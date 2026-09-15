import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CatalogService } from './catalog.service';

@Controller('organizations/:orgId/catalog')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('issue-types') listTypes(@Param('orgId') orgId: string) { return this.catalog.listTypes(orgId); }
  @Post('issue-types') @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_ISSUE_TYPES') createType(@Param('orgId') orgId: string, @Body() body: { key: string; name: string; description?: string }) { return this.catalog.createType(orgId, body); }

  @Get('labels') listLabels(@Param('orgId') orgId: string) { return this.catalog.listLabels(orgId); }
  @Delete('labels/:labelId') @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_LABELS') archiveLabel(@Param('orgId') orgId: string, @Param('labelId') id: string) { return this.catalog.archiveLabel(orgId, id); }

  @Get('link-types') listLinkTypes(@Param('orgId') orgId: string) { return this.catalog.listLinkTypes(orgId); }
  @Post('link-types') @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_LINK_TYPES') createLinkType(@Param('orgId') orgId: string, @Body() body: { key: string; outwardLabel: string; inwardLabel: string; directionality?: 'directed' | 'symmetric' }) { return this.catalog.createLinkType(orgId, body); }
  @Delete('link-types/:linkTypeId') @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_LINK_TYPES') archiveLinkType(@Param('orgId') orgId: string, @Param('linkTypeId') id: string) { return this.catalog.archiveLinkType(orgId, id); }

  // Priorities
  @Get('priorities') listPriorities(@Param('orgId') orgId: string) { return this.catalog.listPriorities(orgId); }
  @Post('priorities') @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_ISSUE_TYPES') createPriority(@Param('orgId') orgId: string, @Body() body: { key: string; name: string; color?: string; orderNum?: number; isDefault?: boolean }) { return this.catalog.createPriority(orgId, body); }

  // Resolutions
  @Get('resolutions') listResolutions(@Param('orgId') orgId: string) { return this.catalog.listResolutions(orgId); }
  @Post('resolutions') @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_ISSUE_TYPES') createResolution(@Param('orgId') orgId: string, @Body() body: { key: string; name: string; description?: string; orderNum?: number }) { return this.catalog.createResolution(orgId, body); }
}
