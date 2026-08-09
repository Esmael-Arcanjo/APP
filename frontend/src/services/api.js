import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se der 401 e a requisição que falhou JÁ FOI a de refresh, interrompa o loop!
    if (error.response?.status === 401 && originalRequest.url.includes('/auth/refresh')) {
      // Limpa dados antigos e redireciona ou apenas rejeita
      localStorage.removeItem('token');
      return Promise.reject(error);
    }

    // Só tenta fazer refresh se NÃO for a primeira tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // ... chamada de refresh token
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
