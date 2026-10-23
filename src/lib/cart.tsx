import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from './types';
import { shippingFor } from './format';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  descriptor: string;
  size: string;
  price: number;
  image: string;
  qty: number;
  maxQty: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  add: (p: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'vyra.cart.v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((p: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, maxQty: p.stock, qty: Math.min(p.stock, i.qty + qty) } : i,
        );
      }
      return [
        ...prev,
        {
          productId: p.id, slug: p.slug, name: p.name, descriptor: p.descriptor, size: p.size,
          price: p.price, image: p.image, qty: Math.min(qty, p.stock), maxQty: p.stock,
        },
      ];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, Math.min(i.maxQty, qty)) } : i)),
    );
  }, []);

  const remove = useCallback((productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = shippingFor(subtotal);
    return {
      items, add, setQty, remove, clear, subtotal, shipping, total: subtotal + shipping,
      count: items.reduce((s, i) => s + i.qty, 0),
    };
  }, [items, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
