import { Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MinIO from 'minio';

type StorageMode = 'minio' | 's3';

@Injectable()
export class StorageService implements OnModuleInit {
  private client: MinIO.Client | null = null;
  private bucketName: string;
  private publicBaseUrl: string;
  private mode: StorageMode | null = null;

  constructor(private configService: ConfigService) {
    this.bucketName =
      this.configService.get<string>('S3_BUCKET') ||
      this.configService.get<string>('MINIO_BUCKET_NAME', 'babylone-media');
    this.publicBaseUrl = this.configService.get<string>('S3_PUBLIC_BASE_URL', '');
  }

  isAvailable(): boolean {
    return this.client != null;
  }

  async onModuleInit() {
    try {
      const disabled = this.configService.get<string>('STORAGE_DISABLED', 'false') === 'true';
      if (disabled) {
        console.warn('[StorageService] Stockage désactivé (STORAGE_DISABLED=true).');
        return;
      }

      // 1) S3-compatible (AWS S3, Cloudflare R2, etc.)
      const s3AccessKey =
        this.configService.get<string>('S3_ACCESS_KEY') || this.configService.get<string>('AWS_ACCESS_KEY_ID');
      const s3SecretKey =
        this.configService.get<string>('S3_SECRET_KEY') || this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
      const s3Bucket = this.configService.get<string>('S3_BUCKET');

      if (s3Bucket && s3AccessKey && s3SecretKey) {
        await this.initS3(s3Bucket, s3AccessKey, s3SecretKey);
        return;
      }

      // 2) MinIO uniquement si endpoint explicite (pas localhost en prod, évite ECONNREFUSED sur Railway)
      const minioEndpoint = (this.configService.get<string>('MINIO_ENDPOINT') || 'localhost').toLowerCase();
      const isLocalEndpoint = ['localhost', '127.0.0.1', '::1'].includes(minioEndpoint) || minioEndpoint.startsWith('127.');
      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
      if (isProduction && isLocalEndpoint) {
        console.warn('[StorageService] MinIO en localhost ignoré en production. Utilisez S3_* ou un MINIO_ENDPOINT distant.');
        return;
      }

      const minioAccessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
      const minioSecretKey = this.configService.get<string>('MINIO_SECRET_KEY');
      if (minioAccessKey && minioSecretKey) {
        await this.initMinIO(minioAccessKey, minioSecretKey);
        return;
      }

      console.warn(
        '[StorageService] Aucun stockage configuré. Définir S3_* (ou AWS_*) ou MINIO_* pour activer les uploads.',
      );
    } catch (err: any) {
      console.warn('[StorageService] Erreur au démarrage du stockage:', err?.message || err);
      this.client = null;
    }
  }

  private async initS3(bucket: string, accessKey: string, secretKey: string): Promise<void> {
    const endpoint = this.configService.get<string>('S3_ENDPOINT', 's3.amazonaws.com');
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    const publicBase = this.configService.get<string>('S3_PUBLIC_BASE_URL', '');

    try {
      const host = endpoint.replace(/^https?:\/\//, '').split('/')[0];
      const useSSL = endpoint.startsWith('https') || host.includes('amazonaws.com') || host.includes('r2.cloudflarestorage.com');

      this.client = new MinIO.Client({
        endPoint: host,
        port: useSSL ? 443 : 80,
        useSSL,
        accessKey,
        secretKey,
        region,
      });
      this.bucketName = bucket;
      this.publicBaseUrl = publicBase;
      this.mode = 's3';

      const bucketExists = await this.client.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.client.makeBucket(this.bucketName, region);
        console.log(`[StorageService] Bucket S3 "${this.bucketName}" créé (region: ${region}).`);
      } else {
        console.log(`[StorageService] S3 connecté (bucket: ${this.bucketName}).`);
      }
    } catch (err: any) {
      console.warn('[StorageService] Connexion S3 impossible:', err?.message || err);
      this.client = null;
    }
  }

  private async initMinIO(accessKey: string, secretKey: string): Promise<void> {
    const useSSLValue = this.configService.get<string | boolean>('MINIO_USE_SSL', false);
    const useSSL = typeof useSSLValue === 'string' ? useSSLValue === 'true' : useSSLValue === true;
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);

    try {
      this.client = new MinIO.Client({
        endPoint: endpoint,
        port,
        useSSL,
        accessKey,
        secretKey,
      });
      this.publicBaseUrl = `${useSSL ? 'https' : 'http'}://${endpoint}:${port}/${this.bucketName}`;
      this.mode = 'minio';

      const bucketExists = await this.client.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(`[StorageService] Bucket MinIO "${this.bucketName}" créé.`);
      }
      try {
        const publicPolicy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        });
        await this.client.setBucketPolicy(this.bucketName, publicPolicy);
      } catch (err: any) {
        console.warn('[StorageService] Policy bucket MinIO:', err?.message);
      }
      console.log(`[StorageService] MinIO connecté (bucket: ${this.bucketName}).`);
    } catch (err: any) {
      console.warn('[StorageService] MinIO indisponible (connexion refusée). Uploads désactivés.', err?.message || err);
      this.client = null;
    }
  }

  private assertStorageAvailable(): void {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Stockage non configuré ou indisponible. Configurer S3_* (ou AWS_*) ou MINIO_* (et que le service soit joignable).',
      );
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    this.assertStorageAvailable();
    const objectName = `${Date.now()}-${fileName}`;
    await this.client!.putObject(this.bucketName, objectName, file, file.length, {
      'Content-Type': contentType,
    });
    return objectName;
  }

  getPublicUrl(objectName: string): string {
    if (!this.client || !this.publicBaseUrl) return '';
    return `${this.publicBaseUrl.replace(/\/$/, '')}/${objectName}`;
  }

  async getPresignedUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    this.assertStorageAvailable();
    return this.client!.presignedGetObject(this.bucketName, objectName, expiry);
  }

  async getFileUrl(objectName: string): Promise<string> {
    const url = this.getPublicUrl(objectName);
    if (url) return url;
    return this.getPresignedUrl(objectName);
  }

  async deleteFile(objectName: string): Promise<void> {
    this.assertStorageAvailable();
    await this.client!.removeObject(this.bucketName, objectName);
  }
}
