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

@Entity('story_views', { schema: 'babylone' })
@Unique(['story_id', 'user_id'])
@Index(['story_id'])
@Index(['user_id'])
export class StoryView {
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

  @CreateDateColumn({ type: 'timestamp' })
  viewed_at: Date;
}
