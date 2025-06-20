import { Injectable, NestMiddleware } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RequestIdMiddleware.name);
  }

  use(req, res, next: () => void) {
    // Get the request ID using the getId method
    const requestId = this.cls.getId();
    this.logger.info(`requestId: ${requestId}`);

    next();
  }
}
