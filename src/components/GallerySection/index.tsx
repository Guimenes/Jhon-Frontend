import React, { useState, useRef, useEffect } from 'react';
import { 
  Grid, 
  Layers, 
  Heart, 
  Share2, 
  Award, 
  Scissors, 
  Sparkles, 
  Eye,
  X,
  Calendar
} from 'lucide-react';
import { galleryAPI } from '../../services/api';
import './styles.css';

interface GalleryPhoto {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  normalizedImageUrl?: string;
  likes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const GallerySection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<GalleryPhoto | null>(null);
  const [galleryData, setGalleryData] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [isChangingView, setIsChangingView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Filtros compactos
  const filters = [
    { 
      id: 'all', 
      label: 'Todos', 
      icon: <Layers size={16} />
    },
    { 
      id: 'cortes', 
      label: 'Cortes', 
      icon: <Scissors size={16} />
    },
    { 
      id: 'barbas', 
      label: 'Barbas', 
      icon: <Award size={16} />
    },
    { 
      id: 'tratamentos', 
      label: 'Tratamentos', 
      icon: <Sparkles size={16} />
    },
  ];

  // Carregar fotos da API
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setIsLoading(true);
        const photos = await galleryAPI.getAll();
        
        const normalizeImageUrl = (imageUrl: string) => {
          if (imageUrl.startsWith('http')) return imageUrl;
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
          return `${baseUrl}${imageUrl}`;
        };
        
        const formattedPhotos = photos.map(photo => ({
          ...photo,
          normalizedImageUrl: normalizeImageUrl(photo.imageUrl)
        }));
        
        setGalleryData(formattedPhotos);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar galeria:', error);
        setIsLoading(false);
      }
    };
    
    fetchGalleryData();
  }, []);

  // Função para mudar modo de visualização
  const handleViewChange = async (newMode: 'grid' | 'masonry') => {
    if (newMode === viewMode || isChangingView) {
      console.log(`Tentativa de mudança ignorada: ${newMode} === ${viewMode} ou isChangingView: ${isChangingView}`);
      return;
    }
    
    setIsChangingView(true);
    console.log(`🔄 Mudando de ${viewMode} para ${newMode}`);
    
    // Delay para transição suave
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setViewMode(newMode);
    
    // Pequeno delay adicional para garantir que o DOM seja atualizado
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsChangingView(false);
    console.log(`✅ Mudança concluída para ${newMode}`);
  };

  // Filtrar fotos
  const filteredPhotos = activeFilter === 'all' 
    ? galleryData 
    : galleryData.filter(photo => photo.category === activeFilter);

  // Contador de fotos por categoria
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return galleryData.length;
    return galleryData.filter(photo => photo.category === categoryId).length;
  };

  // Animações ao scroll
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
  }, [filteredPhotos, viewMode]);

  // Garantir re-render das imagens quando viewMode muda
  useEffect(() => {
    if (!isChangingView && galleryData.length > 0) {
      console.log(`🖼️ Re-renderizando imagens para modo: ${viewMode}`);
      
      // Aguardar o DOM atualizar
      setTimeout(() => {
        const images = document.querySelectorAll('.gallery-grid .card-image');
        console.log(`Encontradas ${images.length} imagens para atualizar`);
        
        images.forEach((img, index) => {
          if (img instanceof HTMLImageElement && img.src) {
            // Força recarregamento da imagem
            const originalSrc = img.src;
            img.style.opacity = '0';
            
            setTimeout(() => {
              img.src = originalSrc;
              img.onload = () => {
                img.style.opacity = '1';
              };
            }, index * 50); // Delay escalonado para efeito visual
          }
        });
      }, 100);
    }
  }, [viewMode, isChangingView, galleryData]);

  // Curtir foto
  const likePhoto = async (photoId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await galleryAPI.like(photoId);
      setGalleryData(prevData => 
        prevData.map(photo => 
          photo._id === photoId 
            ? { ...photo, likes: response.likes } 
            : photo
        )
      );
      
      if (modalImage?._id === photoId) {
        setModalImage(prev => prev ? { ...prev, likes: response.likes } : null);
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);
    }
  };

  // Modal
  const openModal = (photo: GalleryPhoto) => {
    setModalImage(photo);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
    document.body.style.overflow = 'auto';
  };

  // Compartilhar
  const sharePhoto = (photo: GalleryPhoto) => {
    if (navigator.share) {
      navigator.share({
        title: photo.title,
        text: `Confira este trabalho incrível de Jhon Cortes`,
        url: window.location.href
      });
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <section id="galeria" ref={sectionRef} className="gallery-section-modern">
      <div className="gallery-container container">
        
        {/* Header Premium */}
        <div className="gallery-header animate-on-scroll">
          <span className="gallery-badge">PORTFÓLIO</span>
          <h2 className="gallery-title">
            Arte em Cada <span className="highlight-gold">Detalhe</span>
          </h2>
          <p className="gallery-subtitle">
            Resultados que falam por si. Cada foto representa nossa dedicação à perfeição.
          </p>
        </div>  

        {/* Filtros Compactos */}
        <div className="gallery-controls-modern animate-on-scroll">
          <div className="filter-pills">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span className="pill-icon">{filter.icon}</span>
                <span className="pill-label">{filter.label}</span>
                <span className="pill-count">{getCategoryCount(filter.id)}</span>
              </button>
            ))}
          </div>
          
          <div className="view-switcher">
            <button
              className={`view-option ${viewMode === 'grid' ? 'active' : ''} ${isChangingView ? 'loading' : ''}`}
              onClick={() => handleViewChange('grid')}
              aria-label="Grade"
              title="Visualização em Grade"
              disabled={isChangingView}
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-option ${viewMode === 'masonry' ? 'active' : ''} ${isChangingView ? 'loading' : ''}`}
              onClick={() => handleViewChange('masonry')}
              aria-label="Mosaico"
              title="Visualização em Mosaico"
              disabled={isChangingView}
            >
              <Layers size={18} />
            </button>
          </div>
        </div>

        {/* Galeria Principal */}
        <div 
          className={`gallery-grid ${viewMode} ${isChangingView ? 'changing' : ''} animate-on-scroll`}
          key={`gallery-${viewMode}`}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="gallery-card skeleton">
                <div className="skeleton-shimmer" />
              </div>
            ))
          ) : (
            filteredPhotos.map((photo, index) => (
              <div 
                key={`${photo._id}-${viewMode}-${index}`} 
                className={`gallery-card animate-on-scroll ${viewMode === 'masonry' ? `masonry-item-${index % 3}` : ''}`}
                onClick={() => openModal(photo)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card-image-wrapper">
                  <img
                    src={photo.normalizedImageUrl || photo.imageUrl}
                    alt={photo.title}
                    className="card-image"
                    loading="lazy"
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', photo.title);
                      e.currentTarget.style.opacity = '0.5';
                    }}
                  />
                  <div className="card-overlay">
                    <div className="overlay-top">
                      <span className="photo-category">{photo.category}</span>
                    </div>
                    <div className="overlay-content">
                      <h3 className="photo-title">{photo.title}</h3>
                      <div className="photo-actions">
                        <button
                          className="action-btn like-btn"
                          onClick={(e) => likePhoto(photo._id, e)}
                          aria-label="Curtir"
                        >
                          <Heart size={18} />
                          <span>{photo.likes}</span>
                        </button>
                        <button
                          className="action-btn view-btn"
                          aria-label="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA Section */}
        <div className="gallery-cta animate-on-scroll">
          <div className="cta-content">
            <h3 className="cta-title">Pronto para sua transformação?</h3>
            <p className="cta-text">
              Agende seu horário e seja o próximo a aparecer em nossa galeria de sucessos.
            </p>
            <div className="cta-buttons">
              <a href="#agendamento" className="btn-gallery primary">
                Agendar Agora
              </a>
              <a 
                href="https://instagram.com/jhoncortesbarbershop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-gallery secondary"
              >
                Ver Mais no Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ultra Moderno */}
      {isModalOpen && modalImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-modern" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              <X size={24} />
            </button>
            
            <div className="modal-content-wrapper">
              {/* Lado Esquerdo - Imagem */}
              <div className="modal-image-container">
                <img
                  src={modalImage.normalizedImageUrl || modalImage.imageUrl}
                  alt={modalImage.title}
                  className="modal-photo"
                />
                <div className="modal-image-gradient" />
              </div>
              
              {/* Lado Direito - Informações */}
              <div className="modal-info-container">
                <div className="modal-info-header">
                  <span className="modal-badge">{modalImage.category}</span>
                  <h2 className="modal-photo-title">{modalImage.title}</h2>
                </div>
                
                <div className="modal-metadata">
                  <div className="metadata-item">
                    <Calendar size={16} />
                    <span>{formatDate(modalImage.createdAt)}</span>
                  </div>
                  <div className="metadata-item">
                    <Eye size={16} />
                    <span>{Math.floor(Math.random() * 1000) + 100} visualizações</span>
                  </div>
                </div>
                
                <div className="modal-engagement">
                  <button
                    className="engagement-btn like-button"
                    onClick={() => likePhoto(modalImage._id)}
                  >
                    <Heart size={20} />
                    <span>{modalImage.likes}</span>
                  </button>
                  <button
                    className="engagement-btn share-button"
                    onClick={() => sharePhoto(modalImage)}
                  >
                    <Share2 size={20} />
                    <span>Compartilhar</span>
                  </button>
                </div>
                
                <div className="modal-cta-section">
                  <p className="modal-cta-text">
                    Inspire-se com nosso trabalho e agende sua transformação
                  </p>
                  <a href="#agendamento" className="modal-cta-button" onClick={closeModal}>
                    Quero Este Visual
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;