import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Star, Leaf } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductClick }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'flower':
        return <Leaf className="h-4 w-4 text-green-600" />;
      case 'concentrate':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'edible':
        return <span className="text-sm">🍪</span>;
      case 'accessory':
        return <span className="text-sm">🔧</span>;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on the add to cart button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onProductClick(product);
  };

  return (
    <div 
      className="card hover:shadow-md transition-shadow duration-200 cursor-pointer dark:bg-gray-800 dark:border-gray-700"
      onClick={handleCardClick}
    >
      <div className="flex space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>
            
            {/* Featured Badge - Now properly positioned */}
            {product.featured && (
              <div className="flex-shrink-0 ml-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  Featured
                </span>
              </div>
            )}
          </div>

          {/* Category and THC/CBD Info */}
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              {getCategoryIcon(product.category)}
              <span>{getCategoryLabel(product.category)}</span>
            </div>
            
            {product.thcContent && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                THC: {product.thcContent}%
              </span>
            )}
            
            {product.cbdContent && product.cbdContent > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                CBD: {product.cbdContent}%
              </span>
            )}
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${product.price}
              </span>
              {!product.inStock && (
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Out of Stock
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={!product.inStock}
              className="btn-primary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 