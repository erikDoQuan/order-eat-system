import axios from 'axios';

export type Category = {
  id: string;
  name: string;
  nameLocalized?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getAllCategories = async (): Promise<Category[]> => {
  const res = await axios.get('/api/v1/categories');
  return res.data.data;
};
