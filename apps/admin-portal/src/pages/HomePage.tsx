import { useEffect, useState } from 'react';
import { Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { Category, getAllCategories } from '../services/category.api';
import { getAllDishes } from '../services/dish.api';
import { Dish } from '../types/dish.type';
import DishCard from './DishCard';

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAllDishes().then(d => setDishes(d || []));
    getAllCategories().then(c => setCategories(c || []));
  }, []);

  const pizzaDishes = dishes.filter(
    d =>
      d.categoryId &&
      categories.find(
        cat =>
          (cat.nameLocalized || cat.name)?.toLowerCase().includes('pizza') &&
          cat.id === d.categoryId,
      ),
  );

  const chickenDishes = dishes.filter(
    d =>
      d.categoryId &&
      categories.find(
        cat =>
          (cat.nameLocalized || cat.name)?.toLowerCase().includes('gà') &&
          cat.id === d.categoryId,
      ),
  );

  return (
    <div className="min-h-screen bg-white py-8">
      {/* Danh mục động */}
      {categories.length > 0 && (
        <div className="mx-auto mb-10 max-w-7xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-black">Danh mục</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => (
              <span
                key={cat.id}
                className="cursor-pointer rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-800 shadow hover:bg-gray-200"
              >
                {cat.nameLocalized || cat.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="mb-10 w-full">
        <Swiper
          modules={[Mousewheel]}
          slidesPerView={1}
          loop
          mousewheel={{ forceToAxis: true, sensitivity: 1 }}
          className="w-full"
        >
          {['/banner.png', '/banner2.png'].map((src, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative h-[300px] w-full overflow-hidden md:h-[400px]">
                <img
                  src={src}
                  alt={`Banner ${idx + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                  <h2 className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl md:text-5xl">
                    Ưu đãi lên đến 50%
                  </h2>
                  <p className="mt-2 text-base text-white sm:text-lg">
                    Pizza Hải Sản – Chỉ còn từ 199k
                  </p>
                  <button className="mt-4 rounded-full bg-[#e62a10] px-6 py-3 text-lg font-semibold text-white transition hover:bg-red-600">
                    Mua ngay
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Danh sách Pizza swiper ngang */}
      {pizzaDishes.length > 0 && (
        <div className="mx-auto max-w-7xl bg-white px-4 pb-10">
          <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">Pizza</h2>

          <Swiper
            className="bg-white py-4"
            modules={[Mousewheel]}
            mousewheel={{ forceToAxis: true, sensitivity: 1 }}
            spaceBetween={24}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2.3 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 3.5 },
            }}
          >
            {pizzaDishes.map(dish => (
              <SwiperSlide key={dish.id} className="overflow-visible bg-white">
                <DishCard dish={dish} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Danh sách Gà swiper ngang */}
      {chickenDishes.length > 0 && (
        <div className="mx-auto max-w-7xl bg-white px-4 pb-10 mt-12">
          <h2 className="mb-6 text-3xl font-extrabold text-black drop-shadow-lg">Gà</h2>

          <Swiper
            className="bg-white py-4"
            modules={[Mousewheel]}
            mousewheel={{ forceToAxis: true, sensitivity: 1 }}
            spaceBetween={24}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2.3 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 3.5 },
            }}
          >
            {chickenDishes.map(dish => (
              <SwiperSlide key={dish.id} className="overflow-visible bg-white">
                <DishCard dish={dish} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}
