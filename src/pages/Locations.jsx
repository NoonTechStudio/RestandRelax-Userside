import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight, Home, Sun } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define the primary color for consistency
const PRIMARY_COLOR_CLASS = 'text-[#008DDA]';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set()); // Track failed image loads

  // Function to construct proper image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // Try different possible image path properties
    const path = image.url || image.path || image.webpPath || image.src;
    
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

  // Function to get the main image URL
  const getMainImageUrl = (location) => {
    if (!location.images || location.images.length === 0) {
      // Return a default placeholder image if no images exist
      return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    // Find the image with isMainImage: true
    const mainImage = location.images.find(img => img.isMainImage === true);
    
    if (mainImage) {
      const imageUrl = getImageUrl(mainImage);
      return imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    // If no main image found, return the first image
    const firstImageUrl = getImageUrl(location.images[0]);
    return firstImageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  };

  // Handle image load error
  const handleImageError = (locationId, imageUrl) => {
    console.error(`Failed to load image for location ${locationId}:`, imageUrl);
    setFailedImages(prev => new Set([...prev, locationId]));
  };

  // Fetch locations data from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setFailedImages(new Set()); // Reset failed images
        
        const response = await axios.get(`${API_BASE_URL}/locations`);
        
        // For each location, fetch its images to get the main image
        const locationsWithImages = await Promise.all(
          response.data.map(async (location) => {
            try {
              const imagesResponse = await axios.get(`${API_BASE_URL}/locations/${location._id}`);
              const images = imagesResponse.data.images || [];
              
              console.log(`Location ${location.name} images:`, images);
              if (images.length > 0) {
                console.log(`First image for ${location.name}:`, images[0]);
              }
              
              return {
                ...location,
                images: images
              };
            } catch (imgError) {
              console.error(`Error fetching images for location ${location._id}:`, imgError);
              return {
                ...location,
                images: []
              };
            }
          })
        );
        
        console.log('All locations loaded:', locationsWithImages);
        setLocations(locationsWithImages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations. Please try again later.');
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Function to generate slug from location name (Kept for completeness, though not used in links yet)
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  // Helper component for loading/error state
  const StateSection = ({ title, message, color = 'text-gray-600' }) => (
    <section className="py-20 sm:py-28 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6">{title}</h1>
        <div className={`text-xl ${color}`}>{message}</div>
      </div>
    </section>
  );

  if (loading) {
    return <StateSection title="Our Locations" message="Loading locations..." />;
  }

  if (error) {
    return <StateSection title="Our Locations" message={error} color="text-red-600" />;
  }

  return (
    <>
    <Navbar/>
    
    {/* Header Section (Updated as per Rates.jsx style) */}
    <div className="bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-gray-100 shadow-sm">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-4">
            {/* <div className={`bg-blue-50 ${PRIMARY_COLOR_CLASS} px-4 py-2 rounded-full flex items-center gap-2 shadow-sm`}>
                <Home className="w-5 h-5" />
                <p className="text-sm font-semibold uppercase tracking-wider">
                    Exclusive Properties
                </p>
            </div> */}
        </div>
        <h1 className="text-5xl sm:text-7xl text-gray-900 tracking-tight leading-tight mb-4">
          Our Locations
        </h1>
        <p className="mt-4  text-sm md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Explore our curated collection of world-class properties, each offering a unique and unforgettable experience
        </p>
      </header>
    </div>

    {/* Location Cards Section (UI/UX improvements) */}
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {locations.map((location, index) => {
          const mainImageUrl = getMainImageUrl(location);
          const hasFailed = failedImages.has(location._id);
          
          return (
            <div 
              key={location._id}
              // Modern Card Layout: Full-width card with image/content side-by-side
              className={`bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500 ease-in-out 
                          flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-stretch group`}
            >
              
              {/* Image Section */}
              <div className="w-full lg:w-1/2 relative">
                <div className="relative h-80 lg:h-full overflow-hidden">
                  {!hasFailed ? (
                    <img 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                      src={mainImageUrl} 
                      alt={location.name}
                      loading="lazy"
                      onError={() => handleImageError(location._id, mainImageUrl)}
                      onLoad={() => console.log(`✅ Image loaded for ${location.name}:`, mainImageUrl)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Home className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Property Image</p>
                        <p className="text-xs">Not available</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                
                {/* Location Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className={`w-5 h-5 ${PRIMARY_COLOR_CLASS}`} />
                  <span className={`text-sm font-bold uppercase tracking-widest ${PRIMARY_COLOR_CLASS}`}>
                    {location.address?.city ? `${location.address.city}` : 'Details Coming Soon'}
                  </span>
                </div>
                
                {/* Title */}
                <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  {location.name}
                </h2>
                
                {/* Description */}
                <p className="text-base text-gray-600 leading-relaxed mb-6">
                  {location.description?.substring(0, 200) + (location.description?.length > 200 ? '...' : '') || 'No description available.'}
                </p>
                
                {/* Additional Info / Features */}
                <div className="flex flex-wrap gap-4 text-sm mb-8">
                  {location.capacityOfPersons && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                      <MapPin className="w-4 h-4" />
                      <span>{location.capacityOfPersons} guests</span>
                    </div>
                  )}
                  {location.propertyDetails?.bedrooms && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-full font-medium">
                      <Sun className="w-4 h-4" />
                      <span>{location.propertyDetails.bedrooms} bedrooms</span>
                    </div>
                  )}
                  {location.propertyDetails?.bathrooms && (
                    <div className="flex items-center gap-2 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-full font-medium">
                      <Sun className="w-4 h-4" />
                      <span>{location.propertyDetails.bathrooms} bathrooms</span>
                    </div>
                  )}
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a 
                    href={`/locations-details/${location._id}`} 
                    className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold rounded-xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                  >
                    View Details
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <button 
                    type="button" 
                    className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold rounded-xl ${PRIMARY_COLOR_CLASS} bg-white border-2 border-[#008DDA] hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {locations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-xl text-gray-600">No locations found.</p>
          </div>
        )}

      </div>
    </section>
    <Footer/>
    </>
  );
};

export default Locations;