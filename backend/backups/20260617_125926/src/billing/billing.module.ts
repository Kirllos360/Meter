import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { ReadingsModule } from '../readings/readings.module';
import { BillingController } from './billing.controller';
import { TariffService } from './tariffs/tariff.service';
import { PeriodService } from './periods/period.service';
import { LedgerService } from './ledger.service';

@Module({
  imports: [DatabaseModule, ReadingsModule],
  controllers: [BillingController],
  providers: [TariffService, PeriodService, LedgerService],
  exports: [TariffService, PeriodService, LedgerService]
})
export class BillingModule {}
