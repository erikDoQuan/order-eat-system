import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import { USER_ROLE } from '~/modules/user/constants/users.constant';
import { AuthBaseService } from '~/shared-modules/auth-base/auth-base.service';
import { SignInDto } from './dto/auth.dto';
import { RefreshTokensService } from './refresh-tokens.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authBaseService: AuthBaseService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly tokenService: TokenService,
  ) {}

  async signInAdmin(signInDto: SignInDto, ipAddress: string, userAgent: string) {
    const { email, password } = signInDto;

    const user = await this.authBaseService.findByEmailAndPassword(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị tắt, vui lòng liên hệ quản trị viên.');
    }

    if (user.role !== USER_ROLE.ADMIN) {
      throw new ForbiddenException('Access denied: Admin privileges required');
    }

    const accessToken = this.tokenService.createAccessToken(user);
    const refreshToken = this.tokenService.createRefreshToken(user);

    await this.refreshTokensService.create({
      userId: user.id,
      token: refreshToken,
      createdByIp: ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async signIn(signInDto: SignInDto, ipAddress: string, userAgent: string) {
    const { email, password } = signInDto;

    const user = await this.authBaseService.findByEmailAndPassword(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị tắt, vui lòng liên hệ quản trị viên.');
    }

    if (user.role !== USER_ROLE.USER) {
      throw new ForbiddenException('Access denied: User privileges required');
    }

    const accessToken = this.tokenService.createAccessToken(user);
    const refreshToken = this.tokenService.createRefreshToken(user);

    await this.refreshTokensService.create({
      userId: user.id,
      token: refreshToken,
      createdByIp: ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async signOut(refreshToken: string, ipAddress: string, userAgent: string) {
    return this.refreshTokensService.revoke(refreshToken, ipAddress, userAgent);
  }
}
