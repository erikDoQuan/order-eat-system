import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  return {
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    jwtRefreshSecretKey: process.env.JWT_REFRESH_SECRET_KEY,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  };
});
