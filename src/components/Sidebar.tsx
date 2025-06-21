import React, { useState } from 'react';
import { Home, Leaf, Star, Cookie, Wrench, User, Package, Clock, LogIn, Gift, Heart, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategoryChange }) => {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Products', icon: <Home className="h-5 w-5" /> },
    { id: 'flower', name: 'Flower', icon: <Leaf className="h-5 w-5" /> },
    { id: 'concentrate', name: 'Concentrates', icon: <Star className="h-5 w-5" /> },
    { id: 'edible', name: 'Edibles', icon: <Cookie className="h-5 w-5" /> },
    { id: 'accessory', name: 'Accessories', icon: <Wrench className="h-5 w-5" /> },
  ];

  const recentOrders = [
    { id: '1', name: 'OG Kush Premium', date: '2 days ago', status: 'Delivered' },
    { id: '2', name: 'Live Resin Concentrate', date: '1 week ago', status: 'Delivered' },
  ];

  const specialOffers = [
    { id: '1', title: 'First Order', discount: '20% OFF', code: 'WELCOME20' },
    { id: '2', title: 'Free Shipping', discount: 'On orders $100+', code: 'FREESHIP' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <div className="card">
        {isAuthenticated && profile ? (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Welcome Back</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.username || user?.email?.split('@')[0] || 'Premium Member'}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <Package className="h-5 w-5 text-primary-600 dark:text-primary-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                <p className="font-semibold text-gray-900 dark:text-white">12</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
                <p className="font-semibold text-gray-900 dark:text-white">1,250</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>Wishlist</span>
              </button>
              <button className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center space-x-1">
                <Settings className="h-3 w-3" />
                <span>Settings</span>
              </button>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full mt-3 btn-secondary text-xs py-2 flex items-center justify-center space-x-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Welcome to Kasawa</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to access your account</p>
            </div>
            
            <button 
              onClick={() => setShowAuthModal(true)}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In / Register</span>
            </button>
          </>
        )}
      </div>

      {/* Special Offers */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Special Offers</h3>
        </div>
        
        <div className="space-y-3">
          {specialOffers.map((offer) => (
            <div key={offer.id} className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-3 border border-primary-200 dark:border-primary-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">{offer.title}</h4>
                <span className="text-xs bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                  {offer.discount}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Use code: <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">{offer.code}</span></p>
              <button className="w-full btn-secondary text-xs py-1">
                Copy Code
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {isAuthenticated && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
          </div>
          
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{order.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.date}</p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
        
        <nav className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category.icon}
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Additional Info */}
      <div className="card">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">About Kasawa</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Premium cannabis products delivered to your door. Quality guaranteed.
        </p>
        
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Lab tested</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Discrete shipping</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>24/7 support</span>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Sidebar; 