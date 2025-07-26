import { registerAs } from '@nestjs/config';

export default registerAs('zalopay', () => ({
  appId: process.env.ZP_APP_ID || '',
  key1: process.env.ZP_KEY1 || '',
  key2: process.env.ZP_KEY2 || '',
  endpoint: process.env.ZP_CREATE_ORDER || '',
  checkStatusEndpoint: process.env.ZP_CHECK_STATUS || '',
  callbackUrl: process.env.ZP_CALLBACK_URL || '',
  redirectUrl: process.env.ZP_REDIRECT_URL || '',
}));
