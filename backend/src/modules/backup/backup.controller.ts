import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  async createBackup() {
    return this.backupService.createBackup();
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async listBackups() {
    return this.backupService.listBackups();
  }

  @Post('clean')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  async cleanOldBackups() {
    return this.backupService.cleanOldBackups();
  }
}

