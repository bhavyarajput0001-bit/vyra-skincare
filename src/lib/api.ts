/**
 * VYRA data layer.
 *
 * Every call is async and shaped like a REST client (GET /products, PATCH /products/:id/stock,
 * POST /orders …) so the storefront and admin UI are backend-agnostic. In this demo build the
 * "database" is a versioned JSON document persisted in localStorage; swapping `adapter` for a
 * fetch-based client against a Postgres-backed API requires no UI changes.
 */
import type { Customer, Order, Product, ProductInput } from './types';
import { SEED_PRODUCTS } from './seed';
import { shippingFor, slugify } from './format';

interface DB {
  version: 1;
  products: Product[];
  orders: Order[];
  subscribers: { email: string; createdAt: string }[];
}

const KEY = 'vyra.db.v1';
const SESSION = 'vyra.admin.session';
export const DEMO_ADMIN = { email: 'admin@vyraskin.demo', password: 'vyra-demo' };

export class ApiError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
  }
}

const fresh = (): DB => ({ version: 1, products: structuredClone(SEED_PRODUCTS), orders: [], subscribers: [] });

const adapter = {
  read(): DB {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const db = JSON.parse(raw) as DB;
      if (db.version !== 1 || !Array.isArray(db.products)) return fresh();
      return db;
    } catch {
      return fresh();
    }
  },
  write(db: DB) {
    localStorage.setItem(KEY, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('vyra:db'));
  },
};

const latency = (ms = 380) => new Promise((r) => setTimeout(r, ms + Math.random() * 260));
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

function validateProduct(input: ProductInput, db: DB, selfId?: string) {
  if (!input.name.trim()) throw new ApiError('Product name is required.', 'name');
  if (!input.sku.trim()) throw new ApiError('SKU is required.', 'sku');
  if (db.products.some((p) => p.sku.toLowerCase() === input.sku.trim().toLowerCase() && p.id !== selfId))
    throw new ApiError('That SKU is already in use.', 'sku');
  if (!(input.price > 0)) throw new ApiError('Price must be greater than zero.', 'price');
  if (!Number.isInteger(input.stock) || input.stock < 0) throw new ApiError('Stock must be a whole number of 0 or more.', 'stock');
  if (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold < 0)
    throw new ApiError('Threshold must be a whole number of 0 or more.', 'lowStockThreshold');
}

function uniqueSlug(name: string, db: DB, selfId?: string) {
  const base = slugify(name) || 'product';
  let slug = base;
  let i = 2;
  while (db.products.some((p) => p.slug === slug && p.id !== selfId)) slug = `${base}-${i++}`;
  return slug;
}

export const api = {
  /* ---------- Products ---------- */
  async listProducts(opts: { includeDrafts?: boolean } = {}): Promise<Product[]> {
    await latency();
    const { products } = adapter.read();
    return products
      .filter((p) => opts.includeDrafts || p.status === 'active')
      .sort((a, b) => a.featured - b.featured);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    await latency(260);
    return adapter.read().products.find((p) => p.slug === slug && p.status === 'active') ?? null;
  },

  async getProduct(id: string): Promise<Product | null> {
    await latency(260);
    return adapter.read().products.find((p) => p.id === id) ?? null;
  },

  async createProduct(input: ProductInput): Promise<Product> {
    await latency(550);
    const db = adapter.read();
    validateProduct(input, db);
    const ts = new Date().toISOString();
    const product: Product = {
      ...input,
      sku: input.sku.trim().toUpperCase(),
      id: uid('p'),
      slug: uniqueSlug(input.name, db),
      featured: db.products.length + 1,
      createdAt: ts,
      updatedAt: ts,
    };
    db.products.push(product);
    adapter.write(db);
    return product;
  },

  async updateProduct(id: string, input: ProductInput): Promise<Product> {
    await latency(550);
    const db = adapter.read();
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx < 0) throw new ApiError('Product not found.');
    validateProduct(input, db, id);
    const updated: Product = {
      ...db.products[idx],
      ...input,
      sku: input.sku.trim().toUpperCase(),
      slug: uniqueSlug(input.name, db, id),
      updatedAt: new Date().toISOString(),
    };
    db.products[idx] = updated;
    adapter.write(db);
    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    await latency(450);
    const db = adapter.read();
    db.products = db.products.filter((p) => p.id !== id);
    adapter.write(db);
  },

  async setStock(id: string, stock: number): Promise<Product> {
    await latency(300);
    if (!Number.isInteger(stock) || stock < 0) throw new ApiError('Stock must be a whole number of 0 or more.');
    const db = adapter.read();
    const p = db.products.find((x) => x.id === id);
    if (!p) throw new ApiError('Product not found.');
    p.stock = stock;
    p.updatedAt = new Date().toISOString();
    adapter.write(db);
    return p;
  },

  /* ---------- Orders ---------- */
  async placeOrder(customer: Customer, items: { productId: string; qty: number }[]): Promise<Order> {
    await latency(900);
    if (!items.length) throw new ApiError('Your bag is empty.');
    const db = adapter.read();
    const lines = items.map(({ productId, qty }) => {
      const p = db.products.find((x) => x.id === productId && x.status === 'active');
      if (!p) throw new ApiError('One of the items in your bag is no longer available. Please review your bag.');
      if (p.stock < qty)
        throw new ApiError(
          p.stock === 0
            ? `${p.name} just sold out. Remove it from your bag to continue.`
            : `Only ${p.stock} of ${p.name} left. Please update the quantity in your bag.`,
        );
      return { p, qty };
    });
    lines.forEach(({ p, qty }) => {
      p.stock -= qty;
      p.updatedAt = new Date().toISOString();
    });
    const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
    const shipping = shippingFor(subtotal);
    const order: Order = {
      id: uid('o'),
      number: `VY-${String(1001 + db.orders.length).padStart(5, '0')}`,
      createdAt: new Date().toISOString(),
      customer,
      items: lines.map(({ p, qty }) => ({
        productId: p.id, name: p.name, descriptor: p.descriptor, image: p.image, price: p.price, qty,
      })),
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: 'Demo — received',
    };
    db.orders.unshift(order);
    adapter.write(db);
    return order;
  },

  async getOrder(id: string): Promise<Order | null> {
    await latency(300);
    return adapter.read().orders.find((o) => o.id === id) ?? null;
  },

  async listOrders(): Promise<Order[]> {
    await latency();
    return adapter.read().orders;
  },

  /* ---------- Newsletter ---------- */
  async subscribe(email: string): Promise<void> {
    await latency(600);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new ApiError('Please enter a valid email address.');
    const db = adapter.read();
    if (db.subscribers.some((s) => s.email === email.toLowerCase()))
      throw new ApiError('You’re already on the list — thank you.');
    db.subscribers.push({ email: email.toLowerCase(), createdAt: new Date().toISOString() });
    adapter.write(db);
  },

  /* ---------- Admin auth (demo) ---------- */
  async login(email: string, password: string): Promise<void> {
    await latency(700);
    if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password)
      throw new ApiError('Those credentials don’t match our demo admin account.');
    sessionStorage.setItem(SESSION, '1');
  },
  logout() {
    sessionStorage.removeItem(SESSION);
  },
  isAuthed() {
    return sessionStorage.getItem(SESSION) === '1';
  },

  async resetDemo(): Promise<void> {
    await latency(500);
    adapter.write(fresh());
  },
};
