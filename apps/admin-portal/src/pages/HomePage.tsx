import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import '../css/HomePage.css';

import type { Category } from '../services/category.api';
import type { Dish } from '../types/dish.type';
import { getAllCategories } from '../services/category.api';
import { getAllDishes } from '../services/dish.api';
import DishCard from './DishCard';
import { CartPopup } from '../components/CartPopup';
import { getOrderItemsByUserId } from '../services/user.api';
import { AuthContext } from '../context/AuthContext';

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [visiblePizzaCount, setVisiblePizzaCount] = useState(3);
  const [visibleChickenCount, setVisibleChickenCount] = useState(3);
  const [filterPizzaType, setFilterPizzaType] = useState<string>('Tất cả');
  const location = useLocation();
  const [showCart, setShowCart] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    getAllDishes().then(d => setDishes(d || []));
    getAllCategories().then(c => setCategories(c || []));
  }, []);

  useEffect(() => {
    if (location.pathname === '/') setFilterPizzaType('Tất cả');
    else if (location.pathname === '/dishes') setFilterPizzaType('Pizza Hải Sản');
    else if (location.pathname === '/dishes/new' && location.search.includes('truyenthong')) setFilterPizzaType('Pizza Truyền Thống');
    else if (location.pathname === '/dishes/new' && location.search.includes('thapcam')) setFilterPizzaType('Pizza Thập Cẩm');
  }, [location]);

  const pizzaDishes = dishes.filter(
    d => d.status === 'available' && d.categoryId && categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('pizza') && cat.id === d.categoryId),
  );
  const chickenDishes = dishes.filter(
    d => d.status === 'available' && d.categoryId && categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('gà') && cat.id === d.categoryId),
  );
  const spaghettiDishes = dishes.filter(
    d => d.status === 'available' && d.categoryId && categories.find(cat => (cat.nameLocalized || cat.name).toLowerCase().includes('mỳ ý') && cat.id === d.categoryId),
  );

  // Lọc pizza theo filter
  const filteredPizzaDishes = pizzaDishes.filter(dish => {
    if (filterPizzaType === 'Tất cả') return true;
    if (filterPizzaType === 'Pizza Hải Sản') return dish.typeName?.trim().toLowerCase() === 'hải sản';
    if (filterPizzaType === 'Pizza Thập Cẩm') return dish.typeName?.trim().toLowerCase() === 'thập cẩm';
    if (filterPizzaType === 'Pizza Truyền Thống') return dish.typeName?.trim().toLowerCase() === 'truyền thống';
    return true;
  });

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

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mb-10 w-full">
        <div className="relative h-[300px] w-full overflow-hidden md:h-[400px]">
          <img src="/banner.png" alt="Banner" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <h2 className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl md:text-5xl">Ưu đãi lên đến 50%</h2>
            <p className="mt-2 text-base text-white sm:text-lg">Pizza Hải Sản – Chỉ còn từ 199k</p>
            <button className="mt-4 rounded-full bg-[#e62a10] px-6 py-3 text-lg font-semibold text-white transition hover:bg-red-600">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
      {pizzaDishes.length > 0 && (
        <div className="mx-auto max-w-7xl bg-white px-4 pb-4">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="flex-shrink-0 text-3xl font-extrabold text-black drop-shadow-lg">Pizza</h2>
            <div className="ml-4 flex flex-1 flex-wrap justify-end gap-2">
              <button
                className={`rounded-full px-4 py-1 text-sm font-bold shadow border transition-all duration-150
                  ${filterPizzaType === 'Tất cả' ? 'text-white bg-[#C92A15] border-[#C92A15]' : 'text-[#C92A15] bg-white border-gray-200 font-semibold'}`}
                onClick={() => setFilterPizzaType('Tất cả')}
              >Tất cả</button>
              <button
                className={`rounded-full px-4 py-1 text-sm font-bold shadow border transition-all duration-150
                  ${filterPizzaType === 'Pizza Hải Sản' ? 'text-white bg-[#C92A15] border-[#C92A15]' : 'text-[#C92A15] bg-white border-gray-200 font-semibold'}`}
                onClick={() => setFilterPizzaType('Pizza Hải Sản')}
              >Pizza Hải Sản</button>
              <button
                className={`rounded-full px-4 py-1 text-sm font-bold shadow border transition-all duration-150
                  ${filterPizzaType === 'Pizza Truyền Thống' ? 'text-white bg-[#C92A15] border-[#C92A15]' : 'text-[#C92A15] bg-white border-gray-200 font-semibold'}`}
                onClick={() => setFilterPizzaType('Pizza Truyền Thống')}
              >Truyền Thống</button>
              <button
                className={`rounded-full px-4 py-1 text-sm font-bold shadow border transition-all duration-150
                  ${filterPizzaType === 'Pizza Thập Cẩm' ? 'text-white bg-[#C92A15] border-[#C92A15]' : 'text-[#C92A15] bg-white border-gray-200 font-semibold'}`}
                onClick={() => setFilterPizzaType('Pizza Thập Cẩm')}
              >Thập Cẩm</button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filteredPizzaDishes.slice(0, visiblePizzaCount).map(dish => (
              <DishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
            ))}
          </div>
          {visiblePizzaCount < pizzaDishes.length && (
            <div className="mb-12 mt-4 flex justify-center">
              <a
                className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                style={{ textDecoration: 'none' }}
                onClick={() => setVisiblePizzaCount(prev => prev + 3)}
              >
                Xem thêm
                <em className="ri-add-line" />
              </a>
            </div>
          )}
        </div>
      )}
      {chickenDishes.length > 0 && (
        <div className="mx-auto max-w-7xl bg-white px-4 pb-4">
          <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">Gà</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {chickenDishes.slice(0, visibleChickenCount).map(dish => (
              <DishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
            ))}
          </div>
          {visibleChickenCount < chickenDishes.length && (
            <div className="mb-12 mt-4 flex justify-center">
              <a
                className="view-all cursor-pointer rounded-full border border-[#C92A15] px-6 py-2 text-base font-semibold text-[#C92A15] transition hover:bg-[#C92A15] hover:text-white"
                style={{ textDecoration: 'none' }}
                onClick={() => setVisibleChickenCount(prev => prev + 3)}
              >
                Xem thêm
                <em className="ri-add-line" />
              </a>
            </div>
          )}
        </div>
      )}
      {spaghettiDishes.length > 0 && (
        <div className="mx-auto max-w-7xl bg-white px-4 pb-4">
          <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">Mỳ Ý</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {spaghettiDishes.map(dish => (
              <DishCard key={dish.id} dish={dish} categoryName={categories.find(cat => cat.id === dish.categoryId)?.name || ''} />
            ))}
          </div>
        </div>
      )}
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
          <CartPopup
            onClose={handleCloseCart}
          />
        </>
      )}
    </div>
  );
}
