import React, { useRef, useEffect } from 'react';
import { Trophy, Clock, Sparkles, Shield, TrendingUp, Users } from 'lucide-react';
import './styles.css';

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const stats = [
    { 
      icon: <Trophy className="stat-icon" />, 
      number: '10K+', 
      label: 'Cortes Realizados'
    },
    { 
      icon: <Clock className="stat-icon" />, 
      number: '12', 
      label: 'Anos de Expertise'
    },
    { 
      icon: <Sparkles className="stat-icon" />, 
      number: '98%', 
      label: 'Satisfação'
    },
    { 
      icon: <Shield className="stat-icon" />, 
      number: '#1', 
      label: 'Top Rated'
    }
  ];

  const expertise = [
    { 
      title: 'Cortes Modernos',
      description: 'Fade, Undercut, Textured Crop e as últimas tendências internacionais'
    },
    { 
      title: 'Barba & Bigode',
      description: 'Desenho personalizado e tratamentos especializados para sua barba'
    },
    { 
      title: 'Coloração',
      description: 'Técnicas avançadas de coloração e luzes masculinas'
    },
    { 
      title: 'Tratamentos Premium',
      description: 'Spa capilar, relaxamento e cuidados exclusivos'
    }
  ];

  const values = [
    {
      icon: <TrendingUp size={24} />,
      title: 'Inovação Constante',
      text: 'Sempre atualizado com as últimas tendências e técnicas do mercado mundial'
    },
    {
      icon: <Users size={24} />,
      title: 'Atendimento VIP',
      text: 'Cada cliente é único e merece uma experiência personalizada e exclusiva'
    },
    {
      icon: <Shield size={24} />,
      title: 'Excelência Garantida',
      text: 'Compromisso com a qualidade e satisfação total em cada serviço'
    }
  ];

  return (
    <section id="sobre" className="about-section" ref={sectionRef}>
      <div className="about-container container">
        
        {/* Hero About */}
        <div className="about-hero">
          <div className="about-hero-content animate-on-scroll">
            <span className="about-badge">DESDE 2013</span>
            <h1 className="about-hero-title">
              Transformando <span className="highlight">Estilos</span>,<br />
              Elevando <span className="highlight">Confiança</span>
            </h1>
            <p className="about-hero-subtitle">
              Mais que uma barbearia, somos um templo de estilo masculino onde tradição 
              encontra inovação para criar experiências únicas.
            </p>
          </div>
          
          <div className="about-hero-visual animate-on-scroll">
            <div className="hero-image-wrapper">
              <img 
                src="/uploads/barber-hero.jpg" 
                alt="Jhon Cortes em ação"
                className="hero-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=1000&fit=crop';
                }}
              />
              <div className="hero-overlay">
                <div className="hero-stats">
                  {stats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      {stat.icon}
                      <div className="stat-content">
                        <span className="stat-number">{stat.number}</span>
                        <span className="stat-label">{stat.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="about-story animate-on-scroll">
          <div className="story-grid">
            <div className="story-content">
              <h2 className="story-title">
                A Jornada de um <span className="text-gold">Artista</span>
              </h2>
              <div className="story-text">
                <p>
                  <strong>Jhon Cortes</strong> não é apenas um barbeiro — é um artista que 
                  esculpe confiança e estilo. Com formação internacional em Londres, 
                  Nova York e São Paulo, trouxe para o Brasil uma visão única da barbearia moderna.
                </p>
                <p>
                  Cada corte é uma obra-prima personalizada, cada barba um statement de estilo. 
                  Nossa missão vai além da estética: transformamos a autoestima e a forma 
                  como nossos clientes se apresentam ao mundo.
                </p>
              </div>
              <div className="story-signature">
                <img 
                  src="/uploads/signature.png" 
                  alt="Assinatura"
                  className="signature-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="signature-info">
                  <strong>Jhon Cortes</strong>
                  <span>Master Barber & Founder</span>
                </div>
              </div>
            </div>
            
            <div className="story-visual">
              <div className="story-images">
                <img 
                  src="/uploads/studio-1.jpg" 
                  alt="Ambiente da barbearia"
                  className="story-image-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=400&fit=crop';
                  }}
                />
                <img 
                  src="/uploads/studio-2.jpg" 
                  alt="Detalhes do trabalho"
                  className="story-image-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=600&fit=crop';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Grid */}
        <div className="expertise-section animate-on-scroll">
          <div className="expertise-header">
            <h2 className="expertise-title">Especialidades</h2>
            <p className="expertise-subtitle">
              Técnicas refinadas para o homem moderno que valoriza seu visual
            </p>
          </div>
          
          <div className="expertise-grid">
            {expertise.map((item, index) => (
              <div key={index} className="expertise-card">
                <div className="expertise-number">0{index + 1}</div>
                <h3 className="expertise-card-title">{item.title}</h3>
                <p className="expertise-card-text">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="values-section animate-on-scroll">
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-text">{value.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="about-final-cta animate-on-scroll">
          <div className="cta-content">
            <h2 className="cta-title">
              Pronto para sua melhor versão?
            </h2>
            <p className="cta-subtitle">
              Junte-se aos milhares de clientes que confiam em nosso trabalho
            </p>
            <div className="cta-buttons">
              <a href="#servicos" className="btn-modern btn-primary">
                Ver Serviços
              </a>
              <a href="#contato" className="btn-modern btn-secondary">
                Agendar Agora
              </a>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default AboutSection;