import api from './api';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    image?: string;
    stock: number;
    isActive: boolean;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export const cartAPI = {
  // Obter carrinho do usuário
  getCart: async (): Promise<Cart> => {
    try {
      const response = await api.get('/cart');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter carrinho:', error);
      throw error;
    }
  },

  // Adicionar item ao carrinho
  addToCart: async (productId: string, quantity: number = 1): Promise<Cart> => {
    try {
      const response = await api.post('/cart/add', { productId, quantity });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error);
      throw error;
    }
  },

  // Atualizar quantidade de um item
  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    try {
      const response = await api.put(`/cart/item/${itemId}`, { quantity });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar item do carrinho:', error);
      throw error;
    }
  },

  // Remover item do carrinho
  removeItem: async (itemId: string): Promise<Cart> => {
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      throw error;
    }
  },

  // Limpar carrinho
  clearCart: async (): Promise<Cart> => {
    try {
      const response = await api.delete('/cart');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw error;
    }
  }
};
