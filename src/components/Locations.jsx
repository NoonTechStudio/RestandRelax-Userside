import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

const Location = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get proper image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // If it's already a string URL, use it directly
    if (typeof image === 'string') {
      return image;
    }
    
    // If it's an object with url property, use that directly
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    
    return null;
  };

  // Fetch locations data from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/locations`);
        
        // For each location, fetch its images to get the main image
        const locationsWithImages = await Promise.all(
          response.data.map(async (location) => {
            try {
              const imagesResponse = await axios.get(`${API_BASE_URL}/locations/${location._id}`);
              return {
                ...location,
                images: imagesResponse.data.images || []
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

  // Function to get the main image URL
  const getMainImageUrl = (location) => {
    if (!location.images || location.images.length === 0) {
      // Return a default placeholder image if no images exist
      return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    // Find the image with isMainImage: true
    const mainImage = location.images.find(img => img.isMainImage === true);
    
    if (mainImage) {
      // Use the Cloudinary URL directly - no need to prepend API_BASE_URL
      return getImageUrl(mainImage);
    }

    // If no main image found, return the first image
    return getImageUrl(location.images[0]);
  };

  // Handle image load error
  const handleImageError = (e, locationName) => {
    console.error(`Failed to load image for ${locationName}`);
    e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  };

  // Function to generate slug from location name
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  if (loading) {
    return (
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6">Our Locations</div>
          <div className="text-xl text-gray-600">Loading locations...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-6">Our Locations</div>
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-24">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-tight tracking-tight mb-6">
          Our Locations
        </h1>
        <p className="mt-4 text-xl sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Explore our curated collection of world-class properties, each offering a unique and unforgettable experience
        </p>
      </div>

      {/* Location Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {locations.map((location, index) => {
          const mainImageUrl = getMainImageUrl(location);
          
          return (
            <div 
              key={location._id}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-12 group`}
            >
              {/* Image Section */}
              <div className="w-full lg:w-1/2 relative overflow-hidden rounded-2xl shadow-2xl">
                <div className="relative h-80 lg:h-96 overflow-hidden">
                  <img 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
                    src={mainImageUrl} 
                    alt={location.name}
                    loading="lazy"
                    onError={(e) => handleImageError(e, location.name)}
                    onLoad={() => console.log(`✅ Image loaded for ${location.name}:`, mainImageUrl)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="w-full lg:w-1/2 space-y-6">
                {/* Location Tag */}
                <div className="flex items-center gap-2 text-[#008DDA]">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    {location.address?.city ? `${location.address.city}` : 'Location details coming soon'}
                  </span>
                </div>
                
                {/* Title */}
                <h2 className="text-2xl lg:text-4xl text-gray-900 leading-tight">
                  {location.name}
                </h2>
                
                {/* Description */}
                <p className="text-lg text-justify text-gray-600 leading-relaxed">
                {location.description ? `${location.description.substring(0, 200)}${location.description.length > 200 ? '...' : ''}` : 'No description available.'}
                </p>
                
                {/* Additional Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {location.capacityOfPersons && (
                    <span>{location.capacityOfPersons} guests</span>
                  )}
                  {location.propertyDetails?.bedrooms && (
                    <span>{location.propertyDetails.bedrooms} bedrooms</span>
                  )}
                  {location.propertyDetails?.bathrooms && (
                    <span>{location.propertyDetails.bathrooms} bathrooms</span>
                  )}
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <a 
                    href={`/location/${location._id}`}
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    View Details
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <button 
                    type="button" 
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl text-[#008DDA] bg-white border-2 border-[#008DDA] hover:bg-indigo-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {locations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No locations found.</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default Location;