import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPin, Star, ArrowRight, Home, Sun, ChevronDown, ChevronUp, Search, Filter, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define the primary color for consistency
const PRIMARY_COLOR_CLASS = 'text-[#008DDA]';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

// Helper to build absolute image URL (copied from ImageGallery fix)
const getImageUrl = (image) => {
  if (!image) return null;

  // Extract URL from image object (could be string or object with url property)
  let url = typeof image === 'string' ? image : image?.url || image?.path || image?.webpPath || image?.src;
  if (!url) return null;

  // If already absolute, use directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Build absolute URL from base
  let base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

  // Remove '/api' from base if present (images often served from root)
  if (base.includes('/api')) {
    base = base.split('/api')[0];
  }

  // Ensure path starts with a slash
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState({});
  const navigate = useNavigate();

  // Filter states
  const [filterCity, setFilterCity] = useState('');
  const [filterAddressLine2, setFilterAddressLine2] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [availableAddressLine2, setAvailableAddressLine2] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Memoized extraction function (stable across renders)
  const extractLocationGroupName = useCallback((location) => {
    const { address } = location;

    let groupName = '';

    if (address?.line2 && address?.city) {
      groupName = `${address.line2}, ${address.city}`;
    } else if (address?.line2) {
      groupName = address.line2;
    } else if (address?.city) {
      groupName = address.city;
    } else {
      const title = location.name;
      const match = title.match(/"([^"]+)"/);
      if (match && match[1]) return match[1];
      const atMatch = title.match(/at\s+([^\d]+)/i);
      if (atMatch && atMatch[1]) return atMatch[1].trim();
      const colonMatch = title.match(/:\s*([^\d]+)/i);
      if (colonMatch && colonMatch[1]) return colonMatch[1].trim();
      return title;
    }
    return groupName;
  }, []);

  // Extract unique cities and address line 2 values from locations
  useEffect(() => {
    if (locations.length > 0) {
      const cities = [...new Set(
        locations.map(loc => loc.address?.city).filter(city => city && city.trim() !== '')
      )].sort();
      const addressLine2s = [...new Set(
        locations.map(loc => loc.address?.line2).filter(line2 => line2 && line2.trim() !== '')
      )].sort();
      setAvailableCities(cities);
      setAvailableAddressLine2(addressLine2s);
    }
  }, [locations]);

  // Filter locations – memoized
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesCity = !filterCity ||
        (location.address?.city && location.address.city.toLowerCase() === filterCity.toLowerCase());
      const matchesAddressLine2 = !filterAddressLine2 ||
        (location.address?.line2 && location.address.line2.toLowerCase() === filterAddressLine2.toLowerCase());
      return matchesCity && matchesAddressLine2;
    });
  }, [locations, filterCity, filterAddressLine2]);

  // Group filtered locations – memoized
  const locationGroups = useMemo(() => {
    const groups = {};
    filteredLocations.forEach(location => {
      const groupName = extractLocationGroupName(location);
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(location);
    });
    return groups;
  }, [filteredLocations, extractLocationGroupName]);

  // Get main image URL – memoized per location? But used inside render, so we'll compute directly.
  const getMainImageUrl = useCallback((location) => {
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
  }, []);

  // Handle image load error – stable callback
  const handleImageError = useCallback((locationId, imageUrl) => {
    console.error(`Failed to load image for location ${locationId}:`, imageUrl);
    setFailedImages(prev => new Set([...prev, locationId]));
    // Optionally show toast
    toast.error(`Image failed to load for location ${locationId}`);
  }, []);

  // Toggle group expand – stable callback
  const toggleGroupExpand = useCallback((groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  }, []);

  // Clear all filters – stable callback
  const clearFilters = useCallback(() => {
    setFilterCity('');
    setFilterAddressLine2('');
  }, []);

  // Reset expanded groups when filters change
  useEffect(() => {
    setExpandedGroups({});
  }, [filterCity, filterAddressLine2]);

  // Fetch locations data from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setFailedImages(new Set());

        const response = await axios.get(`${API_BASE_URL}/locations`);

        // ⚠️ Performance bottleneck: each location triggers an extra API call for images.
        // Recommended: modify backend to include images when fetching all locations.
        // For now, we keep it but show a loading skeleton.
        // New: if the backend already includes images, use them; otherwise fetch individually
let locationsData = response.data;

// Check if the first location has an 'images' field
if (locationsData.length > 0 && !locationsData[0].images) {
  // Backend does not include images – fall back to old method
  console.warn('Images not included in /locations response – fetching individually (slow)');
  locationsData = await Promise.all(
    locationsData.map(async (location) => {
      try {
        const imagesResponse = await axios.get(`${API_BASE_URL}/locations/${location._id}`);
        const images = imagesResponse.data.images || [];
        return { ...location, images };
      } catch (imgError) {
        console.error(`Error fetching images for location ${location._id}:`, imgError);
        return { ...location, images: [] };
      }
    })
  );
} else {
  // Ensure every location has an images array (even if empty)
  locationsData = locationsData.map(loc => ({
    ...loc,
    images: loc.images || []
  }));
}

setLocations(locationsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations. Please try again later.');
        toast.error('Failed to load locations');
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Helper component for loading/error state – memoized? Not necessary as it's simple.
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
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header Section */}
      <div className="bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-gray-100 shadow-sm">
        <header className="mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-7xl text-gray-900 tracking-tight leading-tight mb-4">
            Our Locations
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our curated collection of world-class properties, each offering a unique and unforgettable experience
          </p>
        </header>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between py-4 text-gray-700"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {(filterCity || filterAddressLine2) && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Active
                </span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters */}
            <div className={`
              ${showMobileFilters ? 'block' : 'hidden'}
              lg:block lg:w-80 flex-shrink-0
            `}>
              <div className="bg-white rounded-xl shadow-md p-6 lg:sticky lg:top-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Active Filters */}
                {(filterCity || filterAddressLine2) && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Active Filters</span>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filterCity && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-full text-xs text-blue-700">
                          City: {filterCity}
                          <button
                            onClick={() => setFilterCity('')}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filterAddressLine2 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-full text-xs text-blue-700">
                          Area: {filterAddressLine2}
                          <button
                            onClick={() => setFilterAddressLine2('')}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="space-y-6">
                  {/* City Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <div className="relative">
                      <select
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 appearance-none bg-white"
                      >
                        <option value="">All Cities</option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Address Line 2 Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area
                    </label>
                    <div className="relative">
                      <select
                        value={filterAddressLine2}
                        onChange={(e) => setFilterAddressLine2(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 appearance-none bg-white"
                      >
                        <option value="">All Areas</option>
                        {availableAddressLine2.map(line2 => (
                          <option key={line2} value={line2}>
                            {line2}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Showing</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredLocations.length} <span className="text-lg font-normal text-gray-600">locations</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      of {locations.length} total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Locations List */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {filteredLocations.length} Location{filteredLocations.length !== 1 ? 's' : ''} Found
                    </h2>
                    {(filterCity || filterAddressLine2) && (
                      <p className="text-gray-600 mt-1">
                        Filtered by {filterCity && `City: ${filterCity}`}
                        {filterCity && filterAddressLine2 && ' and '}
                        {filterAddressLine2 && `Area: ${filterAddressLine2}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Sun className="w-4 h-4 text-blue-500" />
                        <span>Pool Party Available</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span>Night Stay Available</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grouped Location Sections */}
              <div className="space-y-8">
                {Object.entries(locationGroups).map(([groupName, groupLocations]) => {
                  const isExpanded = expandedGroups[groupName];

                  return (
                    <div
                      key={groupName}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      {/* Group Header */}
                      <div
                        className="p-6 sm:p-8 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleGroupExpand(groupName)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                  {groupName}
                                </h2>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                  {groupLocations[0]?.address?.line1 && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5" />
                                      {groupLocations[0].address.line1}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Pool Party Badge */}
                              {groupLocations.some(loc => loc.poolPartyConfig?.hasPoolParty) && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  <Sun className="w-3.5 h-3.5" />
                                  Pool Party
                                  <span className="ml-1 text-xs font-bold">
                                    ({groupLocations.filter(loc => loc.poolPartyConfig?.hasPoolParty).length})
                                  </span>
                                </span>
                              )}

                              {/* Night Stay Badge */}
                              {groupLocations.some(loc => loc.propertyDetails?.nightStay) && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                  <Star className="w-3.5 h-3.5" />
                                  Night Stay
                                  <span className="ml-1 text-xs font-bold">
                                    ({groupLocations.filter(loc => loc.propertyDetails?.nightStay).length})
                                  </span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <span className="text-sm text-gray-500">
                                {groupLocations.length} propert{groupLocations.length === 1 ? 'y' : 'ies'} available
                              </span>
                            </div>
                          </div>

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

                      {/* Expandable Content */}
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="p-6 sm:p-8 space-y-12">
                          {groupLocations.map((location) => {
                            const mainImageUrl = getMainImageUrl(location);
                            const hasFailed = failedImages.has(location._id);

                            return (
                              <div
                                key={location._id}
                                className="bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col lg:flex-row items-stretch"
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
                                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                                    {location.name}
                                  </h3>

                                  {/* Address Details */}
                                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
                                    {location.address?.line1 && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{location.address.line1}</span>
                                      </span>
                                    )}
                                    {location.address?.line2 && location.address.line2 !== groupName.split(', ')[0] && (
                                      <span className="text-gray-500">•</span>
                                    )}
                                    {location.address?.city && location.address.city !== groupName.split(', ')[1] && (
                                      <span className="text-gray-500">•</span>
                                    )}
                                  </div>

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
                                    {location.poolPartyConfig?.hasPoolParty && (
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
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-[#008DDA] bg-white border border-[#008DDA] hover:bg-blue-50 transition-colors duration-300"
                                    >
                                      Book Now
                                    </button>
                                    {(location.poolPartyConfig?.isSharedPoolCreatedFromHere ||
                                      location.poolPartyConfig?.isPrivatePoolCreatedFromHere) && (
                                      <button
                                        onClick={() => navigate(`/locations-details/${location._id}`)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg
                                          bg-gradient-to-r from-[#008DDA] to-[#00A8E8]
                                          text-white shadow-md hover:shadow-lg
                                          hover:from-[#0278b8] hover:to-[#0090c9]
                                          transition-all duration-300 transform hover:scale-[1.02]
                                          border-2 border-[#008DDA]"
                                      >
                                        <Sun className="w-4 h-4" />
                                        Book Pool Party Only
                                        <ArrowRight className="w-4 h-4" />
                                      </button>
                                    )}
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
                    <div className="max-w-md mx-auto">
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl text-gray-600 mb-2">No locations found</p>
                      <p className="text-gray-500 mb-6">
                        Try adjusting your filters to see more results
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={clearFilters}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                        >
                          Clear All Filters
                        </button>
                        <button
                          onClick={() => setShowMobileFilters(true)}
                          className="lg:hidden px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                        >
                          Adjust Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default React.memo(Locations);