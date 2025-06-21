import React from 'react';
import { ShoppingCart, Leaf } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Kasawa</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Products
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Contact
            </a>
          </nav>

          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 