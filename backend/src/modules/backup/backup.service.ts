import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BackupResult {
  success: boolean;
  backupFile?: string;
  size?: string;
  hash?: string;
  error?: string;
  timestamp: Date;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;
  private readonly dbUser: string;
  private readonly dbName: string;
  private readonly dbHost: string;
  private readonly dbPort: number;
  private readonly encryptionKey?: string;
  private readonly remoteStorage?: string;
  private readonly retentionDays: number;

  constructor(private configService: ConfigService) {
    this.backupDir = this.configService.get<string>('BACKUP_DIR', '/var/backups/babylone');
    this.dbUser = this.configService.get<string>('DB_USERNAME', 'babylone_user');
    this.dbName = this.configService.get<string>('DB_DATABASE', 'babylone_prod');
    this.dbHost = this.configService.get<string>('DB_HOST', 'localhost');
    this.dbPort = this.configService.get<number>('DB_PORT', 5432);
    this.encryptionKey = this.configService.get<string>('BACKUP_ENCRYPTION_KEY');
    this.remoteStorage = this.configService.get<string>('BACKUP_REMOTE_STORAGE');
    this.retentionDays = this.configService.get<number>('BACKUP_RETENTION_DAYS', 30);

    // Créer le dossier de backup s'il n'existe pas
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Created backup directory: ${this.backupDir}`);
    }
  }

  // Exécuter un backup manuel
  async createBackup(): Promise<BackupResult> {
    const timestamp = new Date();
    const date = timestamp.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                 timestamp.toTimeString().split(' ')[0].replace(/:/g, '');

    try {
      this.logger.log('Starting manual backup...');

      // 1. Dump de la base de données
      const dbPassword = this.configService.get<string>('DB_PASSWORD');
      const dumpFile = path.join(this.backupDir, `dump_${date}.dump`);
      
      const pgDumpCmd = `PGPASSWORD="${dbPassword}" pg_dump -h ${this.dbHost} -p ${this.dbPort} -U ${this.dbUser} -d ${this.dbName} --schema=babylone --format=custom --file="${dumpFile}" --verbose`;

      this.logger.log('Creating database dump...');
      await execAsync(pgDumpCmd);

      // 2. Compression
      const backupFile = path.join(this.backupDir, `backup_${date}.tar.gz`);
      this.logger.log('Compressing backup...');
      await execAsync(`tar -czf "${backupFile}" -C "${this.backupDir}" "dump_${date}.dump"`);

      // Supprimer le dump non compressé
      fs.unlinkSync(dumpFile);

      // 3. Chiffrement GPG (si configuré)
      let finalBackupFile = backupFile;
      if (this.encryptionKey) {
        this.logger.log('Encrypting backup...');
        const encryptedFile = `${backupFile}.gpg`;
        try {
          await execAsync(
            `gpg --batch --yes --encrypt --recipient "${this.encryptionKey}" --output "${encryptedFile}" "${backupFile}"`,
          );
          fs.unlinkSync(backupFile);
          finalBackupFile = encryptedFile;
          this.logger.log('Backup encrypted successfully');
        } catch (error) {
          this.logger.warn('Encryption failed, keeping unencrypted backup');
        }
      }

      // 4. Calculer la taille et le hash
      const stats = fs.statSync(finalBackupFile);
      const size = this.formatBytes(stats.size);
      const hashResult = await execAsync(`sha256sum "${finalBackupFile}"`);
      const hash = hashResult.stdout.split(' ')[0];

      // 5. Envoi vers stockage distant (si configuré)
      if (this.remoteStorage) {
        await this.uploadToRemoteStorage(finalBackupFile);
      }

      // 6. Créer les métadonnées
      await this.createMetadata(date, finalBackupFile, size, hash);

      this.logger.log(`Backup completed: ${finalBackupFile}`);

      return {
        success: true,
        backupFile: finalBackupFile,
        size,
        hash,
        timestamp,
      };
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp,
      };
    }
  }

  // Upload vers stockage distant
  private async uploadToRemoteStorage(filePath: string): Promise<void> {
    if (!this.remoteStorage) {
      return;
    }

    try {
      if (this.remoteStorage.startsWith('s3://')) {
        // AWS S3 ou compatible
        if (await this.commandExists('aws')) {
          await execAsync(
            `aws s3 cp "${filePath}" "${this.remoteStorage}/backups/" --storage-class GLACIER`,
          );
          this.logger.log('Uploaded to S3');
        } else if (await this.commandExists('rclone')) {
          await execAsync(`rclone copy "${filePath}" "${this.remoteStorage}/backups/"`);
          this.logger.log('Uploaded via rclone');
        } else {
          this.logger.warn('Neither aws CLI nor rclone found');
        }
      } else if (this.remoteStorage.startsWith('ftp://') || this.remoteStorage.startsWith('sftp://')) {
        // FTP/SFTP
        if (await this.commandExists('rclone')) {
          await execAsync(`rclone copy "${filePath}" "${this.remoteStorage}/backups/"`);
          this.logger.log('Uploaded via FTP/SFTP');
        } else {
          this.logger.warn('rclone not found for FTP/SFTP upload');
        }
      }
    } catch (error) {
      this.logger.error(`Remote storage upload failed: ${error.message}`);
    }
  }

  // Créer le fichier de métadonnées
  private async createMetadata(
    date: string,
    backupFile: string,
    size: string,
    hash: string,
  ): Promise<void> {
    const metadataFile = path.join(this.backupDir, `backup_${date}.metadata.json`);
    const metadata = {
      backup_date: date,
      backup_file: path.basename(backupFile),
      backup_size: size,
      backup_hash: hash,
      database: this.dbName,
      encrypted: !!this.encryptionKey,
      remote_storage: this.remoteStorage || null,
      created_at: new Date().toISOString(),
    };

    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  }

  // Lister les backups disponibles
  async listBackups(): Promise<any[]> {
    const files = fs.readdirSync(this.backupDir);
    const backups = [];

    for (const file of files) {
      if (file.startsWith('backup_') && (file.endsWith('.tar.gz') || file.endsWith('.tar.gz.gpg'))) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        const metadataFile = file.replace(/\.(tar\.gz|tar\.gz\.gpg)$/, '.metadata.json');
        const metadataPath = path.join(this.backupDir, metadataFile);

        let metadata = null;
        if (fs.existsSync(metadataPath)) {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        }

        backups.push({
          file,
          size: this.formatBytes(stats.size),
          created_at: stats.birthtime,
          modified_at: stats.mtime,
          encrypted: file.endsWith('.gpg'),
          metadata,
        });
      }
    }

    return backups.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  // Nettoyer les anciens backups
  async cleanOldBackups(): Promise<{ deleted: number; errors: number }> {
    let deleted = 0;
    let errors = 0;

    try {
      const files = fs.readdirSync(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      for (const file of files) {
        if (file.startsWith('backup_') && (file.endsWith('.tar.gz') || file.endsWith('.tar.gz.gpg'))) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);

          if (stats.mtime < cutoffDate) {
            try {
              fs.unlinkSync(filePath);
              // Supprimer aussi le fichier de métadonnées
              const metadataFile = file.replace(/\.(tar\.gz|tar\.gz\.gpg)$/, '.metadata.json');
              const metadataPath = path.join(this.backupDir, metadataFile);
              if (fs.existsSync(metadataPath)) {
                fs.unlinkSync(metadataPath);
              }
              deleted++;
            } catch (error) {
              this.logger.error(`Failed to delete ${file}: ${error.message}`);
              errors++;
            }
          }
        }
      }

      this.logger.log(`Cleaned ${deleted} old backups`);
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`);
    }

    return { deleted, errors };
  }

  // Vérifier si une commande existe
  private async commandExists(command: string): Promise<boolean> {
    try {
      await execAsync(`which ${command}`);
      return true;
    } catch {
      return false;
    }
  }

  // Formater les bytes en format lisible
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

