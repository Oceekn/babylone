import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('professionals', { schema: 'babylone' })
@Index(['user_id'], { unique: true })
// Index spatial GIST créé via migration (voir migrations/1700000000000-CreatePostGISIndexes.ts)
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 200, nullable: true })
  business_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  profession: string; // Ex: "Plombier", "Coiffeur", etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 2, nullable: false, default: 'CM' })
  pays_code: string;

  // Géolocalisation : JSON { type: 'Point', coordinates: [lng, lat] } (compatible sans PostGIS)
  @Column({ type: 'jsonb', nullable: true })
  position_gps: { type: 'Point'; coordinates: [number, number] } | null;

  @Column({ type: 'text', nullable: true })
  cni_document_url: string; // URL du document CNI sur MinIO

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // Note moyenne (0-5)

  @Column({ type: 'int', default: 0 })
  total_reviews: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

