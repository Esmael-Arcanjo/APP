import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';

const useQuery = () => new URLSearchParams(useLocation().search);

const PaymentSuccessPage = () => {
  const q = useQuery();
  const sessionId = q.get('session_id');
  const [status, setStatus] = useState('pending');
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (cancelled) return;
        if (data.payment_status === 'paid') {
          setStatus('paid');
        } else if (tries < 12) {
          setTimeout(() => setTries((t) => t + 1), 2500);
        } else {
          setStatus('timeout');
        }
      } catch (e) {
        setStatus('error');
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [sessionId, tries]);

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto text-center py-16" data-testid="payment-success-page">
        {status === 'paid' ? (
          <>
            <CheckCircle2 className="w-20 h-20 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl md:text-4xl font-black mb-3">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground mb-8">Obrigado pela sua compra na WIBAZA. Você receberá um email de confirmação.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/profile" data-testid="payment-view-orders" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Meus Pedidos</Link>
              <Link to="/" className="px-6 py-3 rounded-full border border-border font-semibold">Continuar Comprando</Link>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-black">Confirmando pagamento...</h1>
            <p className="text-muted-foreground mt-2">Isso pode levar alguns segundos.</p>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default PaymentSuccessPage;
