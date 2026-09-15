import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { Notification } from '../../database/entities/audit/notification.entity';
import { NotificationDelivery } from '../../database/entities/audit/notification-delivery.entity';
import { WebhookSubscription } from '../../database/entities/audit/webhook-subscription.entity';
import { WebhookDelivery } from '../../database/entities/audit/webhook-delivery.entity';
import { AutomationRule } from '../../database/entities/automation/automation-rule.entity';
import { AutomationComponent } from '../../database/entities/automation/automation-component.entity';
import { AutomationExecution } from '../../database/entities/automation/automation-execution.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { OutboxService } from './outbox.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			OutboxEvent,
			Notification,
			NotificationDelivery,
			WebhookSubscription,
			WebhookDelivery,
			AutomationRule,
			AutomationComponent,
			AutomationExecution,
			Issue,
		]),
	],
	providers: [OutboxService],
	exports: [OutboxService],
})
export class OutboxModule {}
