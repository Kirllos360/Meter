import { Controller, Get, Post, Param, Body, ParseUUIDPipe, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { PaymentsService } from './payments.service';
import { ReversePaymentDto } from './dto/reverse-payment.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(Role.OPERATOR, Role.PROJECT_ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'List payments' })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('customerId') customerId?: string
  ) {
    return this.paymentsService.findAll(projectId, customerId);
  }

  @Get(':id')
  @Roles(Role.OPERATOR, Role.PROJECT_ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post(':id/reverse')
  @Roles(Role.SUPER_ADMIN)
  @Audit('payment', 'reverse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reverse a payment' })
  async reverse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReversePaymentDto
  ) {
    return this.paymentsService.reverse(id, dto.reason);
  }
}
