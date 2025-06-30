import axios from 'axios';

export type Category = {
  id: string;
  name: string;
  nameLocalized?: string;
  status?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getAllCategories = async (): Promise<Category[]> => {
  const res = await axios.get('/api/v1/categories');
  return res.data.data;
};

export const createCategory = async (data: { name: string; createdBy: string; status?: string; isActive?: boolean }) => {
  const res = await axios.post('/api/v1/categories', data);
  return res.data;
};

export const updateCategory = async (id: string, data: { name: string; isActive?: boolean }) => {
  const res = await axios.patch(`/api/v1/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await axios.delete(`/api/v1/categories/${id}`);
  return res.data;
};
