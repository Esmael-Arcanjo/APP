import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

const PaymentCancelPage = () => (
  <MainLayout>
    <div className="max-w-xl mx-auto text-center py-16" data-testid="payment-cancel-page">
      <XCircle className="w-20 h-20 mx-auto text-red-500 mb-4" />
      <h1 className="text-3xl md:text-4xl font-black mb-3">Pagamento Cancelado</h1>
      <p className="text-muted-foreground mb-8">Nenhum valor foi cobrado. Você pode tentar novamente.</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/cart" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Voltar ao Carrinho</Link>
        <Link to="/" className="px-6 py-3 rounded-full border border-border font-semibold">Ir para Home</Link>
      </div>
    </div>
  </MainLayout>
);

export default PaymentCancelPage;
