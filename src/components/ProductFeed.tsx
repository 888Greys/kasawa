import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { useProducts, useProductsByCategory } from '../hooks/useProducts';
import { products as staticProducts } from '../data/products';

interface ProductFeedProps {
  selectedCategory: string;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

const ProductFeed: React.FC<ProductFeedProps> = ({ 
  selectedCategory, 
  onAddToCart, 
  onProductClick 
}) => {
  // Use Supabase hooks with fallback to static data
  const { products: allProducts, loading: allLoading, error: allError } = useProducts();
  const { products: categoryProducts, loading: categoryLoading, error: categoryError } = useProductsByCategory(selectedCategory);

  // Determine which data to use
  const isAllCategory = selectedCategory === 'all';
  const products = isAllCategory ? allProducts : categoryProducts;
  const loading = isAllCategory ? allLoading : categoryLoading;
  const error = isAllCategory ? allError : categoryError;

  // Fallback to static data if Supabase is not configured
  const displayProducts = products.length > 0 ? products : staticProducts.filter(p => 
    isAllCategory ? true : p.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
          <LoadingSpinner />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
          <span className="text-gray-500 dark:text-gray-400">{displayProducts.length} items</span>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            Using offline data. Connect to Supabase for real-time updates.
          </p>
        </div>
        
        <div className="space-y-4">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
        <span className="text-gray-500 dark:text-gray-400">{displayProducts.length} items</span>
      </div>
      
      <div className="space-y-4">
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        ))}
      </div>
      
      {displayProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default ProductFeed; 