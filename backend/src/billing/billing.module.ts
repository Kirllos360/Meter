import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { BillingController } from './billing.controller';
import { TariffService } from './tariffs/tariff.service';
import { PeriodService } from './periods/period.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BillingController],
  providers: [TariffService, PeriodService],
  exports: [TariffService, PeriodService]
})
export class BillingModule {}
