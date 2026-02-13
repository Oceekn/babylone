import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    const wallet = await this.walletService.getOrCreate(req.user.id);
    return {
      balance: parseFloat(wallet.balance.toString()),
      currency: wallet.currency,
      user_id: req.user.id,
    };
  }

  @Get()
  async getWallet(@Request() req) {
    return this.walletService.getOrCreate(req.user.id);
  }

  // Rechargement simule (MVP)
  @Post('topup')
  async topup(@Request() req, @Body() body: { amount: number }) {
    const wallet = await this.walletService.getOrCreate(req.user.id);
    const updated = await this.walletService.credit(req.user.id, body.amount, 'Rechargement');
    return {
      message: 'Rechargement effectue',
      balance: parseFloat(updated.balance.toString()),
      currency: updated.currency,
    };
  }
}
