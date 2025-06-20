declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    // APP
    HOST: string;
    PORT: string;
    LANG_CODE: string;
    // HTTP
    REQUEST_TIMEOUT: string;
    // RATE LIMIT
    THROTTLE_TTL: string;
    THROTTLE_LIMIT: string;
    // CACHE
    CACHE_TIME_TO_LIVE: string;
    // AUTH
    JWT_SECRET_KEY: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET_KEY: string;
    JWT_REFRESH_EXPIRES_IN: string;
    // DOCUMENTATION
    DOCUMENTATION_ENABLED: string;
    // DEFAULT USER
    USER_EMAIL: string;
    USER_PASSWORD: string;
    // EMAIL
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_SECURE: string;
    EMAIL_USERNAME: string;
    EMAIL_PASSWORD: string;
    // DATABASE
    DB_SSL: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_SCHEMA: string;
    DB_LOGS: string;
    // ALLOW ORIGIN
    ALLOW_WEB_APP_ORIGIN: string;
    ALLOW_ADMIN_PORTAL_ORIGIN: string;
    // AWS
    AWS_ENDPOINT: string;
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    // S3
    AWS_S3_BUCKET_NAME: string;
    AWS_S3_BASE_URL: string;
  }
}
