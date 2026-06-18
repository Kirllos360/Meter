import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { ReadingsService } from './readings.service';
import { CreateReadingDto } from './dto/create-reading.dto';

@Controller('readings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Post()
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.PROJECT_ADMIN, Role.SUPER_ADMIN)
  @Audit('reading', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReadingDto, @Req() req: { user: { userId: string } }) {
    return this.readingsService.createReading(dto, req.user.userId);
  }

  @Get('review-queue')
  @Roles(Role.OPERATOR, Role.TECHNICIAN, Role.PROJECT_ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async listReviewQueue(@Query('projectId') projectId?: string, @Query('status') status?: string) {
    return this.readingsService.listReviewQueue({ projectId, status });
  }
}
