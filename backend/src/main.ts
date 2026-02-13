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

  // CORS - À configurer selon les besoins
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

  await app.listen(port);
  console.log(`🚀 BABYLONE Backend running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📊 Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();

