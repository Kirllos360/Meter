import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { CollectionsController } from './collections.controller';
import { PaymentReceiptService } from '../payments/payment-receipt.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CollectionsController],
  providers: [PaymentReceiptService],
  exports: [PaymentReceiptService],
})
export class CollectionsModule {}
