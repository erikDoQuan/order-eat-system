import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import 'swiper/css';

import { getAllDishes } from '../services/dish.api';
import { Dish } from '../types/dish.type';
import DishCard from './DishCard';

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    getAllDishes().then(d => setDishes(d || []));
  }, []);

  return (
    <div className="min-h-screen bg-white py-8">
      {/* Banner full-width theo style The Pizza Company */}
      <div className="w-full mb-10">
        <Swiper
          modules={[Mousewheel]}
          slidesPerView={1}
          loop
          mousewheel={{ forceToAxis: true, sensitivity: 1 }}
          className="w-full"
        >
          {['/banner.png', '/banner2.png'].map((src, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
                {/* Ảnh nền */}
                <img
                  src={src}
                  alt={`Banner ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay tối ở giữa */}
                <div className="absolute inset-0 bg-black/30" />
                {/* Chữ và CTA */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
                    Ưu đãi lên đến 50%
                  </h2>
                  <p className="mt-2 text-base sm:text-lg text-white">
                    Pizza Hải Sản – Chỉ còn từ 199k
                  </p>
                  <button className="mt-4 rounded-full bg-[#e62a10] px-6 py-3 text-lg font-semibold text-white hover:bg-red-600 transition">
                    Mua ngay
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Danh sách món ăn */}
      {dishes.length > 0 ? (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {dishes.map((dish, idx) => (
            <div key={dish.id} className="flex flex-col col-span-1">
              {idx === 0 && (
                <h2 className="mb-4 text-3xl font-extrabold text-black drop-shadow-lg">
                  Pizza
                </h2>
              )}
              <DishCard dish={dish} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">Không tìm thấy món ăn nào.</p>
      )}
    </div>
  );
}
