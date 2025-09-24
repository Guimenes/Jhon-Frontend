import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Send,
  Calendar,
  Award,
  Users,
  Star,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import './styles.css';

interface ContactInfo {
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  social: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
}

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const contactInfo: ContactInfo = {
    address: 'Rua das Barbas, 123 - Centro, São Paulo - SP',
    phone: '(11) 98765-4321',
    whatsapp: '11987654321',
    email: 'contato@jhoncortes.com.br',
    hours: {
      weekdays: '09:00 - 20:00',
      saturday: '09:00 - 18:00',
      sunday: 'Fechado'
    },
    social: {
      instagram: 'https://instagram.com/jhoncortesbarbershop',
      facebook: 'https://facebook.com/jhoncortesbarbershop',
      whatsapp: 'https://wa.me/5511987654321'
    }
  };

  const services = [
    'Corte Tradicional',
    'Corte + Barba',
    'Barba Completa',
    'Tratamento Capilar',
    'Coloração',
    'Outros'
  ];

  const stats = [
    { icon: <Users size={20} />, value: '5000+', label: 'Clientes Satisfeitos' },
    { icon: <Star size={20} />, value: '4.9', label: 'Avaliação Google' },
    { icon: <Award size={20} />, value: '12', label: 'Anos de Experiência' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envio do formulário
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      
      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar um horário.');
    window.open(`https://wa.me/${contactInfo.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <section id="contato" ref={sectionRef} className="contact-section-modern">
      <div className="contact-container container">
        
        {/* Header Premium */}
        <div className="contact-header animate-on-scroll">
          <span className="contact-badge">
            <MessageCircle size={16} />
            FALE CONOSCO
          </span>
          <h2 className="contact-title">
            Entre em <span className="highlight-gold">Contato</span>
          </h2>
          <p className="contact-subtitle">
            Estamos prontos para atender você com excelência e profissionalismo
          </p>
        </div>

        {/* Stats Bar */}
        <div className="contact-stats animate-on-scroll">
          {stats.map((stat, index) => (
            <div key={index} className="contact-stat">
              <div className="stat-icon-wrapper">{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="contact-main-grid">
          
          {/* Left Side - Contact Form */}
          <div className="contact-form-container animate-on-scroll">
            <div className="form-header">
              <h3 className="form-title">Envie sua mensagem</h3>
              <p className="form-subtitle">
                Preencha o formulário e retornaremos o mais breve possível
              </p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form-modern">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Nome completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">WhatsApp</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="service" className="form-label">Serviço de interesse</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                    className="form-input form-select"
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map((service, index) => (
                      <option key={index} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Mensagem</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="form-input form-textarea"
                    placeholder="Digite sua mensagem aqui..."
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-submit-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Enviar Mensagem</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side - Contact Info */}
          <div className="contact-info-container animate-on-scroll">
            
            {/* Quick Contact Card */}
            <div className="quick-contact-card">
              <h3 className="card-title">Atendimento Rápido</h3>
              <p className="card-subtitle">
                Prefere um contato mais direto? Use nossos canais rápidos
              </p>
              <button onClick={openWhatsApp} className="btn-whatsapp">
                <MessageCircle size={20} />
                <span>Chamar no WhatsApp</span>
              </button>
            </div>

            {/* Contact Details */}
            <div className="contact-details">
              <div className="detail-item">
                <div className="detail-icon">
                  <MapPin size={20} />
                </div>
                <div className="detail-content">
                  <h4>Endereço</h4>
                  <p>{contactInfo.address}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Phone size={20} />
                </div>
                <div className="detail-content">
                  <h4>Telefone</h4>
                  <p>{contactInfo.phone}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Mail size={20} />
                </div>
                <div className="detail-content">
                  <h4>E-mail</h4>
                  <p>{contactInfo.email}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Clock size={20} />
                </div>
                <div className="detail-content">
                  <h4>Horário de Funcionamento</h4>
                  <div className="hours-list">
                    <div className="hour-item">
                      <span className="day">Segunda a Sexta</span>
                      <span className="time">{contactInfo.hours.weekdays}</span>
                    </div>
                    <div className="hour-item">
                      <span className="day">Sábado</span>
                      <span className="time">{contactInfo.hours.saturday}</span>
                    </div>
                    <div className="hour-item">
                      <span className="day">Domingo</span>
                      <span className="time">{contactInfo.hours.sunday}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="social-links-card">
              <h4 className="social-title">Siga-nos nas redes</h4>
              <div className="social-buttons">
                <a 
                  href={contactInfo.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-btn instagram"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href={contactInfo.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-btn facebook"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href={contactInfo.social.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-btn whatsapp"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section animate-on-scroll">
          <div className="map-header">
            <h3 className="map-title">Nossa Localização</h3>
            <p className="map-subtitle">Fácil acesso e estacionamento no local</p>
          </div>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0975647461586!2d-46.65867068502221!3d-23.564916784682495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c7dbf9ff57%3A0x4ca8eb5c4f7ecca9!2sShopping%20Frei%20Caneca!5e0!3m2!1spt-BR!2sbr!4v1635959745693!5m2!1spt-BR!2sbr"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="map-iframe"
            />
          </div>
        </div>

        {/* Final CTA */}
        <div className="contact-final-cta animate-on-scroll">
          <div className="cta-content">
            <CheckCircle size={48} className="cta-icon" />
            <h3 className="cta-title">Pronto para transformar seu visual?</h3>
            <p className="cta-text">
              Agende agora mesmo seu horário e venha viver a experiência Jhon Cortes
            </p>
            <div className="cta-buttons">
              <a href="#agendamento" className="btn-cta primary">
                <Calendar size={20} />
                <span>Agendar Agora</span>
              </a>
              <button onClick={openWhatsApp} className="btn-cta secondary">
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;