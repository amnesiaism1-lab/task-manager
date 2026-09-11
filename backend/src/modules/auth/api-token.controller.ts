import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ApiTokenService } from './api-token.service';

@Controller('organizations/:orgId/api-tokens')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class ApiTokenController {
  constructor(private readonly tokens: ApiTokenService) {}
  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.tokens.list(orgId, memberId); }
  @Post() create(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: { name: string; scopes: string[]; expiresAt?: string }) { return this.tokens.create(orgId, memberId, body); }
  @Delete(':tokenId') revoke(@Param('orgId') orgId: string, @Param('tokenId') tokenId: string, @CurrentMember('id') memberId: string) { return this.tokens.revoke(orgId, memberId, tokenId); }
}