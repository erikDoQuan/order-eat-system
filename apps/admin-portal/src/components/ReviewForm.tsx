import React, { useState } from 'react';
import RatingStars from './RatingStars';

export default function ReviewForm({ orderId, existingReview, onSubmit, onSuccess }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = React.useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await onSubmit({ orderId, rating, comment });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Review error:', err);
      const error = err as any;
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Gửi đánh giá thất bại!');
      }
    }
    setSubmitting(false);
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white p-4 shadow flex flex-col gap-3 w-full mt-2 border border-gray-200"
      style={{ width: '100%' }}
    >
      <div style={{ margin: '16px 0' }}>
        <label>Đánh giá:</label>
        <RatingStars value={rating} onChange={setRating} />
      </div>
      <textarea
        className="border rounded p-2 w-full"
        placeholder="Nhận xét của bạn..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={2}
        disabled={!!existingReview}
      />
      {error && (
        <div className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      {!existingReview && (
        <button
          type="submit"
          className="bg-[#C92A15] text-white px-4 py-2 rounded hover:bg-[#a81f0e] transition"
          disabled={submitting}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      )}
      {existingReview && (
        <div className="text-green-600 font-medium">Bạn đã đánh giá đơn hàng này.</div>
      )}
    </form>
  );
} 