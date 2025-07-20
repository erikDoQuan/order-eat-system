import React, { createContext, useContext, useEffect, useState } from 'react';

import { getAllDishes } from '../services/dish.api';

const DishContext = createContext<any[]>([]);

export const DishProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dishes, setDishes] = useState<any[]>([]);
  useEffect(() => {
    getAllDishes().then(setDishes);
  }, []);
  return <DishContext.Provider value={dishes}>{children}</DishContext.Provider>;
};

export const useDishes = () => useContext(DishContext);
