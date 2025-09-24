import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff,
  Scissors,
  ArrowRight,
} from 'lucide-react';
import './styles.css';

interface AuthFormData {
  name?: string;
  identifier: string;
  email?: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
}

const AuthPage: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    identifier: '',
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');
      
      if (numbers.length <= 2) {
        formattedValue = numbers;
      } else if (numbers.length <= 7) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }

    if (name === 'identifier' && isLogin) {
      if (!value.includes('@') && /^\d/.test(value)) {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) {
          formattedValue = numbers;
        } else if (numbers.length <= 7) {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
      } else {
        formattedValue = value;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (isLogin) {
      if (!formData.identifier) {
        newErrors.identifier = 'Email ou telefone é obrigatório';
      } else {
        const isEmail = formData.identifier.includes('@');
        if (isEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.identifier)) {
            newErrors.identifier = 'Email inválido';
          }
        } else {
          const phoneNumbers = formData.identifier.replace(/\D/g, '');
          if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
            newErrors.identifier = 'Telefone deve ter 10 ou 11 dígitos';
          }
        }
      }
    } else {
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
        newErrors.email = 'Email é obrigatório';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      
      if (!formData.phone || formData.phone.trim().length < 10) {
        newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
      } else {
        const phoneNumbers = formData.phone.replace(/\D/g, '');
        if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
          newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
        }
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.identifier, formData.password);
      } else {
        await register({
          name: formData.name!,
          email: formData.email!,
          phone: formData.phone!,
          password: formData.password
        });
      }
      navigate('/');
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Erro ao processar solicitação'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    setFormData({
      identifier: '',
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      phone: ''
    });
    setErrors({});
    navigate(newIsLogin ? '/login' : '/register', { replace: true });
  };

  return (
    <div className="auth-page-modern">
      <div className="auth-container-modern">
        <div className="auth-form-section">
          <div className="auth-form-content">
            {/* Logo */}
            <div className="auth-logo-section">
              <div className="logo-icon">
                <Scissors size={32} />
              </div>
              <h1 className="brand-name">Jhon Cortes</h1>
              <p className="brand-tagline">Premium Barber Shop</p>
            </div>

            {/* Tabs */}
            <div className="auth-tabs-modern">
              <button 
                className={`tab-modern ${isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  navigate('/login', { replace: true });
                }}
                type="button"
              >
                Entrar
              </button>
              <button 
                className={`tab-modern ${!isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  navigate('/register', { replace: true });
                }}
                type="button"
              >
                Criar Conta
              </button>
              <div className={`tab-indicator ${!isLogin ? 'right' : ''}`} />
            </div>

            {/* Form */}
            <form className="auth-form-modern" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-group-modern">
                  <div className="input-icon">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Nome completo"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              )}

              {!isLogin && (
                <div className="input-group-modern">
                  <div className="input-icon">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              )}

              {!isLogin && (
                <div className="input-group-modern">
                  <div className="input-icon">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Email"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              )}

              {isLogin && (
                <div className="input-group-modern">
                  <div className="input-icon">
                    <Mail size={20} />
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className={errors.identifier ? 'error' : ''}
                    placeholder="Email ou telefone"
                  />
                  {errors.identifier && <span className="error-text">{errors.identifier}</span>}
                </div>
              )}

              <div className="input-group-modern">
                <div className="input-icon">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Senha"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {!isLogin && (
                <div className="input-group-modern">
                  <div className="input-icon">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirmar senha"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              )}

              {errors.submit && (
                <div className="error-message-box">
                  {errors.submit}
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn-modern"
                disabled={isLoading}
              >
                {/* Conteúdo normal do botão */}
                <span 
                  style={{ 
                    opacity: isLoading ? 0 : 1, 
                    transition: 'opacity 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                  <ArrowRight size={20} />
                </span>
                
                {/* Estado de carregamento */}
                {isLoading && (
                  <span className="loading-state">
                    <span className="spinner-modern"></span>
                    Processando...
                  </span>
                )}
              </button>

              {isLogin && (
                <a href="/forgot-password" className="forgot-link">
                  Esqueceu sua senha?
                </a>
              )}
            </form>

            {/* Footer */}
            <div className="auth-footer-modern">
              <p>
                {isLogin ? 'Novo por aqui?' : 'Já tem uma conta?'}
              </p>
              <button 
                type="button"
                className="switch-mode-btn"
                onClick={toggleMode}
              >
                {isLogin ? 'Criar conta grátis' : 'Fazer login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;