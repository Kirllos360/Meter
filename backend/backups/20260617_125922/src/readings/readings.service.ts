import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { ThresholdService } from '../projects/thresholds/threshold.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { ReadingResponseDto } from './dto/reading-response.dto';

@Injectable()
export class ReadingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly thresholdService: ThresholdService
  ) {}

  async listReviewQueue(filters: {
    projectId?: string;
    status?: string;
  }): Promise<{ items: ReadingResponseDto[] }> {
    const where: any = {
      status: { in: ['pending_review', 'suspicious'] }
    };
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;

    const readings = await this.prisma.reading.findMany({ where, orderBy: { readingAt: 'desc' } });

    return {
      items: readings.map((r) => ({
        id: r.id,
        meterId: r.meterId,
        status: r.status,
        consumptionValue: r.consumptionValue ? Number(r.consumptionValue) : null,
        projectThresholdProfile: null
      }))
    };
  }

  async createReading(dto: CreateReadingDto, userId: string): Promise<ReadingResponseDto> {
    const previous = await this.prisma.reading.findFirst({
      where: { meterId: dto.meterId },
      orderBy: { readingAt: 'desc' }
    });

    const previousReadingValue = previous ? Number(previous.readingValue) : null;
    const currentValue = dto.readingValue;
    let consumptionValue: number | null = null;

    if (previousReadingValue !== null) {
      consumptionValue = currentValue - previousReadingValue;
    }

    const profile = await this.thresholdService.getProfile(dto.projectId);
    let status = 'valid';
    let profileName: string | null = null;

    if (
      consumptionValue !== null &&
      consumptionValue < 0 &&
      profile.alertOnNegativeConsumption !== false
    ) {
      status = 'suspicious';
      profileName = 'negative-consumption';
    }

    if (
      consumptionValue !== null &&
      consumptionValue === 0 &&
      profile.alertOnZeroConsumption === true
    ) {
      status = 'pending_review';
      profileName = 'zero-consumption';
    }

    if (
      profile.maxConsumptionPerMonth !== null &&
      profile.maxConsumptionPerMonth !== undefined &&
      consumptionValue !== null
    ) {
      if (consumptionValue > profile.maxConsumptionPerMonth) {
        status = 'pending_review';
        profileName = 'high-consumption';
      }
    }

    if (
      consumptionValue !== null &&
      profile.alertOnSpike === true &&
      profile.spikeMultiplier !== null &&
      profile.spikeMultiplier !== undefined
    ) {
      const avgConsumption = await this.getAverageConsumption(dto.meterId);
      if (avgConsumption > 0 && consumptionValue > avgConsumption * profile.spikeMultiplier) {
        status = 'suspicious';
        profileName = 'spike-detected';
      }
    }

    let reading;
    try {
      reading = await this.prisma.reading.create({
        data: {
          meterId: dto.meterId,
          projectId: dto.projectId,
          customerIdSnapshot: '',
          unitIdSnapshot: '',
          readingValue: currentValue,
          readingAt: new Date(dto.readingAt),
          source: dto.source as any,
          previousReadingValue: previousReadingValue ?? undefined,
          consumptionValue: consumptionValue ?? undefined,
          status: status as any,
          rawPayload: dto.rawPayload ? JSON.parse(JSON.stringify(dto.rawPayload)) : undefined,
          enteredBy: userId
        }
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new HttpException(
          'Duplicate reading: meterId + readingAt + source already exists',
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }
      throw err;
    }

    return {
      id: reading.id,
      meterId: reading.meterId,
      status: status,
      consumptionValue: consumptionValue,
      projectThresholdProfile: profileName
    };
  }

  private async getAverageConsumption(meterId: string): Promise<number> {
    const recent = await this.prisma.reading.findMany({
      where: { meterId, consumptionValue: { not: null } },
      orderBy: { readingAt: 'desc' },
      take: 5
    });
    if (recent.length === 0) return 0;
    const sum = recent.reduce((acc, r) => acc + Number(r.consumptionValue ?? 0), 0);
    return sum / recent.length;
  }
}
