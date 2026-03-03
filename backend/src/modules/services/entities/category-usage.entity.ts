import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('category_usage', { schema: 'babylone' })
export class CategoryUsage {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', default: 0 })
  count: number;
}
