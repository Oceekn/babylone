import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentProvider, PaymentStatus } from './entities/payment.entity';
import { CinetPayProvider } from './providers/cinetpay.provider';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private cinetPayProvider: CinetPayProvider,
    private walletService: WalletService,
    private transactionsService: TransactionsService,
  ) {}

  // Initialiser un paiement (recharger le wallet)
  async initializePayment(
    userId: string,
    amount: number,
    phoneNumber: string,
    provider: PaymentProvider = PaymentProvider.CINETPAY,
  ): Promise<Payment> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Générer une référence unique
    const reference = `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Créer l'enregistrement de paiement
    const payment = this.paymentsRepository.create({
      user_id: userId,
      provider,
      reference,
      status: PaymentStatus.PENDING,
      amount,
      currency: 'XAF',
      phone_number: phoneNumber,
      description: `Rechargement wallet - ${amount} XAF`,
      callback_url: `${process.env.API_URL || 'http://localhost:3000'}/api/v1/payments/webhook/cinetpay`,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Si CinetPay, initialiser le paiement
    if (provider === PaymentProvider.CINETPAY) {
      try {
        const initResponse = await this.cinetPayProvider.initializePayment({
          amount,
          currency: 'XOF', // CinetPay utilise XOF par défaut
          description: payment.description,
          customer_name: 'Client',
          customer_surname: 'BABYLONE',
          customer_phone_number: phoneNumber,
          notify_url: payment.callback_url,
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/wallet/success`,
        });

        // Mettre à jour avec la réponse du provider
        savedPayment.provider_response = initResponse;
        savedPayment.reference = initResponse.data?.payment_token || reference;
        await this.paymentsRepository.save(savedPayment);
      } catch (error) {
        savedPayment.status = PaymentStatus.FAILED;
        savedPayment.provider_response = { error: error.message };
        await this.paymentsRepository.save(savedPayment);
        throw error;
      }
    }

    return savedPayment;
  }

  // Traiter un webhook de paiement
  async handleWebhook(
    provider: PaymentProvider,
    payload: any,
  ): Promise<Payment> {
    let payment: Payment;

    if (provider === PaymentProvider.CINETPAY) {
      // Vérifier la signature
      const isValid = this.cinetPayProvider.verifyWebhookSignature(payload);
      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }

      // Trouver le paiement par référence
      payment = await this.paymentsRepository.findOne({
        where: { reference: payload.cpm_trans_id },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Mettre à jour avec les données du webhook
      payment.webhook_data = payload;

      // Vérifier si le paiement a réussi
      if (payload.cpm_result === '00' && payment.status === PaymentStatus.PENDING) {
        payment.status = PaymentStatus.SUCCESS;
        payment.paid_at = new Date();

        // Créditer le wallet
        await this.walletService.credit(payment.user_id, payment.amount, payment.description);

        // Créer la transaction
        await this.transactionsService.createCredit(
          payment.user_id,
          payment.amount,
          payment.description,
          { payment_id: payment.id, provider: provider },
        );
      } else if (payload.cpm_result !== '00') {
        payment.status = PaymentStatus.FAILED;
      }

      await this.paymentsRepository.save(payment);
    }

    return payment;
  }

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async findByReference(reference: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({ where: { reference } });
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}

