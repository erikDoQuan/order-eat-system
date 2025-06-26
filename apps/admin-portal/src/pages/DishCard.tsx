import { Dish } from '../types/dish.type';

export default function DishCard({ dish }: { dish: Dish }) {
  // Xử lý giá trị basePrice
  let priceText = 'Liên hệ';
  if (dish.basePrice && !isNaN(Number(dish.basePrice))) {
    priceText = Number(dish.basePrice).toLocaleString() + '₫';
  }

  return (
    <div className="group relative mx-auto flex min-w-[340px] max-w-xl flex-col rounded-3xl bg-white p-10 shadow-2xl transition-all duration-200 hover:shadow-2xl">
      {dish.imageUrl ? (
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="mb-5 h-52 w-full rounded-2xl bg-white object-contain transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="mb-5 flex h-52 w-full items-center justify-center rounded-2xl text-5xl" style={{ background: '#e6f4ed', color: '#b2d8c5' }}>
          🍽️
        </div>
      )}
      <h3 className="mb-2 truncate text-2xl font-bold text-primary">{dish.name}</h3>
      <p className="mb-4 line-clamp-2 min-h-[44px] text-base text-gray-600">{dish.description}</p>
      <div className="mt-auto flex w-full items-end justify-between gap-2">
        <div className="flex flex-col items-start">
          <span className="mb-0.5 text-xs font-medium text-gray-500">Giá chỉ từ</span>
          <span className="text-2xl font-bold text-primary">{priceText}</span>
        </div>
        <button className="flex items-center gap-2 rounded-lg border-2 border-primary bg-white px-5 py-2.5 text-base font-semibold text-primary transition hover:bg-primary hover:text-white hover:shadow-lg">
          Mua ngay
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12h10.5m0 0l-4.5-4.5m4.5 4.5l-4.5 4.5" />
          </svg>
        </button>
      </div>
      {/* Không hiển thị kích thước nữa */}
      {/*  bỏ badge trạng thái "Hiển thị" */}
    </div>
  );
}
