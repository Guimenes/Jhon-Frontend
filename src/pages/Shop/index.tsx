import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '../../services/products';
import type { Product } from '../../services/products';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import { FaFilter, FaStar, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './styles.css';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy, filterFeatured]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params: {
        category?: string;
        featured?: boolean;
        search?: string;
      } = {};

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (filterFeatured) {
        params.featured = true;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const data = await ProductService.getAllProducts(params);
      
      // Aplicar ordenação
      const sortedData = sortProducts(data, sortBy);
      setProducts(sortedData);
      
      // Extrair categorias únicas dos produtos
      const uniqueCategories = Array.from(
        new Set(data.map((product) => product.category))
      ).sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Não foi possível carregar os produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const sortProducts = (productList: Product[], sortType: string): Product[] => {
    const sorted = [...productList];
    switch (sortType) {
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceA - priceB;
        });
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceB - priceA;
        });
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted.sort((a, b) => {
          // Primeiro por destaque, depois por data mais recente
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSortBy('default');
    setFilterFeatured(false);
    setSearchTerm('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="shop-page-container">
      <div className="shop-header">
        <div className="shop-title">
          <h1>Nossos Produtos</h1>
          <p>Os melhores produtos para seu estilo</p>
        </div>

        <div className="shop-search">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
          
          <button 
            className="filter-toggle-button" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filtros
          </button>
        </div>
      </div>

      <div className={`shop-filters ${showFilters ? 'show' : ''}`}>
        <div className="filter-group">
          <label>Categoria:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas as Categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar por:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Relevância</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
          </select>
        </div>

        <div className="filter-group checkbox-filter">
          <input 
            type="checkbox" 
            id="featured-only" 
            checked={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.checked)}
          />
          <label htmlFor="featured-only">Apenas Produtos em Destaque</label>
        </div>

        <button className="reset-filters" onClick={handleResetFilters}>
          Limpar Filtros
        </button>
      </div>

      {isLoading ? (
        <div className="shop-loading">Carregando produtos...</div>
      ) : products.length === 0 ? (
        <div className="no-products-found">
          <h3>Nenhum produto encontrado</h3>
          <p>Tente alterar os filtros ou realizar uma nova busca.</p>
        </div>
      ) : (
        <div className="shop-products-grid">
          {products.map((product) => (
            <div key={product._id} className="shop-product-card">
              <Link to={`/shop/${product._id}`} className="shop-product-link">
                <div className="shop-product-image-container">
                  {product.image ? (
                    <img
                      src={normalizeImageUrl(product.image)}
                      alt={product.name}
                      className="shop-product-image"
                      onError={createImageFallbackHandler(product.image).onError}
                    />
                  ) : (
                    <div className="shop-product-no-image">
                      <span>Sem imagem</span>
                    </div>
                  )}
                  {product.featured && (
                    <div className="shop-product-featured">
                      <FaStar />
                    </div>
                  )}
                  {product.discountPrice && product.discountPrice < product.price && (
                    <div className="shop-product-discount">
                      {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                    </div>
                  )}
                </div>

                <div className="shop-product-info">
                  <h3 className="shop-product-name">{product.name}</h3>
                  <p className="shop-product-category">{product.category}</p>
                  
                  <div className="shop-product-price-container">
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <>
                        <span className="shop-product-original-price">{formatPrice(product.price)}</span>
                        <span className="shop-product-price">{formatPrice(product.discountPrice)}</span>
                      </>
                    ) : (
                      <span className="shop-product-price">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
              </Link>
              
              <button className="shop-add-to-cart-btn">
                Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
