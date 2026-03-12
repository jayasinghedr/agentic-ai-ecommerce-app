import { create } from 'zustand';
import api from '../api/client';
import { Cart } from '../types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;

  loadCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  loadCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<Cart>('/cart');
      set({ cart: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity) => {
    const { data } = await api.post<Cart>('/cart/items', { productId, quantity });
    set({ cart: data });
  },

  updateItem: async (cartItemId, quantity) => {
    const { data } = await api.patch<Cart>(`/cart/items/${cartItemId}`, { quantity });
    set({ cart: data });
  },

  removeItem: async (cartItemId) => {
    const { data } = await api.delete<Cart>(`/cart/items/${cartItemId}`);
    set({ cart: data });
  },

  clearCart: () => set({ cart: null }),
}));
