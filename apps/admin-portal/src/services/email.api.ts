import axios from './axios';

export const sendPaymentSuccessEmail = async (data: { email: string; orderData: any; customerName: string }) => {
  const response = await axios.post('/api/v1/email/payment-success', data);
  return response.data;
};
