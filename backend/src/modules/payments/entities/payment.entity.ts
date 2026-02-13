import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PaymentProvider {
  CINETPAY = 'cinetpay',
  FLUTTERWAVE = 'flutterwave',
  MOBILE_MONEY = 'mobile_money',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('payments', { schema: 'babylone' })
@Index(['user_id'])
@Index(['reference'], { unique: true })
@Index(['status'])
@Index(['provider'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    nullable: false,
  })
  provider: PaymentProvider;

  @Column({ type: 'varchar', length: 100, unique: true })
  reference: string; // Référence unique du paiement (CinetPay transaction_id, etc.)

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 10, nullable: false, default: 'XAF' })
  currency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone_number: string; // Pour Mobile Money

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  provider_response: Record<string, any>; // Réponse complète du provider

  @Column({ type: 'jsonb', nullable: true })
  webhook_data: Record<string, any>; // Données reçues du webhook

  @Column({ type: 'varchar', length: 255, nullable: true })
  callback_url: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

