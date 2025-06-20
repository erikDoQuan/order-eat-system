import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

import { AppConfigsService } from '~/config/config.service';
import { GenericHealthIndicator } from './health.service';

@Controller('')
export class HealthController {
  private serviceURL: string;

  constructor(
    private readonly configService: AppConfigsService,
    private health: HealthCheckService,
    private healthIndicator: GenericHealthIndicator,
  ) {
    const appConfig = this.configService.get('app');
    this.serviceURL = `http://${appConfig.host}:${appConfig.port}`;
  }

  @Get('/ping')
  @Version(VERSION_NEUTRAL)
  @HealthCheck()
  ping(): Promise<HealthCheckResult> {
    return this.health.check([() => this.healthIndicator.isHealthy(this.serviceURL)]);
  }

  @Get('/health')
  @Version(VERSION_NEUTRAL)
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    // All dependent services health check needs to performed below.
    return this.health.check([() => this.healthIndicator.isHealthy(this.serviceURL)]);
  }
}
