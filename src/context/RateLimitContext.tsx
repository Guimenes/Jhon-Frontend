import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import RateLimitAlert from '../components/RateLimitAlert';

interface RateLimitContextProps {
  showRateLimitAlert: (retryAfter?: number, message?: string) => void;
}

const RateLimitContext = createContext<RateLimitContextProps | undefined>(undefined);

export const RateLimitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [retryAfter, setRetryAfter] = useState(5000); // Default: 5 segundos
  const [message, setMessage] = useState('');

  const showRateLimitAlert = (
    retryMs = 5000, 
    customMessage = 'Muitas requisições foram feitas. Aguardando para tentar novamente...'
  ) => {
    setRetryAfter(retryMs);
    setMessage(customMessage);
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <RateLimitContext.Provider value={{ showRateLimitAlert }}>
      {children}
      {isVisible && (
        <RateLimitAlert 
          retryAfter={retryAfter}
          message={message}
          onClose={handleClose}
        />
      )}
    </RateLimitContext.Provider>
  );
};

export const useRateLimit = (): RateLimitContextProps => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimit must be used within a RateLimitProvider');
  }
  return context;
};
