import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, Calendar, User, LogOut, 
  Crown, Sparkles,
  ChevronRight, Package, UserCircle,
  LayoutDashboard, CalendarDays, Images,
  Users, Menu, X
} from 'lucide-react';
import CartIcon from '../CartIcon';
import './styles.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../UserAvatar';

interface HeaderProps {
  onBookingClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBookingClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [_activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleBooking = () => {
    if (user) {
      navigate('/booking');
    } else if (onBookingClick) {
      onBookingClick();
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <header className={`premium-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* Logo - Isolated on the left */}
          <Link to="/" className="premium-logo">
            <div className="logo-badge">
              <Crown size={20} />
            </div>
            <div className="logo-content">
              <span className="logo-title">JHON CORTES</span>
              <span className="logo-subtitle">PREMIUM BARBER</span>
            </div>
          </Link>
          
          {/* Right Menu Toggle */}
          <button 
            className="hamburger-menu"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Menu Principal"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Side Menu (expanded version of hamburger menu) */}
      <div className={`side-menu ${isMobileOpen ? 'active' : ''}`}>
        <div className="side-menu-backdrop" onClick={() => setIsMobileOpen(false)} />
        <div className="side-menu-content">
          <div className="side-menu-header">
            <Link to="/" className="side-menu-logo" onClick={() => setIsMobileOpen(false)}>
              <Crown size={24} />
              <span>JHON CORTES</span>
            </Link>
            <button 
              className="side-menu-close"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="side-menu-body">
            {/* User Section */}
            {user ? (
              <div className="side-user-section">
                <UserAvatar user={user} disableProfileModal={true} className="rounded-avatar" />
                <div>
                  <p className="side-user-name">{user.name}</p>
                  <p className="side-user-role">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                </div>
              </div>
            ) : (
              <div className="side-login-section">
                <Link to="/login" className="side-login-button" onClick={() => setIsMobileOpen(false)}>
                  <User size={18} />
                  <span>Entrar</span>
                </Link>
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="side-actions">
              <button className="side-action-btn booking" onClick={handleBooking}>
                <Sparkles size={18} />
                <span>Agendar</span>
              </button>
              
              {user && (
                <div className="side-action-btn cart">
                  <CartIcon />
                  <span>Carrinho</span>
                </div>
              )}
            </div>
            
            {/* Main Navigation */}
            <div className="side-nav-divider">Navegação</div>
            <nav className="side-nav">
              <Link to="/" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                <span>Início</span>
                <ChevronRight size={16} />
              </Link>
              <button className="side-nav-item" onClick={() => scrollToSection('services')}>
                <span>Serviços</span>
                <ChevronRight size={16} />
              </button>
              <Link to="/shop" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                <span>Loja</span>
                <ChevronRight size={16} />
              </Link>
              <button className="side-nav-item" onClick={() => scrollToSection('gallery')}>
                <span>Galeria</span>
                <ChevronRight size={16} />
              </button>
              <button className="side-nav-item" onClick={() => scrollToSection('about')}>
                <span>Sobre</span>
                <ChevronRight size={16} />
              </button>
            </nav>

            {/* User Account Section */}
            {user && (
              <>
                <div className="side-nav-divider">Minha Conta</div>
                <nav className="side-nav">
                  <Link to="/profile" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <UserCircle size={16} />
                    <span>Meu Perfil</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/booking" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <Calendar size={16} />
                    <span>Agendamentos</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/shop/orders" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <Package size={16} />
                    <span>Pedidos</span>
                    <ChevronRight size={16} />
                  </Link>
                </nav>
              </>
            )}

            {/* Admin Section */}
            {user?.role === 'admin' && (
              <>
                <div className="side-nav-divider">Administração</div>
                <nav className="side-nav">
                  <Link to="/admin/dashboard" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/admin/services" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <Scissors size={16} />
                    <span>Serviços</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/admin/schedules" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <CalendarDays size={16} />
                    <span>Agendas</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/admin/products" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <Package size={16} />
                    <span>Produtos</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/admin/gallery" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <Images size={16} />
                    <span>Galeria</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/admin/customers" className="side-nav-item" onClick={() => setIsMobileOpen(false)}>
                    <Users size={16} />
                    <span>Clientes</span>
                    <ChevronRight size={16} />
                  </Link>
                </nav>
              </>
            )}

            {/* Footer */}
            {user && (
              <div className="side-menu-footer">
                <button className="side-logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
