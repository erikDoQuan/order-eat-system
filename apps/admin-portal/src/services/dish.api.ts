import axios from 'axios'
import { Dish } from '../types/dish.type'

export const getAllDishes = async (): Promise<Dish[]> => {
  const res = await axios.get('/api/v1/dishes')
  return res.data.data
}

export const createDish = async (data: Partial<Dish>) => {
  const res = await axios.post('/api/v1/dishes', data);
  return res.data;
}

export const updateDish = async (id: string, data: Partial<Dish>) => {
  const res = await axios.patch(`/api/v1/dishes/${id}`, data);
  return res.data;
};

export const deleteDish = async (id: string) => {
  const res = await axios.delete(`/api/v1/dishes/${id}`);
  return res.data;
};
