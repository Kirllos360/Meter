import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { AssignMeterDto } from './dto/assign-meter.dto';
import { MeterAssignmentDto } from './dto/meter-assignment.dto';
import { TerminateMeterDto, MeterTerminateResultDto } from './dto/terminate-meter.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { MeterResponseDto } from './dto/meter-response.dto';
import { QueryMeterDto } from './dto/query-meter.dto';

@Injectable()
export class MetersService {
  private readonly logger = new Logger(MetersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMeterDto, userId: string): Promise<MeterResponseDto> {
    const meter = await this.prisma.meter.create({
      data: {
        serialNumber: dto.serialNumber,
        meterType: dto.meterType,
        brand: dto.brand,
        model: dto.model,
        installationDate: new Date(dto.installationDate),
        activationDate: new Date(dto.activationDate),
        projectId: dto.projectId,
        locationId: dto.locationId ?? undefined,
        parentMainMeterId: dto.parentMainMeterId ?? undefined,
        status: 'available',
        createdBy: userId,
        updatedBy: userId
      }
    });
    return this.toResponse(meter);
  }

  async findAll(query?: QueryMeterDto): Promise<MeterResponseDto[]> {
    const where: Record<string, unknown> = {};
    if (query?.projectId) where.projectId = query.projectId;
    if (query?.status) where.status = query.status;
    if (query?.meterType) where.meterType = query.meterType;
    if (query?.search) {
      where.serialNumber = { contains: query.search, mode: 'insensitive' };
    }
    const meters = await this.prisma.meter.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    return meters.map((m) => this.toResponse(m));
  }

  async findOne(id: string): Promise<MeterResponseDto> {
    const meter = await this.prisma.meter.findUnique({ where: { id } });
    if (!meter) {
      throw new NotFoundException(`Meter ${id} not found`);
    }
    return this.toResponse(meter);
  }

  async update(id: string, dto: UpdateMeterDto, userId: string): Promise<MeterResponseDto> {
    await this.findOne(id);
    const meter = await this.prisma.meter.update({
      where: { id },
      data: {
        serialNumber: dto.serialNumber,
        meterType: dto.meterType,
        brand: dto.brand,
        model: dto.model,
        installationDate: dto.installationDate ? new Date(dto.installationDate) : undefined,
        activationDate: dto.activationDate ? new Date(dto.activationDate) : undefined,
        projectId: dto.projectId,
        locationId: dto.locationId,
        parentMainMeterId: dto.parentMainMeterId,
        status: dto.status,
        updatedBy: userId
      }
    });
    return this.toResponse(meter);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.meter.update({
      where: { id },
      data: { status: 'retired', updatedBy: userId }
    });
  }

  private toResponse(meter: {
    id: string;
    serialNumber: string;
    meterType: string;
    brand: string;
    model: string;
    status: string;
    installationDate: Date;
    activationDate: Date;
    terminationDate: Date | null;
    projectId: string;
    locationId: string | null;
    parentMainMeterId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): MeterResponseDto {
    return {
      id: meter.id,
      serialNumber: meter.serialNumber,
      meterType: meter.meterType,
      brand: meter.brand,
      model: meter.model,
      status: meter.status,
      installationDate: meter.installationDate,
      activationDate: meter.activationDate,
      terminationDate: meter.terminationDate,
      projectId: meter.projectId,
      locationId: meter.locationId,
      parentMainMeterId: meter.parentMainMeterId,
      createdAt: meter.createdAt,
      updatedAt: meter.updatedAt
    };
  }

  async assignMeter(
    meterId: string,
    dto: AssignMeterDto,
    userId: string
  ): Promise<MeterAssignmentDto> {
    const meter = await this.prisma.meter.findUnique({ where: { id: meterId } });
    if (!meter) {
      throw new NotFoundException(`Meter ${meterId} not found`);
    }

    const existing = await this.prisma.meterAssignment.findFirst({
      where: { meterId, status: 'active' }
    });
    if (existing) {
      throw new ConflictException(
        `Meter ${meterId} is already assigned to customer ${existing.customerId}`
      );
    }

    const assignment = await this.prisma.meterAssignment.create({
      data: {
        meterId,
        customerId: dto.customerId,
        unitId: dto.unitId,
        projectId: dto.projectId,
        startAt: new Date(dto.startAt),
        changeReason: dto.reason ?? 'Meter assignment',
        status: 'active',
        createdBy: userId,
        updatedBy: userId
      }
    });

    return {
      id: assignment.id,
      meterId: assignment.meterId,
      customerId: assignment.customerId,
      unitId: assignment.unitId,
      status: assignment.status,
      startAt: assignment.startAt,
      endAt: assignment.endAt
    };
  }

  async terminateMeter(
    meterId: string,
    dto: TerminateMeterDto,
    userId: string
  ): Promise<MeterTerminateResultDto> {
    const meter = await this.prisma.meter.findUnique({ where: { id: meterId } });
    if (!meter) {
      throw new NotFoundException(`Meter ${meterId} not found`);
    }

    const activeAssignment = await this.prisma.meterAssignment.findFirst({
      where: { meterId, status: 'active' }
    });
    if (!activeAssignment) {
      throw new ConflictException(`Meter ${meterId} has no active assignment to terminate`);
    }

    const terminatedAt = new Date(dto.terminatedAt);

    await this.prisma.meterAssignment.update({
      where: { id: activeAssignment.id },
      data: { endAt: terminatedAt, status: 'ended', updatedBy: userId }
    });

    await this.prisma.meter.update({
      where: { id: meterId },
      data: { status: 'terminated', updatedBy: userId }
    });

    let simStatus = 'none';
    let simReusable = false;

    const activeSimAssignment = await this.prisma.sIMAssignment.findFirst({
      where: { meterId, status: 'active' },
      include: { sim: true }
    });

    if (activeSimAssignment) {
      await this.prisma.sIMAssignment.update({
        where: { id: activeSimAssignment.id },
        data: { endAt: terminatedAt, status: 'ended', updatedBy: userId }
      });

      const sim = activeSimAssignment.sim;
      const now = new Date();
      if (!sim.cooldownUntil || sim.cooldownUntil <= now) {
        simStatus = 'released';
        simReusable = true;
        await this.prisma.sIMCard.update({
          where: { id: sim.id },
          data: { status: 'reusable', updatedBy: userId }
        });
      } else {
        simStatus = 'cooldown';
        simReusable = false;
        await this.prisma.sIMCard.update({
          where: { id: sim.id },
          data: { status: 'old', updatedBy: userId }
        });
      }
    }

    return { meterStatus: 'terminated', simStatus, simReusable };
  }
}
