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
    const verificationLink = `http://localhost:3001/api/v1/auth/verify-email?token=${token}&redirect=http://localhost:3001/login`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email - Bếp Của Mẹ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #b45309; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Welcome to Bếp Của Mẹ!</h1>
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #b45309; margin-bottom: 20px;">Thank you for registering!</h2>
            <p style="color: #444; line-height: 1.6; margin-bottom: 20px;">
              Please verify your email by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}"
                 style="background: #b45309; color: white; padding: 15px 30px; text-decoration: none;
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p style="color: #444; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all;">
              <a href="${verificationLink}" style="color: #b45309;">${verificationLink}</a>
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link will expire in 24 hours.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated email, please do not reply.
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

  async sendResetPasswordEmail(email: string, resetLink: string, userName: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password - Bếp Của Mẹ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #b45309; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Bếp Của Mẹ</h1>
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #b45309; margin-bottom: 20px;">Hello ${userName}!</h2>
            <p style="color: #444; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your account. Click the button below to reset your password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #b45309; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #444; line-height: 1.6; margin-bottom: 20px;">
              Or you can copy and paste this link into your browser:
            </p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all;">
              <a href="${resetLink}" style="color: #b45309;">${resetLink}</a>
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour. If you did not request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated email, please do not reply.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw new Error('Failed to send reset password email');
    }
  }
} 