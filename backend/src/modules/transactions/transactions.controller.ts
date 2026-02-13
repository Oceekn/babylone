import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('my-transactions')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.findByUserId(
      req.user.id,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTransaction(@Param('id') id: string, @Request() req) {
    const transaction = await this.transactionsService.findById(id);
    // Vérifier que la transaction appartient à l'utilisateur
    if (transaction.user_id !== req.user.id) {
      throw new Error('Unauthorized');
    }
    return transaction;
  }
}

