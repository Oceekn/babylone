import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
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
}

