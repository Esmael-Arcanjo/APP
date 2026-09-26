import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/context/AppContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ServicesHub from "@/pages/ServicesHub";
import Payments from "@/pages/Payments";
import Wallet from "@/pages/Wallet";
import Ledger from "@/pages/Ledger";
import Webhooks from "@/pages/Webhooks";
import Marketplace from "@/pages/Marketplace";
import Orders from "@/pages/Orders";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Sellers from "@/pages/Sellers";
import Emails from "@/pages/Emails";
import ApiKeys from "@/pages/ApiKeys";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import AutomationOverview from "@/pages/automation/AutomationOverview";
import Agenda from "@/pages/automation/Agenda";
import Crm from "@/pages/automation/Crm";
import Assistant from "@/pages/automation/Assistant";
import Flows from "@/pages/automation/Flows";
import LinkBio from "@/pages/LinkBio";
import PublicBio from "@/pages/PublicBio";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPricing from "@/pages/admin/AdminPricing";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminMetrics from "@/pages/admin/AdminMetrics";
import { PaymentSuccess, PaymentCancel } from "@/pages/Payment";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bio/:slug" element={<PublicBio />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />

          {/* Admin has its OWN shell — no service switcher, no service sidebar */}
          <Route path="/app/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="metrics" element={<AdminMetrics />} />
          </Route>

          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<ServicesHub />} />

            {/* LEAMSE Payments */}
            <Route path="payments" element={<Payments />} />
            <Route path="payments/wallet" element={<Wallet />} />
            <Route path="payments/ledger" element={<Ledger />} />
            <Route path="payments/webhooks" element={<Webhooks />} />
            <Route path="payments/api" element={<ApiKeys service="payments" />} />

            {/* Marketplace API */}
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/orders" element={<Orders />} />
            <Route path="marketplace/products" element={<Products />} />
            <Route path="marketplace/customers" element={<Customers />} />
            <Route path="marketplace/sellers" element={<Sellers />} />
            <Route path="marketplace/api" element={<ApiKeys service="marketplace" />} />

            {/* Email API */}
            <Route path="email" element={<Emails />} />
            <Route path="email/api" element={<ApiKeys service="email" />} />

            {/* Automação (SEM API/chaves) */}
            <Route path="automation" element={<AutomationOverview />} />
            <Route path="automation/agenda" element={<Agenda />} />
            <Route path="automation/crm" element={<Crm />} />
            <Route path="automation/assistant" element={<Assistant />} />
            <Route path="automation/flows" element={<Flows />} />

            {/* Link na Bio (SEM API/chaves) */}
            <Route path="linkbio" element={<LinkBio />} />

            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="bottom-right" richColors />
      </AppProvider>
    </BrowserRouter>
  );
}
