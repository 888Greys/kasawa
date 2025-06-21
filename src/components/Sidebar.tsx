import React, { useState } from 'react';
import { 
  Home, 
  Flower, 
  Droplets, 
  Cookie, 
  Wrench, 
  Package, 
  User, 
  LogOut, 
  LogIn,
  ShoppingBag,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Order } from '../services/orderService';
import AuthModal from './AuthModal';

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  recentOrders?: Order[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedCategory, 
  onCategoryChange,
  recentOrders = []
}) => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Products', icon: Home },
    { id: 'flower', name: 'Flower', icon: Flower },
    { id: 'concentrate', name: 'Concentrates', icon: Droplets },
    { id: 'edible', name: 'Edibles', icon: Cookie },
    { id: 'accessory', name: 'Accessories', icon: Wrench },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'processing': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'shipped': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'delivered': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Member
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Guest User
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign in for full access
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Orders - Only show for logged in users */}
      {user && recentOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Recent Orders
          </h3>
          <div className="space-y-3">
            {recentOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {order.order_number}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>${order.total.toFixed(2)}</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Offers */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <Star className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Special Offer</h3>
        </div>
        <p className="text-xs opacity-90 mb-3">
          Get 15% off your first order when you sign up!
        </p>
        {!user && (
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
          >
            Sign Up Now
          </button>
        )}
      </div>

      {/* Quick Stats - Only show for logged in users */}
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {recentOrders.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {recentOrders.filter(o => o.status === 'delivered').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Sidebar; 