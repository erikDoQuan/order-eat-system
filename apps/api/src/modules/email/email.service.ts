import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Cấu hình transporter theo hướng dẫn
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, userName: string): Promise<void> {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Xác nhận địa chỉ Email của bạn - Bếp Của Mẹ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Bếp Của Mẹ</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${userName}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Cảm ơn bạn đã đăng ký tài khoản tại Bếp Của Mẹ. Để hoàn tất quá trình đăng ký, 
              vui lòng xác nhận email của bạn bằng cách nhấn vào nút bên dưới:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Xác nhận Email
              </a>
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hoặc bạn có thể copy và paste link sau vào trình duyệt:
            </p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all;">
              <a href="${verificationLink}" style="color: #16a34a;">${verificationLink}</a>
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Link này sẽ hết hạn sau 1 giờ. Nếu bạn không thực hiện yêu cầu này, 
              vui lòng bỏ qua email này.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Email này được gửi tự động, vui lòng không trả lời email này.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, token: string, userName: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Đặt lại mật khẩu - Bếp Của Mẹ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Bếp Của Mẹ</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${userName}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
              Nhấn vào nút bên dưới để đặt lại mật khẩu:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hoặc bạn có thể copy và paste link sau vào trình duyệt:
            </p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all;">
              <a href="${resetLink}" style="color: #16a34a;">${resetLink}</a>
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Link này sẽ hết hạn sau 1 giờ. Nếu bạn không thực hiện yêu cầu này, 
              vui lòng bỏ qua email này.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Email này được gửi tự động, vui lòng không trả lời email này.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
} 