import api from './api';

// Interfaces
export interface AppointmentStats {
  totalAppointments: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  upcomingAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  appointmentsByDay: { day: string; count: number }[];
  appointmentsByService: { service: string; count: number }[];
}

export interface Appointment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  service: {
    _id: string;
    name: string;
    duration: number;
    price: number;
  };
  date: string;
  status: 'scheduled' | 'completed' | 'canceled';
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
}

// API de agendamentos
export const appointmentsAPI = {
  // Buscar todos os agendamentos (para administradores)
  getAllAppointments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    serviceId?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<AppointmentsResponse> => {
    try {
      const response = await api.get('/appointments', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  },

  // Buscar agendamentos do usuário logado
  getUserAppointments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AppointmentsResponse> => {
    try {
      const response = await api.get('/appointments/user', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar meus agendamentos:', error);
      throw error;
    }
  },

  // Buscar agendamento por ID
  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao buscar agendamento com ID ${appointmentId}:`, error);
      throw error;
    }
  },

  // Criar um novo agendamento
  createAppointment: async (appointmentData: {
    serviceId: string;
    date: string;
  }): Promise<Appointment> => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  // Atualizar status de um agendamento
  updateAppointmentStatus: async (
    appointmentId: string,
    status: 'completed' | 'canceled'
  ): Promise<Appointment> => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao atualizar status do agendamento com ID ${appointmentId}:`, error);
      throw error;
    }
  },

  // Cancelar um agendamento
  cancelAppointment: async (appointmentId: string): Promise<Appointment> => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/cancel`);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao cancelar agendamento com ID ${appointmentId}:`, error);
      throw error;
    }
  },
  
  // Buscar horários disponíveis para um serviço em uma data específica
  getAvailableSlots: async (params: {
    serviceId: string;
    date: string;
  }): Promise<string[]> => {
    try {
      const response = await api.get('/appointments/available-slots', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      throw error;
    }
  },

  // Obter estatísticas de agendamentos (para administradores)
  getAppointmentStats: async (): Promise<AppointmentStats> => {
    try {
      const response = await api.get('/appointments/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de agendamentos:', error);
      throw error;
    }
  }
};
