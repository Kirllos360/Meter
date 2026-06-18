import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    dto: CreateCustomerDto,
    userId: string
  ): Promise<CustomerResponseDto> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const customer = await this.prisma.customer.create({
      data: {
        projectId,
        customerCode: dto.customerCode,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        customerType: dto.customerType,
        nationalOrCommercialId: dto.nationalOrCommercialId,
        createdBy: userId,
        updatedBy: userId
      }
    });
    return this.toResponse(customer);
  }

  async findAll(projectId: string): Promise<CustomerResponseDto[]> {
    const customers = await this.prisma.customer.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    return customers.map(this.toResponse);
  }

  async findOne(projectId: string, id: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer || customer.projectId !== projectId) {
      throw new NotFoundException(`Customer ${id} not found in project ${projectId}`);
    }
    return this.toResponse(customer);
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateCustomerDto,
    userId: string
  ): Promise<CustomerResponseDto> {
    await this.findOne(projectId, id);
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        customerCode: dto.customerCode,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        customerType: dto.customerType,
        nationalOrCommercialId: dto.nationalOrCommercialId,
        status: dto.status,
        updatedBy: userId
      }
    });
    return this.toResponse(customer);
  }

  async remove(projectId: string, id: string, userId: string): Promise<void> {
    await this.findOne(projectId, id);
    await this.prisma.customer.update({
      where: { id },
      data: { status: 'inactive', updatedBy: userId }
    });
  }

  private toResponse(customer: {
    id: string;
    projectId: string;
    customerCode: string;
    name: string;
    phone: string;
    email: string;
    customerType: string;
    nationalOrCommercialId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): CustomerResponseDto {
    return {
      id: customer.id,
      projectId: customer.projectId,
      customerCode: customer.customerCode,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      customerType: customer.customerType,
      nationalOrCommercialId: customer.nationalOrCommercialId,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }
}
