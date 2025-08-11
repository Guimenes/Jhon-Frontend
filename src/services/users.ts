import api from './api';

// Interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastAppointment?: string;
  appointmentsCount?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  currentPassword?: string;
  avatar?: File;
  removeAvatar?: boolean;
}

// API de usuários
export const userAPI = {
  // Obter o usuário logado (perfil)
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/users/profile');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  // Atualizar o perfil do usuário
  updateProfile: async (userData: UserUpdateData): Promise<User> => {
    try {
      // Usar FormData para enviar arquivos
      const formData = new FormData();
      
      if (userData.name !== undefined) {
        formData.append('name', userData.name);
      }
      
      if (userData.email !== undefined) {
        formData.append('email', userData.email);
      }
      
      if (userData.phone !== undefined) {
        formData.append('phone', userData.phone);
      }
      
      if (userData.password !== undefined) {
        formData.append('password', userData.password);
      }
      
      if (userData.currentPassword !== undefined) {
        formData.append('currentPassword', userData.currentPassword);
      }
      
      if (userData.removeAvatar !== undefined) {
        formData.append('removeAvatar', userData.removeAvatar.toString());
      }
      
      if (userData.avatar) {
        formData.append('avatar', userData.avatar);
      }

      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  // Obter todos os usuários (para administradores)
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    active?: boolean;
  }): Promise<UsersResponse> => {
    try {
      const response = await api.get('/users', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // Obter usuário por ID (para administradores)
  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${userId}:`, error);
      throw error;
    }
  },

  // Criar novo usuário (para administradores)
  createUser: async (userData: UserUpdateData & { role?: 'user' | 'admin' }): Promise<User> => {
    try {
      const formData = new FormData();
      
      if (userData.name) {
        formData.append('name', userData.name);
      }
      
      if (userData.email) {
        formData.append('email', userData.email);
      }
      
      if (userData.phone) {
        formData.append('phone', userData.phone);
      }
      
      if (userData.password) {
        formData.append('password', userData.password);
      }
      
      if (userData.role) {
        formData.append('role', userData.role);
      }
      
      if (userData.avatar) {
        formData.append('avatar', userData.avatar);
      }

      const response = await api.post('/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  // Atualizar usuário (para administradores)
  updateUser: async (userId: string, userData: UserUpdateData & { role?: 'user' | 'admin' }): Promise<User> => {
    try {
      const formData = new FormData();
      
      if (userData.name !== undefined) {
        formData.append('name', userData.name);
      }
      
      if (userData.email !== undefined) {
        formData.append('email', userData.email);
      }
      
      if (userData.phone !== undefined) {
        formData.append('phone', userData.phone);
      }
      
      if (userData.password !== undefined) {
        formData.append('password', userData.password);
      }
      
      if (userData.role !== undefined) {
        formData.append('role', userData.role);
      }
      
      if (userData.removeAvatar !== undefined) {
        formData.append('removeAvatar', userData.removeAvatar.toString());
      }
      
      if (userData.avatar) {
        formData.append('avatar', userData.avatar);
      }

      const response = await api.put(`/users/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao atualizar usuário com ID ${userId}:`, error);
      throw error;
    }
  },

  // Alternar status de ativo/inativo do usuário (para administradores)
  toggleUserActive: async (userId: string, isActive: boolean): Promise<User> => {
    try {
      const response = await api.patch(`/users/${userId}/active`, { isActive });
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao alterar status do usuário com ID ${userId}:`, error);
      throw error;
    }
  },

  // Alterar a função do usuário (para administradores)
  changeUserRole: async (userId: string, role: 'user' | 'admin'): Promise<User> => {
    try {
      const response = await api.patch(`/users/${userId}/role`, { role });
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao alterar a função do usuário com ID ${userId}:`, error);
      throw error;
    }
  },

  // Excluir usuário (para administradores)
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      console.error(`Erro ao excluir usuário com ID ${userId}:`, error);
      throw error;
    }
  },
  
  // Obter estatísticas de usuários (para administradores)
  getUserStats: async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByMonth: { month: string; count: number }[];
  }> => {
    try {
      const response = await api.get('/users/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      
      // Retornar dados zerados se a API falhar
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        usersByMonth: [
          { month: 'Jan', count: 0 },
          { month: 'Fev', count: 0 },
          { month: 'Mar', count: 0 },
          { month: 'Abr', count: 0 },
          { month: 'Mai', count: 0 },
          { month: 'Jun', count: 0 },
          { month: 'Jul', count: 0 },
          { month: 'Ago', count: 0 }
        ]
      };
    }
  }
};
