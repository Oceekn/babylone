import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class BackupScheduler {
  private readonly logger = new Logger(BackupScheduler.name);

  constructor(private backupService: BackupService) {}

  // Exécuter le backup chaque nuit à 3h du matin
  @Cron('0 3 * * *', {
    name: 'daily-backup',
    timeZone: 'Africa/Douala', // Fuseau horaire du Cameroun
  })
  async handleDailyBackup() {
    this.logger.log('Starting scheduled daily backup...');
    
    try {
      const result = await this.backupService.createBackup();
      if (result.success) {
        this.logger.log(`Daily backup completed: ${result.backupFile}`);
      } else {
        this.logger.error(`Daily backup failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Daily backup error: ${error.message}`);
    }
  }

  // Nettoyer les anciens backups chaque dimanche à 4h
  @Cron('0 4 * * 0', {
    name: 'weekly-cleanup',
    timeZone: 'Africa/Douala',
  })
  async handleWeeklyCleanup() {
    this.logger.log('Starting weekly backup cleanup...');
    
    try {
      const result = await this.backupService.cleanOldBackups();
      this.logger.log(`Weekly cleanup completed: ${result.deleted} deleted, ${result.errors} errors`);
    } catch (error) {
      this.logger.error(`Weekly cleanup error: ${error.message}`);
    }
  }
}

