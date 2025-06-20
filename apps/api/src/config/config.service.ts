import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigType, Path, PathValue } from '@nestjs/config';

import appConfig from './app.config';
import authConfig from './auth.config';
import awsConfig from './aws.config';
import dbConfig from './db.config';

type AppConfigsType = {
  app: ConfigType<typeof appConfig>;
  auth: ConfigType<typeof authConfig>;
  aws: ConfigType<typeof awsConfig>;
  db: ConfigType<typeof dbConfig>;
};

@Injectable()
export class AppConfigsService extends ConfigService<AppConfigsType, true> {
  override get<P extends Path<T>, T = AppConfigsType>(arg: P): PathValue<T, P> {
    return super.get<T, P, PathValue<T, P>>(arg, { infer: true });
  }
}
