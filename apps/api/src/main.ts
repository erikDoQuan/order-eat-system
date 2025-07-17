import 'reflect-metadata';
import 'source-map-support/register';
import * as dotenv from 'dotenv';
dotenv.config();

import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ValidationError } from 'class-validator';
import { BadRequestException, ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import { join } from 'path';
import * as express from 'express';

import { AppConfigsService } from '~/config/config.service';
import { AppModule } from './app.module';

process.env.TZ = 'UTC';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
    bufferLogs: true,
  });

  const configs = app.get(AppConfigsService);
  const appConfig = configs.get('app');

  // Bật CORS cho frontend
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3002'], 
    credentials: true,
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.enableShutdownHooks();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "frame-ancestors": ["'self'", "http://localhost:3001"],
        },
      },
    })
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.set('query parser', 'extended');

  // ✅ Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      skipMissingProperties: false,
      validationError: { target: false },
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => new BadRequestException(errors),
    }),
  );

  // ✅ Prefix + Versioning
  const excludePaths = ['/health', '/ping'];
  app.setGlobalPrefix('api', { exclude: excludePaths });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // ✅ Swagger
  const documentBuilder = new DocumentBuilder()
    .setTitle('Food Ordering System API')
    .setDescription('API documentation for food ordering system')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'accessToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api/v1/documentation', app, document);

  // Log đường dẫn Swagger UI
  console.log(`\n==============================`);
  console.log(`Swagger UI is available at: http://${appConfig.host}:${appConfig.port}/api/v1/documentation`);
  console.log(`==============================\n`);

  // Serve static files from frontend build
  app.use(express.static(join(__dirname, '..', '..', 'admin-portal', 'dist')));

  // Fallback: mọi route không phải API trả về index.html
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(join(__dirname, '..', '..', 'admin-portal', 'dist', 'index.html'));
  });

  await app.listen(appConfig.port, appConfig.host);

  // Log server information
  console.log(`==========================================================`);
  console.log(`Http Server running on ${await app.getUrl()} Example System`);
  console.log(`==========================================================`);
  console.log(`Documentation: http://localhost:${appConfig.port}/api/v1/documentation`);
  console.log(`==========================================================`);

  return app;
}

// 🔁 Shutdown + error listeners
function setupGlobalHandlers(app: NestExpressApplication) {
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
  process.removeAllListeners('SIGTERM');
  process.removeAllListeners('error');

  process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', { promise, reason });
  });

  process.on('SIGTERM', () => {
    gracefulShutdown(app);
  });

  process.on('error', error => {
    if (error instanceof Error) {
      console.error('Process error:', {
        message: error.message,
        stack: error.stack,
      });
    }
  });
}

// 🛑 Graceful shutdown
async function gracefulShutdown(app: NestExpressApplication) {
  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// 🚀 Start server
async function startServer() {
  try {
    const app = await bootstrap();
    setupGlobalHandlers(app);
    return app;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(error => {
  console.error('Unhandled error during server start:', error);
  process.exit(1);
});
