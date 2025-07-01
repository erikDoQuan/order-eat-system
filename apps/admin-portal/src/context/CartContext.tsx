import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface CartItem {
  dishId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  orderItems: { items: CartItem[] };
  totalAmount: number;
  status: string;
  createdBy: string;
  id?: string;
}

interface CartContextProps {
  cart: Cart | null;
  addToCart: (dishId: string, quantity?: number) => Promise<void>;
  removeFromCart: (dishId: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps>({
  cart: null,
  addToCart: async () => {},
  removeFromCart: async () => {},
  fetchCart: async () => {},
  clearCart: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
  const [cart, setCart] = useState<Cart | null>(null);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`/api/v1/orders?userId=${userId}&status=pending`);
      console.log('API cart response:', res.data.data[0]);
      setCart(res.data.data[0] || null);
    } catch (err) {
      setCart(null);
    }
  };

  const addToCart = async (dishId: string, quantity: number = 1) => {
    let items = cart?.orderItems?.items ? [...cart.orderItems.items] : [];
    const idx = items.findIndex(i => i.dishId === dishId);
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      items.push({ dishId, quantity });
    }
    const totalAmount = 0; // TODO: tính lại tổng tiền nếu cần
    const payload = {
      userId,
      orderItems: { items },
      totalAmount,
      status: 'pending',
      createdBy: userId,
    };
    console.log('addToCart payload:', payload);
    await axios.post('/api/v1/orders', payload);
    await fetchCart();
  };

  const removeFromCart = async (dishId: string) => {
    if (!cart || !cart.orderItems || !Array.isArray(cart.orderItems.items)) return;
    const { items = [] } = cart.orderItems;
    const filteredItems = items.filter(i => i.dishId !== dishId);
    const payload = {
      userId,
      orderItems: { items: filteredItems },
      totalAmount: cart.totalAmount,
      status: 'pending',
      createdBy: userId,
    };
    console.log('removeFromCart payload:', payload);
    await axios.post('/api/v1/orders', payload);
    await fetchCart();
  };

  const clearCart = () => setCart(null);

  useEffect(() => {
    if (userId) fetchCart();
    // eslint-disable-next-line
  }, [userId]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}; 