import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get() @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all settings' })
  getAll() { return this.service.getAll(); }

  @Get(':key') @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a setting' })
  get(@Param('key') key: string) { return this.service.get(key); }

  @Patch() @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update settings' })
  update(@Body() dto: Record<string, string>) { return this.service.updateMultiple(dto); }
}
