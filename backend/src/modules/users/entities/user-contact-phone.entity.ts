import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/** Numéros importés depuis le répertoire du téléphone (pour autoriser les DM sans follow). */
@Entity('user_contact_phones', { schema: 'babylone' })
@Index(['user_id', 'phone_e164'], { unique: true })
export class UserContactPhone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 24 })
  phone_e164: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
