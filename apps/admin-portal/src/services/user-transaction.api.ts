import axios from './axios';

export async function getAllUserTransactions() {
  const res = await axios.get('/user-transaction');
  return res.data;
} 