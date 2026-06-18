import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { SimCardsService } from './sim-cards.service';
import { CreateSimCardDto } from './dto/create-sim-card.dto';
import { UpdateSimCardDto } from './dto/update-sim-card.dto';
import { QuerySimCardDto } from './dto/query-sim-card.dto';

@Controller('sim-cards')
export class SimCardsController {
  constructor(private readonly simCardsService: SimCardsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OPERATOR, Role.PROJECT_ADMIN, Role.SUPER_ADMIN)
  @Audit('sim_card', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSimCardDto, @Req() req: { user: { userId: string } }) {
    return this.simCardsService.create(dto, req.user.userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    Role.OPERATOR,
    Role.PROJECT_ADMIN,
    Role.SUPER_ADMIN,
    Role.TECHNICIAN,
    Role.FINANCE,
    Role.SUPPORT
  )
  async findAll(@Query() query: QuerySimCardDto) {
    return this.simCardsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    Role.OPERATOR,
    Role.PROJECT_ADMIN,
    Role.SUPER_ADMIN,
    Role.TECHNICIAN,
    Role.FINANCE,
    Role.SUPPORT
  )
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.simCardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OPERATOR, Role.PROJECT_ADMIN, Role.SUPER_ADMIN)
  @Audit('sim_card', 'update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSimCardDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.simCardsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Audit('sim_card', 'deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: { userId: string } }) {
    await this.simCardsService.remove(id, req.user.userId);
  }

  @Get(':simId/eligibility')
  async getEligibility(@Param('simId', ParseUUIDPipe) simId: string) {
    return this.simCardsService.getEligibility(simId);
  }
}
