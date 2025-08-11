import api from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  stock: number;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  stock?: number;
  isActive?: boolean;
  featured?: boolean;
  image?: File;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  removeImage?: boolean;
}

export interface ProductStats {
  totalProducts: number;
  lowStockProducts: number;
  featuredProducts: number;
  totalRevenue: number;
  topSellingProducts: { name: string; sales: number }[];
}

export const ProductService = {
  // Obter todos os produtos (público)
  getAllProducts: async (params?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },

  // Obter todos os produtos (admin)
  getAllProductsAdmin: async () => {
    const response = await api.get<Product[]>('/products/admin/all');
    return response.data;
  },

  // Obter produto por ID
  getProductById: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Criar novo produto
  createProduct: async (productData: CreateProductData) => {
    // Usar FormData para enviar arquivos
    const formData = new FormData();
    
    // Adicionar campos simples
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    
    // Adicionar campos opcionais
    if (productData.discountPrice !== undefined) {
      formData.append('discountPrice', productData.discountPrice.toString());
    }
    
    if (productData.stock !== undefined) {
      formData.append('stock', productData.stock.toString());
    }
    
    if (productData.isActive !== undefined) {
      formData.append('isActive', productData.isActive.toString());
    }
    
    if (productData.featured !== undefined) {
      formData.append('featured', productData.featured.toString());
    }
    
    // Adicionar imagem se fornecida
    if (productData.image) {
      formData.append('image', productData.image);
    }
    
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Atualizar produto
  updateProduct: async (id: string, productData: UpdateProductData) => {
    // Usar FormData para enviar arquivos
    const formData = new FormData();
    
    // Adicionar campos que existem
    if (productData.name !== undefined) {
      formData.append('name', productData.name);
    }
    
    if (productData.description !== undefined) {
      formData.append('description', productData.description);
    }
    
    if (productData.price !== undefined) {
      formData.append('price', productData.price.toString());
    }
    
    if (productData.discountPrice !== undefined) {
      formData.append('discountPrice', productData.discountPrice.toString());
    }
    
    if (productData.category !== undefined) {
      formData.append('category', productData.category);
    }
    
    if (productData.stock !== undefined) {
      formData.append('stock', productData.stock.toString());
    }
    
    if (productData.isActive !== undefined) {
      formData.append('isActive', productData.isActive.toString());
    }
    
    if (productData.featured !== undefined) {
      formData.append('featured', productData.featured.toString());
    }
    
    if (productData.removeImage !== undefined) {
      formData.append('removeImage', productData.removeImage.toString());
    }
    
    // Adicionar imagem se fornecida
    if (productData.image) {
      formData.append('image', productData.image);
    }
    
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Alternar status ativo/inativo
  toggleProductActive: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/products/${id}/active`, { isActive });
    return response.data;
  },

  // Alternar destaque do produto
  toggleProductFeatured: async (id: string, featured: boolean) => {
    const response = await api.patch(`/products/${id}/featured`, { featured });
    return response.data;
  },

  // Excluir produto
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  // Obter estatísticas dos produtos (para administradores)
  getProductStats: async (): Promise<ProductStats> => {
    try {
      const response = await api.get('/products/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de produtos:', error);
      // Retorna dados zerados em caso de falha
      return {
        totalProducts: 0,
        lowStockProducts: 0,
        featuredProducts: 0,
        totalRevenue: 0,
        topSellingProducts: []
      };
    }
  },
};
