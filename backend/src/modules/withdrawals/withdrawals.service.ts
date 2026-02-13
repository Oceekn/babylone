import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../transactions/entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private walletService: WalletService,
    private transactionsService: TransactionsService,
  ) {}

  // Créer une demande de retrait
  async createWithdrawal(
    userId: string,
    amount: number,
    phoneNumber: string,
  ): Promise<Transaction> {
    // Vérifier que le solde est suffisant
    const hasBalance = await this.walletService.hasSufficientBalance(userId, amount);
    if (!hasBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Frais de retrait (exemple: 250 XAF)
    const withdrawalFee = 250;
    const totalAmount = amount + withdrawalFee;

    // Vérifier le solde total (montant + frais)
    const hasTotalBalance = await this.walletService.hasSufficientBalance(userId, totalAmount);
    if (!hasTotalBalance) {
      throw new BadRequestException(`Insufficient balance. Required: ${totalAmount} XAF (amount: ${amount} + fee: ${withdrawalFee})`);
    }

    // Créer la transaction de retrait (le wallet sera débité)
    const transaction = await this.transactionsService.createPayment(
      userId,
      totalAmount,
      `Retrait de ${amount} XAF vers ${phoneNumber} (Frais: ${withdrawalFee} XAF)`,
      {
        withdrawal_amount: amount,
        withdrawal_fee: withdrawalFee,
        phone_number: phoneNumber,
        type: 'withdrawal',
      },
    );

    // Changer le type en WITHDRAWAL
    transaction.type = TransactionType.WITHDRAWAL;
    await this.transactionsRepository.save(transaction);

    // TODO: Intégrer avec l'API de Mobile Money pour effectuer le transfert réel
    // Pour l'instant, on simule juste le retrait

    return transaction;
  }
}

