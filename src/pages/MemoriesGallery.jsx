import React, { useState, useEffect } from 'react';
import { MapPin, Filter, X, Heart, Share2, ZoomIn, Image, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define the primary color for consistency
const PRIMARY_COLOR_CLASS = 'text-[#008DDA]';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

const MemoriesGallery = () => {
  const [locations, setLocations] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLimit, setShowLimit] = useState(12);
  const [failedImages, setFailedImages] = useState(new Set()); // Track failed image loads

  // Function to construct proper image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // Try different possible image path properties
    const path = image.fullUrl || image.url || image.path || image.webpPath || image.src;
    
    if (!path) {
      console.warn('No image path found:', image);
      return null;
    }
    
    // If it's already a full URL, use it as is
    if (path.startsWith('http')) {
      return path;
    }
    
    // If it's a relative path starting with /, construct full URL
    if (path.startsWith('/')) {
      return `${API_BASE_URL}${path}`;
    }
    
    // If it's just a filename, construct path
    return `${API_BASE_URL}/uploads/${path}`;
  };

  // Fetch locations and their images
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFailedImages(new Set()); // Reset failed images
        
        const locationsResponse = await axios.get(`${API_BASE_URL}/locations`);
        const locationsData = locationsResponse.data;
        setLocations(locationsData);

        const imagesPromises = locationsData.map(async (location) => {
          try {
            const imagesResponse = await axios.get(`${API_BASE_URL}/locations/${location._id}`);
            const images = imagesResponse.data.images || [];
            
            return images.map(img => ({
              ...img,
              locationId: location._id,
              locationName: location.name,
              // Don't pre-process URL here, we'll handle it in getImageUrl
            }));
          } catch (imgError) {
            console.error(`Error fetching images for location ${location._id}:`, imgError);
            return [];
          }
        });

        const nestedImages = await Promise.all(imagesPromises);
        const images = nestedImages.flat().filter(img => img);
        
        console.log('Total images loaded:', images.length);
        if (images.length > 0) {
          console.log('Sample image data:', images[0]);
        }
        
        setAllImages(images);
        setFilteredImages(images.slice(0, showLimit));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load memories gallery. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter images when location changes or showLimit changes
  useEffect(() => {
    let imagesToFilter = allImages;

    if (selectedLocation !== 'all') {
      imagesToFilter = allImages.filter(img => img.locationId === selectedLocation);
    }

    setFilteredImages(imagesToFilter.slice(0, showLimit));
  }, [selectedLocation, allImages, showLimit]);

  // Handle location filter change
  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId);
    setShowLimit(12);
  };

  // Handle image load error
  const handleImageError = (imageId, imageUrl) => {
    console.error(`Failed to load image: ${imageUrl}`);
    setFailedImages(prev => new Set([...prev, imageId]));
  };

  const loadMore = () => {
    setShowLimit(prevLimit => prevLimit + 12);
  };

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };
  
  // Loading and Error States
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading beautiful memories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-xl text-red-600 p-8 bg-white rounded-xl shadow-lg border border-red-200">{error}</div>
      </div>
    );
  }

  const hasMoreToLoad = filteredImages.length < (selectedLocation === 'all' 
    ? allImages.length 
    : allImages.filter(img => img.locationId === selectedLocation).length
  );
  
  const totalImageCount = selectedLocation === 'all' 
    ? allImages.length 
    : allImages.filter(img => img.locationId === selectedLocation).length;

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen font-inter">
        
        {/* Header Section */}
        <div className="bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-gray-100 shadow-sm">
          <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl text-gray-900 tracking-tight">
              Memories Gallery
            </h1>
            <p className="mt-4 text-sm md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore the beautiful moments shared by our guests at our exclusive locations.
            </p>
          </header>
        </div>
        
        {/* Gallery Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          
          {/* Location Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            
            <button
              onClick={() => handleLocationChange('all')}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 shadow-md ${
                selectedLocation === 'all'
                  ? 'bg-[#008DDA] text-white shadow-blue-300/50 transform scale-[1.03]'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-1" />
              All Memories ({allImages.length})
            </button>
            
            {locations.map((location) => (
              <button
                key={location._id}
                onClick={() => handleLocationChange(location._id)}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 shadow-md ${
                  selectedLocation === location._id
                    ? 'bg-[#008DDA] text-white shadow-blue-300/50 transform scale-[1.03]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                {location.name}
              </button>
            ))}
          </div>
          
          {totalImageCount === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
                <p className="text-xl text-gray-600">No memories found for this location.</p>
            </div>
          ) : (
            <>
              <div className="text-center text-gray-600 mb-6 font-medium">
                  Showing {filteredImages.length} of {totalImageCount} memories.
              </div>
              
              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image, index) => {
                  const imageUrl = getImageUrl(image);
                  const imageId = image._id || image.id || `image-${index}`;
                  const hasFailed = failedImages.has(imageId);
                  
                  return (
                    <div 
                      key={imageId} 
                      className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                      onClick={() => openLightbox(image)}
                    >
                      {!hasFailed && imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={image.title || image.locationName}
                          className="w-full h-64 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                          loading="lazy"
                          onError={() => handleImageError(imageId, imageUrl)}
                          onLoad={() => console.log(`✅ Image loaded: ${imageUrl}`)}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Image className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Image not available</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay for Details and Zoom */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                          <div className="text-white">
                              <div className="flex items-center gap-1.5 mb-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="text-sm font-semibold">{image.locationName}</span>
                              </div>
                              <p className="text-xs font-medium opacity-90">{image.title || 'Guest Photo'}</p>
                          </div>
                          <ZoomIn className="w-6 h-6 text-white bg-white/20 p-1 rounded-full backdrop-blur-sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Load More Button */}
          {hasMoreToLoad && (
            <div className="mt-12 text-center">
              <button
                onClick={loadMore}
                className={`inline-flex items-center gap-2 px-10 py-3 text-lg font-bold rounded-xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              >
                Load More Memories ({totalImageCount - filteredImages.length} left)
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full">
              
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>
              
              {(() => {
                const lightboxImageUrl = getImageUrl(selectedImage);
                return lightboxImageUrl ? (
                  <img
                    src={lightboxImageUrl}
                    alt={selectedImage.alt || selectedImage.title || selectedImage.locationName}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    onError={(e) => {
                      console.error('Lightbox image failed to load:', lightboxImageUrl);
                      e.target.style.display = 'none';
                      // Show fallback in lightbox
                      const container = e.target.parentElement;
                      container.innerHTML = `
                        <div class="w-96 h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                          <div class="text-center text-gray-500">
                            <Image class="w-12 h-12 mx-auto mb-4" />
                            <p class="text-lg">Image not available</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-96 h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                    <div className="text-center text-gray-500">
                      <Image className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg">Image not available</p>
                    </div>
                  </div>
                );
              })()}
              
              {/* Image Footer/Details */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-white" />
                  <span className="font-bold text-xl text-white">{selectedImage.locationName}</span>
                </div>
                {(selectedImage.title || selectedImage.alt) && (
                  <p className="text-white/90 text-sm">
                    {selectedImage.title || selectedImage.alt}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default MemoriesGallery;