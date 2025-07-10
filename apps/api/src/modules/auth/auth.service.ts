import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import { USER_ROLE } from '~/modules/user/constants/users.constant';
import { AuthBaseService } from '~/shared-modules/auth-base/auth-base.service';
import { UserRepository } from '~/database/repositories/user.repository';
import { hashPassword } from '~/common/utils/password.util';
import { SignInDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokensService } from './refresh-tokens.service';
import { TokenService } from './token.service';
import { VerificationService } from './verification.service';

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

    // Normalize email trước khi kiểm tra
    const normalizedEmail = email.trim().toLowerCase();
    

    // Kiểm tra email đã tồn tại chưa (chỉ user active)
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    
    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        // Nếu user đã tồn tại nhưng chưa xác thực, gửi lại email xác thực
        try {
          await this.verificationService.sendVerificationEmail(existingUser.id);
          return {
            success: true,
            message: 'Email này đã đăng ký nhưng chưa xác thực. Đã gửi lại email xác thực, vui lòng kiểm tra email.',
            user: {
              id: existingUser.id,
              email: existingUser.email,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              isEmailVerified: existingUser.isEmailVerified,
            },
          };
        } catch (error) {
          return {
            success: true,
            message: 'Email này đã đăng ký nhưng chưa xác thực. Tuy nhiên, có lỗi khi gửi lại email xác thực. Vui lòng liên hệ admin.',
            user: {
              id: existingUser.id,
              email: existingUser.email,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              isEmailVerified: existingUser.isEmailVerified,
            },
          };
        }
      }
      throw new BadRequestException('Email này đã tồn tại');
    }

    // Hash password trước khi tạo user
    const hashedPassword = await hashPassword(password);

    // Kiểm tra xem có user inactive với email này không
    const inactiveUser = await this.userRepository.findInactiveByEmail(normalizedEmail);
    
    let newUser;
    if (inactiveUser) {
      // Update user cũ thành active
      newUser = await this.userRepository.update(inactiveUser.id, {
        email: normalizedEmail,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        address,
        role: USER_ROLE.USER,
        isActive: true,
        isEmailVerified: false,
      });
    } else {
      // Tạo user mới
      newUser = await this.userRepository.create({
        email: normalizedEmail,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        address,
        role: USER_ROLE.USER,
        isActive: true,
        isEmailVerified: false, // Email chưa được xác thực
      });
    }

    // Gửi email xác thực
    try {
      await this.verificationService.sendVerificationEmail(newUser.id);
    } catch (error) {
      // Vẫn tạo user nhưng thông báo lỗi gửi email
      return {
        success: true,
        message: 'Đăng ký thành công! Tuy nhiên, có lỗi khi gửi email xác thực. Vui lòng liên hệ admin để được hỗ trợ.',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isEmailVerified: newUser.isEmailVerified,
        },
      };
    }

    return {
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isEmailVerified: newUser.isEmailVerified,
      },
    };
  }
}
