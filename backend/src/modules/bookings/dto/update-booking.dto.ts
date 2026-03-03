import { IsOptional, IsString, IsNumber, IsIn, MaxLength, Min, Max, IsDateString } from 'class-validator';

export class RescheduleBookingDto {
  @IsDateString()
  scheduled_at: string;
}

export class UpdateBookingStatusDto {
  @IsIn(['confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellation_reason?: string;
}

export class ReviewBookingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  review?: string;
}
