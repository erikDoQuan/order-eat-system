import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import dayjs from 'dayjs';
import qs from 'qs';

import { OrderRepository } from '../../database/repositories/order.repository';
import { TransactionMethod, TransactionStatus } from '../user_transaction/dto/create-user-transaction.dto';
import { UserTransactionService } from '../user_transaction/user-transaction.service';

@Injectable()
export class ZaloPayService {
  constructor(
    private config: ConfigService,
    private readonly orderRepository: OrderRepository,
    private readonly userTransactionService: UserTransactionService,
  ) {}

  async createOrder(payload: Record<string, any>): Promise<Record<string, any>> {
    console.log('📦 ZaloPay createOrder payload:', payload);

    if (!payload) {
      throw new Error('Payload is required');
    }

    const app_id = this.config.get('zalopay.appId');
    const key1 = this.config.get('zalopay.key1');
    const endpoint = this.config.get('zalopay.endpoint');
    const callbackUrl = this.config.get('zalopay.callbackUrl') || 'https://3ff7cf6a1456.ngrok-free.app/api/v1/zalopay/callback';
    const redirectUrl = this.config.get('zalopay.redirectUrl') || 'https://3ff7cf6a1456.ngrok-free.app/api/v1/zalopay/redirect-after-zalopay';

    // Sinh appTransId mỗi lần gọi, không trùng trong ngày
    const date = new Date();
    const app_trans_id = payload.appTransId || `${dayjs(date).format('YYMMDD')}_${Math.floor(Math.random() * 1000000)}`;

    // app_user: lấy userId thực tế nếu có
    const app_user = payload.userId || payload.appUser || 'user123';

    // Chuẩn hóa items cho ZaloPay (ưu tiên lấy từ payload.items thực tế)
    let items = [];
    if (Array.isArray(payload.items) && payload.items.length > 0) {
      items = payload.items.map((item: any, idx: number) => ({
        itemid: item.dishId || `item${idx + 1}`,
        itemname: item.name || item.dishName || `Món ${idx + 1}`,
        itemprice: Number(item.price || item.basePrice || payload.amount || 0),
        itemquantity: item.quantity || 1,
      }));
    } else {
      // Nếu không có items thực tế, tạo 1 item mẫu
      items = [{ itemid: 'item1', itemname: 'Sản phẩm', itemprice: Number(payload.amount || 0), itemquantity: 1 }];
    }

    // Chuẩn hóa embed_data cho OpenAPI v2, truyền đủ thông tin đơn hàng tạm
    const embed_data = JSON.stringify({
      redirecturl: redirectUrl,
      callbackurl: callbackUrl,
      userId: payload.userId,
      items: payload.items,
      orderId: payload.orderId,
      totalAmount: payload.amount,
      note: payload.note,
      deliveryAddress: payload.deliveryAddress,
      pickupTime: payload.pickupTime,
      userPhone: payload.userPhone,
      userName: payload.userName,
    });

    // Log callback URL để debug
    console.log('🔗 ZaloPay Callback URL:', callbackUrl);
    console.log('🔗 ZaloPay Redirect URL:', redirectUrl);
    console.log('🔗 ZaloPay App ID:', app_id);
    console.log('🔗 ZaloPay App Trans ID:', app_trans_id);
    console.log('🔗 Callback URL valid:', callbackUrl && callbackUrl.startsWith('https://'));
    console.log('🔗 Redirect URL valid:', redirectUrl && redirectUrl.startsWith('https://'));
    console.log('🔗 Callback URL sẽ được gửi đến ZaloPay:', callbackUrl);
    console.log('🔗 Đảm bảo URL này đã được cấu hình trong ZaloPay Developer Portal!');

    // Kiểm tra cấu hình ZaloPay
    if (!app_id || !key1 || !endpoint) {
      throw new Error('ZaloPay configuration missing: app_id, key1, or endpoint');
    }

    // Thử format callback URL khác nếu cần
    if (!callbackUrl || !callbackUrl.startsWith('https://')) {
      console.warn('⚠️ Callback URL không hợp lệ, ZaloPay có thể không gọi callback!');
    }

    const app_time = Date.now();
    const amount = Number(payload.amount);
    const description = payload.description || `Thanh toán đơn hàng #${app_trans_id}`;

    // MAC đúng chuẩn OpenAPI v2
    const data = `${app_id}|${app_trans_id}|${app_user}|${amount}|${app_time}|${embed_data}|${JSON.stringify(items)}`;
    const mac = crypto.createHmac('sha256', key1).update(data).digest('hex');

    let deliveryAddress = null;
    if (payload.deliveryAddress) {
      if (typeof payload.deliveryAddress === 'string') {
        deliveryAddress = { address: payload.deliveryAddress };
      } else {
        deliveryAddress = { ...payload.deliveryAddress };
      }
      if (payload.userPhone) deliveryAddress.phone = payload.userPhone;
      if (payload.userName) deliveryAddress.name = payload.userName;
    }
    const order = {
      app_id,
      app_user,
      app_time,
      amount,
      app_trans_id,
      item: JSON.stringify(items),
      embed_data,
      description,
      mac,
      callback_url: callbackUrl, // ✅ BỔ SUNG DÒNG NÀY
      redirect_url: redirectUrl, // ✅ BỔ SUNG DÒNG NÀY
    };

    // Log MAC, endpoint, data gửi đi
    console.log('ZaloPay MAC string:', data);
    console.log('ZaloPay MAC:', mac);
    console.log('ZaloPay Endpoint:', endpoint);
    console.log('ZaloPay Request Data:', order);
    console.log('qs string:', qs.stringify(order));
    console.log('📦 Embed Data:', embed_data);

    let response;
    try {
      response = await axios.post(endpoint, qs.stringify(order), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      console.log('📦 ZaloPay response:', response.data);

      if (response.data.return_code === 1) {
        // ✅ Lưu đơn hàng vào DB với appTransId
        const orderData = {
          userId: payload.userId || 'user123',
          orderItems: { items: payload.items || [] },
          totalAmount: amount,
          type: payload.type || 'delivery',
          deliveryAddress,
          pickupTime: payload.pickupTime || undefined,
          appTransId: app_trans_id, // ✅ Lưu appTransId
          zpTransToken: response.data.zp_trans_token || response.data.order_token || '',
          status: 'pending', // ✅ Status pending
        };

        console.log('📦 Order data to save:', orderData);
        console.log('📦 Payload deliveryAddress:', payload.deliveryAddress);
        console.log('📦 Payload pickupTime:', payload.pickupTime);
        console.log('📦 Payload type:', payload.type);
        console.log('📦 Payload userPhone:', payload.userPhone);
        console.log('📦 Payload userName:', payload.userName);

        const savedOrder = await this.orderRepository.create(orderData);
        console.log('✅ Đã lưu đơn hàng vào DB:', savedOrder.id, 'với appTransId:', app_trans_id);
        console.log('📦 Saved deliveryAddress:', savedOrder.deliveryAddress);
        console.log('📦 Saved pickupTime:', savedOrder.pickupTime);
        console.log('📦 Saved status:', savedOrder.status);

        return {
          ...response.data,
          app_trans_id: app_trans_id, // ✅ Trả về appTransId cho frontend
        };
      } else {
        throw new Error(response.data.return_message || 'ZaloPay error');
      }
    } catch (error) {
      console.error('❌ ZaloPay API error:', error);
      throw error;
    }
  }

  async handleCallback(data: Record<string, any>) {
    console.log('📦 Callback từ ZaloPay:', data);
    console.log('📦 Return code:', data?.return_code);
    console.log('📦 App trans ID:', data?.app_trans_id);
    console.log('📦 Amount:', data?.amount);
    console.log('📦 Embed data:', data?.embed_data);

    // Validation dữ liệu đầu vào
    if (!data) {
      console.error('❌ Callback data is null or undefined');
      return;
    }

    if (!data.app_trans_id) {
      console.error('❌ Missing app_trans_id in callback data');
      return;
    }

    try {
      if (data.return_code === 1 && data.app_trans_id) {
        console.log('✅ Điều kiện callback hợp lệ: return_code=1, app_trans_id có');
        // Lấy thông tin từ embed_data
        console.log('🔍 Embed data raw:', data.embed_data);
        let embed: Record<string, any> = {};
        try {
          embed = JSON.parse(data.embed_data || '{}');
          console.log('✅ Parse embed_data thành công:', embed);
          console.log('🔍 Embed data keys:', Object.keys(embed));
          console.log('🔍 Embed deliveryAddress:', embed.deliveryAddress);
          console.log('🔍 Embed pickupTime:', embed.pickupTime);
          console.log('🔍 Embed userPhone:', embed.userPhone);
          console.log('🔍 Embed userName:', embed.userName);
        } catch (err) {
          console.error('❌ Lỗi parse embed_data:', err);
          embed = {};
        }
        // Kiểm tra nếu đơn hàng đã tồn tại thì không tạo lại
        console.log('🔍 Kiểm tra đơn hàng đã tồn tại chưa:', data.app_trans_id);
        const existed = await this.orderRepository.findOneByAppTransId(data.app_trans_id);
        console.log('🔍 Đơn hàng đã tồn tại:', !!existed);

        if (!existed) {
          // Không tạo order mới ở callback nữa!
          console.error('❌ Không tìm thấy order với appTransId, KHÔNG tạo mới!');
          return;
        } else {
          // Chỉ tạo user_transaction, không update order
          console.log('⚠️ Đơn hàng đã tồn tại, chỉ tạo user transaction:', data.app_trans_id);
          console.log('📦 Existing order details:', {
            id: existed.id,
            status: existed.status,
            deliveryAddress: existed.deliveryAddress,
            pickupTime: existed.pickupTime,
            appTransId: existed.appTransId,
          });

          // Chỉ tạo user_transaction, không tạo order mới
          console.log('💰 Bắt đầu tạo user transaction...');
          const transaction = await this.userTransactionService.create({
            userId: embed.userId || 'user123',
            orderId: existed.id,
            amount: String(data.amount),
            method: TransactionMethod.ZALOPAY,
            status: TransactionStatus.SUCCESS,
            transTime: new Date().toISOString(),
            transactionCode: data.zp_trans_token || data.order_token || '',
            description: `Thanh toán ZaloPay cho đơn hàng #${existed.id}`,
          });
          console.log('✅ Đã tạo user transaction:', transaction.id);
        }
      }
    } catch (err) {
      console.error('❌ Lỗi khi xử lý callback ZaloPay:', err);
      console.error('❌ Error details:', {
        message: err?.message,
        stack: err?.stack,
        data: data,
      });
      // Không throw error để ZaloPay không retry
    }
  }

  async checkOrderStatus(appTransId: string): Promise<any> {
    const app_id = this.config.get('zalopay.appId');
    const key1 = this.config.get('zalopay.key1');
    const checkStatusEndpoint = this.config.get('zalopay.checkStatusEndpoint');

    if (!app_id || !key1 || !checkStatusEndpoint) {
      throw new Error('ZaloPay configuration missing for check status');
    }

    const app_time = Date.now();
    const data = `${app_id}|${appTransId}|${app_time}`;
    const mac = crypto.createHmac('sha256', key1).update(data).digest('hex');

    const requestData = {
      app_id,
      app_trans_id: appTransId,
      app_time,
      mac,
    };

    try {
      const response = await axios.post(checkStatusEndpoint, qs.stringify(requestData), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return response.data;
    } catch (err: any) {
      console.error('Lỗi khi kiểm tra trạng thái ZaloPay:', err?.response?.data || err?.message || err);
      throw new Error('Không thể kiểm tra trạng thái ZaloPay: ' + (err?.response?.data || err?.message || err));
    }
  }

  // ✅ Tìm order theo appTransId
  async findOrderByAppTransId(appTransId: string): Promise<any> {
    try {
      console.log('🔍 Tìm order theo appTransId:', appTransId);
      const order = await this.orderRepository.findOneByAppTransId(appTransId);
      console.log('🔍 Order found:', order ? 'YES' : 'NO');
      return order;
    } catch (error) {
      console.error('❌ Lỗi khi tìm order theo appTransId:', error);
      return null;
    }
  }

  // ✅ Tìm order theo orderId
  async findOrderById(orderId: string): Promise<any> {
    try {
      console.log('🔍 Tìm order theo orderId:', orderId);
      const order = await this.orderRepository.findOne(orderId);
      console.log('🔍 Order found:', order ? 'YES' : 'NO');
      return order;
    } catch (error) {
      console.error('❌ Lỗi khi tìm order theo orderId:', error);
      return null;
    }
  }
}
