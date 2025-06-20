import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './app.config';
import authConfig from './auth.config';
import awsConfig from './aws.config';
import { AppConfigsService } from './config.service';
import dbConfig from './db.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, awsConfig, dbConfig],
      envFilePath: ['.env'],
    }),
  ],
  providers: [AppConfigsService],
  exports: [AppConfigsService],
})
export class AppConfigsModule {}
