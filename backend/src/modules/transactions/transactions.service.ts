import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private dataSource: DataSource,
    private walletService: WalletService,
  ) {}

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionsRepository.create(transactionData);
    return this.transactionsRepository.save(transaction);
  }

  // Créer une transaction de paiement avec vérification de solde et verrou
  async createPayment(
    userId: string,
    amount: number,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Débiter le wallet (avec verrou intégré)
      await this.walletService.debit(userId, amount, description);

      // Créer la transaction
      const transaction = this.transactionsRepository.create({
        user_id: userId,
        amount,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
        currency: 'XAF',
        description,
        metadata,
      });

      const savedTransaction = await queryRunner.manager.save(Transaction, transaction);
      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Créer une transaction de crédit (dépôt)
  async createCredit(
    userId: string,
    amount: number,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Créditer le wallet (avec verrou intégré)
      await this.walletService.credit(userId, amount, description);

      // Créer la transaction
      const transaction = this.transactionsRepository.create({
        user_id: userId,
        amount,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
        currency: 'XAF',
        description,
        metadata,
      });

      const savedTransaction = await queryRunner.manager.save(Transaction, transaction);
      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    transaction.status = status;
    return this.transactionsRepository.save(transaction);
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({
      where: { reference },
    });
  }

  /** Trouver la transaction de paiement liée à une réservation */
  async findByBookingId(bookingId: string): Promise<Transaction | null> {
    return this.transactionsRepository
      .createQueryBuilder('t')
      .where("t.metadata->>'booking_id' = :bookingId", { bookingId })
      .andWhere('t.type = :type', { type: TransactionType.PAYMENT })
      .andWhere('t.status = :status', { status: TransactionStatus.COMPLETED })
      .orderBy('t.created_at', 'DESC')
      .getOne();
  }

  /** Remboursement : créditer le wallet et créer une transaction REFUND */
  async createRefund(
    userId: string,
    amount: number,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.walletService.credit(userId, amount, description);
      const transaction = this.transactionsRepository.create({
        user_id: userId,
        amount,
        type: TransactionType.REFUND,
        status: TransactionStatus.COMPLETED,
        currency: 'XAF',
        description,
        metadata,
      });
      const saved = await queryRunner.manager.save(Transaction, transaction);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

