import React, { useState } from 'react';
import { ShoppingCart, Leaf, Package, Menu, X } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onOrdersClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, onOrdersClick, onAboutClick, onContactClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Kasawa</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button className="text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </button>
            <button className="text-gray-600 hover:text-primary-600 transition-colors">
              Products
            </button>
            <button
              onClick={onAboutClick}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              About
            </button>
            <button
              onClick={onContactClick}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Orders Button */}
            <button
              onClick={onOrdersClick}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="My Orders"
            >
              <Package className="h-6 w-6" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <button className="text-left text-gray-600 hover:text-primary-600 transition-colors px-4 py-2">
                Home
              </button>
              <button className="text-left text-gray-600 hover:text-primary-600 transition-colors px-4 py-2">
                Products
              </button>
              <button
                onClick={() => {
                  onAboutClick();
                  setMobileMenuOpen(false);
                }}
                className="text-left text-gray-600 hover:text-primary-600 transition-colors px-4 py-2"
              >
                About
              </button>
              <button
                onClick={() => {
                  onContactClick();
                  setMobileMenuOpen(false);
                }}
                className="text-left text-gray-600 hover:text-primary-600 transition-colors px-4 py-2"
              >
                Contact
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 