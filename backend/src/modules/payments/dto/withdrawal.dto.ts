import { IsNumber, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @Min(1000) // Minimum 1000 XAF
  amount: number;

  @IsString()
  phone_number: string; // Numéro de téléphone pour le retrait Mobile Money
}

