import fastifyMultipart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BodyInterceptor } from './interceptors/body.interceptor';
import { ValidationPipe } from './pipes/validation.pipe';
import { DataSource } from 'typeorm';
import { userSeed } from './database/seeds/user.seed';

async function bootstrap() {
  const adapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      cors: {
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        origin: '*',
      },
    },
  );

  app.register(fastifyMultipart as any, { attachFieldsToBody: true });
  const config = new DocumentBuilder()
    .setTitle('Cilok Baradax API')
    .setDescription('The Cilok Baradax API description')
    .addBearerAuth(
      { type: 'http', scheme: 'Bearer', bearerFormat: 'JWT', in: 'header' },
      'Authorization',
    )
    .setVersion('1.0')
    .addTag('auth')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new BodyInterceptor());
  app.setGlobalPrefix('api');

  await app.listen(3000, '0.0.0.0');

  // ── Auto Seeder ─────────────────────────────
  const dataSource = app.get(DataSource);
  await userSeed(dataSource);
}

void bootstrap();
