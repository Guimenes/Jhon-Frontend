import api from './api';

// Interfaces
export interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServicesResponse {
  services: Service[];
  total: number;
}

export interface ServiceStats {
  totalServices: number;
  popularServices: { name: string; count: number; revenue: number }[];
}

// API de serviços
export const servicesAPI = {
  // Buscar todos os serviços
  getAllServices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    active?: boolean;
  }): Promise<ServicesResponse> => {
    try {
      const response = await api.get('/services', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
  },

  // Buscar serviço por ID
  getServiceById: async (serviceId: string): Promise<Service> => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao buscar serviço com ID ${serviceId}:`, error);
      throw error;
    }
  },

  // Criar um novo serviço (para administradores)
  createService: async (serviceData: {
    name: string;
    description: string;
    duration: number;
    price: number;
    image?: File;
  }): Promise<Service> => {
    try {
      // Usar FormData para enviar arquivos
      const formData = new FormData();
      formData.append('name', serviceData.name);
      formData.append('description', serviceData.description);
      formData.append('duration', serviceData.duration.toString());
      formData.append('price', serviceData.price.toString());
      
      if (serviceData.image) {
        formData.append('image', serviceData.image);
      }

      const response = await api.post('/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  },

  // Atualizar um serviço (para administradores)
  updateService: async (
    serviceId: string,
    serviceData: {
      name?: string;
      description?: string;
      duration?: number;
      price?: number;
      image?: File;
      removeImage?: boolean;
    }
  ): Promise<Service> => {
    try {
      // Usar FormData para enviar arquivos
      const formData = new FormData();
      
      if (serviceData.name !== undefined) {
        formData.append('name', serviceData.name);
      }
      
      if (serviceData.description !== undefined) {
        formData.append('description', serviceData.description);
      }
      
      if (serviceData.duration !== undefined) {
        formData.append('duration', serviceData.duration.toString());
      }
      
      if (serviceData.price !== undefined) {
        formData.append('price', serviceData.price.toString());
      }
      
      if (serviceData.removeImage !== undefined) {
        formData.append('removeImage', serviceData.removeImage.toString());
      }
      
      if (serviceData.image) {
        formData.append('image', serviceData.image);
      }

      const response = await api.put(`/services/${serviceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao atualizar serviço com ID ${serviceId}:`, error);
      throw error;
    }
  },

  // Alternar status de ativo/inativo do serviço (para administradores)
  toggleServiceActive: async (serviceId: string, isActive: boolean): Promise<Service> => {
    try {
      const response = await api.patch(`/services/${serviceId}/active`, { isActive });
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao alterar status do serviço com ID ${serviceId}:`, error);
      throw error;
    }
  },

  // Excluir um serviço (para administradores)
  deleteService: async (serviceId: string): Promise<void> => {
    try {
      await api.delete(`/services/${serviceId}`);
    } catch (error) {
      console.error(`Erro ao excluir serviço com ID ${serviceId}:`, error);
      throw error;
    }
  },
  
  // Obter estatísticas dos serviços (para administradores)
  getServiceStats: async (): Promise<ServiceStats> => {
    try {
      const response = await api.get('/services/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de serviços:', error);
      throw error;
    }
  }
};
