import { Body, Controller, Post } from '@nestjs/common';

import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('payment-success')
  async sendPaymentSuccessEmail(@Body() body: { email: string; orderData: any; customerName: string }) {
    try {
      await this.emailService.sendPaymentSuccessEmail(body.email, body.orderData, body.customerName);
      return { success: true, message: 'Payment success email sent successfully' };
    } catch (error) {
      console.error('Error sending payment success email:', error);
      return { success: false, message: 'Failed to send payment success email' };
    }
  }
}
