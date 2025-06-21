import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Star, Heart, Share2, ZoomIn } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || !product) return null;

  // Use product images array if available, otherwise fall back to single image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pr-4">{product.name}</h2>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Enhanced Image Gallery */}
            <div className="space-y-4">
              <div className="relative">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={productImages[currentImageIndex]}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isZoomed ? 'scale-110' : 'scale-100'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                  
                  {/* Zoom Indicator */}
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 bg-opacity-80 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                  >
                    <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  
                  {/* Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 bg-opacity-80 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 bg-opacity-80 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs sm:text-sm">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Thumbnail Navigation */}
              {productImages.length > 1 && (
                <div className="space-y-2">
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-primary-500 ring-2 ring-primary-200'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Gallery Instructions */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Use arrow keys or click thumbnails to navigate • Click image to zoom
                  </p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Price and Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">${product.price}</span>
                  {product.featured && (
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">4.8 (24 reviews)</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Description</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Specs */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Product Details</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Category</span>
                    <p className="font-medium text-gray-900 dark:text-white capitalize text-sm sm:text-base">{product.category}</p>
                  </div>
                  {product.thcContent && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">THC Content</span>
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{product.thcContent}%</p>
                    </div>
                  )}
                  {product.cbdContent && product.cbdContent > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">CBD Content</span>
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{product.cbdContent}%</p>
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Availability</span>
                    <p className={`font-medium text-sm sm:text-base ${product.inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full btn-primary py-3 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal; 