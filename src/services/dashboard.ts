import api from './api';

// Interfaces para estatísticas do dashboard
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByMonth: { month: string; count: number }[];
}

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

export interface ServiceStats {
  totalServices: number;
  popularServices: { name: string; count: number; revenue: number }[];
}

export interface ProductStats {
  totalProducts: number;
  lowStockProducts: number;
  featuredProducts: number;
  totalRevenue: number;
  topSellingProducts: { name: string; sales: number }[];
}

export interface FinancialStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  revenueByMonth: { month: string; amount: number }[];
}

export interface DashboardStats {
  userStats: UserStats;
  appointmentStats: AppointmentStats;
  serviceStats: ServiceStats;
  productStats: ProductStats;
  financialStats: FinancialStats;
}

// Dados padrão (vazios) para quando as APIs falham
export const emptyUserStats: UserStats = {
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

export const emptyAppointmentStats: AppointmentStats = {
  totalAppointments: 0,
  appointmentsToday: 0,
  appointmentsThisWeek: 0,
  appointmentsThisMonth: 0,
  upcomingAppointments: 0,
  completedAppointments: 0,
  canceledAppointments: 0,
  appointmentsByDay: [
    { day: 'Dom', count: 0 },
    { day: 'Seg', count: 0 },
    { day: 'Ter', count: 0 },
    { day: 'Qua', count: 0 },
    { day: 'Qui', count: 0 },
    { day: 'Sex', count: 0 },
    { day: 'Sáb', count: 0 }
  ],
  appointmentsByService: []
};

export const emptyServiceStats: ServiceStats = {
  totalServices: 0,
  popularServices: []
};

export const emptyProductStats: ProductStats = {
  totalProducts: 0,
  lowStockProducts: 0,
  featuredProducts: 0,
  totalRevenue: 0,
  topSellingProducts: []
};

export const emptyFinancialStats: FinancialStats = {
  totalRevenue: 0,
  revenueThisMonth: 0,
  revenueGrowth: 0,
  revenueByMonth: [
    { month: 'Jan', amount: 0 },
    { month: 'Fev', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Abr', amount: 0 },
    { month: 'Mai', amount: 0 },
    { month: 'Jun', amount: 0 },
    { month: 'Jul', amount: 0 },
    { month: 'Ago', amount: 0 }
  ]
};

// Serviço do Dashboard
export const dashboardAPI = {
  // Obter estatísticas de usuários
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await api.get('/users/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      return emptyUserStats;
    }
  },

  // Obter estatísticas de agendamentos
  getAppointmentStats: async (): Promise<AppointmentStats> => {
    try {
      const response = await api.get('/appointments/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de agendamentos:', error);
      return emptyAppointmentStats;
    }
  },

  // Obter estatísticas de serviços
  getServiceStats: async (): Promise<ServiceStats> => {
    try {
      const response = await api.get('/services/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de serviços:', error);
      return emptyServiceStats;
    }
  },

  // Obter estatísticas de produtos
  getProductStats: async (): Promise<ProductStats> => {
    try {
      const response = await api.get('/products/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de produtos:', error);
      return emptyProductStats;
    }
  },

  // Obter estatísticas financeiras
  getFinancialStats: async (): Promise<FinancialStats> => {
    try {
      const response = await api.get('/financial/stats');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas financeiras:', error);
      return emptyFinancialStats;
    }
  },

  // Obter todas as estatísticas de uma vez
  getAllStats: async (): Promise<DashboardStats> => {
    try {
      // Fazer todas as requisições em paralelo
      const [userStats, appointmentStats, serviceStats, productStats, financialStats] = await Promise.all([
        dashboardAPI.getUserStats(),
        dashboardAPI.getAppointmentStats(),
        dashboardAPI.getServiceStats(),
        dashboardAPI.getProductStats(),
        dashboardAPI.getFinancialStats()
      ]);

      return {
        userStats,
        appointmentStats,
        serviceStats,
        productStats,
        financialStats
      };
    } catch (error) {
      console.error('Erro ao buscar todas as estatísticas do dashboard:', error);
      return {
        userStats: emptyUserStats,
        appointmentStats: emptyAppointmentStats,
        serviceStats: emptyServiceStats,
        productStats: emptyProductStats,
        financialStats: emptyFinancialStats
      };
    }
  }
};
