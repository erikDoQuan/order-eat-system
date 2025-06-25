import { Dish } from '../types/dish.type'

export default function DishCard({ dish }: { dish: Dish }) {
  return (
    <div className="border rounded-xl p-4 shadow-md max-w-sm">
      {dish.imageUrl && (
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-40 object-cover rounded-md mb-4"
        />
      )}
      <h3 className="text-lg font-bold">{dish.name}</h3>
      <p className="text-gray-600 mb-2">{dish.description}</p>
      {dish.basePrice && (
        <p className="font-semibold text-primary">Giá: {Number(dish.basePrice).toLocaleString()}₫</p>
      )}
      {dish.size && <p>Kích thước: {dish.size}</p>}
      {dish.status && <p>Trạng thái: {dish.status === 'available' ? 'Hiển thị' : 'Ẩn'}</p>}
    </div>
  )
}
