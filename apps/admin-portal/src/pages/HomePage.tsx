// import DishCard from '../components/DishCard'
import { useEffect, useState } from 'react';

import { getAllDishes } from '../services/dish.api';
import { Dish } from '../types/dish.type';
import DishCard from './DishCard';

export default function HomePage() {
  const [dish, setDish] = useState<Dish | null>(null);

  useEffect(() => {
    getAllDishes().then(dishes => {
      if (dishes.length > 0) setDish(dishes[0] as Dish);
    });
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">🏠 Trang chủ quản trị</h2>
      {dish ? (
        <div>
          <p className="mb-2 text-gray-600">🔍 Món ăn mẫu để test:</p>
          <DishCard dish={dish} />
        </div>
      ) : (
        <p>Không tìm thấy món ăn nào.</p>
      )}
    </div>
  );
}
