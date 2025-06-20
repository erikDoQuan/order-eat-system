import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { GenericHealthIndicator } from './health.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [GenericHealthIndicator],
})
export class HealthModule {}
