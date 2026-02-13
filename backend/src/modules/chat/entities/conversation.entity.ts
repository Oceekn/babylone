import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

export enum ConversationType {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
}

@Entity('conversations', { schema: 'babylone' })
@Index(['type'])
@Index(['last_message_at'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.INDIVIDUAL,
  })
  type: ConversationType;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string; // Pour les groupes

  @Column({ type: 'text', nullable: true })
  avatar_url: string; // Pour les groupes

  @Column({ type: 'uuid', nullable: true })
  created_by: string; // Créateur de la conversation (pour groupes)

  @Column({ type: 'timestamp', nullable: true })
  last_message_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}

