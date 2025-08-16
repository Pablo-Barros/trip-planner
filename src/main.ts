import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Swagger (disabled in production by default)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Trip Planner API')
      .setDescription('API for searching and managing trips')
      .setVersion('1.0')
      .addTag('Trips')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err: Error) => {
  Logger.error('Bootstrap failed:', err.stack || err.message || err);
  process.exit(1);
});
