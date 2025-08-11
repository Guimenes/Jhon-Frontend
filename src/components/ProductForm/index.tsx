import React, { useState, useEffect } from 'react';
import type { Product } from '../../services/products';
import './styles.css';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { createImageFallbackHandler } from '../../utils/imageUtils';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  
  const categories = [
    'Pomadas',
    'Shampoos',
    'Condicionadores',
    'Cremes',
    'Gel',
    'Óleos',
    'Acessórios',
    'Lâminas',
    'Perfumes',
    'Outros'
  ];

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price?.toString() || '');
      setDiscountPrice(product.discountPrice?.toString() || '');
      setCategory(product.category || '');
      setStock(product.stock?.toString() || '0');
      setIsActive(product.isActive);
      setFeatured(product.featured);
      
      if (product.image) {
        const normalizedUrl = normalizeImageUrl(product.image);
        setImagePreview(normalizedUrl || null);
      } else {
        setImagePreview(null);
      }
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      // Criar URL para preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setImagePreview(event.target.result as string);
          setRemoveImage(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      category,
      stock: stock ? parseInt(stock) : 0,
      isActive,
      featured,
      image: image || undefined,
      removeImage
    };
    
    await onSubmit(formData);
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Nome do Produto*</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nome do produto"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Categoria*</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Preço (R$)*</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="0.00"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="discountPrice">Preço com Desconto (R$)</label>
          <input
            id="discountPrice"
            type="number"
            min="0"
            step="0.01"
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="stock">Estoque</label>
          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <div className="checkbox-wrapper">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive">Produto Ativo</label>
          </div>
          
          <div className="checkbox-wrapper">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <label htmlFor="featured">Produto em Destaque</label>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Descrição*</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="Descreva o produto..."
        ></textarea>
      </div>
      
      <div className="form-group image-upload-group">
        <label>Imagem do Produto</label>
        <div className="image-upload-container">
          <div className="image-preview-container">
            {imagePreview && !removeImage ? (
              <div className="image-preview">
                <img 
                  src={imagePreview} 
                  alt="Preview do produto" 
                  onError={createImageFallbackHandler(imagePreview).onError}
                />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="no-image-preview">
                <span>Sem imagem</span>
              </div>
            )}
          </div>
          
          <div className="image-upload-actions">
            <label className="file-input-label" htmlFor="productImage">
              Escolher Imagem
            </label>
            <input
              id="productImage"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="file-input"
            />
            <span className="image-help-text">JPEG, PNG, WebP ou GIF. Max 5MB.</span>
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : product ? 'Atualizar Produto' : 'Criar Produto'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
