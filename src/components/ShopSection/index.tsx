import React, { useEffect, useState } from 'react';
import './styles.css';
import { ProductService } from '../../services/products';
import type { Product } from '../../services/products';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import { toast } from 'react-toastify';
import { 
  ShoppingBag, 
  Eye, 
  Heart, 
  Star, 
  TrendingUp, 
  Package,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShopSectionProps {
  title?: string;
  subtitle?: string;
  showFeaturedOnly?: boolean;
  category?: string;
  limit?: number;
}

const ShopSection: React.FC<ShopSectionProps> = ({
  subtitle = "Encontre os melhores produtos para seu estilo",
  showFeaturedOnly = false,
  category,
  limit = 8
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    // Carregar produtos curtidos do localStorage
    const liked = localStorage.getItem('likedProducts');
    if (liked) {
      setLikedProducts(new Set(JSON.parse(liked)));
    }
  }, [showFeaturedOnly, category, limit]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await ProductService.getAllProducts({
        featured: showFeaturedOnly,
        category,
        limit
      });
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Não foi possível carregar os produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, discountPrice: number) => {
    return Math.round((1 - discountPrice / originalPrice) * 100);
  };

  const toggleLike = (productId: string) => {
    const newLiked = new Set(likedProducts);
    if (newLiked.has(productId)) {
      newLiked.delete(productId);
    } else {
      newLiked.add(productId);
    }
    setLikedProducts(newLiked);
    localStorage.setItem('likedProducts', JSON.stringify(Array.from(newLiked)));
  };

  const addToCart = (product: Product) => {
    // Implementar lógica do carrinho
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <section className="shop-section-modern">
      <div className="shop-container container">
        
        {/* Header Premium */}
        <div className="shop-header animate-on-scroll">
          <span className="shop-badge">
            <Package size={16} />
            LOJA EXCLUSIVA
          </span>
          <h2 className="shop-title">
            Produtos <span className="highlight-gradient">Premium</span> Selecionados
          </h2>
          <p className="shop-subtitle">
            {subtitle}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="shop-stats-bar animate-on-scroll">
          <div className="shop-stat">
            <Sparkles className="stat-icon" />
            <span className="stat-text">Qualidade Premium</span>
          </div>
          <div className="shop-stat">
            <TrendingUp className="stat-icon" />
            <span className="stat-text">Produtos em Alta</span>
          </div>
          <div className="shop-stat">
            <Star className="stat-icon" />
            <span className="stat-text">Avaliações 5 Estrelas</span>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="products-skeleton">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-content">
                  <div className="skeleton-title" />
                  <div className="skeleton-price" />
                  <div className="skeleton-buttons" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="no-products-modern">
            <Package size={48} />
            <h3>Nenhum produto disponível</h3>
            <p>Volte em breve para conferir nossas novidades!</p>
          </div>
        ) : (
          <div className="products-grid-modern">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="product-card-modern"
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Badges */}
                <div className="product-badges">
                  {product.featured && (
                    <span className="badge-featured">
                      <Star size={14} />
                      DESTAQUE
                    </span>
                  )}
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span className="badge-discount">
                      -{calculateDiscount(product.price, product.discountPrice)}%
                    </span>
                  )}
                </div>

                {/* Like Button */}
                <button 
                  className={`product-like-btn ${likedProducts.has(product._id) ? 'liked' : ''}`}
                  onClick={() => toggleLike(product._id)}
                  aria-label="Favoritar"
                >
                  <Heart size={20} />
                </button>

                {/* Image Container */}
                <div className="product-image-modern">
                  {product.image ? (
                    <img
                      src={normalizeImageUrl(product.image)}
                      alt={product.name}
                      className="product-img"
                      onError={createImageFallbackHandler(product.image).onError}
                    />
                  ) : (
                    <div className="product-no-image-modern">
                      <Package size={40} />
                      <span>Sem imagem</span>
                    </div>
                  )}
                  
                  {/* Quick Actions Overlay */}
                  <div className={`quick-actions ${hoveredProduct === product._id ? 'show' : ''}`}>
                    <Link to={`/shop/${product._id}`} className="quick-action-btn">
                      <Eye size={18} />
                      <span>Ver Detalhes</span>
                    </Link>
                    <button 
                      className="quick-action-btn"
                      onClick={() => addToCart(product)}
                    >
                      <Plus size={18} />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="product-info-modern">
                  <span className="product-category-tag">{product.category}</span>
                  <h3 className="product-name-modern">{product.name}</h3>
                  
                  {/* Rating */}
                  <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="star-icon" />
                    ))}
                    <span className="rating-text">(4.8)</span>
                  </div>

                  {/* Price */}
                  <div className="product-price-modern">
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <>
                        <span className="price-original">{formatPrice(product.price)}</span>
                        <span className="price-current">{formatPrice(product.discountPrice)}</span>
                      </>
                    ) : (
                      <span className="price-current">{formatPrice(product.price)}</span>
                    )}
                  </div>

                  {/* Main Actions */}
                  <div className="product-actions-modern">
                    <button 
                      className="btn-add-cart"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingBag size={18} />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Footer */}
        <div className="shop-footer-modern animate-on-scroll">
          <div className="footer-content">
            <div className="footer-text">
              <h3>Explore nossa coleção completa</h3>
              <p>Descubra todos os produtos exclusivos da nossa loja</p>
            </div>
            <Link to="/shop" className="btn-view-all">
              <span>Ver Todos os Produtos</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopSection;