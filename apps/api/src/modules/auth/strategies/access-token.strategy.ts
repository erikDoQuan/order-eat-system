import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigsService } from '~/config/config.service';

type JwtDecodedPayload = {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: AppConfigsService) {
    const { jwtSecretKey } = configService.get('auth');

    super({
      ignoreExpiration: false,
      secretOrKey: jwtSecretKey,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  validate(payload: JwtDecodedPayload) {
    const isTokenExpired = payload.exp < Date.now() / 1000;

    if (isTokenExpired) throw new BadRequestException('Token expired');

    return payload;
  }
}
