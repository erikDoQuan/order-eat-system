import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

import { EmailVerificationRepository } from '~/database/repositories/email-verification.repository';
import { UserRepository } from '~/database/repositories/user.repository';
import { EmailService } from '~/modules/email/email.service';
import { hashPassword } from '~/common/utils/password.util';
import { USER_ROLE } from '~/modules/user/constants/users.constant';

@Injectable()
export class VerificationService {
  constructor(
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async createVerificationToken(userId: string): Promise<string> {
    // Xóa token cũ nếu có
    await this.emailVerificationRepository.deleteByUserId(userId);

    // Tạo token mới
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    await this.emailVerificationRepository.create({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Luôn gửi email xác thực, không kiểm tra isEmailVerified
    const token = await this.createVerificationToken(userId);
    const userName = `${user.firstName} ${user.lastName}`.trim();

    await this.emailService.sendVerificationEmail(user.email, token, userName);
  }

  // Gửi email xác thực với email, token và tên người dùng tuỳ ý (không cần userId)
  async sendVerificationEmailRaw(email: string, token: string, userName: string): Promise<void> {
    await this.emailService.sendVerificationEmail(email, token, userName);
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const verification = await this.emailVerificationRepository.findByToken(token);

    if (!verification) {
      throw new BadRequestException('Token không hợp lệ');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Token đã hết hạn');
    }

    if (verification.verifiedAt) {
      throw new BadRequestException('Email đã được xác thực trước đó');
    }

    // Đánh dấu email đã được xác thực
    await this.emailVerificationRepository.markAsVerified(token);

    // Cập nhật trạng thái user
    await this.userRepository.update(verification.userId, { isEmailVerified: true });

    return {
      success: true,
      message: 'Xác thực email thành công!',
    };
  }

  // Xác thực email bằng token, tạo user vào database nếu hợp lệ
  async verifyEmailWithToken(token: string): Promise<{ success: boolean; message: string }> {
    const secret = process.env.EMAIL_VERIFICATION_SECRET || 'email-secret';
    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userRepository.findByEmailWithInactive(payload.email);
    if (existingUser) {
      throw new BadRequestException('Email này đã tồn tại hoặc đã được xác thực.');
    }
    // Hash password trước khi lưu
    const hashedPassword = await hashPassword(payload.password);
    // Tạo user mới
    await this.userRepository.create({
      email: payload.email,
      password: hashedPassword,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      address: payload.address,
      role: USER_ROLE.USER,
      isActive: true,
      isEmailVerified: true,
    });
    return {
      success: true,
      message: 'Xác thực email thành công! Tài khoản đã được tạo.',
    };
  }

  async resendVerificationEmail(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Luôn gửi lại email xác thực, không kiểm tra isEmailVerified
    await this.sendVerificationEmail(userId);

    return {
      success: true,
      message: 'Email xác thực đã được gửi lại',
    };
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.emailVerificationRepository.deleteExpiredTokens();
  }
} 