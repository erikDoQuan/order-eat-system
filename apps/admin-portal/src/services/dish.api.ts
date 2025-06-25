import axios from 'axios'
import { Dish } from '../types/dish.type'

export const getAllDishes = async (): Promise<Dish[]> => {
  const res = await axios.get('/api/v1/dishes')
  return res.data.data
}
