import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get() @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List report templates' })
  findAll() { return this.service.findAll(); }

  @Get(':id') @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get report template' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Post() @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create report template' })
  create(@Body() dto: { name: string; category: string; description?: string; config?: string }, @Req() req: any) {
    return this.service.create({ ...dto, createdBy: req.user.userId });
  }

  @Patch(':id') @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update report template' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { name?: string; category?: string; description?: string; config?: string }) {
    return this.service.update(id, dto);
  }

  @Delete(':id') @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete report template' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
