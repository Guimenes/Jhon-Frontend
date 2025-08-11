import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Edit, Trash2, Star, UserPlus, Phone, Mail, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../services/users.js';
import { showSuccess, showError, showConfirmation } from '../../utils/alerts';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import './styles.css';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastAppointment?: string;
  appointmentsCount?: number;
  normalizedAvatarUrl?: string;
}

interface FilterOptions {
  search: string;
  sortBy: 'name' | 'createdAt' | 'lastAppointment' | 'appointmentsCount';
  sortOrder: 'asc' | 'desc';
  onlyActive: boolean;
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  
  // Paginação
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  
  // Filtro e ordenação
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    onlyActive: false
  });
  
  const { token, user } = useAuth();
  
  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
  }, [token, currentPage, filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Construir parâmetros para a API
      const params: any = {
        page: currentPage,
        limit,
        search: filters.search || undefined,
        sort: filters.sortBy,
        order: filters.sortOrder
      };
      
      if (filters.onlyActive) {
        params.active = true;
      }
      
      const response = await userAPI.getAllUsers(params);
      
      // Normalizar URLs de avatar
      const normalizedCustomers = response.users.map((customer: Customer) => ({
        ...customer,
        normalizedAvatarUrl: customer.avatar ? normalizeImageUrl(customer.avatar) : undefined
      }));
      
      setCustomers(normalizedCustomers);
      setTotalCustomers(response.total);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showError('Erro', 'Não foi possível carregar a lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1); // Resetar para a primeira página ao pesquisar
  };

  const handleSort = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleToggleActive = async (customer: Customer) => {
    try {
      await userAPI.toggleUserActive(customer._id, !customer.isActive);
      showSuccess('Sucesso', `Cliente ${customer.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      fetchCustomers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      showError('Erro', 'Não foi possível alterar o status do cliente.');
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    showConfirmation(
      'Excluir cliente',
      'Esta ação não poderá ser revertida. Todos os dados do cliente serão removidos. Deseja continuar?',
      'Sim, excluir',
      'Cancelar'
    ).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          await userAPI.deleteUser(customerId);
          showSuccess('Sucesso', 'Cliente excluído com sucesso!');
          fetchCustomers();
        } catch (error) {
          console.error('Erro ao excluir cliente:', error);
          showError('Erro', 'Não foi possível excluir o cliente.');
        }
      }
    });
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const formatPhone = (phone?: string) => {
    if (!phone) return '—';
    
    // Remover todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Formatação para número brasileiro
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    
    return phone; // Retornar original se não conseguir formatar
  };

  // Cálculo de paginação
  const totalPages = Math.ceil(totalCustomers / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="admin-customers-container">
      <div className="admin-header">
        <div className="admin-title">
          <Users size={24} />
          <h1>Gerenciamento de Clientes</h1>
        </div>
        
        <button className="btn btn-primary add-new-btn">
          <UserPlus size={18} />
          Adicionar Cliente
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou telefone" 
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-options">
          <button 
            className={`filter-btn ${filters.onlyActive ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, onlyActive: !prev.onlyActive }))}
          >
            <Filter size={16} />
            {filters.onlyActive ? 'Todos os clientes' : 'Apenas ativos'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>Nenhum cliente encontrado</h3>
          <p>Não há clientes registrados no sistema ou sua busca não retornou resultados.</p>
        </div>
      ) : (
        <>
          <div className="customers-table-container">
            <table className="customers-table">
              <thead>
                <tr>
                  <th className="avatar-column"></th>
                  <th 
                    className={`sortable ${filters.sortBy === 'name' ? filters.sortOrder : ''}`}
                    onClick={() => handleSort('name')}
                  >
                    Nome
                  </th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th 
                    className={`sortable ${filters.sortBy === 'createdAt' ? filters.sortOrder : ''}`}
                    onClick={() => handleSort('createdAt')}
                  >
                    Cadastro em
                  </th>
                  <th 
                    className={`sortable ${filters.sortBy === 'lastAppointment' ? filters.sortOrder : ''}`}
                    onClick={() => handleSort('lastAppointment')}
                  >
                    Último Agendamento
                  </th>
                  <th 
                    className={`sortable ${filters.sortBy === 'appointmentsCount' ? filters.sortOrder : ''}`}
                    onClick={() => handleSort('appointmentsCount')}
                  >
                    Total de Agendamentos
                  </th>
                  <th>Status</th>
                  <th className="actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer._id} onClick={() => handleViewDetails(customer)}>
                    <td className="avatar-column">
                      {customer.avatar ? (
                        <img 
                          src={customer.normalizedAvatarUrl || customer.avatar} 
                          alt={`${customer.name}`}
                          className="customer-avatar"
                          {...createImageFallbackHandler(customer.avatar)}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="name-column">
                      <div className="customer-name">
                        {customer.name}
                        {customer.role === 'admin' && (
                          <span className="admin-badge" title="Administrador">
                            <Star size={14} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{customer.email}</td>
                    <td>{formatPhone(customer.phone)}</td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>{customer.lastAppointment ? formatDate(customer.lastAppointment) : '—'}</td>
                    <td>{customer.appointmentsCount || 0}</td>
                    <td>
                      <span className={`status-badge ${customer.isActive ? 'active' : 'inactive'}`}>
                        {customer.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons" onClick={e => e.stopPropagation()}>
                        <button 
                          className="action-btn edit-btn" 
                          title="Editar cliente"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implementar edição
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn toggle-btn" 
                          title={customer.isActive ? 'Desativar cliente' : 'Ativar cliente'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(customer);
                          }}
                        >
                          {customer.isActive ? '🔒' : '🔓'}
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          title="Excluir cliente"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomer(customer._id);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              &laquo; Anterior
            </button>
            
            <div className="page-numbers">
              {pageNumbers.map(number => (
                <button
                  key={number}
                  className={`page-number ${currentPage === number ? 'active' : ''}`}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Próximo &raquo;
            </button>
          </div>
        </>
      )}

      {showDetailsModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="customer-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Cliente</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="customer-profile">
                <div className="profile-header">
                  {selectedCustomer.avatar ? (
                    <img 
                      src={selectedCustomer.normalizedAvatarUrl || selectedCustomer.avatar} 
                      alt={selectedCustomer.name}
                      className="profile-avatar"
                      {...createImageFallbackHandler(selectedCustomer.avatar)}
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="profile-info">
                    <h3>{selectedCustomer.name}</h3>
                    <span className={`status-badge ${selectedCustomer.isActive ? 'active' : 'inactive'}`}>
                      {selectedCustomer.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    {selectedCustomer.role === 'admin' && (
                      <span className="admin-badge-large">
                        <Star size={16} /> Administrador
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="detail-item">
                    <Mail size={18} />
                    <div>
                      <strong>Email</strong>
                      <p>{selectedCustomer.email}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <Phone size={18} />
                    <div>
                      <strong>Telefone</strong>
                      <p>{formatPhone(selectedCustomer.phone)}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <Clock size={18} />
                    <div>
                      <strong>Cliente desde</strong>
                      <p>{formatDate(selectedCustomer.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="customer-stats">
                  <div className="stat-card">
                    <h4>Total de Agendamentos</h4>
                    <p className="stat-value">{selectedCustomer.appointmentsCount || 0}</p>
                  </div>
                  
                  <div className="stat-card">
                    <h4>Último Agendamento</h4>
                    <p className="stat-value">
                      {selectedCustomer.lastAppointment ? formatDate(selectedCustomer.lastAppointment) : '—'}
                    </p>
                  </div>
                </div>
                
                <div className="customer-actions">
                  <button className="btn btn-secondary">
                    <Edit size={18} />
                    Editar Informações
                  </button>
                  
                  <button className="btn btn-primary">
                    Ver Histórico de Agendamentos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
