import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Injeta o Token JWT em TODAS as chamadas para a API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta: Gerencia expiração de token e erros 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se der 401 na rota de refresh, interrompe o loop e limpa a sessão
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem('token');
      return Promise.reject(error);
    }

    // Se der 401 em rotas normais e ainda não tentou o retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenta renovar o token
        const { data } = await api.post('/auth/refresh');
        const newToken = data.access_token || data.token;

        if (newToken) {
          localStorage.setItem('token', newToken);
          
          // Atualiza o cabeçalho da requisição original e refaz a chamada
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se a renovação falhar, limpa o token expirado e rejeita a requisição
        localStorage.removeItem('token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;