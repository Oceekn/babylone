import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWithdrawalDto } from '../payments/dto/withdrawal.dto';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createWithdrawal(
    @Body() dto: CreateWithdrawalDto,
    @Request() req,
  ) {
    return this.withdrawalsService.createWithdrawal(
      req.user.id,
      dto.amount,
      dto.phone_number,
    );
  }
}

