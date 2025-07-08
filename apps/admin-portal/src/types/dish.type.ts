export type Dish = {
  id: string
  name: string
  description?: string
  imageUrl?: string
  basePrice?: string
  size?: 'small' | 'medium' | 'large'
  status?: 'available' | 'unavailable'
  typeName?: string
  categoryId?: string
  createdAt?: string
  updatedAt?: string
  pickupTime?: string // Thời gian lấy món (ISO hoặc HH:mm)
}
