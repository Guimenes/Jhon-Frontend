import React, { useEffect, useState } from 'react';
import { ShoppingCart, Tag, ArrowRight, Plus } from 'lucide-react';
import { ProductService } from '../../services/products';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import { useCart } from '../../hooks/useCart';
import { showSuccess, showError } from '../../utils/alerts';
import './styles.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  normalizedImageUrl?: string;
}

interface PromotionalProductsProps {
  onClose?: () => void;
  onViewAllProducts?: () => void;
}

const PromotionalProducts: React.FC<PromotionalProductsProps> = ({ onClose, onViewAllProducts }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    loadPromotionalProducts();
  }, []);

  const loadPromotionalProducts = async () => {
    try {
      setLoading(true);
      // Buscar produtos em promoção (com desconto)
      const allProducts = await ProductService.getAllProducts({ featured: true });
      
      // Filtrar apenas produtos com desconto e normalizar as imagens
      const promotionalProducts = allProducts
        .filter(product => product.discountPrice && product.discountPrice < product.price)
        .map(product => ({
          ...product,
          normalizedImageUrl: product.image ? normalizeImageUrl(product.image) : undefined
        }));
      
      setProducts(promotionalProducts.slice(0, 3)); // Limitar a 3 produtos
    } catch (error) {
      console.error('Erro ao carregar produtos promocionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    const success = await addItem(product._id);
    if (success) {
      showSuccess('Produto adicionado ao carrinho!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateDiscount = (original: number, discounted: number | undefined) => {
    if (!discounted) return 0;
    return Math.round((1 - discounted / original) * 100);
  };

  if (loading) {
    return (
      <div className="promotional-overlay">
        <div className="promotional-container">
          <div className="promotional-header">
            <h2><Tag size={20} /> Ofertas Exclusivas</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando produtos em promoção...</p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Não mostrar nada se não houver produtos em promoção
  }

  return (
    <div className="promotional-overlay">
      <div className="promotional-container">
        <div className="promotional-header">
          <h2><Tag size={20} /> Ofertas Exclusivas</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="promotional-content">
          <p className="promo-message">
            Seu agendamento foi confirmado! 🎉 <br />
            Aproveite estas promoções especiais:
          </p>
          
          <div className="promotional-products">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.image && (
                    <img 
                      src={product.normalizedImageUrl || product.image} 
                      alt={product.name}
                      {...createImageFallbackHandler(product.image)}
                    />
                  )}
                  {product.discountPrice && (
                    <div className="discount-badge">
                      -{calculateDiscount(product.price, product.discountPrice)}%
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">
                    {product.discountPrice ? (
                      <>
                        <span className="original-price">{formatPrice(product.price)}</span>
                        <span className="discount-price">{formatPrice(product.discountPrice)}</span>
                      </>
                    ) : (
                      <span>{formatPrice(product.price)}</span>
                    )}
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <Plus size={16} />
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="promotional-actions">
            <button className="view-all-btn" onClick={onViewAllProducts}>
              Ver todos os produtos
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalProducts;
