import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import VirtualAssistant from './components/VirtualAssistant';
import SupportChat from './components/SupportChat';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import SearchPage from './pages/SearchPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';

import './i18n';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AuthProvider>
              <CartProvider>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/payment/success" element={<PaymentSuccessPage />} />
                  <Route path="/payment/cancel" element={<PaymentCancelPage />} />
                  <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/seller" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><SellerDashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/client" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Routes>

                <VirtualAssistant />
                <SupportChat />
                <Toaster position="top-right" richColors />
              </CartProvider>
            </AuthProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
