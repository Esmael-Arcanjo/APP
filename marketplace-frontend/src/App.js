import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterBuyer from "@/pages/RegisterBuyer";
import RegisterSeller from "@/pages/RegisterSeller";
import MyOrders from "@/pages/MyOrders";
import SellerStore from "@/pages/SellerStore";
import Messages from "@/pages/Messages";
import { OrderSuccess, OrderCancel } from "@/pages/OrderResult";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import BuyerLayout from "@/pages/buyer/BuyerLayout";
import BuyerOverview from "@/pages/buyer/BuyerOverview";
import BuyerProfile from "@/pages/buyer/BuyerProfile";
import SellerLayout from "@/pages/seller/SellerLayout";
import SellerOverview from "@/pages/seller/SellerOverview";
import SellerProducts from "@/pages/seller/SellerProducts";
import SellerOrders from "@/pages/seller/SellerOrders";
import SellerProfile from "@/pages/seller/SellerProfile";

function Shell({ children }) {
  return (
    <>
      <Header />
      <div className="pb-16 md:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Marketplace Admin — isolated, no Wibaza header */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>

          {/* Everything else fgtgtgtgtuses the Wibaza header */}
          <Route path="/*" element={<Shell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/store/:slug" element={<SellerStore />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/success" element={<OrderSuccess />} />
              <Route path="/order/cancel" element={<OrderCancel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/buyer" element={<RegisterBuyer />} />
              <Route path="/register/seller" element={<RegisterSeller />} />
              <Route path="/messages" element={<Messages />} />

              {/* Buyer Dashboard */}
              <Route path="/buyer" element={<BuyerLayout />}>
                <Route index element={<BuyerOverview />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="messages" element={<Messages />} />
                <Route path="profile" element={<BuyerProfile />} />
              </Route>

              {/* Seller Dashboard */}
              <Route path="/seller" element={<SellerLayout />}>
                <Route index element={<SellerOverview />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route path="messages" element={<Messages />} />
                <Route path="profile" element={<SellerProfile />} />
              </Route>

              {/* Legacy route — old links to /orders redirect to buyer orders */}
              <Route path="/orders" element={<MyOrders />} />
            </Routes>
          </Shell>} />
        </Routes>
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}
