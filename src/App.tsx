import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './lib/cart';
import { ToastProvider } from './components/ui';
import { StoreLayout } from './components/StoreLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Collections from './pages/Collections';
import Philosophy from './pages/Philosophy';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Inventory from './pages/admin/Inventory';
import ProductForm from './pages/admin/ProductForm';
import Orders from './pages/admin/Orders';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="collections" element={<Collections />} />
              <Route path="philosophy" element={<Philosophy />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order/:id" element={<Confirmation />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
            </Route>
          </Routes>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
