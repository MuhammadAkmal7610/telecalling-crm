import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'node:fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

async function exportSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false });
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
  writeFileSync('swagger-export.json', JSON.stringify(document, null, 2));
  console.log('Exported swagger-export.json');
  await app.close();
}

exportSwagger().catch((error) => {
  console.error(error);
  process.exit(1);
});
