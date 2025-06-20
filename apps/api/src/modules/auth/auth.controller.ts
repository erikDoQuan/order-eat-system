import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response as ExpressResponse, Request } from 'express';

import { ApiDocumentResponse } from '~/common/decorators/api-document-response.decorator';
import { Response } from '~/common/decorators/response.decorator';
import { AppConfigsService } from '~/config/config.service';
import { AuthService } from './auth.service';
import { LoginWithCredentialsDoc, SignOutDoc } from './docs/auth.doc';
import { SignInDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigsService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 10000 } })
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiDocumentResponse({ message: 'Login successfully', model: LoginWithCredentialsDoc })
  @Response({ message: 'Login successfully' })
  async login(@Req() req: Request, @Res({ passthrough: true }) response: ExpressResponse, @Body() signInDto: SignInDto) {
    const ip = req.ip;
    const ua = req.headers['user-agent'] || '';

    const resp = await this.authService.signIn(signInDto, ip, ua);
    const appEnv = this.configService.get('app').appEnv;

    response.cookie('refreshToken', resp.refreshToken, {
      httpOnly: true,
      secure: appEnv !== 'development',
    });

    delete resp.refreshToken;

    return resp;
  }
  @Post('logout')
  @ApiOperation({ summary: 'Log out' })
  @ApiDocumentResponse({ message: 'Logout successfully', model: SignOutDoc })
  @Response({ message: 'Logout successfully' })
  async signOut(@Req() req: Request) {
    const ip = req.ip;
    const ua = req.headers['user-agent'] || '';
    const refreshToken = req.cookies?.refreshToken || '';

    if (!refreshToken) {
      return { success: true, message: 'Logged out successfully' };
    }

    return this.authService.signOut(refreshToken, ip, ua);
  }
}
