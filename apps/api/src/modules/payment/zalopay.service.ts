import axios from 'axios';
import * as crypto from 'crypto';
const moment = require('moment');
import * as querystring from 'querystring';

export class ZaloPayService {
  private app_id = process.env.ZP_APP_ID || '';
  private key1 = process.env.ZP_KEY1 || '';
  private key2 = process.env.ZP_KEY2 || '';
  private endpoint = process.env.ZP_CREATE_ORDER || '';

  async createOrder(amount: number, orderId: string, description: string) {
    const embed_data = {};
    const items: any[] = [];

    const now = moment();
    const app_trans_id = `${now.format('YYMMDD')}_${orderId}`;

    const order = {
      app_id: this.app_id,
      app_trans_id: app_trans_id,
      app_user: 'demo_user',
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: description || `Thanh toán đơn hàng #${orderId}`,
      bank_code: '',
      callback_url: process.env.ZP_CALLBACK_URL || '',
      redirect_url: process.env.ZP_REDIRECT_URL || '',
    };

    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order['mac'] = crypto.createHmac('sha256', this.key1).update(data).digest('hex');

    try {
      console.log('ZaloPay endpoint:', this.endpoint);
      console.log('Order gửi đi:', order);
      const formBody = querystring.stringify(order);
      const response = await axios.post(this.endpoint, formBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log('ZaloPay response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi tạo đơn hàng ZaloPay:', error);
      if (error.response) {
        console.error('❌ Lỗi response data:', error.response.data);
        throw new Error(error.response.data.return_message || JSON.stringify(error.response.data));
      } else {
        throw new Error(error.message || 'Tạo đơn hàng thất bại');
      }
    }
  }
} 