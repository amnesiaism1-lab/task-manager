import { describe, expect, it, vi } from 'vitest';
import { WebhookService } from './webhook.service';

function repository() {
  return { find: vi.fn(), findOne: vi.fn(), save: vi.fn(async (value) => value), create: vi.fn((value) => value) } as any;
}

describe('WebhookService', () => {
  it('blocks non-HTTPS and private webhook targets', async () => {
    const service = new WebhookService(repository(), repository());
    await expect(service.validateUrl('http://example.com/hook')).rejects.toThrow('HTTPS');
    await expect(service.validateUrl('https://127.0.0.1/hook')).rejects.toThrow('private');
  });

  it('creates deterministic HMAC signatures and deduplicates deliveries', async () => {
    const subscriptions = repository();
    const deliveries = repository();
    deliveries.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'existing' });
    const service = new WebhookService(subscriptions, deliveries);
    const first = service.sign('secret', '{"id":1}');
    expect(first).toBe(service.sign('secret', '{"id":1}'));
    expect(await service.enqueue('sub-a', 'event-a')).toEqual(expect.objectContaining({ subscriptionId: 'sub-a' }));
    expect(await service.enqueue('sub-a', 'event-a')).toEqual({ id: 'existing' });
  });
});