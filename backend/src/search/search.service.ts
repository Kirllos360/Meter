import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, limit = 10) {
    if (!query || query.length < 2) return { results: [] };
    const q = `%${query}%`;
    const results: any[] = [];

    // Customers
    const customers = await this.prisma.customer.findMany({
      where: { OR: [{ name: { contains: query } }, { customerCode: { contains: query } }, { phone: { contains: query } }] },
      take: limit, select: { id: true, name: true, customerCode: true },
    });
    customers.forEach((c: any) => results.push({ type: 'customer', id: c.id, label: c.name, sublabel: c.customerCode, route: 'customer-detail', params: { id: c.id } }));

    // Projects
    const projects = await this.prisma.project.findMany({
      where: { OR: [{ name: { contains: query } }, { code: { contains: query } }] },
      take: limit, select: { id: true, name: true, code: true },
    });
    projects.forEach((p: any) => results.push({ type: 'project', id: p.id, label: p.name, sublabel: p.code, route: 'project-detail', params: { id: p.id } }));

    // Meters
    const meters = await this.prisma.meter.findMany({
      where: { OR: [{ serialNumber: { contains: query } }, { brand: { contains: query } }] },
      take: limit, select: { id: true, serialNumber: true, meterType: true },
    });
    meters.forEach((m: any) => results.push({ type: 'meter', id: m.id, label: m.serialNumber, sublabel: m.meterType, route: 'meter-detail', params: { id: m.id } }));

    // Invoices
    const invoices = await this.prisma.invoice.findMany({
      where: { invoiceNumber: { contains: query } },
      take: limit, select: { id: true, invoiceNumber: true, status: true },
    });
    invoices.forEach((i: any) => results.push({ type: 'invoice', id: i.id, label: i.invoiceNumber, sublabel: i.status, route: 'invoice-detail', params: { id: i.id } }));

    // Payments
    const payments = await this.prisma.payment.findMany({
      where: { paymentNumber: { contains: query } },
      take: limit, select: { id: true, paymentNumber: true, amount: true },
    });
    payments.forEach((p: any) => results.push({ type: 'payment', id: p.id, label: p.paymentNumber, sublabel: `EGP ${p.amount}`, route: 'payments', params: { id: p.id } }));

    // Tickets
    const tickets = await this.prisma.ticket.findMany({
      where: { title: { contains: query } },
      take: limit, select: { id: true, title: true, status: true },
    });
    tickets.forEach((t: any) => results.push({ type: 'ticket', id: t.id, label: t.title, sublabel: t.status, route: 'tickets', params: { id: t.id } }));

    return { results };
  }
}
