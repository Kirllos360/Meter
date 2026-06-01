import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../common/database/prisma.service';
import { TariffService } from './tariffs/tariff.service';
import { PeriodService } from './periods/period.service';

@ApiTags('Billing')
@Controller()
export class BillingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tariffService: TariffService,
    private readonly periodService: PeriodService
  ) {}

  @Post('invoices/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate invoices for billing period' })
  async generateInvoices(
    @Body() dto: { projectId: string; billingPeriodId: string; customerIds?: string[] }
  ) {
    const period = await this.prisma.billingPeriod.findUnique({
      where: { id: dto.billingPeriodId }
    });
    if (!period) return { batchId: 'no-period', generatedCount: 0 };

    const meters = await this.prisma.meter.findMany({
      where: { projectId: dto.projectId, status: { not: 'retired' } }
    });
    const readings = await this.prisma.reading.findMany({
      where: {
        projectId: dto.projectId,
        readingAt: { gte: period.startDate, lte: period.endDate },
        status: 'valid'
      }
    });

    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    const taxRate = project?.taxEnabled ? Number(project.taxRate ?? 0) / 100 : 0;
    let count = 0;

    for (const meter of meters) {
      const tariff = await this.tariffService.getEffectiveTariff(
        dto.projectId,
        meter.meterType,
        period.startDate
      );
      if (!tariff) continue;
      const consumption = readings
        .filter((r) => r.meterId === meter.id)
        .reduce((s, r) => s + Number(r.consumptionValue ?? 0), 0);
      if (consumption <= 0) continue;
      const subtotal = Number(tariff.ratePerUnit) * consumption;
      const tax = subtotal * taxRate;

      await this.prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${period.periodCode}-${meter.id.substring(0, 8)}`,
          projectId: dto.projectId,
          customerId: 'system',
          unitId: 'system',
          meterId: meter.id,
          utilityType: meter.meterType === 'electricity' ? 'electricity' : 'water',
          billingPeriodId: dto.billingPeriodId,
          status: 'draft',
          subtotalAmount: subtotal,
          taxAmount: tax,
          totalAmount: subtotal + tax,
          remainingAmount: subtotal + tax,
          paidAmount: 0
        }
      });
      count++;
    }
    return { batchId: `batch-${Date.now()}`, generatedCount: count };
  }

  @Post('invoices/:id/issue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue an invoice' })
  async issueInvoice(@Param('id', ParseUUIDPipe) id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { status: 'not_found' };
    if (invoice.status !== 'draft') return { status: 'already_issued' };

    const total = Number(invoice.totalAmount);
    if (total > 10000) return { status: 'approval_required' };

    await this.prisma.invoice.update({
      where: { id },
      data: { status: 'issued', issuedAt: new Date() }
    });
    return { status: 'issued' };
  }

  @Post('invoices/:id/adjustments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add adjustment to invoice' })
  async addAdjustment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { adjustmentType: 'credit' | 'debit'; amount: number; reason: string }
  ) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { status: 'not_found' };

    const adjustment = await this.prisma.invoiceAdjustment.create({
      data: {
        invoiceId: id,
        adjustmentType: dto.adjustmentType,
        amount: dto.amount,
        reason: dto.reason,
        createdBy: 'system'
      }
    });
    const amount = Number(dto.amount) * (dto.adjustmentType === 'credit' ? -1 : 1);
    await this.prisma.invoice.update({
      where: { id },
      data: {
        totalAmount: Number(invoice.totalAmount) + amount,
        remainingAmount: Number(invoice.remainingAmount) + amount
      }
    });
    return { status: 'adjusted', adjustmentId: adjustment.id };
  }

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record payment' })
  async createPayment(
    @Body()
    dto: {
      projectId: string;
      customerId: string;
      amount: number;
      paymentDate: string;
      method: string;
    }
  ) {
    return this.prisma.payment.create({
      data: {
        paymentNumber: `PAY-${Date.now()}`,
        projectId: dto.projectId,
        customerId: dto.customerId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        method: dto.method as any,
        status: 'confirmed' as any,
        collectedBy: 'system'
      }
    });
  }

  @Get('tariffs')
  @ApiOperation({ summary: 'List tariffs' })
  async listTariffs(@Query('projectId') projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return this.prisma.tariffPlan.findMany({ where, orderBy: { effectiveFrom: 'desc' } });
  }

  @Get('periods')
  @ApiOperation({ summary: 'List billing periods' })
  async listPeriods(@Query('projectId') projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return this.prisma.billingPeriod.findMany({ where, orderBy: { startDate: 'desc' } });
  }
}
