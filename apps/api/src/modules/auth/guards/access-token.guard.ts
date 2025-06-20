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
    // Log all request headers to see what's coming in
    const request: Request = context.switchToHttp().getRequest();
    console.log('Request path:', request.path);

    const { jwtSecretKey } = this.configService.get<IConfigs['auth']>('auth');
    console.log('JWT Secret Key exists:', !!jwtSecretKey);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    console.log('Is public endpoint:', isPublic);

    if (isPublic) return true;

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.log('No token found in request');
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Log the token and secret key being used (be careful with this in production)
      console.log('Verifying token with secret key:', jwtSecretKey ? 'Secret key exists' : 'Secret key is missing');

      // Verify the token
      const payload = await this.jwtService.verifyAsync(token, { secret: jwtSecretKey });

      // Set the user in the request
      request.user = payload;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request.headers.authorization) {
      console.log('No authorization header found');
      // Also check for token in query parameters (for testing purposes)
      if (request.query && request.query.token) {
        console.log('Found token in query parameters');
        return request.query.token as string;
      }
      // Check for token in cookies
      if (request.cookies && request.cookies.accessToken) {
        console.log('Found token in cookies');
        return request.cookies.accessToken;
      }
      return undefined;
    }

    // Handle both 'Bearer token' format and raw token format
    const authHeader = request.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      const [type, token] = authHeader.split(' ');
      console.log('Auth type:', type, 'Token exists:', !!token);
      return token;
    } else {
      // If the header doesn't start with 'Bearer ', assume it's the raw token
      console.log('Using raw token from Authorization header');
      return authHeader;
    }
  }
}
