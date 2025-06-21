import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: fetchProducts };
};

export const useProductsByCategory = (category: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductsByCategory(category);
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products by category:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchProductsByCategory();
    }
  }, [category]);

  return { products, loading, error, refetch: fetchProductsByCategory };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getFeaturedProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch featured products');
      console.error('Error fetching featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return { products, loading, error, refetch: fetchFeaturedProducts };
};

export const useProductSearch = (query: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async () => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productService.searchProducts(query);
      setProducts(data);
    } catch (err) {
      setError('Failed to search products');
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query]);

  return { products, loading, error };
}; 