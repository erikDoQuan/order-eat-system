import React from 'react';

interface RatingStarsProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
  size?: number;
  readOnly?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({ value, onChange, max = 5, size = 32, readOnly = false }) => {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <span
            key={i}
            style={{
              fontSize: size,
              color: filled ? '#FFD600' : '#E0E0E0',
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'color 0.2s',
              userSelect: 'none',
            }}
            onClick={() => !readOnly && onChange(i + 1)}
            role={readOnly ? undefined : 'button'}
            aria-label={`Đánh giá ${i + 1} sao`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default RatingStars; 