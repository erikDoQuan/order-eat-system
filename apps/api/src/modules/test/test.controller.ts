import { Controller, Get } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

@Controller('test')
export class TestController {
  constructor(
    private readonly cls: ClsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TestController.name);
  }

  @Get('')
  async getTest(): Promise<{ status: string; requestId: string }> {
    this.logger.info('request to TestController');

    return {
      status: 'ok',
      requestId: this.cls.getId(),
    };
  }
}
