import React, { useState, useEffect } from 'react';
import { MapPin, Filter, X, Heart, Share2, ZoomIn, Image, ArrowRight, Play } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define the primary color for consistency
const PRIMARY_COLOR_CLASS = 'text-[#008DDA]';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

const MemoriesGallery = () => {
  const [locations, setLocations] = useState([]);
  const [allMedia, setAllMedia] = useState([]); // Changed from allImages to allMedia
  const [filteredMedia, setFilteredMedia] = useState([]); // Changed from filteredImages to filteredMedia
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null); // Changed from selectedImage to selectedMedia
  const [showLimit, setShowLimit] = useState(12);
  const [failedMedia, setFailedMedia] = useState(new Set()); // Track failed media loads

  // Function to check if media is a video
  const isVideo = (media) => {
    const path = media.fullUrl || media.url || media.path || media.webpPath || media.src || '';
    return path.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) !== null;
  };

  // Function to construct proper media URL
  const getMediaUrl = (media) => {
    if (!media) return null;
    
    // Try different possible media path properties
    const path = media.fullUrl || media.url || media.path || media.webpPath || media.src;
    
    if (!path) {
      console.warn('No media path found:', media);
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

  // Fetch locations and their media
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFailedMedia(new Set()); // Reset failed media
        
        const locationsResponse = await axios.get(`${API_BASE_URL}/locations`);
        const locationsData = locationsResponse.data;
        setLocations(locationsData);

        const mediaPromises = locationsData.map(async (location) => {
          try {
            const imagesResponse = await axios.get(`${API_BASE_URL}/locations/${location._id}`);
            const images = imagesResponse.data.images || [];
            
            return images.map(img => ({
              ...img,
              locationId: location._id,
              locationName: location.name,
              isVideo: isVideo(img), // Add video detection
              // Don't pre-process URL here, we'll handle it in getMediaUrl
            }));
          } catch (imgError) {
            console.error(`Error fetching images for location ${location._id}:`, imgError);
            return [];
          }
        });

        const nestedMedia = await Promise.all(mediaPromises);
        const media = nestedMedia.flat().filter(item => item);
        
        console.log('Total media loaded:', media.length);
        console.log('Videos:', media.filter(item => item.isVideo).length);
        console.log('Images:', media.filter(item => !item.isVideo).length);
        
        if (media.length > 0) {
          console.log('Sample media data:', media[0]);
        }
        
        setAllMedia(media);
        setFilteredMedia(media.slice(0, showLimit));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load memories gallery. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter media when location changes or showLimit changes
  useEffect(() => {
    let mediaToFilter = allMedia;

    if (selectedLocation !== 'all') {
      mediaToFilter = allMedia.filter(media => media.locationId === selectedLocation);
    }

    setFilteredMedia(mediaToFilter.slice(0, showLimit));
  }, [selectedLocation, allMedia, showLimit]);

  // Handle location filter change
  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId);
    setShowLimit(12);
  };

  // Handle media load error
  const handleMediaError = (mediaId, mediaUrl) => {
    console.error(`Failed to load media: ${mediaUrl}`);
    setFailedMedia(prev => new Set([...prev, mediaId]));
  };

  const loadMore = () => {
    setShowLimit(prevLimit => prevLimit + 12);
  };

  const openLightbox = (media) => {
    setSelectedMedia(media);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
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

  const hasMoreToLoad = filteredMedia.length < (selectedLocation === 'all' 
    ? allMedia.length 
    : allMedia.filter(media => media.locationId === selectedLocation).length
  );
  
  const totalMediaCount = selectedLocation === 'all' 
    ? allMedia.length 
    : allMedia.filter(media => media.locationId === selectedLocation).length;

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen font-inter">
        
        {/* Header Section */}
        <div className="bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-gray-100 shadow-sm">
          <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl sm:text-7xl text-gray-900 tracking-tight leading-tight mb-4">
              Memories Gallery
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
              All Memories ({allMedia.length})
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
          
          {totalMediaCount === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
                <p className="text-xl text-gray-600">No memories found for this location.</p>
            </div>
          ) : (
            <>
              <div className="text-center text-gray-600 mb-6 font-medium">
                  Showing {filteredMedia.length} of {totalMediaCount} memories.
              </div>
              
              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((media, index) => {
                  const mediaUrl = getMediaUrl(media);
                  const mediaId = media._id || media.id || `media-${index}`;
                  const hasFailed = failedMedia.has(mediaId);
                  const isVideoFile = media.isVideo;
                  
                  return (
                    <div 
                      key={mediaId} 
                      className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                      onClick={() => openLightbox(media)}
                    >
                      {!hasFailed && mediaUrl ? (
                        <>
                          {isVideoFile ? (
                            <div className="relative w-full h-64 bg-black flex items-center justify-center">
                              <video
                                className="w-full h-full object-cover"
                                preload="metadata"
                                onError={() => handleMediaError(mediaId, mediaUrl)}
                              >
                                <source src={mediaUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                  <Play className="w-6 h-6 text-black ml-1" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={mediaUrl}
                              alt={media.title || media.locationName}
                              className="w-full h-64 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                              loading="lazy"
                              onError={() => handleMediaError(mediaId, mediaUrl)}
                              onLoad={() => console.log(`✅ Media loaded: ${mediaUrl}`)}
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Image className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Media not available</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay for Details and Zoom/Play */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                          <div className="text-white">
                              <div className="flex items-center gap-1.5 mb-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="text-sm font-semibold">{media.locationName}</span>
                              </div>
                              <p className="text-xs font-medium opacity-90">{media.title || 'Guest Photo'}</p>
                          </div>
                          {isVideoFile ? (
                            <Play className="w-6 h-6 text-white bg-white/20 p-1 rounded-full backdrop-blur-sm" />
                          ) : (
                            <ZoomIn className="w-6 h-6 text-white bg-white/20 p-1 rounded-full backdrop-blur-sm" />
                          )}
                      </div>

                      {/* Video Badge */}
                      {isVideoFile && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm">
                          VIDEO
                        </div>
                      )}
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
                Load More Memories ({totalMediaCount - filteredMedia.length} left)
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {selectedMedia && (
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
                const lightboxMediaUrl = getMediaUrl(selectedMedia);
                const isVideoFile = selectedMedia.isVideo;
                
                return lightboxMediaUrl ? (
                  isVideoFile ? (
                    <div className="max-w-full max-h-[90vh]">
                      <video
                        controls
                        autoPlay
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                        onError={(e) => {
                          console.error('Lightbox video failed to load:', lightboxMediaUrl);
                          handleVideoError(e);
                        }}
                      >
                        <source src={lightboxMediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <img
                      src={lightboxMediaUrl}
                      alt={selectedMedia.alt || selectedMedia.title || selectedMedia.locationName}
                      className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                      onError={(e) => {
                        console.error('Lightbox image failed to load:', lightboxMediaUrl);
                        e.target.style.display = 'none';
                        // Show fallback in lightbox
                        const container = e.target.parentElement;
                        container.innerHTML = `
                          <div class="w-96 h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                            <div class="text-center text-gray-500">
                              <Image class="w-12 h-12 mx-auto mb-4" />
                              <p class="text-lg">Media not available</p>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  )
                ) : (
                  <div className="w-96 h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                    <div className="text-center text-gray-500">
                      <Image className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg">Media not available</p>
                    </div>
                  </div>
                );
              })()}
              
              {/* Media Footer/Details */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-white" />
                  <span className="font-bold text-xl text-white">{selectedMedia.locationName}</span>
                  {selectedMedia.isVideo && (
                    <span className="bg-white/20 text-white px-2 py-1 rounded-md text-sm font-medium backdrop-blur-sm">
                      VIDEO
                    </span>
                  )}
                </div>
                {(selectedMedia.title || selectedMedia.alt) && (
                  <p className="text-white/90 text-sm">
                    {selectedMedia.title || selectedMedia.alt}
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