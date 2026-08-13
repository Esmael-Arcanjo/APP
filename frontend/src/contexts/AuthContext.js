import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Se não houver token salvo, encerra a checagem sem disparar erro
      if (!token) {
        setUser(false);
        return;
      }

      // Envia o token no cabeçalho para validar na API
      const { data } = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
    } catch (error) {
      // Se o token for inválido/expirado, limpa o storage
      localStorage.removeItem('token');
      setUser(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    // Tenta capturar o token na resposta (suporta diferentes formatos de payload)
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem('token', token);
    }

    // Define o usuário no estado (retorna o objeto de usuário se o token vier separado)
    const userData = data.user || data;
    setUser(userData);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);

    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem('token', token);
    }

    const newUser = data.user || data;
    setUser(newUser);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      // Sempre limpa os dados locais, independentemente de o backend responder ou não
      localStorage.removeItem('token');
      setUser(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};