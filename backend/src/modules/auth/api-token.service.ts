import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ApiToken } from '../../database/entities/identity/api-token.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { generateSecureToken, hashToken } from '../../common/utils/token.util';

const ALLOWED_SCOPES = new Set(['read', 'write', 'admin', 'webhooks']);

@Injectable()
export class ApiTokenService {
  constructor(
    @InjectRepository(ApiToken) private readonly tokens: Repository<ApiToken>,
    @InjectRepository(OrganizationMember) private readonly members: Repository<OrganizationMember>,
  ) {}

  list(orgId: string, memberId: string) { return this.tokens.find({ where: { orgId, memberId, revokedAt: IsNull() }, select: { id: true, orgId: true, memberId: true, name: true, scopes: true, expiresAt: true, lastUsedAt: true, createdAt: true }, order: { createdAt: 'DESC' } }); }

  async create(orgId: string, memberId: string, input: { name: string; scopes: string[]; expiresAt?: string }) {
    const scopes = [...new Set(input.scopes ?? [])];
    if (!scopes.length || scopes.some((scope) => !ALLOWED_SCOPES.has(scope))) throw new ConflictException('Token scope is invalid');
    const { raw, hash } = generateSecureToken(32);
    const token = await this.tokens.save(this.tokens.create({ orgId, memberId, name: input.name.trim(), tokenHash: hash, scopes, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null, lastUsedAt: null, revokedAt: null }));
    return { id: token.id, name: token.name, scopes: token.scopes, expiresAt: token.expiresAt, token: raw, warning: 'The token is shown once. Store it securely.' };
  }

  async revoke(orgId: string, memberId: string, id: string) {
    const token = await this.tokens.findOne({ where: { id, orgId, memberId, revokedAt: IsNull() } });
    if (!token) throw new NotFoundException('API token not found');
    token.revokedAt = new Date();
    return { success: true, revokedAt: (await this.tokens.save(token)).revokedAt };
  }

  /**
   * UC-INT-04: Authenticate a request via PAT.
   * Guard: PAT is invalid if the owning org member is suspended.
   */
  async authenticate(rawToken: string, requiredScope = 'read') {
    const token = await this.tokens.findOne({ where: { tokenHash: hashToken(rawToken), revokedAt: IsNull() } });
    if (!token || (token.expiresAt && token.expiresAt <= new Date()) || !token.scopes.includes(requiredScope) && !token.scopes.includes('admin')) return null;
    // Guard: member must still be active (UC-INT-04 business rule)
    const member = await this.members.findOne({ where: { id: token.memberId } });
    if (!member || member.status !== 'active') return null;
    token.lastUsedAt = new Date();
    await this.tokens.save(token);
    return token;
  }

  /**
   * UC-ORG-11: Revoke all active PATs for a member when they leave an organization.
   * Called as cascade by OrganizationService.leaveOrganization().
   */
  async revokeAllForMember(orgId: string, memberId: string) {
    await this.tokens.update(
      { orgId, memberId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}