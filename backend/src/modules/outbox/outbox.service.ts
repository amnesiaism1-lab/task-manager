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

@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(OutboxEvent) private readonly events: Repository<OutboxEvent>,
    @InjectRepository(Notification) private readonly notifications: Repository<Notification>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
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

  async publishPending() {
    const pending = await this.events.find({ where: { status: 'pending' }, order: { occurredAt: 'ASC' }, take: 20 });
    for (const event of pending) {
      try {
        await this.dataSource.transaction(async (manager) => {
          const claimed = await manager.findOne(OutboxEvent, { where: { id: event.id, status: 'pending' }, lock: { mode: 'pessimistic_write' } });
          if (!claimed) return;

          if (claimed.aggregateType === 'issue') {
            await this.notifyIssueParticipants(manager, claimed);
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
    const recipients = [...new Set([issue.reporterMemberId, issue.assigneeMemberId].filter((id): id is string => Boolean(id)))];
    for (const recipientMemberId of recipients) {
      const notification = await manager.save(Notification, manager.create(Notification, {
        orgId: issue.orgId,
        recipientMemberId,
        outboxEventId: event.id,
        notificationType: event.eventType,
        title: event.eventType === 'issue.created' ? `Issue ${issue.key} created` : `Issue ${issue.key} transitioned`,
        body: issue.summary,
        dataJson: { issueId: issue.id, issueKey: issue.key },
        sentAt: new Date(),
        readAt: null,
      }));

      // Record NotificationDelivery to unify audit & delivery tracking
      await manager.save(NotificationDelivery, manager.create(NotificationDelivery, {
        notificationId: notification.id,
        channel: 'email',
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
    return this.notifications.find({ where: { orgId, recipientMemberId: memberId }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async markRead(orgId: string, memberId: string, notificationId: string) {
    const notification = await this.notifications.findOne({ where: { id: notificationId, orgId, recipientMemberId: memberId, readAt: IsNull() } });
    if (!notification) return null;
    notification.readAt = new Date();
    return this.notifications.save(notification);
  }
}
