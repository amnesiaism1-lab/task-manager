import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { Notification } from '../../database/entities/audit/notification.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { OutboxService } from './outbox.service';

@Module({
	imports: [TypeOrmModule.forFeature([OutboxEvent, Notification, Issue])],
	providers: [OutboxService],
	exports: [OutboxService],
})
export class OutboxModule {}
