import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Highlight } from './highlight.entity';
import { Story } from './story.entity';

@Entity('highlight_stories', { schema: 'babylone' })
@Unique(['highlight_id', 'story_id'])
@Index(['highlight_id'])
@Index(['story_id'])
export class HighlightStory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  highlight_id: string;

  @ManyToOne(() => Highlight, (h) => h.highlight_stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'highlight_id' })
  highlight: Highlight;

  @Column({ type: 'uuid' })
  story_id: string;

  @ManyToOne(() => Story)
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ type: 'int', default: 0 })
  position: number;
}
