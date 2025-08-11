import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { cartAPI } from '../services/cart';
import type { Cart } from '../services/cart';
import { showError } from '../utils/alerts';

type CartContextType = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
  itemCount: number;
  totalAmount: number;
  items: Cart['items'];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const useCartImplementation = () => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar se o usuário está autenticado
  const isAuthenticated = !!token;

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await cartAPI.getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Erro ao buscar carrinho:', err);
      setError('Não foi possível carregar o carrinho');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, user?._id]);

  const addItem = async (productId: string, quantity = 1) => {
    if (!isAuthenticated) {
      showError('Acesso negado', 'Você precisa fazer login para adicionar produtos ao carrinho');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartAPI.addToCart(productId, quantity);
      setCart(updatedCart);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Não foi possível adicionar o produto ao carrinho';
      setError(errorMessage);
      showError('Erro', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartAPI.updateItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Não foi possível atualizar o carrinho';
      setError(errorMessage);
      showError('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartAPI.removeItem(itemId);
      setCart(updatedCart);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Não foi possível remover o item do carrinho';
      setError(errorMessage);
      showError('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartAPI.clearCart();
      setCart(updatedCart);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Não foi possível limpar o carrinho';
      setError(errorMessage);
      showError('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refresh: fetchCart,
    itemCount: cart?.items.length || 0,
    totalAmount: cart?.totalAmount || 0,
    items: cart?.items || []
  };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cartContext = useCartImplementation();
  
  return (
    <CartContext.Provider value={cartContext}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  
  return context;
};
