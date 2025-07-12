import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import { USER_ROLE } from '~/modules/user/constants/users.constant';
import { AuthBaseService } from '~/shared-modules/auth-base/auth-base.service';
import { UserRepository } from '~/database/repositories/user.repository';
import { hashPassword } from '~/common/utils/password.util';
import { SignInDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokensService } from './refresh-tokens.service';
import { TokenService } from './token.service';
import { VerificationService } from './verification.service';
import * as jwt from 'jsonwebtoken';
import { EmailService } from '~/modules/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authBaseService: AuthBaseService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly tokenService: TokenService,
    private readonly verificationService: VerificationService,
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        createdBy: user.createdBy,
        updatedBy: user.updatedBy,
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

    // Kiểm tra email đã xác thực chưa
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản.');
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        createdBy: user.createdBy,
        updatedBy: user.updatedBy,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async signOut(refreshToken: string, ipAddress: string, userAgent: string) {
    return this.refreshTokensService.revoke(refreshToken, ipAddress, userAgent);
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phoneNumber, address } = registerDto;
    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra email đã tồn tại (active hoặc inactive)
    const existingUser = await this.userRepository.findByEmailWithInactive(normalizedEmail);
    if (existingUser && existingUser.isActive) {
      throw new BadRequestException('Email này đã tồn tại');
    }

    // Tạo token xác thực chứa thông tin đăng ký (mã hóa bằng JWT)
    const payload = {
      email: normalizedEmail,
      password, // sẽ hash khi xác thực
      firstName,
      lastName,
      phoneNumber,
      address,
      createdAt: Date.now(),
    };
    const secret = process.env.EMAIL_VERIFICATION_SECRET || 'email-secret';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    // Gửi email xác thực với token này
    try {
      await this.verificationService.sendVerificationEmailRaw(normalizedEmail, token, `${firstName} ${lastName}`);
    } catch (error) {
      throw new BadRequestException('Không thể gửi email xác thực. Vui lòng kiểm tra lại địa chỉ email.');
    }

    return {
      success: true,
      message: 'Đăng ký thành công! Đã gửi email xác thực, vui lòng kiểm tra email.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmailWithInactive(email.trim().toLowerCase());
    if (!user || !user.isActive) throw new BadRequestException('Email not found or inactive');
    const payload = { userId: user.id, email: user.email, type: 'reset', createdAt: Date.now() };
    const secret = process.env.EMAIL_VERIFICATION_SECRET || 'email-secret';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`;
    await this.verificationService.sendResetPasswordEmail(user.email, resetLink, `${user.firstName} ${user.lastName}`);
    return { success: true, message: 'Reset password email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const secret = process.env.EMAIL_VERIFICATION_SECRET || 'email-secret';
    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
    }
    const user = await this.userRepository.findOne(payload.userId);
    if (!user || !user.isActive) throw new BadRequestException('User not found or inactive');
    const hashed = await hashPassword(newPassword);
    await this.userRepository.update(user.id, { password: hashed });
    return { success: true, message: 'Password updated successfully' };
  }
}
