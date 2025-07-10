  import 'reflect-metadata';
  import 'source-map-support/register';

  import type { NestExpressApplication } from '@nestjs/platform-express';
  import type { ValidationError } from 'class-validator';
  import { BadRequestException, ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
  import { NestFactory, Reflector } from '@nestjs/core';
  import { ExpressAdapter } from '@nestjs/platform-express';
  import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
  import { useContainer } from 'class-validator';
  import helmet from 'helmet';

  import { AppConfigsService } from '~/config/config.service';
  import { AppModule } from './app.module';
  import * as dotenv from 'dotenv';
  dotenv.config();


  // Set timezone to UTC
  process.env.TZ = 'UTC';

  async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
      bufferLogs: true,
    });

    const configs = app.get(AppConfigsService);
    const appConfig = configs.get('app');

    // Update CORS configuration after getting configs
    app.enableCors({
      origin: appConfig.corsOrigins,
      credentials: true,
    });

    const reflector = app.get(Reflector);

    // Enable shutdown hooks for non-development environments
    app.enableShutdownHooks();
    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
    app.use(helmet());

    // https://github.com/nestjs/nest/issues/528
    // This will cause class-validator to use the nestJS module resolution,
    // the fallback option is to spare our selfs from importing all the class-validator modules to nestJS
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.set('query parser', 'extended');

    // Set up global validation pipe
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

    // List of paths to exclude
    const excludePaths = ['/health', '/ping'];
    // Set global API prefix and enable versioning
    app.setGlobalPrefix('api', { exclude: excludePaths });
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'v',
    });

    // Configure Swagger for API documentation
    const documentBuilder = new DocumentBuilder()
      .setTitle('Example System API')
      .setDescription('Example System API')
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

    await app.listen(appConfig.port, appConfig.host);

    return app;
  }

  // Declare event handlers outside startServer
  function setupGlobalHandlers(app: NestExpressApplication) {
    // Remove existing handlers if any
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('error');

    // Setup handlers
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

  async function gracefulShutdown(app: NestExpressApplication) {
    try {
      await app.close();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

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

  // Start the server
  startServer().catch(error => {
    console.error('Unhandled error during server start:', error);
    process.exit(1);
  });
