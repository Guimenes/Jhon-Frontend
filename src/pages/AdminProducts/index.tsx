import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/products';
import type { Product, CreateProductData, UpdateProductData } from '../../services/products';
import ProductForm from '../../components/ProductForm';
import './styles.css';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaStar, FaRegStar } from 'react-icons/fa';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await ProductService.getAllProductsAdmin();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar lista de produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (data: CreateProductData) => {
    setIsLoading(true);
    try {
      await ProductService.createProduct(data);
      toast.success('Produto criado com sucesso!');
      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (id: string, data: UpdateProductData) => {
    setIsLoading(true);
    try {
      await ProductService.updateProduct(id, data);
      toast.success('Produto atualizado com sucesso!');
      setIsModalOpen(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      await ProductService.deleteProduct(id);
      toast.success('Produto excluído com sucesso!');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    setIsLoading(true);
    try {
      await ProductService.toggleProductActive(product._id, !product.isActive);
      toast.success(`Produto ${!product.isActive ? 'ativado' : 'desativado'} com sucesso!`);
      loadProducts();
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      toast.error('Erro ao alterar status do produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    setIsLoading(true);
    try {
      await ProductService.toggleProductFeatured(product._id, !product.featured);
      toast.success(`Produto ${!product.featured ? 'destacado' : 'removido dos destaques'} com sucesso!`);
      loadProducts();
    } catch (error) {
      console.error('Erro ao alterar destaque do produto:', error);
      toast.error('Erro ao alterar destaque do produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const openNewProductModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <h1>Gerenciar Produtos</h1>
        <button className="btn btn-primary" onClick={openNewProductModal}>
          Adicionar Novo Produto
        </button>
      </div>

      {isLoading && !isModalOpen ? (
        <div className="loading-spinner">Carregando...</div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Desconto</th>
                <th>Categoria</th>
                <th>Estoque</th>
                <th>Status</th>
                <th>Destaque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-products">
                    Nenhum produto cadastrado
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className={!product.isActive ? 'inactive-product' : ''}>
                    <td className="product-image-cell">
                      {product.image ? (
                        <img 
                          src={normalizeImageUrl(product.image)} 
                          alt={product.name} 
                          className="product-thumbnail"
                          onError={createImageFallbackHandler(product.image).onError}
                        />
                      ) : (
                        <div className="no-image">Sem imagem</div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.discountPrice ? formatPrice(product.discountPrice) : '-'}</td>
                    <td>{product.category}</td>
                    <td>{product.stock || 0}</td>
                    <td>
                      <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <span className={`featured-badge ${product.featured ? 'featured' : ''}`}>
                        {product.featured ? 'Destaque' : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="product-actions">
                        <button 
                          className="icon-button edit" 
                          onClick={() => handleEditClick(product)}
                          title="Editar produto"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="icon-button delete" 
                          onClick={() => handleDeleteClick(product)}
                          title="Excluir produto"
                        >
                          <FaTrash />
                        </button>
                        <button 
                          className={`icon-button ${product.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleActive(product)}
                          title={product.isActive ? 'Desativar produto' : 'Ativar produto'}
                        >
                          {product.isActive ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <button 
                          className={`icon-button ${product.featured ? 'unfeatured' : 'featured'}`}
                          onClick={() => handleToggleFeatured(product)}
                          title={product.featured ? 'Remover destaque' : 'Destacar produto'}
                        >
                          {product.featured ? <FaStar /> : <FaRegStar />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para adicionar/editar produto */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
              <button 
                className="close-button" 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProduct(null);
                }}
              >
                &times;
              </button>
            </div>
            <ProductForm 
              product={selectedProduct} 
              onSubmit={selectedProduct 
                ? (data) => handleUpdateProduct(selectedProduct._id, data) 
                : handleCreateProduct
              }
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && productToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button 
                className="close-button" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
              >
                &times;
              </button>
            </div>
            <div className="delete-confirmation">
              <p>Tem certeza que deseja excluir o produto <strong>{productToDelete.name}</strong>?</p>
              <p>Esta ação não pode ser desfeita.</p>
              
              <div className="delete-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteProduct(productToDelete._id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
