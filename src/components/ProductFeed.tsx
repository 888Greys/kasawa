import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductFeedProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

const ProductFeed: React.FC<ProductFeedProps> = ({ products, onAddToCart, onProductClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
        <span className="text-gray-500 dark:text-gray-400">{products.length} items</span>
      </div>
      
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default ProductFeed; 