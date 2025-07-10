import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { EmailVerificationRepository } from '~/database/repositories/email-verification.repository';
import { UserRepository } from '~/database/repositories/user.repository';
import { EmailService } from '~/modules/email/email.service';

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