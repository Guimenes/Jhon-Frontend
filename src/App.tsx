import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ServicesSection from './components/ServicesSection'
import AboutSection from './components/AboutSection'
import GallerySection from './components/GallerySection'
import ShopSection from './components/ShopSection'
import ContactSection from './components/ContactSection'
import AuthPage from './pages/Auth'
import AdminServices from './pages/AdminServices'
import AdminSchedules from './pages/AdminSchedules'
import AdminGallery from './pages/AdminGallery'
import AdminProducts from './pages/AdminProducts'
import AdminCustomers from './pages/AdminCustomers'
import AdminDashboard from './pages/AdminDashboard'
import UserBooking from './pages/UserBooking'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import BookingWizard from './components/BookingWizard'
import './App.css'
import { AuthProvider } from './hooks/useAuth'
import { CartProvider } from './hooks/useCart'
import type { Service } from './types'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { RateLimitProvider, useRateLimit } from './context/RateLimitContext'
import { registerRateLimitHandler } from './services/apiWithRateLimit'

// Componente para gerenciar o rate limit
const RateLimitHandler = () => {
  const { showRateLimitAlert } = useRateLimit();
  
  useEffect(() => {
    // Registra a função que mostrará o alerta quando ocorrer um erro 429
    registerRateLimitHandler((retryAfter, message) => {
      console.log(`Rate limit atingido. Tentando novamente em ${retryAfter/1000}s`);
      // Usando o contexto para mostrar o alerta de rate limit
      showRateLimitAlert(retryAfter, message);
    });
  }, [showRateLimitAlert]);
  
  return null; // Este componente não renderiza nada
};

function App() {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [preSelectedService, setPreSelectedService] = useState<Service | null>(null)

  const handleBookingClick = (service?: Service) => {
    if (service) {
      setPreSelectedService(service)
    } else {
      setPreSelectedService(null)
    }
    setShowBookingModal(true)
  }

  return (
    <AuthProvider>
      <CartProvider>
        <RateLimitProvider>
          {/* Componente que registra o handler de rate limit */}
          <RateLimitHandler />
          
          <Router>
            <div className="App">
              <ToastContainer position="top-right" autoClose={5000} />
              <Header onBookingClick={handleBookingClick} />
        
              <Routes>
                <Route path="/" element={
                  <main>
                    <Hero onBookingClick={handleBookingClick} />
                    
                    {/* Seção de Serviços */}
                    <ServicesSection onBookingClick={handleBookingClick} />
                    
                    <AboutSection />
                    
                    <GallerySection />
                    
                    <ShopSection 
                      showFeaturedOnly={true}
                      limit={4}
                      title="Produtos em Destaque"
                      subtitle="Escolha os produtos ideais para seu estilo"
                    />
                    
                    <ContactSection />
                  </main>
                } />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/booking" element={<UserBooking />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/schedules" element={<AdminSchedules />} />
                <Route path="/admin/gallery" element={<AdminGallery />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
              </Routes>
              
              {/* Modal de agendamento com BookingWizard */}
              {showBookingModal && (
                <BookingWizard 
                  onClose={() => setShowBookingModal(false)}
                  onSuccess={() => setShowBookingModal(false)} 
                  initialService={preSelectedService}
                />
              )}
              <Footer />
            </div>
          </Router>
        </RateLimitProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
