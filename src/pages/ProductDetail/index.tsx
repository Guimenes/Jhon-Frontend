import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductService } from '../../services/products';
import type { Product } from '../../services/products';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStar } from 'react-icons/fa';
import './styles.css';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const data = await ProductService.getProductById(productId);
      setProduct(data);
      
      // Carregar produtos relacionados
      if (data.category) {
        const relatedData = await ProductService.getAllProducts({
          category: data.category,
          limit: 4
        });
        // Filtrar o produto atual dos relacionados
        setRelatedProducts(relatedData.filter(p => p._id !== data._id).slice(0, 3));
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Não foi possível carregar os detalhes do produto');
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

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      const maxQuantity = product?.stock || 1;
      setQuantity(Math.min(value, maxQuantity));
    }
  };

  const handleAddToCart = () => {
    toast.success(`${quantity} ${quantity > 1 ? 'unidades' : 'unidade'} de ${product?.name} adicionado ao carrinho`);
    // Aqui você implementaria a lógica real de adicionar ao carrinho
  };

  if (isLoading) {
    return (
      <div className="product-detail-container">
        <div className="product-loading">Carregando detalhes do produto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="product-not-found">
          <h2>Produto não encontrado</h2>
          <p>O produto que você está procurando não existe ou foi removido.</p>
          <Link to="/shop" className="back-to-shop">
            <FaArrowLeft /> Voltar para a loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-nav">
        <Link to="/shop" className="back-to-shop">
          <FaArrowLeft /> Voltar para a loja
        </Link>
      </div>

      <div className="product-detail-wrapper">
        <div className="product-detail-image-container">
          {product.image ? (
            <img
              src={normalizeImageUrl(product.image)}
              alt={product.name}
              className="product-detail-image"
              onError={createImageFallbackHandler(product.image).onError}
            />
          ) : (
            <div className="product-detail-no-image">
              <span>Imagem indisponível</span>
            </div>
          )}
          {product.featured && (
            <div className="product-detail-featured">
              <FaStar /> Produto em Destaque
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          <div className="product-detail-category">{product.category}</div>

          <div className="product-detail-price-container">
            {product.discountPrice && product.discountPrice < product.price ? (
              <>
                <span className="product-detail-original-price">{formatPrice(product.price)}</span>
                <span className="product-detail-price">{formatPrice(product.discountPrice)}</span>
                <span className="product-detail-discount">
                  {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="product-detail-price">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="product-detail-description">
            <h3>Descrição</h3>
            <p>{product.description}</p>
          </div>

          {product.stock > 0 ? (
            <div className="product-detail-stock in-stock">
              Em estoque: {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'}
            </div>
          ) : (
            <div className="product-detail-stock out-of-stock">Produto fora de estoque</div>
          )}

          <div className="product-detail-actions">
            <div className="quantity-controls">
              <button 
                className="quantity-btn" 
                onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                disabled={product.stock <= 0}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                className="quantity-input"
                disabled={product.stock <= 0}
              />
              <button 
                className="quantity-btn" 
                onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock || 1))}
                disabled={product.stock <= 0}
              >
                +
              </button>
            </div>
            
            <button 
              className="add-to-cart-btn-large"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock <= 0 ? 'Produto Indisponível' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>Produtos Relacionados</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct._id} className="related-product-card">
                <Link to={`/shop/${relatedProduct._id}`} className="related-product-link">
                  <div className="related-product-image-container">
                    {relatedProduct.image ? (
                      <img
                        src={normalizeImageUrl(relatedProduct.image)}
                        alt={relatedProduct.name}
                        className="related-product-image"
                        onError={createImageFallbackHandler(relatedProduct.image).onError}
                      />
                    ) : (
                      <div className="related-product-no-image">
                        <span>Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <div className="related-product-info">
                    <h3 className="related-product-name">{relatedProduct.name}</h3>
                    <span className="related-product-price">
                      {relatedProduct.discountPrice && relatedProduct.discountPrice < relatedProduct.price
                        ? formatPrice(relatedProduct.discountPrice)
                        : formatPrice(relatedProduct.price)
                      }
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
