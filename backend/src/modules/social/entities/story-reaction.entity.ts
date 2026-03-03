import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Story } from './story.entity';

@Entity('story_reactions', { schema: 'babylone' })
@Unique(['story_id', 'user_id'])
@Index(['story_id'])
@Index(['user_id'])
export class StoryReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  story_id: string;

  @ManyToOne(() => Story)
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 16 })
  emoji: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
