import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import '../css/HomePage.css';

import type { Category } from '../services/category.api';
import type { Dish } from '../types/dish.type';
import logo from '../assets/images/logo.svg';
import { CartPopup } from '../components/CartPopup';
import { AuthContext } from '../context/AuthContext';
import { useDishes } from '../context/DishContext';
import { getAllCategories } from '../services/category.api';
import { getOrderItemsByUserId } from '../services/user.api';
import DishCard, { DishDetailModal } from './DishCard';
import TeachableMachineTestPage from './TeachableMachineTestPage';

export default function HomePage() {
  const dishes = useDishes();
  const [categories, setCategories] = useState<Category[]>([]);
  const [visiblePizzaCount, setVisiblePizzaCount] = useState(3);
  const [visibleChickenCount, setVisibleChickenCount] = useState(3);
  const [filterPizzaType, setFilterPizzaType] = useState<string>('Tất cả');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get('category');
  const selectedCategoryId = queryParams.get('category');
  const [showCart, setShowCart] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [visibleAppetizerCount, setVisibleAppetizerCount] = useState(3);
  const [visibleSaladCount, setVisibleSaladCount] = useState(3);
  const [visibleDrinkCount, setVisibleDrinkCount] = useState(3);
  const [visibleSpaghettiCount, setVisibleSpaghettiCount] = useState(3);
  const [visibleBakedMacaroniCount, setVisibleBakedMacaroniCount] = useState(3);
  const typeParam = queryParams.get('type');
  const [showMiniChat, setShowMiniChat] = useState(false);
  const [dishModal, setDishModal] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (user && user.role === 'admin') return null;

  const pizzaTypeTitle = () => {
    if (typeParam === 'seafood') return t('seafood_pizza');
    if (typeParam === 'combo') return t('combo_pizza');
    if (typeParam === 'traditional') return t('traditional_pizza');
    if (typeParam === 'vegetarian') return t('vegetarian_pizza');
    return t('pizza');
  };
  const chickenTypeTitle = () => {
    if (typeParam === 'bbq') return t('bbq_chicken');
    if (typeParam === 'korean') return t('korean_chicken');
    return t('chicken');
  };
  const spaghettiTypeTitle = () => {
    if (typeParam === 'seafood') return t('seafood_spaghetti');
    if (typeParam === 'bolognese') return t('bolognese_spaghetti');
    return t('spaghetti');
  };
  const appetizerTypeTitle = () => {
    if (typeParam === 'salad') return t('salad');
    if (typeParam === 'soup') return t('soup');
    return t('appetizer');
  };

  useEffect(() => {
    getAllCategories().then(c => setCategories(c || []));
  }, []);

  useEffect(() => {
    if (location.pathname === '/') setFilterPizzaType('Tất cả');
    else if (location.pathname === '/dishes') setFilterPizzaType('Pizza Hải Sản');
    else if (location.pathname === '/dishes/new' && location.search.includes('truyenthong')) setFilterPizzaType('Pizza Truyền Thống');
    else if (location.pathname === '/dishes/new' && location.search.includes('thapcam')) setFilterPizzaType('Pizza Thập Cẩm');
  }, [location]);

  const pizzaDishes = dishes.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('pizza') && cat.id === d.categoryId),
  );
  const chickenDishes = dishes.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('gà') && cat.id === d.categoryId),
  );
  const spaghettiDishes = dishes.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('mỳ ý') && cat.id === d.categoryId),
  );
  const appetizerDishes = dishes.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('khai vị') && cat.id === d.categoryId),
  );
  // Nếu không tìm thấy theo 'khai vị', thử 'appetizer'
  const appetizerDishesFallback = dishes.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('appetizer') && cat.id === d.categoryId),
  );

  // Lọc pizza theo filter
  const filteredPizzaDishes = pizzaDishes.filter(dish => {
    if (!typeParam || typeParam === 'all') return true;
    const typeName = dish.typeName?.trim().toLowerCase();
    if (typeParam === 'seafood') return typeName === 'hải sản';
    if (typeParam === 'combo') return typeName === 'thập cẩm';
    if (typeParam === 'traditional') return typeName === 'truyền thống';
    if (typeParam === 'vegetarian') return typeName === 'chay' || typeName === 'vegetarian';
    return true;
  });

  const filteredChickenDishes = chickenDishes.filter(dish => {
    if (!typeParam) return true;
    const typeName = dish.typeName?.trim().toLowerCase();
    if (typeParam === 'bbq') return typeName === 'bbq' || typeName === 'bbq chicken';
    if (typeParam === 'korean') return typeName === 'korean' || typeName === 'korean chicken';
    return true;
  });
  const filteredSpaghettiDishes = spaghettiDishes.filter(dish => {
    if (!typeParam) return true;
    const typeName = dish.typeName?.trim().toLowerCase();
    if (typeParam === 'seafood') return typeName === 'hải sản' || typeName === 'seafood';
    if (typeParam === 'bolognese') return typeName === 'bolognese';
    return true;
  });
  const filteredAppetizerDishes = appetizerDishes.filter(dish => {
    if (!typeParam) return true;
    const typeName = dish.typeName?.trim().toLowerCase();
    if (typeParam === 'salad') return typeName === 'salad';
    if (typeParam === 'soup') return typeName === 'soup';
    return true;
  });
  // Nếu không tìm thấy theo 'khai vị', thử 'appetizer'
  const filteredAppetizerDishesFallback = appetizerDishesFallback.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('appetizer') && cat.id === d.categoryId),
  );

  // Thêm lọc salad và drink
  const saladDishes = dishes.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('salad') && cat.id === d.categoryId),
  );
  const drinkDishes = dishes.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      (categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('drink') && cat.id === d.categoryId) ||
        categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('thức uống') && cat.id === d.categoryId) ||
        categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('beverage') && cat.id === d.categoryId)),
  );

  const bakedMacaroniDishes = dishes.filter(
    d =>
      d.status === 'available' &&
      d.categoryId &&
      categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('nui bỏ lò') && cat.id === d.categoryId),
  );

  // Filter dishes theo categoryId nếu có
  const filteredDishesByCategory = selectedCategoryId ? dishes.filter(d => d.status === 'available' && d.categoryId === selectedCategoryId) : [];

  const handleOpenCart = () => {
    if (user?.id) {
      setCartLoading(true);
      getOrderItemsByUserId(user.id)
        .then(items => setOrderItems(items))
        .finally(() => setCartLoading(false));
    }
    setShowCart(true);
  };
  const handleCloseCart = () => setShowCart(false);

  // Memo hóa DishCard để tránh re-render không cần thiết
  const MemoDishCard = React.memo(DishCard);

  return (
    <div>
      <div className="mb-6 w-full px-4 md:px-6" style={{ display: 'flex', justifyContent: 'center', marginTop: '-20px' }}>
        <div className="mx-auto max-w-7xl">
          <div
            style={{
              width: '100%',
              aspectRatio: '1536/480', // Tỷ lệ 3.2:1 - tăng chiều cao thêm để thoải mái hơn nữa
              overflow: 'hidden',
              position: 'relative',
              background: '#fff',
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/banner3.png"
              alt="Banner"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                display: 'block',
                borderRadius: 24,
                maxHeight: '100%',
                maxWidth: '100%',
              }}
            />
          </div>
        </div>
      </div>
      {/* Nếu có selectedCategoryId thì chỉ render đúng 1 category đó */}
      {selectedCategoryId && filteredDishesByCategory.length > 0 && (
        <div className="w-full px-4 md:px-6">
          <div className="mx-auto max-w-7xl pb-4">
            <div className="mb-6">
              <h2 className="flex-shrink-0 text-3xl font-extrabold text-black drop-shadow-lg">
                {categories.find(cat => cat.id === selectedCategoryId)?.nameLocalized ||
                  categories.find(cat => cat.id === selectedCategoryId)?.name ||
                  'Danh mục'}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {filteredDishesByCategory.map(dish => (
                <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Nếu có selectedCategory thì chỉ render đúng 1 category đó */}
      {selectedCategory === 'pizza' && filteredPizzaDishes.length > 0 && (
        <div className="w-full px-4 md:px-6">
          <div className="mx-auto max-w-7xl pb-4">
            <div className="mb-6">
              <h2 className="flex-shrink-0 text-3xl font-extrabold text-black drop-shadow-lg">{pizzaTypeTitle()}</h2>
              {/* Nếu không có typeParam thì mới hiển thị các button filter */}
              {!typeParam && (
                <div className="pizza-filter-bar mt-2">
                  <button
                    className={`rounded-full border px-4 py-1 text-sm font-bold shadow transition-all duration-150 ${filterPizzaType === 'Tất cả' ? 'border-[#C92A15] bg-[#C92A15] text-white' : 'border-gray-200 bg-white font-semibold text-[#C92A15]'}`}
                    onClick={() => setFilterPizzaType('Tất cả')}
                  >
                    {t('all')}
                  </button>
                  <button
                    className={`rounded-full border px-4 py-1 text-sm font-bold shadow transition-all duration-150 ${filterPizzaType === 'Pizza Hải Sản' ? 'border-[#C92A15] bg-[#C92A15] text-white' : 'border-gray-200 bg-white font-semibold text-[#C92A15]'}`}
                    onClick={() => setFilterPizzaType('Pizza Hải Sản')}
                  >
                    {t('seafood_pizza')}
                  </button>
                  <button
                    className={`rounded-full border px-4 py-1 text-sm font-bold shadow transition-all duration-150 ${filterPizzaType === 'Pizza Truyền Thống' ? 'border-[#C92A15] bg-[#C92A15] text-white' : 'border-gray-200 bg-white font-semibold text-[#C92A15]'}`}
                    onClick={() => setFilterPizzaType('Pizza Truyền Thống')}
                  >
                    {t('traditional_pizza')}
                  </button>
                  <button
                    className={`rounded-full border px-4 py-1 text-sm font-bold shadow transition-all duration-150 ${filterPizzaType === 'Pizza Thập Cẩm' ? 'border-[#C92A15] bg-[#C92A15] text-white' : 'border-gray-200 bg-white font-semibold text-[#C92A15]'}`}
                    onClick={() => setFilterPizzaType('Pizza Thập Cẩm')}
                  >
                    {t('combo_pizza')}
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {dishes.length === 0
                ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                : filteredPizzaDishes
                    .slice(0, visiblePizzaCount)
                    .map(dish => (
                      <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                    ))}
            </div>
            {visiblePizzaCount < filteredPizzaDishes.length && !typeParam && (
              <div className="mb-12 mt-4 flex justify-center">
                <a
                  className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setVisiblePizzaCount(prev => prev + 3)}
                >
                  {t('view_more')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedCategory === 'spaghetti' && filteredSpaghettiDishes.length > 0 && (
        <div className="w-full px-4 md:px-6">
          <div className="mx-auto max-w-7xl pb-4">
            <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{spaghettiTypeTitle()}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {dishes.length === 0
                ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                : filteredSpaghettiDishes
                    .slice(0, visibleSpaghettiCount)
                    .map(dish => (
                      <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                    ))}
            </div>
            {visibleSpaghettiCount < filteredSpaghettiDishes.length && (
              <div className="mb-12 mt-4 flex justify-center">
                <a
                  className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setVisibleSpaghettiCount(prev => prev + 3)}
                >
                  {t('view_more')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedCategory === 'baked_macaroni' && bakedMacaroniDishes.length > 0 && (
        <div className="w-full px-4 md:px-6">
          <div className="mx-auto max-w-7xl pb-4">
            <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{t('baked_macaroni') || 'Nui Bỏ Lò'}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {dishes.length === 0
                ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                : bakedMacaroniDishes
                    .slice(0, visibleBakedMacaroniCount)
                    .map(dish => (
                      <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                    ))}
            </div>
            {visibleBakedMacaroniCount < bakedMacaroniDishes.length && (
              <div className="mb-12 mt-4 flex justify-center">
                <a
                  className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setVisibleBakedMacaroniCount(prev => prev + 3)}
                >
                  {t('view_more')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedCategory === 'chicken' && chickenDishes.length > 0 && (
        <div className="w-full px-4 md:px-6">
          <div className="mx-auto max-w-7xl pb-4">
            <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{t('chicken')}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {dishes.length === 0
                ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                : chickenDishes
                    .slice(0, visibleChickenCount)
                    .map(dish => (
                      <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                    ))}
            </div>
            {visibleChickenCount < chickenDishes.length && (
              <div className="mb-12 mt-4 flex justify-center">
                <a
                  className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setVisibleChickenCount(prev => prev + 3)}
                >
                  {t('view_more')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedCategory === 'appetizer' && appetizerDishes.length > 0 && (
        <div className="w-full px-4 md:px-6">
          <div className="mx-auto max-w-7xl pb-4">
            <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{appetizerTypeTitle()}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {dishes.length === 0
                ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                : appetizerDishes
                    .slice(0, visibleAppetizerCount)
                    .map(dish => (
                      <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                    ))}
            </div>
            {visibleAppetizerCount < appetizerDishes.length && (
              <div className="mb-12 mt-4 flex justify-center">
                <a
                  className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setVisibleAppetizerCount(prev => prev + 3)}
                >
                  {t('view_more')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedCategory === 'salad' && saladDishes.length > 0 && (
        <div className="w-full px-4 md:px-6">
          <div className="mx-auto max-w-7xl pb-4">
            <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{t('salad') || 'Salad'}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {dishes.length === 0
                ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                : saladDishes
                    .slice(0, visibleSaladCount)
                    .map(dish => (
                      <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                    ))}
            </div>
            {visibleSaladCount < saladDishes.length && (
              <div className="mb-12 mt-4 flex justify-center">
                <a
                  className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setVisibleSaladCount(prev => prev + 3)}
                >
                  {t('view_more')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedCategory === 'drink' && drinkDishes.length > 0 && (
        <div className="w-full px-4 md:px-6">
          <div className="mx-auto max-w-7xl pb-4">
            <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{t('drink') || 'Thức uống'}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {dishes.length === 0
                ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                : drinkDishes
                    .slice(0, visibleDrinkCount)
                    .map(dish => (
                      <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                    ))}
            </div>
            {visibleDrinkCount < drinkDishes.length && (
              <div className="mb-12 mt-4 flex justify-center">
                <a
                  className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setVisibleDrinkCount(prev => prev + 3)}
                >
                  {t('view_more')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Nếu không có selectedCategory thì render tất cả như cũ */}
      {!selectedCategory && (
        <>
          {pizzaDishes.length > 0 && (
            <div className="w-full px-4 md:px-6">
              <div className="mx-auto max-w-7xl pb-4">
                <div className="mb-6 flex items-center gap-4">
                  <h2 className="flex-shrink-0 text-3xl font-extrabold text-black drop-shadow-lg">{t('pizza')}</h2>
                  <div className="ml-4 flex flex-1 flex-wrap justify-end gap-2">
                    <button
                      className={`rounded-full border px-4 py-1 text-sm font-bold shadow transition-all duration-150 ${filterPizzaType === 'Tất cả' ? 'border-[#C92A15] bg-[#C92A15] text-white' : 'border-gray-200 bg-white font-semibold text-[#C92A15]'}`}
                      onClick={() => setFilterPizzaType('Tất cả')}
                    >
                      {t('all')}
                    </button>
                    <button
                      className={`rounded-full border px-4 py-1 text-sm font-bold shadow transition-all duration-150 ${filterPizzaType === 'Pizza Hải Sản' ? 'border-[#C92A15] bg-[#C92A15] text-white' : 'border-gray-200 bg-white font-semibold text-[#C92A15]'}`}
                      onClick={() => setFilterPizzaType('Pizza Hải Sản')}
                    >
                      {t('seafood_pizza')}
                    </button>
                    <button
                      className={`rounded-full border px-4 py-1 text-sm font-bold shadow transition-all duration-150 ${filterPizzaType === 'Pizza Truyền Thống' ? 'border-[#C92A15] bg-[#C92A15] text-white' : 'border-gray-200 bg-white font-semibold text-[#C92A15]'}`}
                      onClick={() => setFilterPizzaType('Pizza Truyền Thống')}
                    >
                      {t('traditional_pizza')}
                    </button>
                    <button
                      className={`rounded-full border px-4 py-1 text-sm font-bold shadow transition-all duration-150 ${filterPizzaType === 'Pizza Thập Cẩm' ? 'border-[#C92A15] bg-[#C92A15] text-white' : 'border-gray-200 bg-white font-semibold text-[#C92A15]'}`}
                      onClick={() => setFilterPizzaType('Pizza Thập Cẩm')}
                    >
                      {t('combo_pizza')}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {filteredPizzaDishes.slice(0, visiblePizzaCount).map(dish => (
                    <DishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                  ))}
                </div>
                {visiblePizzaCount < filteredPizzaDishes.length && (
                  <div className="mb-12 mt-4 flex justify-center">
                    <a
                      className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setVisiblePizzaCount(prev => prev + 3)}
                    >
                      {t('view_more')}
                    </a>
                  </div>
                )}
                {visiblePizzaCount >= filteredPizzaDishes.length && visiblePizzaCount > 3 && (
                  <div className="mb-12 mt-4 flex justify-center">
                    <a
                      className="view-all cursor-pointer rounded-full border border-gray-400 px-6 py-2 text-base font-semibold text-gray-600 transition hover:bg-gray-400 hover:text-white"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setVisiblePizzaCount(3)}
                    >
                      {t('collapse')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          {chickenDishes.length > 0 && (
            <div className="w-full px-4 md:px-6">
              <div className="mx-auto max-w-7xl pb-4">
                <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{t('chicken')}</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {dishes.length === 0
                    ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                    : chickenDishes
                        .slice(0, visibleChickenCount)
                        .map(dish => (
                          <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                        ))}
                </div>
                {visibleChickenCount < chickenDishes.length && (
                  <div className="mb-12 mt-4 flex justify-center">
                    <a
                      className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setVisibleChickenCount(prev => prev + 3)}
                    >
                      {t('view_more')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          {spaghettiDishes.length > 0 && (
            <div className="w-full px-4 md:px-6">
              <div className="mx-auto max-w-7xl pb-4">
                <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{t('spaghetti')}</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {dishes.length === 0
                    ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                    : spaghettiDishes
                        .slice(0, visibleSpaghettiCount)
                        .map(dish => (
                          <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                        ))}
                </div>
                {spaghettiDishes.length > 3 && visibleSpaghettiCount < spaghettiDishes.length && (
                  <div className="mb-12 mt-4 flex justify-center">
                    <a
                      className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setVisibleSpaghettiCount(prev => prev + 3)}
                    >
                      {t('view_more')}
                    </a>
                  </div>
                )}
                {visibleSpaghettiCount >= spaghettiDishes.length && visibleSpaghettiCount > 3 && (
                  <div className="mb-12 mt-4 flex justify-center">
                    <a
                      className="view-all cursor-pointer rounded-full border border-gray-400 px-6 py-2 text-base font-semibold text-gray-600 transition hover:bg-gray-400 hover:text-white"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setVisibleSpaghettiCount(3)}
                    >
                      {t('collapse')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          {bakedMacaroniDishes.length > 0 && (
            <div className="w-full px-4 md:px-6">
              <div className="mx-auto max-w-7xl pb-4">
                <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{t('baked_macaroni') || 'Nui Bỏ Lò'}</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {dishes.length === 0
                    ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                    : bakedMacaroniDishes
                        .slice(0, visibleBakedMacaroniCount)
                        .map(dish => (
                          <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                        ))}
                </div>
                {bakedMacaroniDishes.length > 3 && visibleBakedMacaroniCount < bakedMacaroniDishes.length && (
                  <div className="mb-12 mt-4 flex justify-center">
                    <a
                      className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setVisibleBakedMacaroniCount(prev => prev + 3)}
                    >
                      {t('view_more')}
                    </a>
                  </div>
                )}
                {visibleBakedMacaroniCount >= bakedMacaroniDishes.length && visibleBakedMacaroniCount > 3 && (
                  <div className="mb-12 mt-4 flex justify-center">
                    <a
                      className="view-all cursor-pointer rounded-full border border-gray-400 px-6 py-2 text-base font-semibold text-gray-600 transition hover:bg-gray-400 hover:text-white"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setVisibleBakedMacaroniCount(3)}
                    >
                      {t('collapse')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          {(appetizerDishes.length > 0 || appetizerDishesFallback.length > 0) && (
            <div className="w-full px-4 md:px-6">
              <div className="mx-auto max-w-7xl pb-4">
                <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">{t('appetizer')}</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {dishes.length === 0
                    ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />)
                    : (appetizerDishes.length > 0 ? appetizerDishes : appetizerDishesFallback)
                        .slice(0, visibleAppetizerCount)
                        .map(dish => (
                          <MemoDishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                        ))}
                </div>
                {visibleAppetizerCount < (appetizerDishes.length > 0 ? appetizerDishes.length : appetizerDishesFallback.length) && (
                  <div className="mb-12 mt-4 flex justify-center">
                    <a
                      className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setVisibleAppetizerCount(prev => prev + 3)}
                    >
                      {t('view_more')}
                    </a>
                  </div>
                )}
                {visibleAppetizerCount >= (appetizerDishes.length > 0 ? appetizerDishes.length : appetizerDishesFallback.length) &&
                  visibleAppetizerCount > 3 && (
                    <div className="mb-12 mt-4 flex justify-center">
                      <a
                        className="view-all cursor-pointer rounded-full border border-gray-400 px-6 py-2 text-base font-semibold text-gray-600 transition hover:bg-gray-400 hover:text-white"
                        style={{ textDecoration: 'none' }}
                        onClick={() => setVisibleAppetizerCount(3)}
                      >
                        {t('collapse')}
                      </a>
                    </div>
                  )}
                {/* Thêm phần hiển thị salad nếu có */}
                {saladDishes.length > 0 && (
                  <>
                    <h3 className="mb-4 mt-8 text-2xl font-bold text-black">{t('salad') || 'Salad'}</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                      {saladDishes.slice(0, visibleSaladCount).map(dish => (
                        <DishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                      ))}
                    </div>
                    {saladDishes.length > 3 && visibleSaladCount < saladDishes.length && (
                      <div className="mb-6 mt-4 flex justify-center">
                        <a
                          className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                          style={{ textDecoration: 'none' }}
                          onClick={() => setVisibleSaladCount(prev => prev + 3)}
                        >
                          {t('view_more')}
                        </a>
                      </div>
                    )}
                    {visibleSaladCount >= saladDishes.length && visibleSaladCount > 3 && (
                      <div className="mb-6 mt-4 flex justify-center">
                        <a
                          className="view-all cursor-pointer rounded-full border border-gray-400 px-6 py-2 text-base font-semibold text-gray-600 transition hover:bg-gray-400 hover:text-white"
                          style={{ textDecoration: 'none' }}
                          onClick={() => setVisibleSaladCount(3)}
                        >
                          {t('collapse')}
                        </a>
                      </div>
                    )}
                  </>
                )}
                {/* Thêm phần hiển thị thức uống nếu có */}
                {drinkDishes.length > 0 && (
                  <>
                    <h3 className="mb-4 mt-8 text-2xl font-bold text-black">{t('drink') || 'Thức uống'}</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                      {drinkDishes.slice(0, visibleDrinkCount).map(dish => (
                        <DishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
                      ))}
                    </div>
                    {drinkDishes.length > 3 && visibleDrinkCount < drinkDishes.length && (
                      <div className="mb-6 mt-4 flex justify-center">
                        <a
                          className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                          style={{ textDecoration: 'none' }}
                          onClick={() => setVisibleDrinkCount(prev => prev + 3)}
                        >
                          {t('view_more')}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {/* CartPopup và overlay luôn render ngoài cùng */}
      {showCart && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.1)',
              zIndex: 99,
            }}
            onClick={handleCloseCart}
          />
          <CartPopup onClose={handleCloseCart} />
        </>
      )}
      {/* Nút hỗ trợ nổi góc phải cuối màn hình */}
      <div
        style={{
          position: 'fixed',
          bottom: 40,
          right: 60,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'box-shadow 0.2s, transform 0.2s',
            border: '4px solid #C92A15',
          }}
          className="help-circle homepage-logo-float"
          onClick={() => setShowMiniChat(true)}
        >
          <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, display: 'block', margin: '0 auto' }} />
          <span
            style={{
              position: 'absolute',
              right: 0,
              left: 'auto',
              bottom: 80,
              transform: 'none',
              minWidth: 220,
              maxWidth: 320,
              padding: '8px 24px',
              textAlign: 'center',
              background: '#fff',
              color: '#222',
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
              zIndex: 9999,
              display: showMiniChat ? 'none' : 'block',
            }}
            className="help-note"
          >
            Nhận diện món ăn bằng hình ảnh
          </span>
        </div>
        {/* Popup minichat */}
        {showMiniChat && (
          <div
            style={{
              position: 'absolute',
              bottom: 80,
              right: 0,
              width: 340,
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: 16,
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>Trợ lý món ăn thông minh</b>
              <button onClick={() => setShowMiniChat(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 80, margin: '8px 0', background: '#f8f8f8', borderRadius: 8, padding: 8 }}>
              <div style={{ color: '#888', marginBottom: 8 }}>
                <i>Hãy tìm món ăn bằng hình ảnh hoặc upload ảnh để nhận diện món ăn.</i>
              </div>
              <TeachableMachineTestPage onDishClick={dish => setDishModal(dish)} onClose={() => setShowMiniChat(false)} />
            </div>
          </div>
        )}
      </div>
      {/* Modal DishCard khi click từ minichat */}
      {dishModal && (
        <DishDetailModal
          dish={dishModal}
          onClose={() => setDishModal(null)}
          categoryName={categories.find(cat => cat.id === dishModal.categoryId)?.name || ''}
          categories={categories}
          dishes={dishes}
        />
      )}
    </div>
  );
}
