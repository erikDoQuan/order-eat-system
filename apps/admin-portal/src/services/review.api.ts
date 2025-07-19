import axios from './axios';

export async function createReview(data: any) {
  const res = await axios.post('/reviews', data);
  return res.data.data || res.data;
}

export async function updateReview(id: string, data: any) {
  const res = await axios.patch(`/reviews/${id}`, data);
  return res.data;
}

export async function deleteReview(id: string) {
  const res = await axios.delete(`/reviews/${id}`);
  return res.data;
}

export async function getAllReviews() {
  const res = await axios.get('/reviews');
  return res.data?.data?.data || [];
}

export async function getReviewsByUserId(userId: string) {
  const res = await axios.get('/reviews', { params: { userId } });
  return res.data?.data?.data || [];
}

export async function getReviewsByOrderId(orderId: string) {
  const res = await axios.get('/reviews', { params: { orderId } });
  return res.data?.data?.data || [];
}

export async function getReviewDetail(reviewId: string) {
  const res = await axios.get(`/reviews/${reviewId}`);
  return res.data?.data || res.data;
}

export async function respondReview(reviewId: string, adminReply: string) {
  const res = await axios.post('/reviews/admin/respond', { reviewId, adminReply });
  return res.data;
} 