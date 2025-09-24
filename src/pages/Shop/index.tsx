import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '../../services/products';
import type { Product } from '../../services/products';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingBag, 
  Eye,
  Grid,
  List,
  Package,
  TrendingUp,
  Sparkles,
  X,
  ArrowUpDown,
  Tag
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    loadProducts();
    // Carregar produtos curtidos do localStorage
    const liked = localStorage.getItem('likedProducts');
    if (liked) {
      setLikedProducts(new Set(JSON.parse(liked)));
    }
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
    setPriceRange({ min: 0, max: 1000 });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const toggleLike = (productId: string) => {
    const newLiked = new Set(likedProducts);
    if (newLiked.has(productId)) {
      newLiked.delete(productId);
    } else {
      newLiked.add(productId);
    }
    setLikedProducts(newLiked);
    localStorage.setItem('likedProducts', JSON.stringify(Array.from(newLiked)));
  };

  const addToCart = (product: Product) => {
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const calculateDiscount = (originalPrice: number, discountPrice: number) => {
    return Math.round((1 - discountPrice / originalPrice) * 100);
  };

  // Filtrar produtos por faixa de preço
  const filteredProducts = products.filter(product => {
    const price = product.discountPrice || product.price;
    return price >= priceRange.min && price <= priceRange.max;
  });

  // Stats para o header
  const stats = {
    totalProducts: products.length,
    categories: categories.length,
    featured: products.filter(p => p.featured).length
  };

  return (
    <div className="shop-page-modern">
      {/* Hero Section */}
      <div className="shop-hero">
        <div className="hero-content">
          <span className="hero-badge">
            <Package size={16} />
            LOJA EXCLUSIVA
          </span>
          <h1 className="hero-title">
            Nossa <span className="highlight-gold">Coleção Premium</span>
          </h1>
          <p className="hero-subtitle">
            Produtos selecionados para elevar seu estilo ao próximo nível
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="shop-stats-bar">
        <div className="shop-stat-item">
          <Sparkles className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">{stats.totalProducts}</span>
            <span className="stat-label">Produtos</span>
          </div>
        </div>
        <div className="stat-divider" />
        <div className="shop-stat-item">
          <Tag className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">{stats.categories}</span>
            <span className="stat-label">Categorias</span>
          </div>
        </div>
        <div className="stat-divider" />
        <div className="shop-stat-item">
          <Star className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">{stats.featured}</span>
            <span className="stat-label">Destaques</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="shop-main-container">
        {/* Top Bar */}
        <div className="shop-top-bar">
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form-modern">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-modern"
              />
              <button type="submit" className="search-submit">
                Buscar
              </button>
            </form>
          </div>

          <div className="controls-section">
            <button 
              className={`filter-button-modern ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filtros</span>
              {showFilters && <X size={16} />}
            </button>

            <div className="view-switcher-modern">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Visualização em grade"
              >
                <Grid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="Visualização em lista"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className={`filters-panel-modern ${showFilters ? 'show' : ''}`}>
          <div className="filters-grid">
            <div className="filter-section">
              <label className="filter-label">
                <Tag size={16} />
                Categoria
              </label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas as Categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <label className="filter-label">
                <ArrowUpDown size={16} />
                Ordenar por
              </label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="default">Relevância</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name-asc">Nome (A-Z)</option>
                <option value="name-desc">Nome (Z-A)</option>
              </select>
            </div>

            <div className="filter-section">
              <label className="filter-label">
                <TrendingUp size={16} />
                Faixa de Preço
              </label>
              <div className="price-range-inputs">
                <input 
                  type="number" 
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="price-input"
                />
                <span className="price-separator">-</span>
                <input 
                  type="number" 
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="price-input"
                />
              </div>
            </div>

            <div className="filter-section checkbox-section">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.checked)}
                  className="filter-checkbox"
                />
                <span className="checkbox-custom"></span>
                <Star size={16} />
                Apenas Destaques
              </label>
            </div>
          </div>

          <button className="reset-filters-btn" onClick={handleResetFilters}>
            <X size={16} />
            Limpar Filtros
          </button>
        </div>

        {/* Products Section */}
        {isLoading ? (
          <div className="shop-loading-modern">
            <div className="loading-spinner" />
            <p>Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products-modern">
            <Package size={64} className="no-products-icon" />
            <h3>Nenhum produto encontrado</h3>
            <p>Tente ajustar os filtros ou realizar uma nova busca</p>
            <button onClick={handleResetFilters} className="btn-try-again">
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className={`products-container ${viewMode}`}>
            {filteredProducts.map((product) => (
              <div key={product._id} className={`product-card-modern ${viewMode}`}>
                {/* Badges */}
                <div className="product-badges">
                  {product.featured && (
                    <span className="badge-featured">
                      <Star size={14} />
                      DESTAQUE
                    </span>
                  )}
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span className="badge-discount">
                      -{calculateDiscount(product.price, product.discountPrice)}%
                    </span>
                  )}
                </div>

                {/* Like Button */}
                <button 
                  className={`product-like-btn ${likedProducts.has(product._id) ? 'liked' : ''}`}
                  onClick={() => toggleLike(product._id)}
                  aria-label="Favoritar"
                >
                  <Heart size={20} />
                </button>

                {/* Product Image */}
                <Link to={`/shop/${product._id}`} className="product-image-link">
                  <div className="product-image-container">
                    {product.image ? (
                      <img
                        src={normalizeImageUrl(product.image)}
                        alt={product.name}
                        className="product-image"
                        onError={createImageFallbackHandler(product.image).onError}
                      />
                    ) : (
                      <div className="product-no-image">
                        <Package size={40} />
                        <span>Sem imagem</span>
                      </div>
                    )}
                    
                    <div className="product-overlay">
                      <button className="overlay-btn">
                        <Eye size={20} />
                        <span>Ver Detalhes</span>
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  
                  <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="star-icon" />
                    ))}
                    <span className="rating-count">(4.8)</span>
                  </div>

                  <div className="product-price-section">
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <>
                        <span className="price-original">{formatPrice(product.price)}</span>
                        <span className="price-current">{formatPrice(product.discountPrice)}</span>
                      </>
                    ) : (
                      <span className="price-current">{formatPrice(product.price)}</span>
                    )}
                  </div>

                  <button 
                    className="btn-add-to-cart"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingBag size={18} />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;