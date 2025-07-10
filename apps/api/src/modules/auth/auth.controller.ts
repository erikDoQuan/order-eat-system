import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response as ExpressResponse, Request } from 'express';

import { AppConfigsService } from '~/config/config.service';
import { AuthService } from './auth.service';
import { LoginWithCredentialsDoc, SignOutDoc } from './docs/auth.doc';
import { SignInDto } from './dto/auth.dto';
import { VerificationService } from './verification.service';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verification.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRepository } from '~/database/repositories/user.repository';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigsService,
    private readonly verificationService: VerificationService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 10000 } })
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiOkResponse({ description: 'Login successfully', type: LoginWithCredentialsDoc })
  async login(@Req() req: Request, @Res({ passthrough: true }) response: ExpressResponse, @Body() signInDto: SignInDto) {
    const ip = req.ip;
    const ua = req.headers['user-agent'] || '';

    const resp = await this.authService.signIn(signInDto, ip, ua);
    console.log('[LOGIN] User logged in:', resp.user?.email || resp.user?.id, 'Role:', resp.user?.role);
    const appEnv = this.configService.get('app').appEnv;

    response.cookie('refreshToken', resp.refreshToken, {
      httpOnly: true,
      secure: appEnv !== 'development',
    });

    // Không xóa resp.refreshToken, giữ nguyên accessToken trong response
    response.status(200).json(resp);
    return;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out' })
  @ApiOkResponse({ description: 'Logout successfully', type: SignOutDoc })
  async signOut(@Req() req: Request) {
    const ip = req.ip;
    const ua = req.headers['user-agent'] || '';
    const refreshToken = req.cookies?.refreshToken || '';

    if (!refreshToken) {
      return { success: true, message: 'Logged out successfully' };
    }

    return this.authService.signOut(refreshToken, ip, ua);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiOkResponse({ description: 'Email verified successfully' })
  async verifyEmail(@Query('token') token: string) {
    return this.verificationService.verifyEmail(token);
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Giới hạn 3 lần/phút
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiOkResponse({ description: 'Verification email sent successfully' })
  async resendVerificationEmail(@Body() resendDto: ResendVerificationDto) {
    return this.verificationService.resendVerificationEmail(resendDto.userId);
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Giới hạn 5 lần/phút
  @ApiOperation({ summary: 'Register new user with email verification' })
  @ApiOkResponse({ description: 'User registered successfully, verification email sent' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Endpoint tạm thời để debug - kiểm tra tất cả email
  @Get('debug/emails')
  async getAllEmails() {
    return this.userRepository.getAllEmails();
  }

  // Endpoint test để kiểm tra cấu hình email
  @Post('test-email')
  async testEmail(@Body() body: { email: string }) {
    try {
      await this.verificationService.sendVerificationEmail(body.email);
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      console.error('Test email error:', error);
      return { success: false, message: error.message };
    }
  }
}
