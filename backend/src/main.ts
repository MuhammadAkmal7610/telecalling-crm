import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ---added by akmal--─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id'],
    credentials: true,
  });

  // ---added by akmal--─── Global Prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ---added by akmal--─── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // ---added by akmal--strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,         // ---added by akmal--auto-transform payload types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ---added by akmal--─── Global Interceptors ──────────────────────────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());

  // ---added by akmal--─── Global Exception Filters ─────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ---added by akmal--─── Swagger ──────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Telecalling CRM API')
    .setDescription('Scalable REST API for the Telecalling CRM platform')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🚀 Application running on: http://localhost:${port}/api/v1`);
  console.log(`📋 Swagger docs at:         http://localhost:${port}/api/docs\n`);
}
bootstrap();
