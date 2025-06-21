import React, { useState, useMemo } from 'react';
import { products } from './data/products';
import { Product, CartItem } from './types';
import Header from './components/Header';
import ProductFeed from './components/ProductFeed';
import Sidebar from './components/Sidebar';
import Cart from './components/Cart';
import SearchBar from './components/SearchBar';
import FeaturedBanner from './components/FeaturedBanner';
import ProductModal from './components/ProductModal';
import DarkModeToggle from './components/DarkModeToggle';

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 200] as [number, number],
    thcRange: [0, 30] as [number, number],
    category: 'all',
    inStock: false,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Get featured products for banner
  const featuredProducts = products.filter(product => product.featured);
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header 
        cartItemCount={cart.length}
        onCartClick={() => setShowCart(true)}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
              <DarkModeToggle />
            </div>
            <Sidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Banner */}
            <FeaturedBanner
              featuredProducts={featuredProducts}
              onProductClick={handleProductClick}
            />

            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />

            {/* Product Feed */}
            <ProductFeed
              selectedCategory={selectedCategory}
              onAddToCart={addToCart}
              onProductClick={handleProductClick}
            />
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Cart
              items={cart}
              total={cartTotal}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              isOpen={showCart}
              onClose={() => setShowCart(false)}
            />
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddToCart={addToCart}
      />
    </div>
  );
}

export default App; 