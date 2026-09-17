import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { Notification } from '../../database/entities/audit/notification.entity';
import { NotificationDelivery } from '../../database/entities/audit/notification-delivery.entity';
import { WebhookSubscription } from '../../database/entities/audit/webhook-subscription.entity';
import { WebhookDelivery } from '../../database/entities/audit/webhook-delivery.entity';
import { AutomationRule } from '../../database/entities/automation/automation-rule.entity';
import { AutomationComponent } from '../../database/entities/automation/automation-component.entity';
import { AutomationExecution } from '../../database/entities/automation/automation-execution.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { Sprint } from '../../database/entities/project/sprint.entity';

@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(OutboxEvent) private readonly events: Repository<OutboxEvent>,
    @InjectRepository(Notification) private readonly notifications: Repository<Notification>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(Sprint) private readonly sprints: Repository<Sprint>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    if (this.config.get('RUN_WORKERS', 'false') !== 'true') return;
    this.timer = setInterval(() => void this.publishPending(), 5_000);
    this.logger.log('Outbox worker enabled');
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async publishPending(orgId?: string) {
    const whereClause: any = { status: 'pending' };
    if (orgId) whereClause.orgId = orgId;
    const pending = await this.events.find({ where: whereClause, order: { occurredAt: 'ASC' }, take: 50 });
    for (const event of pending) {
      try {
        await this.dataSource.transaction(async (manager) => {
          const claimed = await manager.findOne(OutboxEvent, { where: { id: event.id, status: 'pending' }, lock: { mode: 'pessimistic_write' } });
          if (!claimed) return;

          if (claimed.aggregateType === 'issue') {
            await this.notifyIssueParticipants(manager, claimed);
          } else if (claimed.aggregateType === 'sprint') {
            await this.notifySprintParticipants(manager, claimed);
          }
          await this.dispatchWebhooks(manager, claimed);
          await this.triggerAutomations(manager, claimed);

          claimed.status = 'published';
          claimed.publishedAt = new Date();
          await manager.save(claimed);
        });
      } catch (error) {
        this.logger.error(`Failed to publish outbox event ${event.id}`, error instanceof Error ? error.stack : String(error));
        await this.events.update(event.id, { status: 'failed', retryCount: () => 'retry_count + 1', lastError: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  private async notifyIssueParticipants(manager: ReturnType<DataSource['createQueryRunner']>['manager'], event: OutboxEvent) {
    const issue = await manager.findOne(Issue, { where: { id: event.aggregateId } });
    if (!issue) return;

    // Collect participants: Assignee, Reporter, Watchers, and Project Members
    const watcherRows = await manager.query(
      'SELECT org_member_id FROM issue_watchers WHERE issue_id = $1',
      [issue.id]
    ).catch(() => []);
    const watcherMemberIds = watcherRows.map((r: any) => r.org_member_id);

    const projectMemberRows = await manager.query(
      'SELECT org_member_id FROM project_members WHERE project_id = $1 AND status = $2',
      [issue.projectId, 'active']
    ).catch(() => []);
    const projectMemberIds = projectMemberRows.map((r: any) => r.org_member_id);

    const recipients = [...new Set([
      issue.assigneeMemberId,
      issue.reporterMemberId,
      ...watcherMemberIds,
      ...projectMemberIds,
    ].filter((id): id is string => Boolean(id)))];

    let title = `Issue ${issue.key} updated`;
    let body = issue.summary;
    const payload = (event.payloadJson as Record<string, any>) || {};

    if (event.eventType === 'issue.created') {
      title = `Issue ${issue.key} created`;
      body = `New issue created: "${issue.summary}" (Priority: ${issue.priority})`;
    } else if (event.eventType === 'issue.transitioned') {
      title = `Issue ${issue.key} transitioned`;
      body = payload.toState ? `Moved to ${payload.toState}: "${issue.summary}"` : `Status updated: "${issue.summary}"`;
    } else if (event.eventType === 'comment.created') {
      title = `New comment on ${issue.key}`;
      body = payload.body ? `Comment: "${String(payload.body).slice(0, 100)}..."` : `A new comment was posted on "${issue.summary}".`;
    } else if (event.eventType === 'worklog.created') {
      title = `Work log added to ${issue.key}`;
      body = `Work logged towards "${issue.summary}".`;
    } else if (event.eventType === 'issue.linked') {
      title = `Issue ${issue.key} linked`;
      body = `Issue dependency linked: "${issue.summary}".`;
    } else if (event.eventType === 'issue.deleted') {
      title = `Issue ${issue.key} deleted`;
      body = `Issue "${issue.summary}" was removed.`;
    }

    for (const recipientMemberId of recipients) {
      const existing = await manager.findOne(Notification, {
        where: { outboxEventId: event.id, recipientMemberId, notificationType: event.eventType },
      });
      if (existing) continue;

      const notification = await manager.save(Notification, manager.create(Notification, {
        orgId: issue.orgId,
        recipientMemberId,
        outboxEventId: event.id,
        notificationType: event.eventType,
        title,
        body,
        dataJson: { issueId: issue.id, issueKey: issue.key, projectId: issue.projectId, ...payload },
        sentAt: new Date(),
        readAt: null,
      }));

      await manager.save(NotificationDelivery, manager.create(NotificationDelivery, {
        notificationId: notification.id,
        channel: 'in_app',
        status: 'sent',
        destination: recipientMemberId,
        attempts: 1,
        sentAt: new Date(),
        lastError: null,
      }));
    }
  }

  private async notifySprintParticipants(manager: ReturnType<DataSource['createQueryRunner']>['manager'], event: OutboxEvent) {
    const sprint = await manager.findOne(Sprint, { where: { id: event.aggregateId } });
    if (!sprint) return;

    const projectMemberRows = await manager.query(
      'SELECT org_member_id FROM project_members WHERE project_id = $1 AND status = $2',
      [sprint.projectId, 'active']
    ).catch(() => []);
    const recipients: string[] = Array.from(new Set<string>(projectMemberRows.map((r: any) => String(r.org_member_id)).filter((id: string) => Boolean(id))));

    const isStarted = event.eventType === 'sprint.started';
    const title = isStarted ? `Sprint "${sprint.name}" started` : `Sprint "${sprint.name}" completed`;
    const body = isStarted
      ? `Sprint "${sprint.name}" has officially started. Review active tasks on the Scrum board.`
      : `Sprint "${sprint.name}" has been completed. Remaining open issues rolled over.`;

    const payload = (event.payloadJson as Record<string, any>) || {};

    for (const recipientMemberId of recipients) {
      const existing = await manager.findOne(Notification, {
        where: { outboxEventId: event.id, recipientMemberId, notificationType: event.eventType },
      });
      if (existing) continue;

      const notification = await manager.save(Notification, manager.create(Notification, {
        orgId: event.orgId,
        recipientMemberId,
        outboxEventId: event.id,
        notificationType: event.eventType,
        title,
        body,
        dataJson: { sprintId: sprint.id, projectId: sprint.projectId, sprintName: sprint.name, ...payload },
        sentAt: new Date(),
        readAt: null,
      }));

      await manager.save(NotificationDelivery, manager.create(NotificationDelivery, {
        notificationId: notification.id,
        channel: 'in_app',
        status: 'sent',
        destination: recipientMemberId,
        attempts: 1,
        sentAt: new Date(),
        lastError: null,
      }));
    }
  }

  private async dispatchWebhooks(manager: ReturnType<DataSource['createQueryRunner']>['manager'], event: OutboxEvent) {
    try {
      const subscriptions = await manager.find(WebhookSubscription, {
        where: { orgId: event.orgId, status: 'active' },
      });
      for (const sub of subscriptions) {
        if (Array.isArray(sub.events) && sub.events.includes(event.eventType)) {
          const existing = await manager.findOne(WebhookDelivery, {
            where: { subscriptionId: sub.id, eventId: event.id },
          });
          if (!existing) {
            await manager.save(WebhookDelivery, manager.create(WebhookDelivery, {
              subscriptionId: sub.id,
              eventId: event.id,
              status: 'pending',
              attempts: 0,
              nextAttemptAt: new Date(),
              responseStatus: null,
              lastError: null,
            }));
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`Webhook enqueue error for event ${event.id}: ${err?.message}`);
    }
  }

  private async triggerAutomations(manager: ReturnType<DataSource['createQueryRunner']>['manager'], event: OutboxEvent) {
    try {
      const rules = await manager.find(AutomationRule, {
        where: { orgId: event.orgId, status: 'active' },
      });
      for (const rule of rules) {
        const components = await manager.find(AutomationComponent, {
          where: { ruleId: rule.id },
          order: { position: 'ASC' },
        });
        const trigger = components.find((c) => c.componentType === 'trigger' && c.componentKey === event.eventType);
        if (trigger) {
          const actions = components.filter((c) => c.componentType === 'action');
          const applied: string[] = [];

          if (event.aggregateType === 'issue' && event.aggregateId) {
            const issue = await manager.findOne(Issue, { where: { id: event.aggregateId } });
            if (issue) {
              for (const act of actions) {
                if (act.componentKey === 'assign_user' && act.configJson?.memberId) {
                  issue.assigneeMemberId = String(act.configJson.memberId);
                  applied.push('assign_user');
                }
              }
              if (applied.length > 0) {
                await manager.save(Issue, issue);
              }
            }
          }

          await manager.save(AutomationExecution, manager.create(AutomationExecution, {
            ruleId: rule.id,
            idempotencyKey: `auto-${event.id}-${rule.id}`,
            status: 'completed',
            resultJson: {
              actions: applied.length || actions.length,
              actionsApplied: applied.length ? applied : actions.map((a) => a.componentKey),
              note: `Automation rule '${rule.name}' triggered by ${event.eventType}`,
            },
            errorMessage: null,
          }));
        }
      }
    } catch (err: any) {
      this.logger.warn(`Automation trigger error for event ${event.id}: ${err?.message}`);
    }
  }

  async list(orgId: string, memberId: string) {
    try {
      await this.publishPending(orgId);
    } catch (err: any) {
      this.logger.warn(`On-demand publishPending error: ${err?.message}`);
    }
    return this.notifications.find({ where: { orgId, recipientMemberId: memberId }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async markRead(orgId: string, memberId: string, notificationId: string) {
    const notification = await this.notifications.findOne({ where: { id: notificationId, orgId, recipientMemberId: memberId, readAt: IsNull() } });
    if (!notification) return null;
    notification.readAt = new Date();
    return this.notifications.save(notification);
  }

  async markAllRead(orgId: string, memberId: string) {
    await this.notifications.update(
      { orgId, recipientMemberId: memberId, readAt: IsNull() },
      { readAt: new Date() }
    );
    return { success: true };
  }

  async deleteNotification(orgId: string, memberId: string, notificationId: string) {
    await this.notifications.delete({ id: notificationId, orgId, recipientMemberId: memberId });
    return { success: true };
  }
}
