import React, { useState } from 'react';

import RatingStars from './RatingStars';

interface ReviewFormProps {
  orderId?: any;
  existingReview: any;
  onSubmit?: any;
  onSuccess?: any;
  viewOnly?: boolean;
}

export default function ReviewForm({ orderId, existingReview, onSubmit, onSuccess, viewOnly = false }: ReviewFormProps) {
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
      onSubmit={viewOnly ? undefined : handleSubmit}
      className="mt-2 flex w-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow"
      style={{ width: '100%' }}
    >
      <div style={{ margin: '16px 0' }}>
        <label>Đánh giá:</label>
        <RatingStars value={rating} onChange={viewOnly ? () => {} : setRating} readOnly={viewOnly} />
      </div>
      {viewOnly ? (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
              fontSize: 15,
              color: '#222',
              textAlign: 'left',
              marginBottom: 4,
            }}
          >
            <span>Đánh giá của bạn:</span>
            <span style={{ fontWeight: 400 }}>{comment || existingReview?.comment || 'Không có bình luận'}</span>
          </div>
          {existingReview && (existingReview.adminReply || existingReview.admin_reply) && (
            <div style={{ color: '#2563eb', fontStyle: 'italic', marginTop: 6, textAlign: 'left' }}>
              <b>BẾP CỦA MẸ:</b> {existingReview.adminReply || existingReview.admin_reply}
            </div>
          )}
        </>
      ) : (
        <textarea
          className="w-full rounded border p-2"
          placeholder="Nhận xét của bạn..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={2}
          disabled={!!existingReview}
        />
      )}
      {error && !viewOnly && <div className="rounded bg-red-50 p-2 text-sm font-medium text-red-600">{error}</div>}
      {!existingReview && !viewOnly && (
        <button type="submit" className="rounded bg-[#C92A15] px-4 py-2 text-white transition hover:bg-[#a81f0e]" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      )}
      {/* Không hiện thông báo đã đánh giá ở chế độ viewOnly */}
      {existingReview && !viewOnly && <div className="font-medium text-green-600">Bạn đã đánh giá đơn hàng này.</div>}
    </form>
  );
}
