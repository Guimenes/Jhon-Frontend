import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { ShoppingCart, X, ChevronRight, Plus, Minus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.css';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';

interface CartIconProps {
  className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ className }) => {
  const { itemCount } = useCart();
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="cart-icon-wrapper">
      <button 
        className={`cart-icon-button ${className || ''}`} 
        onClick={() => setShowCart(true)}
      >
        <ShoppingCart size={24} />
        {itemCount > 0 && (
          <span className="cart-badge">{itemCount}</span>
        )}
      </button>
      
      {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    </div>
  );
};

interface CartDrawerProps {
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onClose }) => {
  const { cart, loading, removeItem, updateItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateItem(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <h2>
            <ShoppingCart size={20} />
            Carrinho de Compras
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cart-drawer-content">
          {loading ? (
            <div className="cart-loading">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <div className="spinner"></div>
                <div className="spinner"></div>
              </div>
              <p>Carregando...</p>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <ShoppingCart size={48} />
              </div>
              <h3>Seu carrinho está vazio</h3>
              <p>Adicione produtos ao seu carrinho para continuar com a compra.</p>
              <Link to="/shop" className="browse-products-button" onClick={onClose}>
                Ver Produtos
                <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <ul className="cart-item-list">
                {cart.items.map((item) => {
                  const product = item.product;
                  return (
                    <li key={item._id} className="cart-item">
                      <div className="cart-item-image">
                        {product.image ? (
                          <img 
                            src={normalizeImageUrl(product.image)} 
                            alt={product.name} 
                            {...createImageFallbackHandler(product.image)}
                          />
                        ) : (
                          <div className="no-image">
                            <span>Sem Imagem</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{product.name}</h4>
                        <div className="cart-item-price">
                          {product.discountPrice ? (
                            <>
                              <span className="original-price">R$ {product.price.toFixed(2)}</span>
                              <span className="discount-price">R$ {product.discountPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span>R$ {product.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button 
                          className="remove-btn"
                          onClick={() => removeItem(item._id)}
                          title="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-amount">R$ {cart.totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="cart-actions">
                  <button 
                    className="clear-cart-btn"
                    onClick={clearCart}
                  >
                    Limpar Carrinho
                  </button>
                  <button 
                    className="checkout-btn"
                    onClick={handleCheckout}
                  >
                    Finalizar Compra
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartIcon;
