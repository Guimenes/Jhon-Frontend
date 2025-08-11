import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, CreditCard, ShoppingCart, Plus, Minus } from 'lucide-react';
import { showError, showSuccess } from '../../utils/alerts';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import './styles.css';

const Checkout: React.FC = () => {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Simulação de formulário de pagamento
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: '',
  });

  useEffect(() => {
    // Redirecionar se não estiver logado ou carrinho vazio
    if (!user) {
      showError('Acesso negado', 'Você precisa estar logado para acessar o checkout');
      navigate('/login');
    } else if (!cart || cart.items.length === 0) {
      showError('Carrinho vazio', 'Adicione produtos ao carrinho antes de prosseguir para o checkout');
      navigate('/shop');
    }
  }, [user, cart, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateItem(itemId, newQuantity);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples do formulário
    const requiredFields = [
      'fullName', 'email', 'address', 'city', 'state', 'zipCode',
      'cardNumber', 'cardName', 'cardExpiry', 'cardCVC'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      showError('Formulário incompleto', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setOrderProcessing(true);
      
      // Simulação de processamento de pedido
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpar carrinho após o pedido bem-sucedido
      await clearCart();
      
      showSuccess(
        'Pedido realizado com sucesso!', 
        'Seu pedido foi processado e será enviado em breve. Um e-mail de confirmação foi enviado para você.'
      );
      
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      showError('Erro no pedido', 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
    } finally {
      setOrderProcessing(false);
    }
  };

  if (loading || !cart) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div className="spinner"></div>
          <div className="spinner"></div>
        </div>
        <p>Carregando informações do checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="back-button" onClick={() => navigate('/shop')}>
          <ArrowLeft size={20} />
          Voltar para a loja
        </button>
        <h1>
          <ShoppingBag size={24} />
          Finalizar Compra
        </h1>
      </div>
      
      <div className="checkout-content">
        <div className="checkout-form-container">
          <form className="checkout-form" onSubmit={handleCheckout}>
            <div className="form-section">
              <h2>Informações Pessoais</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Nome Completo*</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Endereço de Entrega</h2>
              <div className="form-group">
                <label htmlFor="address">Endereço*</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Cidade*</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">Estado*</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">CEP*</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Pagamento</h2>
              <div className="form-group">
                <label htmlFor="cardNumber">Número do Cartão*</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cardName">Nome no Cartão*</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cardExpiry">Data de Validade*</label>
                  <input
                    type="text"
                    id="cardExpiry"
                    name="cardExpiry"
                    placeholder="MM/AA"
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cardCVC">CVC*</label>
                  <input
                    type="text"
                    id="cardCVC"
                    name="cardCVC"
                    placeholder="123"
                    value={formData.cardCVC}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="checkout-button"
                disabled={orderProcessing}
              >
                {orderProcessing ? (
                  <>
                    <div className="button-spinner"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Finalizar Pedido
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="order-summary">
          <div className="summary-header">
            <h2>
              <ShoppingCart size={20} />
              Resumo do Pedido
            </h2>
          </div>
          
          <div className="summary-items">
            {cart.items.map(item => (
              <div key={item._id} className="summary-item">
                <div className="item-image">
                  {item.product.image ? (
                    <img 
                      src={normalizeImageUrl(item.product.image)} 
                      alt={item.product.name} 
                      {...createImageFallbackHandler(item.product.image)}
                    />
                  ) : (
                    <div className="no-image">Sem Imagem</div>
                  )}
                </div>
                <div className="item-details">
                  <h4 className="item-name">{item.product.name}</h4>
                  <div className="item-price">
                    {item.product.discountPrice ? (
                      <span>R$ {item.product.discountPrice.toFixed(2)}</span>
                    ) : (
                      <span>R$ {item.product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={14} />
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
                </div>
                <div className="item-total">
                  R$ {((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="subtotal">
              <span>Subtotal:</span>
              <span>R$ {cart.totalAmount.toFixed(2)}</span>
            </div>
            <div className="shipping">
              <span>Frete:</span>
              <span>R$ {(cart.totalAmount > 100 ? 0 : 15).toFixed(2)}</span>
            </div>
            <div className="discount">
              <span>Desconto:</span>
              <span>R$ 0.00</span>
            </div>
            <div className="total">
              <span>Total:</span>
              <span>R$ {(cart.totalAmount + (cart.totalAmount > 100 ? 0 : 15)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
