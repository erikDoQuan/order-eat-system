import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigsService } from '~/config/config.service';

type JwtRefreshDecodedPayload = {
  id: string;
  email: string;
  iat: number;
  exp: number;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: AppConfigsService) {
    const { jwtRefreshSecretKey } = configService.get('auth');

    super({
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: jwtRefreshSecretKey,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const refreshToken = request?.cookies?.refreshToken as string;

          if (!refreshToken) {
            return null;
          }

          return refreshToken;
        },
      ]),
    });
  }

  validate(payload: JwtRefreshDecodedPayload) {
    const isTokenExpired = payload.exp < Date.now() / 1000;

    if (isTokenExpired) throw new BadRequestException('Token expired');

    return payload;
  }
}
