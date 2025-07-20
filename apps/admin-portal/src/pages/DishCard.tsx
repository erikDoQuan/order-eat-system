import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import '../css/DishCard.css';

import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Dish } from '../types/dish.type';

// Đặt hàm getCategoryNameById ở đầu file, trước mọi component
function getCategoryNameById(categoryId: string | undefined, categories: any[], lang: string) {
  if (!categoryId) return '';
  const cat = categories.find(c => c.id === categoryId);
  if (!cat) return '';
  const nameObj = cat.name as any;
  if (typeof cat.name === 'string') return cat.name;
  return nameObj?.[lang] || nameObj?.vi || '';
}

/* -------------------------------------------------
 *  Modal chi tiết món ăn (Size, Đế + Topping radio)
 * ------------------------------------------------- */
function DishDetailModal({
  dish,
  onClose,
  categoryName,
  categories,
  dishes,
}: {
  dish: Dish;
  onClose: () => void;
  categoryName?: string;
  categories: any[];
  dishes: Dish[];
}) {
  const { addToCart } = useCart();
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ---------- tuỳ chọn cố định ---------- */
  const sizeOptions = [
    { label: t('small') + ' 6"', value: 'small', price: 0 },
    { label: t('medium') + ' 9"', value: 'medium', price: 90_000 },
    { label: t('large') + ' 12"', value: 'large', price: 190_000 },
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
  // const [categories, setCategories] = useState<any[]>([]); // XÓA các dòng sau trong DishDetailModal:
  // useEffect(() => { ... })

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setToppingDishes([]);
      return;
    }
    const lang = i18n.language === 'en-us' ? 'en' : 'vi';

    // Tìm category Topping từ props categories - mở rộng tìm kiếm
    const toppingCat = categories.find((c: any) => {
      const catName = typeof c.name === 'string' ? c.name : (c.name as any)?.vi || (c.name as any)?.en || '';
      return catName.toLowerCase().includes('topping') || catName.toLowerCase().includes('đế') || catName.toLowerCase().includes('base');
    });

    if (!toppingCat) {
      setToppingDishes([]);
      return;
    }

    // Chỉ fetch dishes để lấy toppingDishes
    axios
      .get(`/api/v1/dishes?lang=${lang}`)
      .then(dishRes => {
        const allDishes: Dish[] = dishRes.data.data || [];
        const filteredDishes = allDishes.filter(d => d.categoryId === toppingCat.id);
        setToppingDishes(filteredDishes);
      })
      .catch(error => {
        console.error('Error fetching dishes:', error);
        setToppingDishes([]);
      });
  }, [categories, i18n.language]);

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

  // Lấy ngôn ngữ hiện tại
  const lang = i18n.language === 'en-us' ? 'en' : 'vi';

  /* ---------- label mô tả variant ---------- */
  const variantLabel = (() => {
    if (selectedVariant === 'dày' || selectedVariant === 'mỏng') return selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1);
    const toppingDish = dishes.find(d => d.id === selectedVariant);
    return toppingDish?.name || '—';
  })();

  // Thêm biến kiểm tra có phải danh mục pizza, mỳ ý, gà, topping không
  const dishCategoryName = getCategoryNameById(dish.categoryId, categories, lang);
  const isPizzaCategory = dishCategoryName.toLowerCase().includes('pizza');
  const isSpaghettiCategory = dishCategoryName.toLowerCase().includes('mỳ ý');
  const isChickenCategory = dishCategoryName.toLowerCase().includes('gà');
  const isToppingCategory = dishCategoryName.toLowerCase().includes('topping');

  // Lấy tên và mô tả đúng ngôn ngữ từ i18n, fallback về dish.name nếu không có (dùng cho cả card)
  const dishNameRaw = t(`menu.${dish.id}.name`);
  const dishDescriptionRaw = t(`menu.${dish.id}.desc`);
  const dishName =
    !dishNameRaw || dishNameRaw.startsWith('menu.')
      ? typeof dish.name === 'string'
        ? dish.name
        : (dish.name as any)?.[lang] || (dish.name as any)?.vi || ''
      : dishNameRaw;
  const dishDescription =
    !dishDescriptionRaw || dishDescriptionRaw.startsWith('menu.')
      ? typeof dish.description === 'string'
        ? dish.description
        : (dish.description as any)?.[lang] || (dish.description as any)?.vi || ''
      : dishDescriptionRaw;

  // Nếu là category Topping thì chỉ render tên dish
  if (isToppingCategory) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-white p-8 shadow-2xl md:flex-row">
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <h2 className="mb-2 text-3xl font-bold text-black">{dishName}</h2>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-white p-8 shadow-2xl md:flex-row">
        {/* Hình & giá */}
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <img
            src={getImageUrl(dish.imageUrl)}
            alt={dishName}
            className="dish-card-img"
            style={{ objectFit: 'contain', width: '100%', height: '13rem', borderRadius: '1rem' }}
          />
          <div className="mt-6 text-3xl font-bold text-[#C92A15]">{getPrice()}</div>
        </div>

        {/* Nội dung */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <button className="absolute right-6 top-6 text-2xl font-bold text-gray-400 hover:text-black" onClick={onClose}>
            ×
          </button>
          <h2 className="mb-2 text-3xl font-bold text-black">{dishName}</h2>

          {/* Chỉ hiển thị size và đế nếu là pizza */}
          {isPizzaCategory && !isSpaghettiCategory && !isChickenCategory && (
            <>
              <div className="mb-2 text-base font-medium text-green-600">
                {t('dish_size')} {sizeOptions.find(s => s.value === selectedSize)?.label} – Đế {variantLabel}
              </div>
            </>
          )}

          <p className="mb-4 text-base text-gray-700">{dishDescription}</p>

          {/* ----- Size ----- */}
          {isPizzaCategory && !isSpaghettiCategory && !isChickenCategory && (
            <>
              <div className="mb-2 font-semibold text-black">{t('dish_size').toUpperCase()}</div>
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

                {toppingDishes.map(t => {
                  // Lấy tên topping từ danh sách dishes (giống CartPopup)
                  const toppingDish = dishes.find(d => d.id === t.id);
                  const toppingName = toppingDish?.name || t.name || 'Unnamed Topping';
                  return (
                    <label key={t.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="base"
                        checked={selectedVariant === t.id}
                        onChange={() => setSelectedVariant(t.id)}
                        className="accent-[#C92A15]"
                      />
                      <span className="flex-1">{toppingName}</span>
                      {/* chỉ hiển thị giá khi được chọn */}
                      {selectedVariant === t.id && t.basePrice && (
                        <span className="text-sm font-medium text-gray-600">+{Number(t.basePrice).toLocaleString('vi-VN')}₫</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {/* ----- Ghi chú ----- */}
          <div className="mb-2 font-semibold text-[#C92A15]">{t('note')}</div>
          <textarea
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
            placeholder={t('note_placeholder')}
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
          />

          <button
            className="mt-2 w-full rounded-lg bg-[#C92A15] px-6 py-3 text-lg font-bold text-white hover:bg-[#a81f10]"
            onClick={async () => {
              if (!user) {
                navigate('/login');
                return;
              }
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
                console.error('Lỗi thêm vào giỏ hàng:', err);
              }
            }}
          >
            {t('add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}

export { DishDetailModal };

/* --------------------------------------------------
 *  Thẻ card món ăn – export mặc định
 * -------------------------------------------------- */
export default function DishCard({ dish, categoryName }: { dish: Dish; categoryName?: string }) {
  const [showDetail, setShowDetail] = useState(false);
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const { i18n, t } = useTranslation();
  const locale = i18n.language;

  const [categories, setCategories] = useState<any[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    const lang = i18n.language === 'en-us' ? 'en' : 'vi';
    axios
      .get(`/api/v1/categories?lang=${lang}`)
      .then(res => {
        setCategories(res.data.data || []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, [i18n.language]);

  useEffect(() => {
    axios.get('/api/v1/dishes').then(res => setDishes(res.data.data || []));
  }, []);

  // Lấy tên và mô tả đúng ngôn ngữ từ i18n, fallback về dish.name nếu không có (dùng cho cả card)
  const dishNameRaw = t(`menu.${dish.id}.name`);
  const dishDescriptionRaw = t(`menu.${dish.id}.desc`);
  const dishName =
    !dishNameRaw || dishNameRaw.startsWith('menu.')
      ? typeof dish.name === 'string'
        ? dish.name
        : (dish.name as any)?.[locale] || (dish.name as any)?.vi || ''
      : dishNameRaw;
  const dishDesc =
    !dishDescriptionRaw || dishDescriptionRaw.startsWith('menu.')
      ? typeof dish.description === 'string'
        ? dish.description
        : (dish.description as any)?.[locale] || (dish.description as any)?.vi || ''
      : dishDescriptionRaw;

  const priceText = dish.basePrice !== undefined && !isNaN(Number(dish.basePrice)) ? Number(dish.basePrice).toLocaleString('vi-VN') + '₫' : t('free');

  // Nếu là category Topping thì chỉ render tên dish (dùng trong DishCard list)
  if (getCategoryNameById(dish.categoryId, categories, locale).toLowerCase().includes('topping')) {
    return (
      <div className="dish-card">
        <h3 className="dish-card-title">{dishName}</h3>
      </div>
    );
  }

  return (
    <>
      <div className="dish-card group">
        {/* Hình ảnh */}
        {dish.imageUrl ? (
          <img
            src={getImageUrl(dish.imageUrl)}
            alt={dishName}
            className="dish-card-img mb-5"
            style={{ objectFit: 'contain', width: '100%', height: '13rem', borderRadius: '1rem' }}
            onClick={() => setShowDetail(true)}
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
            {dishName}
          </h3>
          <p className="dish-card-desc">{dishDesc}</p>

          {/* Nút xem thêm */}
          {/* Đã xóa nút 'Xem thêm' trong từng card để chỉ dùng nút ngoài cùng */}

          <div className="mt-auto flex w-full items-end justify-between">
            <div>
              <div className="dish-card-price-label">{t('price_from')}</div>
              <div className="dish-card-price">{priceText}</div>
            </div>

            {/* Nút mở modal */}
            <button className="dish-card-btn" onClick={() => setShowDetail(true)}>
              {t('buy_now')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12h10.5m0 0l-4.5-4.5m4.5 4.5l-4.5 4.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showDetail && (
        <DishDetailModal dish={dish} onClose={() => setShowDetail(false)} categoryName={categoryName} categories={categories} dishes={dishes} />
      )}
    </>
  );
}

// Thêm hàm tiện ích ở đầu file hoặc gần đầu component
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const getImageUrl = (imageUrl: string | undefined | null) => {
  if (!imageUrl) return '/default-image.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_URL}/api/v1/files/public/${imageUrl}`;
};
