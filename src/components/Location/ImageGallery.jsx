import { Grid3x3 } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

// Helper to build absolute image URL
const getImageUrl = (image) => {
  if (!image) return null;

  // Extract URL string
  let url = typeof image === 'string' ? image : image.url;
  if (!url) return null;

  // If already absolute, use it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Build absolute URL from base
  let base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

  // Remove '/api' from base if present (images usually served from root)
  if (base.includes('/api')) {
    base = base.split('/api')[0];
  }

  // Ensure path starts with a slash
  const path = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${base}${path}`;

  // Log for debugging (remove in production)
  console.log('Image URL constructed:', fullUrl);
  return fullUrl;
};

const ImageGallery = ({ locationId, images }) => {
  const navigate = useNavigate();
  const { mainImage, otherImages, allImages } = images;

  const remainingImagesCount = useMemo(
    () => Math.max(0, allImages.length - 5),
    [allImages.length]
  );

  const handleImageClick = useCallback(
    (imageIndex) => {
      navigate(`/locations-details/${locationId}/photos`, {
        state: { images: allImages, currentIndex: imageIndex },
      });
    },
    [navigate, locationId, allImages]
  );

  const handleShowAllPhotos = useCallback(() => {
    navigate(`/locations-details/${locationId}/photos`, {
      state: { images: allImages, currentIndex: 0 },
    });
  }, [navigate, locationId, allImages]);

  // Enhanced error handler
  const handleImageError = useCallback((e) => {
    console.error('Failed to load image:', e.target.src);
    e.target.src =
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }, []);

  return (
    <div className="relative mb-4 md:mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-1 sm:gap-2 h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] rounded-xl overflow-hidden">
        {/* Main image */}
        <div className="col-span-2 row-span-2 bg-gray-200 animate-fadeIn">
          {mainImage ? (
            <img
              src={getImageUrl(mainImage)}
              alt="Property main view"
              className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all duration-200"
              onClick={() => {
                const mainImageIndex = allImages.findIndex(
                  (img) => img === mainImage
                );
                handleImageClick(mainImageIndex >= 0 ? mainImageIndex : 0);
              }}
              onError={handleImageError}
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Grid3x3 className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Main Image</p>
                <p className="text-xs">Not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Other images */}
        {[0, 1, 2, 3].map((index) => {
          const imageObj = otherImages?.[index] || allImages?.[index + 1];
          const imageUrl = getImageUrl(imageObj);

          return (
            <div
              key={index}
              className="hidden sm:block col-span-1 row-span-1 bg-gray-200 animate-fadeIn"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Property view ${index + 2}`}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all duration-200"
                  onClick={() => {
                    const imageIndex = allImages.findIndex(
                      (img) => img === imageObj
                    );
                    handleImageClick(
                      imageIndex >= 0 ? imageIndex : index + 1
                    );
                  }}
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Grid3x3 className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Image {index + 2}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show all photos button */}
      {remainingImagesCount > 0 && (
        <button
          onClick={handleShowAllPhotos}
          className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center gap-2 font-medium text-xs sm:text-sm hover:bg-gray-50 shadow-lg border border-gray-200 z-10 animate-fadeIn"
          style={{ animationDelay: '500ms' }}
        >
          <Grid3x3 size={16} />
          Show all {allImages.length} photos
        </button>
      )}
    </div>
  );
};

export default React.memo(ImageGallery);