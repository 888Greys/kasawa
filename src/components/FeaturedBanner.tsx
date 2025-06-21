import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface FeaturedBannerProps {
  featuredProducts: Product[];
  onProductClick: (product: Product) => void;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ featuredProducts, onProductClick }) => {
  if (featuredProducts.length === 0) return null;

  return (
    <div className="card mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
        </div>
        <span className="text-sm text-gray-600">Premium selection</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredProducts.slice(0, 3).map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick(product)}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-primary-600">${product.price}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedBanner; 