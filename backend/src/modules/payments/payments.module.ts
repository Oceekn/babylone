import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { CinetPayProvider } from './providers/cinetpay.provider';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    WalletModule,
    TransactionsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, CinetPayProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}

