import React, { useState, useEffect } from 'react';
import { 
  BarChart, Scissors, Users, Calendar, Clock, TrendingUp, 
  DollarSign, Package, Activity, AlertCircle, CheckCircle, Award
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardAPI, type DashboardStats } from '../../services/dashboard';
import { showError } from '../../utils/alerts';
import './styles.css';

// Importação do componente de gráfico
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler  // Adiciona o plugin Filler para suportar opção 'fill'
);

// Interface DashboardStats agora importada de '../../services/dashboard'

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'appointments' | 'customers' | 'services' | 'products' | 'financial'>('overview');
  
  const { token } = useAuth();
  
  useEffect(() => {
    if (token) {
      fetchAllStats();
    }
  }, [token]);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as estatísticas usando o novo serviço dashboardAPI
      const allStats = await dashboardAPI.getAllStats();
      
      setStats(allStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do dashboard:', error);
      showError('Erro', 'Não foi possível carregar as estatísticas do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Função fetchProductStats foi removida pois agora usamos ProductService.getProductStats()

  // Função para buscar estatísticas financeiras removida, pois estamos usando dados vazios diretamente

  // Formatar valores monetários
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Função removida pois não está sendo usada

  // Componente para renderizar os cards do dashboard
  const DashboardCard = ({ title, value, icon, color, trend, percent }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    percent?: number;
  }) => {
    let trendColor = '';
    let trendIcon = null;
    
    if (trend === 'up') {
      trendColor = 'trend-positive';
      trendIcon = <TrendingUp size={14} />;
    } else if (trend === 'down') {
      trendColor = 'trend-negative';
      trendIcon = <TrendingUp size={14} className="trend-down" />;
    }
    
    return (
      <div className="dashboard-card">
        <div className="card-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="card-content">
          <h3>{title}</h3>
          <div className="card-value-container">
            <span className="card-value">{value}</span>
            {trend && percent !== undefined && (
              <span className={`trend ${trendColor}`}>
                {trendIcon} {percent}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Componente para seção de visão geral (resumo)
  const OverviewSection = () => {
    if (!stats) return null;
    
    // Dados para o gráfico de agendamentos
    const appointmentChartData = {
      labels: stats.appointmentStats.appointmentsByDay.map(item => item.day),
      datasets: [
        {
          label: 'Agendamentos',
          data: stats.appointmentStats.appointmentsByDay.map(item => item.count),
          backgroundColor: 'rgba(184, 134, 11, 0.6)',
          borderColor: '#B8860B',
          borderWidth: 1
        }
      ]
    };
    
    // Dados para o gráfico de receita
    const revenueChartData = {
      labels: stats.financialStats.revenueByMonth.map(item => item.month),
      datasets: [
        {
          label: 'Receita',
          data: stats.financialStats.revenueByMonth.map(item => item.amount),
          fill: true,
          backgroundColor: 'rgba(255, 215, 0, 0.2)',
          borderColor: '#FFD700',
          tension: 0.4
        }
      ]
    };
    
    return (
      <div className="dashboard-section">
        <h2>Visão Geral</h2>
        
        <div className="dashboard-cards">
          <DashboardCard 
            title="Clientes Ativos" 
            value={stats.userStats.activeUsers} 
            icon={<Users size={20} />} 
            color="rgba(52, 152, 219, 0.2)"
            trend="up"
            percent={5}
          />
          <DashboardCard 
            title="Agendamentos Hoje" 
            value={stats.appointmentStats.appointmentsToday} 
            icon={<Calendar size={20} />} 
            color="rgba(155, 89, 182, 0.2)"
          />
          <DashboardCard 
            title="Agendamentos Pendentes" 
            value={stats.appointmentStats.upcomingAppointments} 
            icon={<Clock size={20} />} 
            color="rgba(243, 156, 18, 0.2)"
          />
          <DashboardCard 
            title="Receita Este Mês" 
            value={formatCurrency(stats.financialStats.revenueThisMonth)} 
            icon={<DollarSign size={20} />} 
            color="rgba(46, 204, 113, 0.2)"
            trend="up"
            percent={stats.financialStats.revenueGrowth}
          />
        </div>
        
        <div className="dashboard-charts-row">
          <div className="dashboard-chart">
            <h3>Agendamentos por Dia</h3>
            <div className="chart-container">
              <Bar 
                data={appointmentChartData} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#FFFFFF' }
                    },
                    x: {
                      ticks: { color: '#FFFFFF' }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: { color: '#FFFFFF' }
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="dashboard-chart">
            <h3>Receita Mensal</h3>
            <div className="chart-container">
              <Line 
                data={revenueChartData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { 
                        color: '#FFFFFF',
                        callback: function(value) {
                          return formatCurrency(value as number);
                        }
                      }
                    },
                    x: {
                      ticks: { color: '#FFFFFF' }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: { color: '#FFFFFF' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          label += formatCurrency(context.parsed.y);
                          return label;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="dashboard-highlights">
          <div className="highlight-section">
            <h3>Serviços Mais Populares</h3>
            <ul className="highlight-list">
              {stats.serviceStats.popularServices.slice(0, 5).map((service, index) => (
                <li key={index} className="highlight-item">
                  <div className="highlight-rank">{index + 1}</div>
                  <div className="highlight-details">
                    <strong>{service.name}</strong>
                    <span>{service.count} agendamentos</span>
                  </div>
                  <div className="highlight-value">
                    {formatCurrency(service.revenue)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="highlight-section">
            <h3>Produtos Mais Vendidos</h3>
            <ul className="highlight-list">
              {stats.productStats.topSellingProducts.slice(0, 5).map((product, index) => (
                <li key={index} className="highlight-item">
                  <div className="highlight-rank">{index + 1}</div>
                  <div className="highlight-details">
                    <strong>{product.name}</strong>
                    <span>{product.sales} vendas</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-secondary">
            <Calendar size={18} /> Ver Agenda de Hoje
          </button>
          <button className="btn btn-primary">
            <AlertCircle size={18} /> Produtos com Baixo Estoque
          </button>
        </div>
      </div>
    );
  };

  // Componente para seção de Agendamentos
  const AppointmentsSection = () => {
    if (!stats) return null;
    
    // Dados para o gráfico de status dos agendamentos
    const appointmentStatusData = {
      labels: ['Agendados', 'Realizados', 'Cancelados'],
      datasets: [
        {
          data: [
            stats.appointmentStats.upcomingAppointments,
            stats.appointmentStats.completedAppointments,
            stats.appointmentStats.canceledAppointments
          ],
          backgroundColor: [
            'rgba(52, 152, 219, 0.6)',
            'rgba(46, 204, 113, 0.6)',
            'rgba(231, 76, 60, 0.6)'
          ],
          borderColor: [
            '#3498db',
            '#2ecc71',
            '#e74c3c'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // Dados para o gráfico de serviços mais agendados
    const serviceDistributionData = {
      labels: stats.appointmentStats.appointmentsByService.map(item => item.service),
      datasets: [
        {
          label: 'Agendamentos',
          data: stats.appointmentStats.appointmentsByService.map(item => item.count),
          backgroundColor: [
            'rgba(255, 215, 0, 0.6)',
            'rgba(184, 134, 11, 0.6)',
            'rgba(218, 165, 32, 0.6)',
            'rgba(205, 133, 63, 0.6)',
            'rgba(210, 180, 140, 0.6)'
          ],
          borderColor: '#1A1A1A',
          borderWidth: 2
        }
      ]
    };
    
    return (
      <div className="dashboard-section">
        <h2>Análise de Agendamentos</h2>
        
        <div className="dashboard-cards">
          <DashboardCard 
            title="Total de Agendamentos" 
            value={stats.appointmentStats.totalAppointments} 
            icon={<Calendar size={20} />} 
            color="rgba(52, 152, 219, 0.2)"
          />
          <DashboardCard 
            title="Pendentes" 
            value={stats.appointmentStats.upcomingAppointments} 
            icon={<Clock size={20} />} 
            color="rgba(243, 156, 18, 0.2)"
          />
          <DashboardCard 
            title="Completados" 
            value={stats.appointmentStats.completedAppointments} 
            icon={<CheckCircle size={20} />} 
            color="rgba(46, 204, 113, 0.2)"
          />
          <DashboardCard 
            title="Cancelados" 
            value={stats.appointmentStats.canceledAppointments} 
            icon={<AlertCircle size={20} />} 
            color="rgba(231, 76, 60, 0.2)"
          />
        </div>
        
        <div className="dashboard-charts-row">
          <div className="dashboard-chart">
            <h3>Status dos Agendamentos</h3>
            <div className="chart-container">
              <Doughnut 
                data={appointmentStatusData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { color: '#FFFFFF' }
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="dashboard-chart">
            <h3>Distribuição por Serviço</h3>
            <div className="chart-container">
              <Bar 
                data={serviceDistributionData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#FFFFFF' }
                    },
                    x: {
                      ticks: { 
                        color: '#FFFFFF',
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Seção de clientes
  const CustomersSection = () => {
    if (!stats) return null;
    
    // Dados para o gráfico de novos clientes por mês
    const newCustomersChartData = {
      labels: stats.userStats.usersByMonth.map(item => item.month),
      datasets: [
        {
          label: 'Novos Clientes',
          data: stats.userStats.usersByMonth.map(item => item.count),
          backgroundColor: 'rgba(155, 89, 182, 0.6)',
          borderColor: '#9b59b6',
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div className="dashboard-section">
        <h2>Análise de Clientes</h2>
        
        <div className="dashboard-cards">
          <DashboardCard 
            title="Total de Clientes" 
            value={stats.userStats.totalUsers} 
            icon={<Users size={20} />} 
            color="rgba(52, 152, 219, 0.2)"
          />
          <DashboardCard 
            title="Clientes Ativos" 
            value={stats.userStats.activeUsers} 
            icon={<CheckCircle size={20} />} 
            color="rgba(46, 204, 113, 0.2)"
            trend="up"
            percent={5}
          />
          <DashboardCard 
            title="Novos este Mês" 
            value={stats.userStats.newUsersThisMonth} 
            icon={<Award size={20} />} 
            color="rgba(155, 89, 182, 0.2)"
          />
        </div>
        
        <div className="dashboard-charts-row full-width">
          <div className="dashboard-chart">
            <h3>Crescimento de Clientes</h3>
            <div className="chart-container">
              <Line 
                data={{
                  labels: newCustomersChartData.labels,
                  datasets: [
                    {
                      ...newCustomersChartData.datasets[0],
                      fill: true,
                      backgroundColor: 'rgba(155, 89, 182, 0.2)',
                      tension: 0.4
                    }
                  ]
                }} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#FFFFFF' }
                    },
                    x: {
                      ticks: { color: '#FFFFFF' }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: { color: '#FFFFFF' }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-secondary">
            <Users size={18} /> Ver Todos os Clientes
          </button>
          <button className="btn btn-primary">
            <Award size={18} /> Programa de Fidelidade
          </button>
        </div>
      </div>
    );
  };

  // Renderização dos serviços e produtos
  const ServicesSection = () => {
    if (!stats) return null;
    
    return (
      <div className="dashboard-section">
        <h2>Análise de Serviços</h2>
        
        <div className="dashboard-cards">
          <DashboardCard 
            title="Total de Serviços" 
            value={stats.serviceStats.totalServices} 
            icon={<Scissors size={20} />} 
            color="rgba(52, 152, 219, 0.2)"
          />
        </div>
        
        <div className="dashboard-charts-row full-width">
          <div className="dashboard-chart">
            <h3>Receita por Serviço</h3>
            <div className="chart-container">
              <Bar 
                data={{
                  labels: stats.serviceStats.popularServices.map(s => s.name),
                  datasets: [
                    {
                      label: 'Receita',
                      data: stats.serviceStats.popularServices.map(s => s.revenue),
                      backgroundColor: 'rgba(184, 134, 11, 0.6)',
                      borderColor: '#B8860B'
                    }
                  ]
                }} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { 
                        color: '#FFFFFF',
                        callback: function(value) {
                          return formatCurrency(value as number);
                        }
                      }
                    },
                    x: {
                      ticks: { 
                        color: '#FFFFFF',
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          label += formatCurrency(context.parsed.y);
                          return label;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <h2>Análise de Produtos</h2>
        
        <div className="dashboard-cards">
          <DashboardCard 
            title="Total de Produtos" 
            value={stats.productStats.totalProducts} 
            icon={<Package size={20} />} 
            color="rgba(52, 152, 219, 0.2)"
          />
          <DashboardCard 
            title="Produtos em Destaque" 
            value={stats.productStats.featuredProducts} 
            icon={<Award size={20} />} 
            color="rgba(243, 156, 18, 0.2)"
          />
          <DashboardCard 
            title="Produtos com Estoque Baixo" 
            value={stats.productStats.lowStockProducts} 
            icon={<AlertCircle size={20} />} 
            color="rgba(231, 76, 60, 0.2)"
          />
          <DashboardCard 
            title="Receita Total" 
            value={formatCurrency(stats.productStats.totalRevenue)} 
            icon={<DollarSign size={20} />} 
            color="rgba(46, 204, 113, 0.2)"
          />
        </div>
        
        <div className="dashboard-charts-row full-width">
          <div className="dashboard-chart">
            <h3>Produtos Mais Vendidos</h3>
            <div className="chart-container">
              <Bar 
                data={{
                  labels: stats.productStats.topSellingProducts.map(p => p.name),
                  datasets: [
                    {
                      label: 'Vendas',
                      data: stats.productStats.topSellingProducts.map(p => p.sales),
                      backgroundColor: 'rgba(255, 215, 0, 0.6)',
                      borderColor: '#FFD700'
                    }
                  ]
                }} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#FFFFFF' }
                    },
                    x: {
                      ticks: { 
                        color: '#FFFFFF',
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Seção financeira
  const FinancialSection = () => {
    if (!stats) return null;
    
    return (
      <div className="dashboard-section">
        <h2>Análise Financeira</h2>
        
        <div className="dashboard-cards">
          <DashboardCard 
            title="Receita Total" 
            value={formatCurrency(stats.financialStats.totalRevenue)} 
            icon={<DollarSign size={20} />} 
            color="rgba(46, 204, 113, 0.2)"
          />
          <DashboardCard 
            title="Receita Este Mês" 
            value={formatCurrency(stats.financialStats.revenueThisMonth)} 
            icon={<Activity size={20} />} 
            color="rgba(52, 152, 219, 0.2)"
            trend="up"
            percent={stats.financialStats.revenueGrowth}
          />
        </div>
        
        <div className="dashboard-charts-row full-width">
          <div className="dashboard-chart">
            <h3>Receita por Mês</h3>
            <div className="chart-container">
              <Line 
                data={{
                  labels: stats.financialStats.revenueByMonth.map(item => item.month),
                  datasets: [
                    {
                      label: 'Receita',
                      data: stats.financialStats.revenueByMonth.map(item => item.amount),
                      fill: true,
                      backgroundColor: 'rgba(46, 204, 113, 0.2)',
                      borderColor: '#2ecc71',
                      tension: 0.4
                    }
                  ]
                }} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { 
                        color: '#FFFFFF',
                        callback: function(value) {
                          return formatCurrency(value as number);
                        }
                      }
                    },
                    x: {
                      ticks: { color: '#FFFFFF' }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: { color: '#FFFFFF' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          label += formatCurrency(context.parsed.y);
                          return label;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar conteúdo com base na visualização atual
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando dados do dashboard...</p>
        </div>
      );
    }
    
    if (!stats) {
      return (
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Erro ao carregar dados</h3>
          <p>Não foi possível carregar as estatísticas do dashboard.</p>
          <button className="btn btn-primary" onClick={fetchAllStats}>
            Tentar Novamente
          </button>
        </div>
      );
    }
    
    switch (currentView) {
      case 'overview':
        return <OverviewSection />;
      case 'appointments':
        return <AppointmentsSection />;
      case 'customers':
        return <CustomersSection />;
      case 'services':
        return <ServicesSection />;
      case 'financial':
        return <FinancialSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <div className="admin-title">
          <BarChart size={24} />
          <h1>Dashboard</h1>
        </div>
        
        <div className="date-display">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${currentView === 'overview' ? 'active' : ''}`}
          onClick={() => setCurrentView('overview')}
        >
          <BarChart size={18} />
          Visão Geral
        </button>
        <button 
          className={`tab-btn ${currentView === 'appointments' ? 'active' : ''}`}
          onClick={() => setCurrentView('appointments')}
        >
          <Calendar size={18} />
          Agendamentos
        </button>
        <button 
          className={`tab-btn ${currentView === 'customers' ? 'active' : ''}`}
          onClick={() => setCurrentView('customers')}
        >
          <Users size={18} />
          Clientes
        </button>
        <button 
          className={`tab-btn ${currentView === 'services' ? 'active' : ''}`}
          onClick={() => setCurrentView('services')}
        >
          <Scissors size={18} />
          Serviços
        </button>
        <button 
          className={`tab-btn ${currentView === 'financial' ? 'active' : ''}`}
          onClick={() => setCurrentView('financial')}
        >
          <DollarSign size={18} />
          Financeiro
        </button>
      </div>

      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
