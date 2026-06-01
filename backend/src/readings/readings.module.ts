import { Module } from '@nestjs/common';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';
import { ThresholdsModule } from '../projects/thresholds/thresholds.module';
import { PrismaService } from '../common/database/prisma.service';
import { PollingModule } from './polling/polling.module';
import { WaterBalanceModule } from './water-balance/water-balance.module';

@Module({
  imports: [ThresholdsModule, PollingModule, WaterBalanceModule],
  controllers: [ReadingsController],
  providers: [ReadingsService, PrismaService],
  exports: [WaterBalanceModule]
})
export class ReadingsModule {}
