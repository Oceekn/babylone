import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentProvider } from './entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async initializePayment(
    @Body() dto: InitializePaymentDto,
    @Request() req,
  ) {
    return this.paymentsService.initializePayment(
      req.user.id,
      dto.amount,
      dto.phone_number,
      dto.provider || PaymentProvider.CINETPAY,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPayment(@Param('id') id: string, @Request() req) {
    const payment = await this.paymentsService.findById(id);
    // Vérifier que le paiement appartient à l'utilisateur
    if (payment.user_id !== req.user.id) {
      throw new Error('Unauthorized');
    }
    return payment;
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@Request() req) {
    return this.paymentsService.findByUserId(req.user.id);
  }

  // Webhook CinetPay
  @Post('webhook/cinetpay')
  @HttpCode(HttpStatus.OK)
  async handleCinetPayWebhook(
    @Body() payload: any,
    @Headers('x-cinetpay-signature') signature: string,
  ) {
    // Le provider vérifiera la signature
    return this.paymentsService.handleWebhook(PaymentProvider.CINETPAY, payload);
  }

  // Webhook Flutterwave (pour plus tard)
  @Post('webhook/flutterwave')
  @HttpCode(HttpStatus.OK)
  async handleFlutterwaveWebhook(
    @Body() payload: any,
    @Headers('verif-hash') signature: string,
  ) {
    // TODO: Implémenter Flutterwave
    return { message: 'Flutterwave webhook not implemented yet' };
  }
}

