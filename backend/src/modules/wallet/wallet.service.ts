import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private dataSource: DataSource,
  ) {}

  async createWallet(userId: string): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      user_id: userId,
      balance: 0,
      currency: 'XAF',
      is_active: true,
    });
    return this.walletRepository.save(wallet);
  }

  async findByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet for user ${userId} not found`);
    }
    return wallet;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findByUserId(userId);
    return parseFloat(wallet.balance.toString());
  }

  // Créditer le wallet avec verrou pour éviter les races conditions
  async credit(userId: string, amount: number, description?: string): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verrou FOR UPDATE pour éviter les transactions concurrentes
      const wallet = await queryRunner.manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.user_id = :userId', { userId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (!wallet.is_active) {
        throw new BadRequestException('Wallet is not active');
      }

      // Créditer le solde
      wallet.balance = Number(wallet.balance) + amount;
      wallet.last_transaction_at = new Date();

      await queryRunner.manager.save(Wallet, wallet);
      await queryRunner.commitTransaction();

      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Débiter le wallet avec verrou pour éviter les doubles dépenses
  async debit(userId: string, amount: number, description?: string): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verrou FOR UPDATE pour éviter les doubles dépenses
      const wallet = await queryRunner.manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.user_id = :userId', { userId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (!wallet.is_active) {
        throw new BadRequestException('Wallet is not active');
      }

      const currentBalance = Number(wallet.balance);
      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Débiter le solde
      wallet.balance = currentBalance - amount;
      wallet.last_transaction_at = new Date();

      await queryRunner.manager.save(Wallet, wallet);
      await queryRunner.commitTransaction();

      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Vérifier si le solde est suffisant (sans débiter)
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const wallet = await this.findByUserId(userId);
    return parseFloat(wallet.balance.toString()) >= amount;
  }

  // Obtenir ou creer un wallet (lazy creation)
  async getOrCreate(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { user_id: userId } });
    if (!wallet) {
      wallet = await this.createWallet(userId);
    }
    return wallet;
  }
}

