import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useProducts } from './hooks/useProducts';
import Header from './components/Header';
import ProductFeed from './components/ProductFeed';
import Sidebar from './components/Sidebar';
import Cart from './components/Cart';
import Orders from './components/Orders';
import About from './components/About';
import Contact from './components/Contact';
import SearchBar from './components/SearchBar';
import FeaturedBanner from './components/FeaturedBanner';
import ProductModal from './components/ProductModal';
import DarkModeToggle from './components/DarkModeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import { Product } from './types';
import './index.css';

function App() {
  const { loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { cartItems, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartItemCount } = useCart();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleAddToCart = async (product: Product) => {
    const success = await addToCart(product.id, 1);
    if (success) {
      console.log('Product added to cart successfully');
    }
  };

  // Get featured products for banner
  const featuredProducts = products.filter(product => product.featured);

  if (authLoading || productsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header 
        cartItemCount={getCartItemCount()}
        onCartClick={() => setShowCart(true)}
        onOrdersClick={() => setShowOrders(true)}
        onAboutClick={() => setShowAbout(true)}
        onContactClick={() => setShowContact(true)}
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
              onSearch={() => {}}
              onFilterChange={() => {}}
            />

            {/* Product Feed */}
            <ProductFeed
              selectedCategory={selectedCategory}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
            />
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Cart 
              items={cartItems}
              total={getCartTotal()}
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
        onAddToCart={handleAddToCart}
      />

      {/* Orders Modal */}
      <Orders
        isOpen={showOrders}
        onClose={() => setShowOrders(false)}
      />

      {/* About Modal */}
      <About
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      {/* Contact Modal */}
      <Contact
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </div>
  );
}

export default App; 