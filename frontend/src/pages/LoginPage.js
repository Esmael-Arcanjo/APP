import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { AUTH } from '../constants/testIds';

const formatApiErrorDetail = (detail) => {
  if (detail == null) return 'Algo deu errado. Por favor, tente novamente.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      const errorMsg = formatApiErrorDetail(error.response?.data?.detail) || error.message;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg">
          <Link
            to="/"
            data-testid="login-logo"
            className="text-3xl font-black text-center mb-8 text-primary block hover:opacity-80 transition-opacity cursor-pointer"
            style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
          >
            WIBAZA
          </Link>
          <h2 className="text-2xl font-bold text-center mb-6">{t('auth.loginTitle')}</h2>

          <form onSubmit={handleSubmit} data-testid={AUTH.loginForm} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
              <input
                data-testid={AUTH.emailInput}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
              <div className="relative">
                <input
                  data-testid={AUTH.passwordInput}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  data-testid="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              data-testid={AUTH.submitButton}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.loginTitle')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('auth.dontHaveAccount')} </span>
            <Link to="/register" className="text-primary font-semibold hover:underline">
              {t('auth.registerTitle')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
