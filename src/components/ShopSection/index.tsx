import React, { useEffect, useState } from 'react';
import './styles.css';
import { ProductService } from '../../services/products';
import type { Product } from '../../services/products';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface ShopSectionProps {
  title?: string;
  subtitle?: string;
  showFeaturedOnly?: boolean;
  category?: string;
  limit?: number;
}

const ShopSection: React.FC<ShopSectionProps> = ({
  title = "Nossa Loja",
  subtitle = "Encontre os melhores produtos para seu estilo",
  showFeaturedOnly = false,
  category,
  limit = 8
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProducts();
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

  return (
    <section className="shop-section">
      <div className="shop-section-header">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>

      {isLoading ? (
        <div className="shop-loading">Carregando produtos...</div>
      ) : products.length === 0 ? (
        <div className="no-products-message">
          <p>Nenhum produto disponível no momento.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                {product.image ? (
                  <img
                    src={normalizeImageUrl(product.image)}
                    alt={product.name}
                    className="product-image"
                    onError={createImageFallbackHandler(product.image).onError}
                  />
                ) : (
                  <div className="product-no-image">
                    <span>Imagem indisponível</span>
                  </div>
                )}
                {product.featured && (
                  <div className="product-featured">
                    <FaStar /> Destaque
                  </div>
                )}
                {product.discountPrice && product.discountPrice < product.price && (
                  <div className="product-discount">
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                  </div>
                )}
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                
                <div className="product-price-container">
                  {product.discountPrice && product.discountPrice < product.price ? (
                    <>
                      <span className="product-original-price">{formatPrice(product.price)}</span>
                      <span className="product-price">{formatPrice(product.discountPrice)}</span>
                    </>
                  ) : (
                    <span className="product-price">{formatPrice(product.price)}</span>
                  )}
                </div>

                <div className="product-buttons">
                  <Link to={`/shop/${product._id}`} className="view-product-btn">
                    Ver Detalhes
                  </Link>
                  <button className="add-to-cart-btn">
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="shop-section-footer">
        <Link to="/shop" className="view-all-products">
          Ver Todos os Produtos
        </Link>
      </div>
    </section>
  );
};

export default ShopSection;
