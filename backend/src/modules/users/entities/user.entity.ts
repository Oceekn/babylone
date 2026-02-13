import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
}

export enum AccountStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

@Entity('users', { schema: 'babylone' })
@Index(['telephone'], { unique: true })
@Index(['email'], { unique: true, where: '"email" IS NOT NULL' })
@Index(['pays_code'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  telephone: string; // Format: +237XXXXXXXXX (avec indicatif)

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PENDING_VERIFICATION,
  })
  status: AccountStatus;

  @Column({ type: 'char', length: 2, nullable: false, default: 'CM' })
  pays_code: string; // ISO 3166-1 alpha-2: CM, GA, TD, CG

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

