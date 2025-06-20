export interface IConfigs {
  app: {
    host: string;
    port: number;
    isDocumentationEnabled: boolean;
  };
  http: {
    timeout: number;
  };
  database: {
    ssl: boolean;
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    schema: string;
    isLoggingEnable: boolean;
  };
  auth: {
    jwtSecretKey: string;
    jwtExpiresIn: string;
    jwtRefreshSecretKey: string;
    jwtRefreshExpiresIn: string;
  };
  cache: {
    timeToLive: number;
  };
  middlewares: {
    cors: {
      allowOrigin: boolean | string[];
      allowMethods: string[];
      allowHeaders: string[];
    };
    rateLimit: {
      timeToLive: number;
      limit: number;
    };
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  aws: {
    region: string;
    endPoint: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
    s3: {
      bucketName: string;
      baseUrl: string;
    };
  };
}
