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

  async sendPaymentSuccessEmail(email: string, orderData: any, customerName: string): Promise<void> {
    // Tạo bảng items
    const itemsHtml =
      orderData.items
        ?.map(
          (item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left; vertical-align: top;">${item.dish?.name || item.name}</td>
        <td style="padding: 12px; text-align: center; vertical-align: top;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; vertical-align: top;">${item.price?.toLocaleString('vi-VN') || 0}</td>
        <td style="padding: 12px; text-align: right; vertical-align: top;">${(item.quantity * (item.price || 0)).toLocaleString('vi-VN')}</td>
      </tr>
    `,
        )
        .join('') || '';

    const totalAmount = orderData.total || 0;
    const orderNumber = orderData.order_number || orderData.orderNumber || orderData.id;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Thanh toán thành công - Bếp Của Mẹ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #C92A15; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">BẾP CỦA MẸ</h1>
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #C92A15; margin-bottom: 20px;">Cảm ơn bạn đã thanh toán thành công!</h2>
            <p style="color: #444; line-height: 1.6; margin-bottom: 20px;">
              Xin chào ${customerName},<br>
              Chúng tôi xác nhận rằng đơn hàng của bạn đã được thanh toán thành công.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #C92A15; margin-bottom: 15px;">Thông tin đơn hàng</h3>
              <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> #${orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Ngày đặt:</strong> ${new Date(orderData.createdAt || orderData.date).toLocaleDateString('vi-VN')}</p>
              <p style="margin: 5px 0;"><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod || 'Tiền mặt'}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #C92A15; margin-bottom: 15px;">Chi tiết đơn hàng</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background: #f8f9fa; border-bottom: 2px solid #C92A15;">
                    <th style="padding: 12px; text-align: left; font-weight: bold;">Mô tả</th>
                    <th style="padding: 12px; text-align: center; font-weight: bold;">Số lượng</th>
                    <th style="padding: 12px; text-align: right; font-weight: bold;">Đơn giá</th>
                    <th style="padding: 12px; text-align: right; font-weight: bold;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div style="text-align: right; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                <h3 style="margin: 0; color: #C92A15;">Tổng cộng: ${totalAmount.toLocaleString('vi-VN')}₫</h3>
              </div>
            </div>

            <div style="background: #e6f4ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C92A15;">
              <h3 style="color: #C92A15; margin-bottom: 10px;">Thông tin giao hàng</h3>
              <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${orderData.deliveryAddress || 'Chưa cập nhật'}</p>
              <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${orderData.customerPhone || orderData.user?.phone || 'Chưa cập nhật'}</p>
            </div>

            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <h3 style="color: #C92A15; margin-bottom: 10px;">Cảm ơn Quý Khách & Hẹn gặp lại!</h3>
              <p style="color: #666; margin: 0;">Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận thời gian giao hàng.</p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.<br>
              Email: support@bepcuame.com | Hotline: 0123 456 789
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending payment success email:', error);
      throw new Error('Failed to send payment success email');
    }
  }
}
