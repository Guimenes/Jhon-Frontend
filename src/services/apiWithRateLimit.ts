import axios from 'axios';
import type {
  User,
  Service,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UpdateProfileData,
} from '../types';

// Variável para armazenar a função de exibição de alerta
let showRateLimitAlertFunction: ((retryAfter: number, message: string) => void) | null = null;

// Função para registrar o manipulador de alerta
export const registerRateLimitHandler = (handler: (retryAfter: number, message: string) => void) => {
  showRateLimitAlertFunction = handler;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentado para 15 segundos
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Função para atrasar a execução
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para calcular tempo de espera com exponential backoff
const getRetryDelay = (retryCount: number) => {
  return Math.min(1000 * Math.pow(2, retryCount), 10000); // Entre 1s e 10s
};

// Handle auth errors and retry on rate limit
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Se não tiver configuração ou já for uma tentativa de retry, rejeita o erro
    if (!config || config._isRetry) {
      return Promise.reject(error);
    }
    
    // Tratar erro 401 (Unauthorized)
    if (response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Tratar erro 429 (Too Many Requests) com retry
    if (response?.status === 429) {
      config._isRetry = true;
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < 3) { // Máximo de 3 tentativas
        config._retryCount++;
        
        // Obter Retry-After do header ou usar backoff exponencial
        const retryAfter = response.headers['retry-after']
          ? parseInt(response.headers['retry-after'], 10) * 1000
          : getRetryDelay(config._retryCount);
        
        console.log(`Taxa de requisições excedida. Aguardando ${retryAfter/1000}s para tentar novamente...`);
        
        // Preparar a mensagem com informações mais detalhadas
        let message = '';
        if (config._retryCount === 1) {
          message = `Estamos processando muitas requisições. Aguardando ${Math.ceil(retryAfter/1000)} segundos antes de tentar novamente.`;
        } else if (config._retryCount === 2) {
          message = `Ainda estamos com alta demanda. Tentando novamente em ${Math.ceil(retryAfter/1000)} segundos.`;
        } else {
          message = `Última tentativa em ${Math.ceil(retryAfter/1000)} segundos. Por favor, aguarde.`;
        }
        
        // Mostrar alerta visual se o handler estiver registrado
        if (showRateLimitAlertFunction) {
          showRateLimitAlertFunction(retryAfter, message);
        }
        
        // Esperar o tempo recomendado antes de tentar novamente
        await delay(retryAfter);
        
        // Tentar novamente
        return api(config);
      }
      
      // Mostrar mensagem amigável se falhar após todas as tentativas
      const finalMessage = 'Estamos com alta demanda no momento. Por favor, tente novamente mais tarde.';
      console.error('Limite de requisições excedido. Tente novamente mais tarde.');
      
      // Mostrar alerta final com tempo de espera maior (30 segundos)
      if (showRateLimitAlertFunction) {
        showRateLimitAlertFunction(30000, finalMessage);
      }
    }
    
    return Promise.reject(error);
  }
);

// Autenticação e outros endpoints omitidos para brevidade...

export default api;

// Auth endpoints
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: User }> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ message: string; avatar: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProfileWithAvatar: async (data: FormData): Promise<{ message: string; user: User }> => {
    const response = await api.put('/auth/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Services endpoints
export const servicesAPI = {
  getAll: async (): Promise<Service[]> => {
    const response = await api.get('/services');
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<Service[]> => {
    const response = await api.get(`/services/category/${category}`);
    return response.data;
  },

  create: async (data: FormData): Promise<{ message: string; service: Service }> => {
    const response = await api.post('/services', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<{ message: string; service: Service }> => {
    const response = await api.put(`/services/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  deletePermanent: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/services/${id}/permanent`);
    return response.data;
  },

  // Admin endpoints
  getAllAdmin: async (): Promise<Service[]> => {
    const response = await api.get('/services/admin');
    return response.data;
  },

  toggleActive: async (id: string, isActive: boolean): Promise<{ message: string; service: Service }> => {
    // Enviar um objeto JSON simples em vez de FormData
    const response = await api.put(`/services/${id}/toggle`, { isActive: isActive.toString() });
    return response.data;
  },
};

// Os outros serviços da API permanecem iguais
