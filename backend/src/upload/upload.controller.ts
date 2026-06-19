import { Controller, Post, Get, Param, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Get('history/:entityType')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get upload history for entity type' })
  getHistory(@Param('entityType') entityType: string) { return this.service.getHistory(entityType); }

  @Post('customers')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk import customers' })
  importCustomers(@Body() dto: { rows: any[] }, @Req() req: any) { return this.service.importCustomers(dto.rows, req.user.userId); }

  @Post('meters')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk import meters' })
  importMeters(@Body() dto: { rows: any[] }, @Req() req: any) { return this.service.importMeters(dto.rows, req.user.userId); }
}
