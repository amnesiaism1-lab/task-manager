import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from '../../database/entities/audit/notification-preference.entity';

@Injectable()
export class NotificationPreferenceService {
  constructor(@InjectRepository(NotificationPreference) private readonly preferences: Repository<NotificationPreference>) {}
  list(orgId: string, memberId: string) { return this.preferences.find({ where: { orgId, memberId }, order: { notificationType: 'ASC', channel: 'ASC' } }); }
  upsert(orgId: string, memberId: string, input: { notificationType: string; channel: 'in_app' | 'email'; enabled: boolean }) { return this.preferences.save(this.preferences.create({ orgId, memberId, notificationType: input.notificationType, channel: input.channel, enabled: input.enabled })); }
}