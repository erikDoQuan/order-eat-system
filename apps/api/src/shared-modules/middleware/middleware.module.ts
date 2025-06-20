import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { RequestIdMiddleware } from './request-context.middleware';

@Module({})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*path');
  }
}
