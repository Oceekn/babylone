import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { BackupScheduler } from './backup.scheduler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [BackupController],
  providers: [BackupService, BackupScheduler],
  exports: [BackupService],
})
export class BackupModule {}

