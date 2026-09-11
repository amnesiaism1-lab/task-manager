import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { BackgroundJob } from '../../database/entities/audit/background-job.entity';

@Injectable()
export class JobService {
  constructor(@InjectRepository(BackgroundJob) private readonly jobs: Repository<BackgroundJob>) {}

  async create(orgId: string, memberId: string, input: { jobType: BackgroundJob['jobType']; idempotencyKey: string; input?: Record<string, unknown> }) {
    const existing = await this.jobs.findOne({ where: { orgId, idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;
    return this.jobs.save(this.jobs.create({ orgId, requestedByMemberId: memberId, jobType: input.jobType, idempotencyKey: input.idempotencyKey, inputJson: input.input ?? {}, resultJson: null, status: 'pending', progress: 0, attempts: 0, nextRunAt: new Date(), leaseUntil: null, lastError: null }));
  }

  list(orgId: string, memberId: string) { return this.jobs.find({ where: { orgId, requestedByMemberId: memberId }, order: { createdAt: 'DESC' }, take: 50 }); }

  async get(orgId: string, memberId: string, id: string) {
    const job = await this.jobs.findOne({ where: { id, orgId, requestedByMemberId: memberId } });
    if (!job) throw new NotFoundException('Background job not found');
    return job;
  }

  async cancel(orgId: string, memberId: string, id: string) {
    const job = await this.get(orgId, memberId, id);
    if (job.status === 'pending' || job.status === 'running') { job.status = 'cancelled'; return this.jobs.save(job); }
    return job;
  }

  async claimNext() {
    const job = await this.jobs.findOne({ where: { status: 'pending', nextRunAt: LessThanOrEqual(new Date()) }, order: { createdAt: 'ASC' } });
    if (!job) return null;
    job.status = 'running'; job.attempts += 1; job.leaseUntil = new Date(Date.now() + 60_000);
    return this.jobs.save(job);
  }

  async complete(id: string, result: Record<string, unknown>) { const job = await this.jobs.findOneBy({ id }); if (!job) return; job.status = 'completed'; job.progress = 100; job.resultJson = result; job.leaseUntil = null; return this.jobs.save(job); }
  async fail(id: string, error: string) { const job = await this.jobs.findOneBy({ id }); if (!job) return; job.status = 'failed'; job.lastError = error.slice(0, 2000); job.leaseUntil = null; return this.jobs.save(job); }
}