import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '~/common/decorators/public.decorator';
import { IConfigs } from '~/common/interfaces/configs.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const { jwtSecretKey } = this.configService.get<IConfigs['auth']>('auth');

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) return true;

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: jwtSecretKey });

      // Set the user in the request
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request.headers.authorization) {
      // Also check for token in query parameters (for testing purposes)
      if (request.query && request.query.token) {
        return request.query.token as string;
      }
      // Check for token in cookies
      if (request.cookies && request.cookies.accessToken) {
        return request.cookies.accessToken;
      }
      return undefined;
    }

    // Handle both 'Bearer token' format and raw token format
    const authHeader = request.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      const [type, token] = authHeader.split(' ');
      return token;
    } else {
      // If the header doesn't start with 'Bearer ', assume it's the raw token
      return authHeader;
    }
  }
}
