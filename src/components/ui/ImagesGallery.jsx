import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Package, Eye } from "lucide-react";

// Reusable ImageGallery Component
const ImagesGallery = ({ images = [], className = "" }) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openFullscreen = (index) => {
    setCurrentImageIndex(index);
    setShowFullscreen(true);
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center ${className}`}
      >
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <>
      {/* Image Grid */}
      <div className={`grid gap-3 ${className}`}>
        {images.length === 1 ? (
          <div
            className="relative group cursor-pointer"
            onClick={() => openFullscreen(0)}
          >
            <img
              src={images[0]}
              alt="Product image"
              className="w-full h-64 sm:h-80 object-cover rounded-lg transition-transform"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
              <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <>
            {/* Main Image */}
            <div
              className="relative group cursor-pointer"
              onClick={() => openFullscreen(0)}
            >
              <img
                src={images[0]}
                alt="Main product image"
                className="w-full h-64 sm:h-80 object-cover rounded-lg transition-transform"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.slice(1).map((image, index) => (
                <div
                  key={index + 1}
                  className="relative group cursor-pointer"
                  onClick={() => openFullscreen(index + 1)}
                >
                  <img
                    src={image}
                    alt={`Product image ${index + 2}`}
                    className="w-full h-20 sm:h-24 object-cover rounded-lg transition-transform"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 rounded-lg">
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div className="max-w-4xl max-h-full flex flex-col items-center">
            <img
              src={images[currentImageIndex]}
              alt={`Product image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Image Counter */}
            <div className="text-white mt-4 text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-primary-500 opacity-100"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImagesGallery;
