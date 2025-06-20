import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { PinoLogger } from 'nestjs-pino';
import { Pool } from 'pg';

import { AppConfigsService } from '~/config/config.service';
import * as schema from '~/database/schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: ReturnType<typeof drizzle<typeof schema>>;

  constructor(
    private readonly configService: AppConfigsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('DrizzleService');
    const dbConfig = this.configService.get('db');

    this.pool = new Pool({
      connectionString: dbConfig.dbURL,
      max: 20,
      idleTimeoutMillis: 45000,
      connectionTimeoutMillis: 30000,
      options: '-c timezone=UTC',
    });

    this.db = drizzle(this.pool, { schema });
  }

  onModuleInit() {
    this.logger.info('DrizzleService initialized');
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.info('Database connection closed');
  }
}
