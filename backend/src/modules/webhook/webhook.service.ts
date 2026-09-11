import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, createHmac } from 'node:crypto';
import { promises as dns } from 'node:dns';
import { isIP } from 'node:net';
import { Repository } from 'typeorm';
import { generateSecureToken } from '../../common/utils/token.util';
import { WebhookDelivery } from '../../database/entities/audit/webhook-delivery.entity';
import { WebhookSubscription } from '../../database/entities/audit/webhook-subscription.entity';

const EVENT_NAMES = new Set(['issue.created', 'issue.updated', 'issue.transitioned', 'comment.created', 'attachment.created']);

@Injectable()
export class WebhookService {
  constructor(@InjectRepository(WebhookSubscription) private readonly subscriptions: Repository<WebhookSubscription>, @InjectRepository(WebhookDelivery) private readonly deliveries: Repository<WebhookDelivery>) {}

  async validateUrl(rawUrl: string) {
    let parsed: URL;
    try { parsed = new URL(rawUrl); } catch { throw new BadRequestException('Webhook URL is invalid'); }
    if (parsed.protocol !== 'https:') throw new BadRequestException('Webhook URL must use HTTPS');
    if (parsed.username || parsed.password || parsed.port === '80') throw new BadRequestException('Webhook URL is not allowed');
    const addresses = await dns.lookup(parsed.hostname, { all: true });
    if (!addresses.length || addresses.some(({ address }) => this.isPrivateAddress(address))) throw new BadRequestException('Webhook target resolves to a private or reserved address');
    return parsed.toString();
  }

  private isPrivateAddress(address: string) {
    if (isIP(address) === 4) { const [a, b] = address.split('.').map(Number); return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168); }
    return address === '::1' || address === '::' || address.toLowerCase().startsWith('fc') || address.toLowerCase().startsWith('fd') || address.toLowerCase().startsWith('fe80:');
  }

  list(orgId: string, memberId: string) { return this.subscriptions.find({ where: { orgId, createdByMemberId: memberId }, order: { createdAt: 'DESC' } }); }

  async create(orgId: string, memberId: string, input: { url: string; events: string[]; projectId?: string }) {
    const events = [...new Set(input.events ?? [])];
    if (!events.length || events.some((event) => !EVENT_NAMES.has(event))) throw new BadRequestException('Webhook event is invalid');
    const url = await this.validateUrl(input.url);
    const secret = generateSecureToken(32);
    const subscription = await this.subscriptions.save(this.subscriptions.create({ orgId, createdByMemberId: memberId, projectId: input.projectId ?? null, url, events, filterJson: {}, secretHash: secret.hash, status: 'active', failureCount: 0 }));
    return { id: subscription.id, url: subscription.url, events, secret: secret.raw, warning: 'The signing secret is shown once.' };
  }

  async pause(orgId: string, memberId: string, id: string) { const item = await this.findOwned(orgId, memberId, id); item.status = item.status === 'paused' ? 'active' : 'paused'; return this.subscriptions.save(item); }
  async remove(orgId: string, memberId: string, id: string) { const item = await this.findOwned(orgId, memberId, id); item.status = 'disabled'; await this.subscriptions.save(item); return { success: true }; }
  async findOwned(orgId: string, memberId: string, id: string) { const item = await this.subscriptions.findOne({ where: { id, orgId, createdByMemberId: memberId, status: 'active' } }); if (!item) throw new NotFoundException('Webhook subscription not found'); return item; }

  async enqueue(subscriptionId: string, eventId: string) { const existing = await this.deliveries.findOne({ where: { subscriptionId, eventId } }); if (existing) return existing; return this.deliveries.save(this.deliveries.create({ subscriptionId, eventId, status: 'pending', attempts: 0, nextAttemptAt: new Date(), responseStatus: null, lastError: null })); }

  sign(secret: string, body: string) { return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`; }
  hashSecret(secret: string) { return createHash('sha256').update(secret).digest('hex'); }
}