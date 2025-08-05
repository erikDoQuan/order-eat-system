import { Injectable } from '@nestjs/common';

import { DrizzleService } from '../../database/drizzle/drizzle.service';
import { EmailService } from '../email/email.service';
import { OrderService } from '../order/order.service';
import { TransactionMethod, TransactionStatus } from '../user_transaction/dto/create-user-transaction.dto';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { UsersService } from '../user/users.service';

export interface PaymentRequestDto {
  userId: string;
  orderId: string;
  amount: string;
  method: TransactionMethod;
  status: TransactionStatus;
  transTime: string;
  transactionCode?: string;
  description: string;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly userTransactionService: UserTransactionService,
    private readonly drizzleService: DrizzleService,
    private readonly emailService: EmailService,
    private readonly orderService: OrderService,
    private readonly userService: UsersService,
  ) {}

  /**
   * Xử lý thanh toán theo method và status
   * @param dto PaymentRequestDto
   * @returns Kết quả xử lý
   */
  async processPayment(dto: PaymentRequestDto) {
    // Trường hợp 1: Thanh toán trực tiếp bằng tiền mặt (cash) và status = success
    if (dto.method === TransactionMethod.CASH && dto.status === TransactionStatus.SUCCESS) {
      const result = await this.drizzleService.db.transaction(async (trx: any) => {
        return await this.userTransactionService.create(dto, trx);
      });

      // Gửi email thông báo thanh toán thành công
      await this.sendPaymentSuccessEmail(dto.orderId, dto.userId);

      return result;
    }

    // Trường hợp 2: Thanh toán qua ZaloPay - KHÔNG tạo transaction tại đây
    if (dto.method === TransactionMethod.ZALOPAY) {
      return {
        message: 'ZaloPay transaction will be created upon successful callback.',
        status: 'pending',
        method: dto.method,
      };
    }

    // Trường hợp khác: Không xử lý
    throw new Error(`Unsupported payment method: ${dto.method} with status: ${dto.status}`);
  }

  /**
   * Tạo transaction khi ZaloPay callback thành công
   * @param callbackData Dữ liệu từ ZaloPay callback
   * @returns Transaction đã tạo
   */
  async createZaloPayTransaction(callbackData: {
    userId: string;
    orderId: string;
    amount: string | number;
    transTime: string;
    transactionCode: string;
    orderNumber?: string;
  }) {
    const result = await this.drizzleService.db.transaction(async (trx: any) => {
      return await this.userTransactionService.create(
        {
          userId: callbackData.userId,
          orderId: callbackData.orderId,
          amount: String(callbackData.amount),
          method: TransactionMethod.ZALOPAY,
          status: TransactionStatus.SUCCESS,
          transTime: callbackData.transTime,
          transactionCode: callbackData.transactionCode,
          description: `Thanh toán đơn hàng #${callbackData.orderNumber || callbackData.orderId}`,
        },
        trx,
      );
    });

    // Gửi email thông báo thanh toán thành công
    await this.sendPaymentSuccessEmail(callbackData.orderId, callbackData.userId);

    return result;
  }

  /**
   * Gửi email thông báo thanh toán thành công
   * @param orderId ID đơn hàng
   * @param userId ID người dùng
   */
  private async sendPaymentSuccessEmail(orderId: string, userId: string) {
    try {
      // Lấy thông tin đơn hàng
      const order = await this.orderService.findOne(orderId);
      if (!order) {
        console.error('Order not found for email:', orderId);
        return;
      }

      // Lấy thông tin người dùng
      const user = await this.userService.findOne(userId);
      if (!user || !user.email) {
        console.error('User not found or no email:', userId);
        return;
      }

      // Chuẩn bị dữ liệu cho email
      const orderItems = (order.orderItems as { items: any[] } | undefined)?.items || [];

      // Xử lý địa chỉ giao hàng
      let deliveryAddress = 'Chưa cập nhật';
      if (order.deliveryAddress) {
        if (typeof order.deliveryAddress === 'string') {
          deliveryAddress = order.deliveryAddress;
        } else if ((order.deliveryAddress as any).address) {
          deliveryAddress = (order.deliveryAddress as any).address;
        } else if ((order.deliveryAddress as any).street) {
          deliveryAddress = (order.deliveryAddress as any).street;
        }
      }

      const orderData = {
        ...order,
        order_number: order.orderNumber,
        total: order.totalAmount,
        items: orderItems.map(item => ({
          name: item.name || item.dish?.name,
          quantity: item.quantity,
          price: item.price || item.dish?.basePrice,
          dish: item.dish,
        })),
        customerName: `${user.firstName} ${user.lastName}`.trim() || 'Quý khách',
        deliveryAddress: deliveryAddress,
        customerPhone: user.phoneNumber,
        paymentMethod: order.paymentMethod === 'zalopay' ? 'ZaloPay' : 'Tiền mặt',
        createdAt: order.createdAt,
      };

      // Gửi email
      await this.emailService.sendPaymentSuccessEmail(user.email, orderData, orderData.customerName);
      console.log('Payment success email sent to:', user.email);
    } catch (error) {
      console.error('Error sending payment success email:', error);
      // Không throw error để không ảnh hưởng đến quá trình thanh toán
    }
  }
}
