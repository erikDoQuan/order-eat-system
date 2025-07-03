import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { Dish } from '../types/dish.type';
import { AuthContext } from './AuthContext';

export interface CartItem {
  dishId: string;
  quantity: number;
  size?: 'small' | 'medium' | 'large';
  base?: string;
  note?: string;
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
  orders: Cart[];
  addToCart: (dishId: string, options?: { quantity?: number; size?: 'small' | 'medium' | 'large'; base?: string; note?: string }) => Promise<void>;
  removeFromCart: (item: { dishId: string; size?: string; base?: string; note?: string }) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
  removeItemFromOrder: (orderId: string, item: { dishId: string; size?: string; base?: string; note?: string }) => Promise<void>;
  fetchCartPublic: () => Promise<void>;
  orderItems: any[];
  setOrderItems: React.Dispatch<React.SetStateAction<any[]>>;
}

const CartContext = createContext<CartContextProps>({
  cart: null,
  orders: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  fetchCart: async () => {},
  clearCart: () => {},
  removeItemFromOrder: async () => {},
  fetchCartPublic: async () => {},
  orderItems: [],
  setOrderItems: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const userId = user?.id || 'guest';
  const CART_KEY = `order-eat-cart-${userId}`;

  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Cart[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    axios.get('/api/v1/dishes').then(res => setDishes(res.data.data || []));
  }, []);

  const fetchCart = async () => {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCart(parsed);
        setOrderItems(parsed.orderItems?.items || []);
      } catch {
        setCart(null);
        setOrderItems([]);
      }
    } else {
      setCart(null);
      setOrderItems([]);
    }
  };

  const saveCart = (cartObj: Cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartObj));
    setCart(cartObj);
    setOrderItems(cartObj.orderItems?.items || []);
  };

  const addToCart = async (
    dishId: string,
    options?: { quantity?: number; size?: 'small' | 'medium' | 'large'; base?: string; note?: string }
  ) => {
    const { quantity = 1, size, base, note } = options || {};
    let items: CartItem[] = cart && cart.orderItems && Array.isArray(cart.orderItems.items)
      ? [...cart.orderItems.items]
      : [];
    const idx = items.findIndex(i =>
      i.dishId === dishId &&
      (i.size ?? null) === (size ?? null) &&
      (i.base ?? null) === (base ?? null) &&
      (i.note ?? null) === (note ?? null)
    );
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      const newItem: CartItem = { dishId, quantity };
      if (size) newItem.size = size;
      if (base) newItem.base = base;
      if (note) newItem.note = note;
      items = [newItem, ...items];
    }
    const filteredItems = items.filter(i => i.quantity > 0);
    let totalAmount = 0;
    for (const item of filteredItems) {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish || typeof dish.basePrice === 'undefined' || dish.basePrice === null) continue;
      const price = Number(dish.basePrice);
      if (isNaN(price) || price <= 0) continue;
      totalAmount += price * (item.quantity || 1);
    }
    const newCart: Cart = {
      userId: userId,
      orderItems: { items: filteredItems },
      totalAmount,
      status: 'pending',
      createdBy: userId,
      id: cart?.id,
    };
    saveCart(newCart);
  };

  const removeFromCart = async (itemToRemove: { dishId: string; size?: string; base?: string; note?: string }) => {
    if (!cart || !cart.orderItems || !Array.isArray(cart.orderItems.items)) return;
    const items: CartItem[] = [...cart.orderItems.items];
    const filteredItems = items.filter(i => !(
      i.dishId === itemToRemove.dishId &&
      i.size === itemToRemove.size &&
      i.base === itemToRemove.base &&
      i.note === itemToRemove.note
    ));
    let totalAmount = 0;
    for (const item of filteredItems) {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish || typeof dish.basePrice === 'undefined' || dish.basePrice === null) continue;
      const price = Number(dish.basePrice);
      if (isNaN(price) || price <= 0) continue;
      totalAmount += price * (item.quantity || 1);
    }
    const newCart: Cart = {
      userId: userId,
      orderItems: { items: filteredItems },
      totalAmount,
      status: 'pending',
      createdBy: userId,
      id: cart?.id,
    };
    saveCart(newCart);
  };

  const clearCart = () => {
    localStorage.removeItem(CART_KEY);
    setCart(null);
    setOrderItems([]);
  };

  const removeItemFromOrder = async () => {};
  const fetchCartPublic = async () => { await fetchCart(); };

  useEffect(() => { fetchCart(); }, [userId]);

  return (
    <CartContext.Provider value={{ cart, orders, addToCart, removeFromCart, fetchCart, clearCart, removeItemFromOrder, fetchCartPublic, orderItems, setOrderItems }}>
      {children}
    </CartContext.Provider>
  );
}; 