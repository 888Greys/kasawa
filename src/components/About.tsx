import React from 'react';
import { Leaf, Shield, Truck, Star, Users, Award } from 'lucide-react';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Leaf className="h-8 w-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About Kasawa</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Premium Cannabis Products
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Kasawa is your trusted source for high-quality cannabis products. We're committed to providing 
              premium flowers, concentrates, edibles, and accessories with exceptional service and discretion.
            </p>
          </div>

          {/* Mission & Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Leaf className="w-6 h-6 text-primary-600 mr-2" />
                Our Mission
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                To provide the highest quality cannabis products while maintaining the highest standards 
                of safety, quality, and customer service. We believe in the therapeutic benefits of cannabis 
                and are committed to helping our customers find the right products for their needs.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Star className="w-6 h-6 text-primary-600 mr-2" />
                Our Values
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Quality and safety first</li>
                <li>• Customer satisfaction</li>
                <li>• Discretion and privacy</li>
                <li>• Education and transparency</li>
                <li>• Community responsibility</li>
              </ul>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Assured</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All products are lab-tested and meet the highest quality standards
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Truck className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Fast Delivery</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Discreet and secure delivery to your doorstep
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Support</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Knowledgeable team ready to help you find the perfect products
              </p>
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Our Product Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h5 className="font-medium text-primary-800 dark:text-primary-200 mb-2">Flowers</h5>
                <p className="text-sm text-primary-600 dark:text-primary-300">
                  Premium cannabis flowers from top cultivators
                </p>
              </div>
              <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
                <h5 className="font-medium text-secondary-800 dark:text-secondary-200 mb-2">Concentrates</h5>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  High-potency extracts and concentrates
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Edibles</h5>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  Delicious infused treats and beverages
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Accessories</h5>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  Premium smoking and storage accessories
                </p>
              </div>
            </div>
          </div>

          {/* Awards & Recognition */}
          <div className="text-center p-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl text-white">
            <Award className="w-12 h-12 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Award-Winning Service</h4>
            <p className="text-primary-100">
              Recognized for excellence in customer service and product quality
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-center space-y-4">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Get in Touch</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Have questions? Our team is here to help you find the perfect products.
            </p>
            <div className="flex justify-center space-x-6">
              <button className="btn-primary">
                Contact Support
              </button>
              <button className="btn-secondary">
                View Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 