import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // CORS - Web + app mobile (origin peut être null, file:// ou capacitor://)
  app.enableCors({
    origin: true, // en dev : accepter toute origine pour que l’app mobile joigne le backend
    credentials: true,
  });

  // Body parser pour les webhooks (raw body)
  app.use('/api/v1/payments/webhook', (req, res, next) => {
    // Pour les webhooks, on garde le body raw pour la vérification de signature
    next();
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log(`🚀 BABYLONE Backend running on: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/${apiPrefix}`);
  if (host === '0.0.0.0') console.log(`   (accessible sur le réseau: http://<VOTRE_IP>:${port}/${apiPrefix})`);
  console.log(`📊 Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();

