import React, { createContext, useContext, useState } from 'react';

const currencies = {
  BRL: { symbol: 'R$', rate: 1 },
  USD: { symbol: '$', rate: 0.20 },
  EUR: { symbol: '€', rate: 0.18 },
};

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'BRL');

  const changeCurrency = (curr) => {
    setCurrency(curr);
    localStorage.setItem('currency', curr);
  };

  const formatPrice = (price) => {
    const converted = price * currencies[currency].rate;
    return `${currencies[currency].symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};
