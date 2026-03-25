import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  Max,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PositionDto {
  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;
}

export class CreateProfessionalDto {
  @IsString()
  @IsOptional()
  business_name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  profession?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, {
    message: 'Country code must be ISO 3166-1 alpha-2 (e.g., CM, GA)',
  })
  pays_code?: string;

  @ValidateNested()
  @Type(() => PositionDto)
  @IsOptional()
  position?: PositionDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  work_start_hour?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  work_end_hour?: number;
}

