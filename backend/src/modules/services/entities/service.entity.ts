import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Professional } from '../../professionals/entities/professional.entity';

@Entity('services', { schema: 'babylone' })
@Index(['professional_id'])
@Index(['is_active'])
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  professional_id: string;

  @ManyToOne(() => Professional)
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'varchar', length: 10, nullable: false, default: 'XAF' })
  currency: string; // XAF, EUR, USD

  @Column({ type: 'int', nullable: true })
  estimated_duration: number; // En minutes

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

