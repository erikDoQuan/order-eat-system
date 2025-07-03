import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import '../css/DishCard.css';

import { Dish } from '../types/dish.type';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/* -------------------------------------------------
 *  Modal chi tiết món ăn (Size, Đế + Topping radio)
 * ------------------------------------------------- */
function DishDetailModal({ dish, onClose, categoryName }: { dish: Dish; onClose: () => void; categoryName?: string }) {
  const { addToCart } = useCart();

  /* ---------- tuỳ chọn cố định ---------- */
  const sizeOptions = [
    { label: 'Nhỏ 6"', value: 'small', price: 0 },
    { label: 'Vừa 9"', value: 'medium', price: 90_000 },
    { label: 'Lớn 12"', value: 'large', price: 190_000 },
  ];

  /* ---------- state ---------- */
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>(
    dish.size === 'small' || dish.size === 'medium' || dish.size === 'large' ? dish.size : 'small',
  );

  /* 
    selectedVariant đại diện cho 'dày' | 'mỏng' | id topping
  */
  const [selectedVariant, setSelectedVariant] = useState<string>('dày');
  const [note, setNote] = useState('');

  /* ---------- topping ---------- */
  const [toppingDishes, setToppingDishes] = useState<Dish[]>([]);

  useEffect(() => {
    Promise.all([axios.get('/api/v1/categories'), axios.get('/api/v1/dishes')])
      .then(([catRes, dishRes]) => {
        const categories = catRes.data.data || [];
        const allDishes: Dish[] = dishRes.data.data || [];

        const toppingCat = categories.find((c: any) => (c.nameLocalized || c.name)?.toLowerCase().includes('topping'));

        if (toppingCat) setToppingDishes(allDishes.filter(d => d.categoryId === toppingCat.id));
      })
      .catch(() => setToppingDishes([]));
  }, []);

  /* ---------- giá ---------- */
  const getPrice = () => {
    const base = Number(dish.basePrice) || 0;
    const sizeExtra = sizeOptions.find(s => s.value === selectedSize)?.price || 0;
    const toppingExtra = (() => {
      const t = toppingDishes.find(td => td.id === selectedVariant);
      return Number(t?.basePrice) || 0;
    })();
    return (base + sizeExtra + toppingExtra).toLocaleString('vi-VN') + '₫';
  };

  /* ---------- label mô tả variant ---------- */
  const variantLabel = (() => {
    if (selectedVariant === 'dày' || selectedVariant === 'mỏng') return selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1);
    const t = toppingDishes.find(td => td.id === selectedVariant);
    return t ? t.name : '—';
  })();

  /* Thêm biến kiểm tra có phải danh mục pizza, mỳ ý, gà không */
  const category = (categoryName || '').toLowerCase();
  const isPizzaCategory = category.includes('pizza');
  const isSpaghettiCategory = category.includes('mỳ ý');
  const isChickenCategory = category.includes('gà');

  /* ---------- render ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-white p-8 shadow-2xl md:flex-row">
        {/* Hình & giá */}
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          {dish.imageUrl && <img src={dish.imageUrl} alt={dish.name} className="w-full max-w-xs rounded-full object-contain" />}
          <div className="mt-6 text-3xl font-bold text-[#C92A15]">{getPrice()}</div>
        </div>

        {/* Nội dung */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <button className="absolute right-6 top-6 text-2xl font-bold text-gray-400 hover:text-black" onClick={onClose}>
            ×
          </button>
          <h2 className="mb-2 text-3xl font-bold text-black">{dish.name}</h2>

          {/* Chỉ hiển thị size và đế nếu là pizza */}
          {isPizzaCategory && !isSpaghettiCategory && !isChickenCategory && (
            <>
              <div className="mb-2 text-base font-medium text-green-600">
                Kích thước {sizeOptions.find(s => s.value === selectedSize)?.label} – Đế {variantLabel}
              </div>
            </>
          )}

          <p className="mb-4 text-base text-gray-700">{dish.description}</p>

          {/* ----- Size ----- */}
          {isPizzaCategory && !isSpaghettiCategory && !isChickenCategory && (
            <>
              <div className="mb-2 font-semibold text-black">KÍCH THƯỚC</div>
              <div className="mb-4 flex gap-3">
                {sizeOptions.map(size => (
                  <button
                    key={size.value}
                    className={`rounded-lg border px-4 py-2 text-base font-semibold transition ${
                      selectedSize === size.value
                        ? 'border-[#C92A15] bg-[#C92A15] text-white'
                        : 'border-gray-300 bg-white text-black hover:border-[#C92A15]'
                    }`}
                    onClick={() => setSelectedSize(size.value as 'small' | 'medium' | 'large')}
                  >
                    {size.label}
                    {size.price > 0 && <span className="ml-1 text-sm font-normal">+{size.price.toLocaleString('vi-VN')}₫</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ----- Đế + Topping (radio) ----- */}
          {isPizzaCategory && !isSpaghettiCategory && !isChickenCategory && (
            <>
              <div className="mb-2 font-semibold text-black">ĐẾ</div>
              <div className="mb-4 flex max-h-40 flex-col gap-2 overflow-y-auto pr-2">
                {(['dày', 'mỏng'] as const).map(base => (
                  <label key={base} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="base"
                      checked={selectedVariant === base}
                      onChange={() => setSelectedVariant(base)}
                      className="accent-[#C92A15]"
                    />
                    {base.charAt(0).toUpperCase() + base.slice(1)}
                  </label>
                ))}

                {toppingDishes.map(t => (
                  <label key={t.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="base"
                      checked={selectedVariant === t.id}
                      onChange={() => setSelectedVariant(t.id)}
                      className="accent-[#C92A15]"
                    />
                    <span className="flex-1">{t.name}</span>
                    {/* chỉ hiển thị giá khi được chọn */}
                    {selectedVariant === t.id && t.basePrice && (
                      <span className="text-sm font-medium text-gray-600">+{Number(t.basePrice).toLocaleString('vi-VN')}₫</span>
                    )}
                  </label>
                ))}
              </div>
            </>
          )}

          {/* ----- Ghi chú ----- */}
          <div className="mb-2 font-semibold text-[#C92A15]">GHI CHÚ</div>
          <textarea
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
            placeholder="Nhập ghi chú của bạn tại đây"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
          />

          <button
            className="mt-2 w-full rounded-lg bg-[#C92A15] px-6 py-3 text-lg font-bold text-white hover:bg-[#a81f10]"
            onClick={async () => {
              try {
                if (isPizzaCategory && !isSpaghettiCategory && !isChickenCategory) {
                  await addToCart(dish.id, {
                    quantity: 1,
                    size: selectedSize,
                    base: selectedVariant,
                    note,
                  });
                } else {
                  await addToCart(dish.id, {
                    quantity: 1,
                    note,
                  });
                }
                onClose();
              } catch (err) {
                alert('Thêm vào giỏ hàng thất bại!');
                console.error('Lỗi thêm vào giỏ hàng:', err);
              }
            }}
          >
            THÊM VÀO GIỎ HÀNG
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------
 *  Thẻ card món ăn – export mặc định
 * -------------------------------------------------- */
export default function DishCard({ dish, categoryName }: { dish: Dish, categoryName?: string }) {
  const [showDetail, setShowDetail] = useState(false);
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();

  const priceText = dish.basePrice !== undefined && !isNaN(Number(dish.basePrice)) ? Number(dish.basePrice).toLocaleString('vi-VN') + '₫' : 'Miễn phí';

  return (
    <>
      <div className="dish-card group">
        {/* Hình ảnh */}
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="dish-card-img mb-5"
            onClick={() => setShowDetail(true)}
            style={{ transform: 'rotate(0deg)' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(10deg)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(0deg)')}
          />
        ) : (
          <div
            className="mb-5 flex h-52 w-full items-center justify-center rounded-2xl text-5xl"
            style={{ background: '#e6f4ed', color: '#b2d8c5' }}
            onClick={() => setShowDetail(true)}
          >
            🍽️
          </div>
        )}

        {/* Nội dung */}
        <div className="flex flex-1 flex-col">
          <h3 className="dish-card-title group-hover:text-[#C92A15]" onClick={() => setShowDetail(true)}>
            {dish.name}
          </h3>
          <p className="dish-card-desc">{dish.description}</p>

          <div className="mt-auto flex w-full items-end justify-between">
            <div>
              <div className="dish-card-price-label">Giá chỉ từ</div>
              <div className="dish-card-price">{priceText}</div>
            </div>

            {/* Nút mở modal */}
            <button className="dish-card-btn" onClick={() => setShowDetail(true)}>
              Mua ngay
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12h10.5m0 0l-4.5-4.5m4.5 4.5l-4.5 4.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showDetail && <DishDetailModal dish={dish} onClose={() => setShowDetail(false)} categoryName={categoryName} />}
    </>
  );
}
