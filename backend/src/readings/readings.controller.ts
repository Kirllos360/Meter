import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { ReadingsService } from './readings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { PrismaService } from '../common/database/prisma.service';

@Controller('readings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReadingsController {
  constructor(
    private readonly readingsService: ReadingsService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReadingDto, @Req() req: { user: { userId: string } }) {
    const reading = await this.readingsService.createReading(dto, req.user.userId);
    this.notificationsService.create({ userId: req.user.userId, title: `Reading submitted: ${reading.meterSerial}`, body: `${reading.consumption} units`, type: 'reading', referenceType: 'reading', referenceId: reading.id }).catch(() => {});
    return reading;
  }

  @Get()
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('projectId') projectId?: string) {
    return this.readingsService.findAll(projectId);
  }

  @Get('review-queue')
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async listReviewQueue(@Query('projectId') projectId?: string, @Query('status') status?: string) {
    return this.readingsService.listReviewQueue({ projectId, status });
  }

  @Get(':id')
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.findOne(id);
  }

  @Post(':id/approve')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'approve')
  @HttpCode(HttpStatus.OK)
  async approveReading(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { reason?: string }, @Req() req: any) {
    const reading = await this.prisma.reading.findUnique({ where: { id } });
    if (!reading) return { status: 'not_found' };
    await this.prisma.reading.update({ where: { id }, data: { status: 'valid' } });
    await this.prisma.readingReview.create({
      data: { readingId: id, reviewAction: 'approve', reviewedBy: req.user.userId, reviewedAt: new Date(), reason: dto.reason ?? '' }
    });
    this.notificationsService.create({ userId: req.user.userId, title: 'Reading approved', referenceType: 'reading', referenceId: id }).catch(() => {});
    return { status: 'approved' };
  }

  @Post(':id/reject')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'reject')
  @HttpCode(HttpStatus.OK)
  async rejectReading(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { reason: string }, @Req() req: any) {
    if (!dto.reason) return { status: 'reason_required' };
    const reading = await this.prisma.reading.findUnique({ where: { id } });
    if (!reading) return { status: 'not_found' };
    await this.prisma.reading.update({ where: { id }, data: { status: 'rejected' } });
    await this.prisma.readingReview.create({
      data: { readingId: id, reviewAction: 'reject', reviewedBy: req.user.userId, reviewedAt: new Date(), reason: dto.reason }
    });
    this.notificationsService.create({ userId: req.user.userId, title: 'Reading rejected', referenceType: 'reading', referenceId: id }).catch(() => {});
    return { status: 'rejected' };
  }
}
