import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';
import { IsUUID, IsOptional } from 'class-validator';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @IsUUID()
  @IsOptional()
  professional_id?: string; // Optionnel pour la mise à jour
}

