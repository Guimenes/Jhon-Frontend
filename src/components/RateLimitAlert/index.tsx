import React, { useState, useEffect } from 'react';
import './styles.css';

interface RateLimitAlertProps {
  retryAfter?: number; // Tempo em milissegundos
  message?: string;
  onClose?: () => void;
}

const RateLimitAlert: React.FC<RateLimitAlertProps> = ({
  retryAfter = 5000,
  message = 'Muitas requisições foram feitas. Aguardando para tentar novamente...',
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [countdown, setCountdown] = useState(Math.ceil(retryAfter / 1000));

  useEffect(() => {
    if (!isVisible) return;

    // Atualiza o contador a cada segundo
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="rate-limit-alert">
      <div className="rate-limit-content">
        <div className="rate-limit-icon">⏱️</div>
        <div className="rate-limit-message">
          <h4>Aguarde um momento</h4>
          <p>{message}</p>
          <div className="rate-limit-progress">
            <div 
              className="rate-limit-progress-bar" 
              style={{ width: `${100 - (countdown * 100 / Math.ceil(retryAfter / 1000))}%` }}
            />
          </div>
          <p className="rate-limit-countdown">Tentando novamente em {countdown}s</p>
        </div>
        {onClose && (
          <button className="rate-limit-close" onClick={() => {
            setIsVisible(false);
            onClose();
          }}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default RateLimitAlert;
