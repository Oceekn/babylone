import { IsString, IsNumber, IsOptional, Matches, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProfessionalsDto {
  @IsString()
  @IsNotEmpty()
  longitude: string;

  @IsString()
  @IsNotEmpty()
  latitude: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  radius?: number; // En mètres

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  pays_code?: string;

  @IsString()
  @IsOptional()
  profession?: string; // Filtrer par profession
}
