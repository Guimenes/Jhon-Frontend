import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Scissors, Clock, Star, ArrowRight, Sparkles, Shield, Award, TrendingUp } from 'lucide-react';
import { servicesAPI } from '../../services/api';
import type { Service } from '../../types';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import './styles.css';

interface ServicesSectionProps {
  onBookingClick?: (service?: Service) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ onBookingClick }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('signature');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Gerar partículas uma única vez para manter consistência
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 20,
      animationDuration: 15 + Math.random() * 10,
      opacity: Math.random() * 0.8 + 0.2,
      scale: Math.random() * 0.5 + 0.5
    }));
  }, []); // Array vazio garante que seja criado apenas uma vez

  // Testimonials para adicionar social proof
  const testimonials = [
    { name: "Carlos Silva", service: "Corte Premium", text: "Experiência incomparável. Saio sempre renovado." },
    { name: "João Pedro", service: "Barba Completa", text: "Atenção aos detalhes que faz toda diferença." },
    { name: "Roberto Dias", service: "Day Spa", text: "Mais que um corte, uma experiência de luxo." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));
    
    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [services]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAll();
      
      const normalizedServices = data
        .filter(service => service.isActive)
        .map(service => ({
          ...service,
          normalizedImageUrl: service.image ? normalizeImageUrl(service.image) : undefined,
          // Adicionar campos premium se não existirem
          benefits: service.benefits || ['Produtos importados', 'Ambiente climatizado', 'Bebida cortesia'],
          rating: service.rating || 4.8,
          popularityScore: service.popularityScore || Math.random() * 100
        }));
        
      setServices(normalizedServices);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
      setError('Não foi possível carregar os serviços.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Categorias premium redesenhadas
  const categories = [
    { 
      id: 'signature', 
      name: 'Signature', 
      icon: <Award size={18} />,
      description: 'Experiências exclusivas'
    },
    { 
      id: 'corte', 
      name: 'Cortes', 
      icon: <Scissors size={18} />,
      description: 'Precisão e estilo'
    },
    { 
      id: 'barba', 
      name: 'Barba', 
      icon: <Shield size={18} />,
      description: 'Cuidado tradicional'
    },
    { 
      id: 'combo', 
      name: 'Combos', 
      icon: <Sparkles size={18} />,
      description: 'Pacotes completos'
    },
    { 
      id: 'tratamento', 
      name: 'Premium Care', 
      icon: <TrendingUp size={18} />,
      description: 'Tratamentos especiais'
    }
  ];

  // Filtrar serviços com lógica premium
  const getFilteredServices = () => {
    if (selectedCategory === 'signature') {
      // Mostrar os 3 serviços mais caros como "Signature"
      return services
        .sort((a, b) => b.price - a.price)
        .slice(0, 3);
    }
    return services.filter(service => service.category === selectedCategory);
  };

  const filteredServices = getFilteredServices();

  const handleBookClick = (e: React.MouseEvent, service: Service) => {
    e.preventDefault();
    if (onBookingClick) {
      onBookingClick(service);
    }
  };

  return (
    <section id="servicos" className="premium-services-section" ref={sectionRef}>


      <div className="hero-overlay"></div>
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
              opacity: particle.opacity,
              transform: `scale(${particle.scale})`
            }}
          />
        ))}
      </div>

      {/* Background Pattern */}
      <div className="section-pattern"></div>
      
      <div className="premium-container">
        {/* Header Premium */}

        <div className="divtext">
          <h2 className="premium-title">
            Serviços <span className="text-gradient">Premium</span>
          </h2>
        </div>

        {loading ? (
          <div className="premium-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="premium-error">
            <p>{error}</p>
            <button className="premium-btn" onClick={loadServices}>
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {/* Categorias Premium */}
            <div className="premium-categories reveal">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>
                  <div className="category-content">
                    <h4>{category.name}</h4>
                    <p>{category.description}</p>
                  </div>
                  {selectedCategory === category.id && (
                    <div className="category-indicator"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Grid de Serviços Premium */}
            <div className="premium-services-grid">
              {filteredServices.length > 0 ? (
                filteredServices.map((service, index) => (
                  <div 
                    className="premium-service-card reveal"
                    key={service._id}
                    style={{ animationDelay: `${index * 0.15}s` }}
                    onMouseEnter={() => setHoveredService(service._id)}
                    onMouseLeave={() => setHoveredService(null)}
                  >
                    {/* Badge de Destaque */}
                    {index === 0 && selectedCategory === 'signature' && (
                      <div className="most-popular-badge">
                        <Star size={14} />
                        Mais Procurado
                      </div>
                    )}
                    
                    {/* Imagem com Overlay Gradient */}
                    <div className="service-image-container">
                      {service.image ? (
                        <img 
                          src={service.normalizedImageUrl || service.image}
                          alt={service.name}
                          className="service-image"
                          {...createImageFallbackHandler(service.image)}
                        />
                      ) : (
                        <div className="service-image-placeholder">
                          <Scissors size={40} />
                        </div>
                      )}
                      <div className="image-overlay"></div>
                      
                      {/* Quick View no Hover */}
                      <div className={`quick-view ${hoveredService === service._id ? 'active' : ''}`}>
                        <button 
                          className="quick-book-btn"
                          onClick={(e) => handleBookClick(e, service)}
                        >
                          Agendar Agora
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="service-card-content">
                      {/* Header do Card */}
                      <div className="service-card-header">
                        <h3 className="service-name">{service.name}</h3>
                        <div className="service-rating">
                          <Star size={14} fill="currentColor" />
                          <span>{service.rating || '4.9'}</span>
                        </div>
                      </div>

                      {/* Descrição */}
                      <p className="service-description">
                        {service.description}
                      </p>

                      {/* Benefits Pills */}
                      <div className="service-benefits">
                        {(service.benefits || ['Toalha quente', 'Produtos premium']).slice(0, 2).map((benefit, idx) => (
                          <span key={idx} className="benefit-pill">
                            {benefit}
                          </span>
                        ))}
                      </div>

                      {/* Footer do Card */}
                      <div className="service-card-footer">
                        <div className="service-info">
                          <div className="service-duration">
                            <Clock size={14} />
                            <span>{service.duration} min</span>
                          </div>
                          <div className="service-price">
                            <span className="price-label">A partir de</span>
                            <span className="price-value">{formatPrice(service.price)}</span>
                          </div>
                        </div>
                        
                        <button 
                          className="service-book-button"
                          onClick={(e) => handleBookClick(e, service)}
                        >
                          <span>Reservar</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-services-message">
                  <Scissors size={40} />
                  <p>Nenhum serviço disponível nesta categoria</p>
                </div>
              )}
            </div>

            {/* Social Proof Section */}
            <div className="social-proof-section reveal">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <Star size={20} fill="currentColor" />
                  <p className="testimonial-text">
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <div className="testimonial-author">
                    <strong>{testimonials[activeTestimonial].name}</strong>
                    <span>{testimonials[activeTestimonial].service}</span>
                  </div>
                </div>
                <div className="testimonial-dots">
                  {testimonials.map((_, index) => (
                    <span 
                      key={index}
                      className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="stats-container">
                <div className="stat-item">
                  <span className="stat-number">15k+</span>
                  <span className="stat-label">Clientes Satisfeitos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">4.9</span>
                  <span className="stat-label">Avaliação Média</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">8+</span>
                  <span className="stat-label">Anos de Excelência</span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="premium-cta reveal">
              <div className="cta-content">
                <h3>Não encontrou o que procura?</h3>
                <p>Entre em contato para serviços personalizados</p>
              </div>
              <button className="cta-button">
                Falar com Especialista
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;