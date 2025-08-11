import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import './styles.css';

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  
  // Gerar um número de pedido aleatório
  const orderNumber = `${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Data estimada de entrega (7 dias a partir de hoje)
  const today = new Date();
  const deliveryDate = new Date(today.setDate(today.getDate() + 7));
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="order-confirmation-container">
      <div className="order-confirmation-card">
        <div className="success-icon">
          <CheckCircle size={64} />
        </div>
        
        <h1>Pedido Confirmado!</h1>
        <p className="thank-you-message">
          Obrigado por comprar na Jhon Cortes Barber Shop!
        </p>
        
        <div className="order-details">
          <div className="order-detail-item">
            <span className="detail-label">Número do Pedido:</span>
            <span className="detail-value">#{orderNumber}</span>
          </div>
          <div className="order-detail-item">
            <span className="detail-label">Data:</span>
            <span className="detail-value">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="order-detail-item">
            <span className="detail-label">Entrega estimada:</span>
            <span className="detail-value">{formattedDeliveryDate}</span>
          </div>
        </div>
        
        <p className="confirmation-message">
          Enviamos um e-mail com os detalhes do seu pedido.
          Você também pode acompanhar o status do seu pedido na sua área de cliente.
        </p>
        
        <div className="confirmation-buttons">
          <button 
            className="shop-more-btn"
            onClick={() => navigate('/shop')}
          >
            <ShoppingBag size={20} />
            Continuar Comprando
          </button>
          <button 
            className="home-btn"
            onClick={() => navigate('/')}
          >
            <Home size={20} />
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
