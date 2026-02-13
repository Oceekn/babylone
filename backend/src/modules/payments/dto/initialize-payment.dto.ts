import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { PaymentProvider } from '../entities/payment.entity';

export class InitializePaymentDto {
  @IsNumber()
  @Min(100) // Minimum 100 XAF
  amount: number;

  @IsString()
  phone_number: string;

  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;
}

