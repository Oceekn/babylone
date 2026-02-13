import { IsUUID, IsDateString, IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  professional_id: string;

  @IsOptional()
  @IsUUID()
  service_id?: string;

  @IsDateString()
  scheduled_at: string;

  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
