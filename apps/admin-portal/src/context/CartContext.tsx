import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { Dish } from '../types/dish.type';

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

export const CartProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Cart[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    axios.get('/api/v1/dishes').then(res => setDishes(res.data.data || []));
  }, []);

  const fetchCart = async () => {
    try {
      console.log('fetchCart userId:', userId);
      const res = await axios.get(`/api/v1/orders`, { params: { userId } });
      const ordersData = res.data && res.data.data ? res.data.data : [];
      const parsedOrders = ordersData
        .filter((order: any) => order && typeof order === 'object' && 'id' in order && (order as any).id && (order as any).isActive !== false)
        .map((order: any) => {
          if (!order) return order;
          const o = order as any;
          if (typeof o.orderItems === 'string') {
            try {
              o.orderItems = JSON.parse(o.orderItems);
            } catch {}
          }
          return o;
        });
      setOrders(parsedOrders);
      const latestOrder = parsedOrders.length > 0 ? parsedOrders.reduce((a: any, b: any) => {
        if (!a.createdAt) return b;
        if (!b.createdAt) return a;
        return new Date(a.createdAt) > new Date(b.createdAt) ? a : b;
      }) : null;
      setCart(latestOrder || null);
      if (latestOrder && (latestOrder as any).orderItems && Array.isArray((latestOrder as any).orderItems.items)) {
        setOrderItems((latestOrder as any).orderItems.items);
      } else {
        setOrderItems([]);
      }
    } catch (err) {
      setCart(null);
      setOrders([]);
      setOrderItems([]);
    }
  };

  const addToCart = async (
    dishId: string,
    options?: { quantity?: number; size?: 'small' | 'medium' | 'large'; base?: string; note?: string }
  ) => {
    const { quantity = 1, size, base, note } = options || {};
    let items: CartItem[] = [];
    if (cart && cart.orderItems && Array.isArray((cart.orderItems as any).items)) {
      items = [...(cart.orderItems as any).items];
    }
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
      items.push(newItem);
    }
    const filteredItems = items.filter(i => i.quantity > 0);
    if (filteredItems.length === 0) return;

    if (!dishes || dishes.length === 0) {
      await fetchCart();
      return;
    }

    let totalAmount = 0;
    for (const item of filteredItems) {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish || typeof dish.basePrice === 'undefined' || dish.basePrice === null) {
        alert('Không thể thêm vào giỏ hàng vì không xác định được giá món ăn!');
        return;
      }
      const price = Number(dish.basePrice);
      if (isNaN(price) || price <= 0) {
        alert('Không thể thêm vào giỏ hàng vì giá món ăn không hợp lệ!');
        return;
      }
      totalAmount += price * (item.quantity || 1);
    }
    if (totalAmount <= 0) {
      alert('Không thể thêm vào giỏ hàng vì không xác định được giá món ăn!');
      return;
    }

    const cleanItems = filteredItems.map(i => {
      const obj: any = { dishId: i.dishId, quantity: i.quantity };
      if (i.size) obj.size = i.size;
      if (i.base) obj.base = i.base;
      if (i.note) obj.note = i.note;
      return obj;
    });

    const payload = {
      userId,
      orderItems: { items: cleanItems },
      totalAmount,
      status: 'pending',
      createdBy: userId,
    };
    if (cart && cart.id) {
      await axios.patch(`/api/v1/orders/${cart.id}`, payload);
    } else {
      await axios.post('/api/v1/orders', payload);
    }
    await fetchCart();
  };

  const removeFromCart = async (itemToRemove: { dishId: string; size?: string; base?: string; note?: string }) => {
    if (!cart || !cart.id || !cart.orderItems || !Array.isArray((cart.orderItems as any).items)) return;
    const items: CartItem[] = [...(cart.orderItems as any).items];
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
    if (filteredItems.length === 0) {
      await axios.delete(`/api/v1/orders/${cart.id}`);
      await fetchCart();
      return;
    } else {
      const payload = {
        userId,
        orderItems: { items: filteredItems },
        totalAmount,
        status: 'pending',
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
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

  const fetchCartPublic = async () => {
    await fetchCart();
  };

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  return (
    <CartContext.Provider value={{ cart, orders, addToCart, removeFromCart, fetchCart, clearCart, removeItemFromOrder, fetchCartPublic, orderItems, setOrderItems }}>
      {children}
    </CartContext.Provider>
  );
}; 