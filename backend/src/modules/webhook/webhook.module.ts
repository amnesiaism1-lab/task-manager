import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookDelivery } from '../../database/entities/audit/webhook-delivery.entity';
import { WebhookSubscription } from '../../database/entities/audit/webhook-subscription.entity';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { AuthModule } from '../auth/auth.module';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';

@Module({ imports: [TypeOrmModule.forFeature([WebhookSubscription, WebhookDelivery, OrganizationMember]), AuthModule], controllers: [WebhookController], providers: [WebhookService, OrgMembershipGuard], exports: [WebhookService] })
export class WebhookModule {}