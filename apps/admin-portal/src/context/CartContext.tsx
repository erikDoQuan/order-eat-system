import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
}

const CartContext = createContext<CartContextProps>({
  cart: null,
  orders: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  fetchCart: async () => {},
  clearCart: () => {},
  removeItemFromOrder: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Cart[]>([]);

  const fetchCart = async () => {
    try {
      console.log('fetchCart userId:', userId);
      const res = await axios.get(`/api/v1/orders`, { params: { userId } });
      const ordersData = res.data && res.data.data ? res.data.data : [];
      const parsedOrders = ordersData.map((order: any) => {
        if (order && typeof order.orderItems === 'string') {
          try {
            order.orderItems = JSON.parse(order.orderItems);
          } catch {}
        }
        return order;
      });
      setOrders(parsedOrders);
      const latestOrder = parsedOrders.length > 0 ? parsedOrders.reduce((a: any, b: any) => {
        if (!a.createdAt) return b;
        if (!b.createdAt) return a;
        return new Date(a.createdAt) > new Date(b.createdAt) ? a : b;
      }) : null;
      setCart(latestOrder || null);
    } catch (err) {
      setCart(null);
      setOrders([]);
    }
  };

  const addToCart = async (
    dishId: string,
    options?: { quantity?: number; size?: 'small' | 'medium' | 'large'; base?: string; note?: string }
  ) => {
    const { quantity = 1, size, base, note } = options || {};
    let items: CartItem[] = [];
    if (cart && cart.orderItems && Array.isArray(cart.orderItems.items)) {
      items = [...cart.orderItems.items];
    }
    const idx = items.findIndex(i => i.dishId === dishId && i.size === size && i.base === base && i.note === note);
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      items.push({ dishId, quantity, size, base, note });
    }
    const totalAmount = 0; // TODO: tính lại tổng tiền nếu cần
    const payload = {
      userId,
      orderItems: { items },
      totalAmount,
      status: 'pending',
      createdBy: userId,
    };
    console.log('addToCart userId:', userId);
    console.log('addToCart payload:', payload);
    await axios.post('/api/v1/orders', payload);
    await fetchCart();
  };

  const removeFromCart = async (itemToRemove: { dishId: string; size?: string; base?: string; note?: string }) => {
    if (!cart || !cart.id || !cart.orderItems || !Array.isArray(cart.orderItems.items)) return;
    const items: CartItem[] = cart.orderItems.items;
    const filteredItems = items.filter(i => !(
      i.dishId === itemToRemove.dishId &&
      i.size === itemToRemove.size &&
      i.base === itemToRemove.base &&
      i.note === itemToRemove.note
    ));
    if (filteredItems.length === 0) {
      await axios.delete(`/api/v1/orders/${cart.id}`);
      setCart(null);
      setOrders([]);
      return;
    } else {
      const payload = {
        userId,
        orderItems: { items: filteredItems },
        status: 'pending',
        createdBy: userId,
      };
      await axios.patch(`/api/v1/orders/${cart.id}`, payload);
    }
    await fetchCart();
  };

  const clearCart = () => setCart(null);

  const removeItemFromOrder = async (orderId: string, itemToRemove: { dishId: string; size?: string; base?: string; note?: string }) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.orderItems || !Array.isArray(order.orderItems.items)) return;
    const filteredItems = order.orderItems.items.filter(i => !(
      i.dishId === itemToRemove.dishId &&
      i.size === itemToRemove.size &&
      i.base === itemToRemove.base &&
      i.note === itemToRemove.note
    ));
    const payload = {
      orderItems: { items: filteredItems },
    };
    await axios.patch(`/api/v1/orders/${orderId}`, payload);
    await fetchCart();
  };

  useEffect(() => {
    if (userId) fetchCart();
    // eslint-disable-next-line
  }, [userId]);

  return (
    <CartContext.Provider value={{ cart, orders, addToCart, removeFromCart, fetchCart, clearCart, removeItemFromOrder }}>
      {children}
    </CartContext.Provider>
  );
}; 