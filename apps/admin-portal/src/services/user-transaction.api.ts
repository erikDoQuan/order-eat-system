import axios from './axios';

export async function getAllUserTransactions() {
  const res = await axios.get('/user-transaction/all');
  return res.data;
}

export async function updateUserTransaction(id: string, data: any) {
  try {
    // Thử PATCH trước
    const res = await axios.patch(`/user-transaction/${id}`, data);
    return res.data;
  } catch (error) {
    try {
      // Nếu PATCH không được, thử PUT
      const res = await axios.put(`/user-transaction/${id}`, data);
      return res.data;
    } catch (error2) {
      try {
        // Nếu PUT không được, thử POST
        const res = await axios.post(`/user-transaction/update/${id}`, data);
        return res.data;
      } catch (error3) {
        console.error('All update methods failed:', error3);
        // Fallback: xóa transaction cũ và tạo mới
        throw new Error('Backend does not support transaction updates. Please implement the update endpoint.');
      }
    }
  }
}

export async function deleteUserTransaction(id: string) {
  const res = await axios.delete(`/user-transaction/${id}`);
  return res.data;
}

export async function createUserTransaction(data: any) {
  const res = await axios.post('/user-transaction', data);
  return res.data;
}
