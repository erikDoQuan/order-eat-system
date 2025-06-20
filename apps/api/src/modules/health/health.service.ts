import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class GenericHealthIndicator {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  isHealthy(key: string) {
    // Start the health indicator check for the given key
    const indicator = this.healthIndicatorService.check(key);

    try {
      return indicator.up();
    } catch (error) {
      return indicator.down('Unable to check service');
    }
  }
}
