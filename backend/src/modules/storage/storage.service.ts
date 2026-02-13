import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MinIO from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: MinIO.Client;
  private bucketName: string;
  private publicBaseUrl: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const useSSLValue = this.configService.get<string | boolean>('MINIO_USE_SSL', false);
    const useSSL = typeof useSSLValue === 'string' ? useSSLValue === 'true' : useSSLValue === true;
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);

    this.minioClient = new MinIO.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'babylone-media');

    // URL de base pour acceder aux fichiers publiquement
    const protocol = useSSL ? 'https' : 'http';
    this.publicBaseUrl = `${protocol}://${endpoint}:${port}/${this.bucketName}`;

    // Creer le bucket s'il n'existe pas
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      console.log(`Bucket MinIO "${this.bucketName}" cree`);
    }

    // Rendre le bucket public en lecture
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
      await this.minioClient.setBucketPolicy(this.bucketName, publicPolicy);
      console.log(`Bucket "${this.bucketName}" configure en lecture publique`);
    } catch (err) {
      console.warn('Impossible de configurer la policy du bucket:', err.message);
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    const objectName = `${Date.now()}-${fileName}`;
    await this.minioClient.putObject(this.bucketName, objectName, file, file.length, {
      'Content-Type': contentType,
    });
    return objectName;
  }

  // Retourner l'URL publique directe (courte, pas de signature)
  getPublicUrl(objectName: string): string {
    return `${this.publicBaseUrl}/${objectName}`;
  }

  // Retourner une URL signee (pour les fichiers prives si necessaire)
  async getPresignedUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucketName, objectName, expiry);
  }

  // Garder la compatibilite avec l'ancien nom de methode
  async getFileUrl(objectName: string): Promise<string> {
    return this.getPublicUrl(objectName);
  }

  async deleteFile(objectName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, objectName);
  }
}
