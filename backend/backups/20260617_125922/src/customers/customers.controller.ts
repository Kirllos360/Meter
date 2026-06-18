import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { PrismaService } from '../common/database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('projects/:projectId/customers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @Roles(Role.OPERATOR, Role.PROJECT_ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateCustomerDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.customersService.create(projectId, dto, req.user.userId);
  }

  @Get()
  @Roles(
    Role.OPERATOR,
    Role.PROJECT_ADMIN,
    Role.SUPER_ADMIN,
    Role.TECHNICIAN,
    Role.FINANCE,
    Role.SUPPORT
  )
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.customersService.findAll(projectId);
  }

  @Get(':id')
  @Roles(
    Role.OPERATOR,
    Role.PROJECT_ADMIN,
    Role.SUPER_ADMIN,
    Role.TECHNICIAN,
    Role.FINANCE,
    Role.SUPPORT
  )
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.customersService.findOne(projectId, id);
  }

  @Patch(':id')
  @Roles(Role.OPERATOR, Role.PROJECT_ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'update')
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.customersService.update(projectId, id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.PROJECT_ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { userId: string } }
  ) {
    await this.customersService.remove(projectId, id, req.user.userId);
  }

  @Get(':id/statement')
  @Roles(Role.OPERATOR, Role.PROJECT_ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT, Role.CUSTOMER)
  @ApiOperation({ summary: 'Get customer statement with debit/credit/running balance' })
  async getStatement(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    await this.customersService.findOne(projectId, id);
    const where: any = { projectId, customerId: id };
    if (from || to) {
      where.entryAt = {};
      if (from) where.entryAt.gte = new Date(from);
      if (to) where.entryAt.lte = new Date(to);
    }
    const entries = await this.prisma.customerLedgerEntry.findMany({
      where,
      orderBy: { entryAt: 'asc' }
    });
    return {
      customerId: id,
      projectId,
      entries: entries.map((e) => ({
        id: e.id,
        entryType: e.entryType,
        referenceType: e.referenceType,
        referenceId: e.referenceId,
        amountDelta: Number(e.amountDelta),
        runningBalance: Number(e.runningBalance),
        entryAt: e.entryAt
      })),
      summary: {
        totalEntries: entries.length,
        totalDebit: entries
          .filter((e) => Number(e.amountDelta) > 0)
          .reduce((s, e) => s + Number(e.amountDelta), 0),
        totalCredit: entries
          .filter((e) => Number(e.amountDelta) < 0)
          .reduce((s, e) => s + Math.abs(Number(e.amountDelta)), 0),
        currentBalance: entries.length > 0 ? Number(entries[entries.length - 1].runningBalance) : 0
      }
    };
  }
}
