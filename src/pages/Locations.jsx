import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight, Home, Sun, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [failedImages, setFailedImages] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState({}); // Track expanded groups by location name

  // Function to extract location group name from title
  const extractLocationGroupName = (title) => {
    // Extract text within quotes
    const match = title.match(/"([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Extract text after "at" 
    const atMatch = title.match(/at\s+([^\d]+)/i);
    if (atMatch && atMatch[1]) {
      return atMatch[1].trim();
    }
    
    // Extract text after ":"
    const colonMatch = title.match(/:\s*([^\d]+)/i);
    if (colonMatch && colonMatch[1]) {
      return colonMatch[1].trim();
    }
    
    // If no pattern matches, return the original title
    return title;
  };

  // Group locations by extracted name
  const groupLocationsByName = () => {
    const groups = {};
    
    locations.forEach(location => {
      const groupName = extractLocationGroupName(location.name);
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      
      groups[groupName].push(location);
    });
    
    return groups;
  };

  // Function to construct proper image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    const path = image.url || image.path || image.webpPath || image.src;
    
    if (!path) {
      console.warn('No image path found:', image);
      return null;
    }
    
    if (path.startsWith('http')) {
      return path;
    }
    
    if (path.startsWith('/')) {
      return `${API_BASE_URL}${path}`;
    }
    
    return `${API_BASE_URL}/uploads/${path}`;
  };

  // Function to get the main image URL
  const getMainImageUrl = (location) => {
    if (!location.images || location.images.length === 0) {
      return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    const mainImage = location.images.find(img => img.isMainImage === true);
    
    if (mainImage) {
      const imageUrl = getImageUrl(mainImage);
      return imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    const firstImageUrl = getImageUrl(location.images[0]);
    return firstImageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  };

  // Handle image load error
  const handleImageError = (locationId, imageUrl) => {
    console.error(`Failed to load image for location ${locationId}:`, imageUrl);
    setFailedImages(prev => new Set([...prev, locationId]));
  };

  // Toggle group expanded state
  const toggleGroupExpand = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Fetch locations data from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setFailedImages(new Set());
        
        const response = await axios.get(`${API_BASE_URL}/locations`);
        
        const locationsWithImages = await Promise.all(
          response.data.map(async (location) => {
            try {
              const imagesResponse = await axios.get(`${API_BASE_URL}/locations/${location._id}`);
              const images = imagesResponse.data.images || [];
              
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

  const locationGroups = groupLocationsByName();

  return (
    <>
      <Navbar/>
      
      {/* Header Section */}
      <div className="bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-gray-100 shadow-sm">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-7xl text-gray-900 tracking-tight leading-tight mb-4">
            Our Locations
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our curated collection of world-class properties, each offering a unique and unforgettable experience
          </p>
        </header>
      </div>

      {/* Grouped Location Sections */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {Object.entries(locationGroups).map(([groupName, groupLocations]) => {
            const isExpanded = expandedGroups[groupName];
            
            return (
              <div 
                key={groupName}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Group Header - Similar to your image example */}
                <div 
                  className="p-6 sm:p-8 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleGroupExpand(groupName)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left side: Group name and location count */}
<div className="flex-1">
  <div className="flex flex-wrap items-center gap-3 mb-2">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
      {groupName}
    </h2>
    
    {/* Pool Party Badge */}
    {groupLocations.some(loc => loc.isPoolPartyAvailable) && (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        <Sun className="w-3.5 h-3.5" />
        Pool Party Available
        <span className="ml-1 text-xs font-bold">
          ({groupLocations.filter(loc => loc.isPoolPartyAvailable).length})
        </span>
      </span>
    )}
    
    {/* Night Stay Badge */}
    {groupLocations.some(loc => loc.propertyDetails?.nightStay) && (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
        <Star className="w-3.5 h-3.5" />
        Night Stay Available
        <span className="ml-1 text-xs font-bold">
          ({groupLocations.filter(loc => loc.propertyDetails?.nightStay).length})
        </span>
      </span>
    )}
  </div>
  
  <div className="flex items-center gap-3 mt-2">
    <span className="text-sm text-gray-500">
      {groupLocations.length} propert{groupLocations.length === 1 ? 'y' : 'ies'} available
    </span>
    {groupLocations[0]?.address?.city && (
      <span className="flex items-center gap-1 text-sm text-gray-500">
        <MapPin className="w-4 h-4" />
        {groupLocations[0].address.city}
      </span>
    )}
  </div>
</div>
                    
                    {/* Right side: View More button */}
                    <div className="flex items-center">
                      <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold ${PRIMARY_COLOR_CLASS} bg-blue-50 hover:bg-blue-100 transition-all duration-300`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupExpand(groupName);
                        }}
                      >
                        {isExpanded ? 'Show Less' : 'View More'}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Border line */}
                <div className="border-t border-gray-200"></div>
                
                {/* Expandable Content with Locations */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 sm:p-8 space-y-12">
                    {groupLocations.map((location, index) => {
                      const mainImageUrl = getMainImageUrl(location);
                      const hasFailed = failedImages.has(location._id);
                      
                      return (
                        <div 
                          key={location._id}
                          className={`bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 
                                    flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-stretch`}
                        >
                          
                          {/* Image Section */}
                          <div className="w-full lg:w-2/5 relative">
                            <div className="relative h-64 lg:h-full overflow-hidden">
                              {!hasFailed ? (
                                <img 
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                                  src={mainImageUrl} 
                                  alt={location.name}
                                  loading="lazy"
                                  onError={() => handleImageError(location._id, mainImageUrl)}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <div className="text-center text-gray-500">
                                    <Home className="w-10 h-10 mx-auto mb-2" />
                                    <p className="text-sm">Image not available</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          <div className="w-full lg:w-3/5 p-6 sm:p-8">
                            {/* Full Title */}
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                              {location.name}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-gray-600 mb-6 line-clamp-3">
                              {location.description || 'No description available.'}
                            </p>
                            
                            {/* Features */}
                            <div className="flex flex-wrap gap-3 mb-6">
                              {location.capacityOfPersons && (
                                <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{location.capacityOfPersons} guests</span>
                                </div>
                              )}
                              {location.propertyDetails?.bedrooms && (
                                <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                  <Sun className="w-3.5 h-3.5" />
                                  <span>{location.propertyDetails.bedrooms} bedrooms</span>
                                </div>
                              )}
                              {location.propertyDetails?.bathrooms && (
                                <div className="flex items-center gap-2 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                  <Sun className="w-3.5 h-3.5" />
                                  <span>{location.propertyDetails.bathrooms} bathrooms</span>
                                </div>
                              )}
                                {location.isPoolPartyAvailable && (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Sun className="w-3 h-3" />
      Pool Party
    </span>
  )}
  
  {location.propertyDetails?.nightStay && (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
      <Star className="w-3 h-3" />
      Night Stay
    </span>
  )}
                            </div>
                            
                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-3">
                              <a 
                                href={`/locations-details/${location._id}`} 
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#008DDA] hover:bg-[#0278b8] transition-colors duration-300"
                              >
                                View Details
                                <ArrowRight className="w-4 h-4" />
                              </a>
                              {/* <button 
                                type="button" 
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-[#008DDA] bg-white border border-[#008DDA] hover:bg-blue-50 transition-colors duration-300"
                              >
                                Book Now
                              </button> */}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {Object.keys(locationGroups).length === 0 && (
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