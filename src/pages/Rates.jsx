import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Utensils,
  Coffee,
  Moon,
  Sun,
  Home,
  Info,
  Clock,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag,
  Droplets,
  ArrowUpRight,
} from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import axios from "axios";

// -------------------------------
// Constants & Fallback Data
// -------------------------------
const fallbackPackages = [
  {
    id: 1,
    title: "Entry Only",
    price: "500",
    duration: "Day Access",
    icon: <Sun className="w-6 h-6" />,
    color: "blue",
    highlight: false,
    features: [
      "Entry Ticket",
      "Access to Resort Amenities",
      "No Food Included",
    ],
  },
  {
    id: 2,
    title: "Entry + Food",
    price: "1000",
    duration: "Morning to Evening",
    icon: <Utensils className="w-6 h-6" />,
    color: "teal",
    highlight: true,
    tag: "Most Popular",
    features: [
      "Entry Ticket",
      "Buffet Breakfast",
      "Buffet Lunch",
      "High-Tea",
      "Access to Amenities",
    ],
  },
  {
    id: 3,
    title: "Full Day + Food",
    price: "1300",
    duration: "Full Day",
    icon: <Coffee className="w-6 h-6" />,
    color: "emerald",
    highlight: false,
    features: [
      "Entry Ticket",
      "Buffet Breakfast",
      "Buffet Lunch",
      "High-Tea",
      "Buffet Dinner",
      "Full Day Enjoyment",
    ],
  },
  {
    id: 4,
    title: "Full Day + Room",
    price: "2000",
    duration: "Day & Night",
    icon: <Home className="w-6 h-6" />,
    color: "violet",
    highlight: false,
    features: [
      "Entry Ticket",
      "All Buffet Meals",
      "High-Tea",
      "Non-AC Room Included",
      "Full Day & Night Access",
    ],
  },
];

const detailedPicnic = {
  withoutFood: {
    title: "Without Food",
    subtitle: "Entry Only",
    icon: <Sun className="w-5 h-5" />,
    sessions: [
      { label: "Morning Session", time: "8:00 am to 2:00 pm", adult: "500", kid: "200" },
      { label: "Evening Session", time: "3:00 pm to 9:00 pm", adult: "500", kid: "200" },
      { label: "Full Day Picnic", time: "8:00 am to 8:00 pm", adult: "800", kid: "300" },
    ],
  },
  withFood: {
    title: "With Food",
    subtitle: "Meals Included",
    icon: <Utensils className="w-5 h-5" />,
    sessions: [
      { label: "Morning Session", time: "8:00 am to 2:00 pm", adult: "750", kid: "400" },
      { label: "Evening Session", time: "3:00 pm to 9:00 pm", adult: "750", kid: "400" },
      { label: "Full Day Picnic", time: "8:00 am to 8:00 pm", adult: "1300", kid: "550", note: "Includes: Breakfast + Lunch + High Tea + Dinner" },
    ],
  },
};

const coupleStays = [
  { title: "Morning Session", time: "8:00 am to 2:00 pm", price: "1500", type: "Couple Rate" },
  { title: "Evening Session", time: "3:00 pm to 9:00 pm", price: "1500", type: "Couple Rate" },
  { title: "Full Day Stay", time: "8:00 am to 8:00 pm", price: "2500", type: "Couple Rate" },
  { title: "Night Stay", time: "9:00 pm to 9:00 am", price: "3500", type: "Couple Rate", highlight: true },
];

const nightFarmHouse = {
  title: "Night At Farm House",
  time: "09 PM to 09 AM",
  includes: "With Dinner & Breakfast",
  rates: [
    { type: "Single Person", price: "1000" },
    { type: "Kid above 5 years", price: "600" },
  ],
};

const extras = [
  { name: "Swimming Pool", detail: "Morning Session Add-on", price: "300" },
  { name: "Villa Ground Floor", detail: "Private Villa Booking", price: "4500" },
  { name: "Full Villa", detail: "Full Private Villa Booking", price: "7500" },
];

// -------------------------------
// Helper Components (memoized)
// -------------------------------
const PriceRow = memo(({ label, price }) => (
  <div className="flex justify-between items-end border-b border-dashed border-gray-200 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="font-bold text-[#008DDA]">₹{price}</span>
  </div>
));

const LoadingCard = memo(() => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 animate-pulse">
    <div className="w-12 h-12 rounded-2xl bg-gray-200 mb-6"></div>
    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded mb-8 w-1/2"></div>
    <div className="h-10 bg-gray-200 rounded mb-6"></div>
  </div>
));

const FallbackCard = memo(({ item }) => (
  <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
    {item.highlight && (
      <div className="absolute top-0 right-0 bg-[#008DDA] text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl shadow-sm z-10">
        {item.tag || "Popular"}
      </div>
    )}
    <div className="p-6 flex flex-col flex-grow">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300 ${item.highlight ? 'bg-[#008DDA]/10 text-[#008DDA]' : 'bg-blue-50 text-blue-600'}`}>
        {item.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{item.title}</h3>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-6">{item.duration}</p>
      <div className="mb-6 mt-auto">
        <span className="text-3xl font-extrabold text-gray-900">₹{item.price}</span>
        <span className="text-xs text-gray-500 font-medium block mt-1">per person</span>
      </div>
      <ul className="space-y-3 pt-4 border-t border-gray-100">
        {item.features.slice(0, 4).map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <div className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 ${item.highlight ? 'bg-[#008DDA]/20 text-[#008DDA]' : 'bg-blue-100 text-blue-600'}`}>
              <Check className="w-3 h-3" strokeWidth={3} />
            </div>
            <span className="text-sm text-gray-600 leading-snug">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
));

const LocationDetails = memo(({ location, offer, expandedPoolPartyId, togglePoolPartyExpansion, handleLocationClick }) => {
  const isLocationExpanded = expandedPoolPartyId === location._id;
  const foodPackages = getFoodPackagesForLocation(offer, location._id);
  const originalFoodPackages = getOriginalFoodPackagesForLocation(offer, location._id);
  const originalPrice = getOriginalPriceForLocation(offer, location._id);
  const currentPrice = offer.locationPricing?.pricePerAdultDay || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={(e) => togglePoolPartyExpansion(location._id, e)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 text-sm">{location.name}</h5>
            <div className="flex items-baseline gap-2 mt-0.5">
              {originalPrice > 0 && currentPrice < originalPrice && (
                <span className="text-xs line-through text-gray-400">₹{originalPrice}</span>
              )}
              <span className="font-bold text-[#008DDA]">₹{currentPrice}</span>
            </div>
          </div>
          <button
            onClick={(e) => handleLocationClick(e, location._id)}
            className="flex items-center gap-1 bg-blue-50 text-[#008DDA] hover:bg-[#008DDA] hover:text-white px-2 py-1 rounded-lg text-xs font-bold transition-all"
          >
            View <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-50">
          <span>{foodPackages.length} packages</span>
          {isLocationExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>
      {isLocationExpanded && (
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          {foodPackages.length > 0 && (
            <div className="space-y-2">
              {foodPackages.map((fp) => {
                const originalFp = originalFoodPackages.find(ofp => ofp.foodPackageId === fp.foodPackageId);
                return (
                  <div key={fp._id} className="bg-white p-2.5 rounded border border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">{fp.name}</span>
                    <div className="text-right">
                      {originalFp && fp.pricePerAdult < originalFp.pricePerAdult && (
                        <span className="text-[10px] line-through text-gray-400 block">₹{originalFp.pricePerAdult}</span>
                      )}
                      <span className="text-xs font-bold text-[#008DDA]">₹{fp.pricePerAdult}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const PoolPartyDetails = memo(({ poolParty, offer, expandedPoolPartyId, togglePoolPartyExpansion, handleLocationClick }) => {
  const isPoolPartyExpanded = expandedPoolPartyId === poolParty._id;
  const sessions = getSessionsForPoolParty(offer, poolParty._id);
  const morningSession = sessions.find(s => s.session === "Morning");

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={(e) => togglePoolPartyExpansion(poolParty._id, e)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 text-sm">{poolParty.name}</h5>
            <span className="font-bold text-[#008DDA] text-sm">
              {morningSession ? `₹${morningSession.perAdult}` : 'Check prices'}
            </span>
          </div>
          <button
            onClick={(e) => handleLocationClick(e, poolParty._id)}
            className="flex items-center gap-1 bg-blue-50 text-[#008DDA] hover:bg-[#008DDA] hover:text-white px-2 py-1 rounded-lg text-xs font-bold transition-all"
          >
            View <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-50">
          <span>{sessions.length} sessions</span>
          {isPoolPartyExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>
      {isPoolPartyExpanded && (
        <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-2">
          {sessions.map((session) => (
            <div key={session._id} className="bg-white p-2 rounded border border-gray-100 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">{session.session}</span>
              <span className="text-xs font-bold text-[#008DDA]">₹{session.perAdult}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const OfferCard = memo(({ item, originalOffer, isExpanded, toggleOfferExpansion, expandedPoolPartyId, togglePoolPartyExpansion, handleLocationClick, getOfferIcon, getPoolPartyPriceText }) => {
  return (
    <div
      className={`flex flex-col h-full bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
        isExpanded ? "border-[#008DDA] shadow-2xl ring-4 ring-[#008DDA]/5 z-10" : "border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300"
      }`}
    >
      <div
        className="p-6 cursor-pointer flex flex-col h-full relative"
        onClick={() => toggleOfferExpansion(item.id)}
      >
        {item.hasDiscount && (
          <div className="absolute top-0 right-0 bg-[#008DDA] text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl shadow-sm">
            Save {item.avgDiscount}%
          </div>
        )}
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-[#008DDA]/10 p-2.5 rounded-xl text-[#008DDA] shrink-0">
            {getOfferIcon(item.offerType)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              {item.offerType === 'location' ? <MapPin className="w-3 h-3" /> : <Droplets className="w-3 h-3" />}
              <span>{item.includedCount} {item.offerType === 'location' ? 'Locations' : 'Venues'}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-6 text-sm text-gray-600 line-clamp-2 min-h-[40px]">{item.description}</div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            {item.hasPriceRange ? (
              <span className="text-2xl font-extrabold text-gray-900">
                ₹{item.minPrice} <span className="text-lg text-gray-400 font-normal">-</span> ₹{item.maxPrice}
              </span>
            ) : (
              <span className="text-3xl font-extrabold text-gray-900">
                {item.offerType === 'poolparty' ? getPoolPartyPriceText(originalOffer) : `₹${item.minPrice}`}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">per person</span>
            <span className="text-xs font-semibold text-[#008DDA] flex items-center">
              {isExpanded ? "Close Details" : "View Details"}
              {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/80 p-5">
          {item.offerType === 'location' && item.selectedLocations.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">Select Location</h4>
              <div className="space-y-3">
                {item.selectedLocations.map((location) => (
                  <LocationDetails
                    key={location._id}
                    location={location}
                    offer={originalOffer}
                    expandedPoolPartyId={expandedPoolPartyId}
                    togglePoolPartyExpansion={togglePoolPartyExpansion}
                    handleLocationClick={handleLocationClick}
                  />
                ))}
              </div>
            </div>
          )}

          {item.offerType === 'poolparty' && item.selectedPoolParties.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">Select Venue</h4>
              <div className="space-y-3">
                {item.selectedPoolParties.map((poolParty) => (
                  <PoolPartyDetails
                    key={poolParty._id}
                    poolParty={poolParty}
                    offer={originalOffer}
                    expandedPoolPartyId={expandedPoolPartyId}
                    togglePoolPartyExpansion={togglePoolPartyExpansion}
                    handleLocationClick={handleLocationClick}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-[10px] text-gray-400">
              Valid until {new Date(item.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

// -------------------------------
// Helper Functions (pure)
// -------------------------------
const getOfferIcon = (offerType) => {
  switch (offerType) {
    case 'location': return <Home className="w-5 h-5" />;
    case 'poolparty': return <Droplets className="w-5 h-5" />;
    default: return <Tag className="w-5 h-5" />;
  }
};

const getPoolPartyPriceText = (offer) => {
  if (!offer || offer.offerType !== 'poolparty' || !offer.poolPartyPricing?.sessions) {
    return "Starting from";
  }
  const sessions = offer.poolPartyPricing.sessions;
  if (sessions.length === 0) return "Starting from";
  const morningSession = sessions.find(s => s.session === "Morning");
  if (morningSession) return `₹${morningSession.perAdult}`;
  const minPrice = Math.min(...sessions.map(s => s.perAdult));
  return `₹${minPrice}`;
};

const getOriginalPriceForLocation = (offer, locationId) => {
  if (!offer || !offer.originalLocationPricing) return 0;
  const original = offer.originalLocationPricing.find(op => op.locationId === locationId);
  return original?.pricingSnapshot?.pricePerAdultDay || 0;
};

const getFoodPackagesForLocation = (offer, locationId) => {
  if (!offer || !offer.locationPricing || !offer.locationPricing.foodPackages) return [];
  return offer.locationPricing.foodPackages.filter(fp => fp.locationId === locationId);
};

const getOriginalFoodPackagesForLocation = (offer, locationId) => {
  if (!offer || !offer.originalLocationPricing) return [];
  const original = offer.originalLocationPricing.find(op => op.locationId === locationId);
  return original?.pricingSnapshot?.foodPackages || [];
};

const getSessionsForPoolParty = (offer, poolPartyId) => {
  if (!offer || !offer.poolPartyPricing || !offer.poolPartyPricing.sessions) return [];
  return offer.poolPartyPricing.sessions;
};

const getOriginalSessionsForPoolParty = (offer, poolPartyId) => {
  if (!offer || !offer.originalPoolPartyPricing) return [];
  const original = offer.originalPoolPartyPricing.find(op => op.poolPartyId === poolPartyId);
  return original?.pricingSnapshot?.sessions || [];
};

const getFoodPackagesForPoolParty = (offer, poolPartyId) => {
  if (!offer || !offer.poolPartyPricing || !offer.poolPartyPricing.foodPackages) return [];
  return offer.poolPartyPricing.foodPackages.filter(fp => fp.poolPartyId === poolPartyId);
};

const getOriginalFoodPackagesForPoolParty = (offer, poolPartyId) => {
  if (!offer || !offer.originalPoolPartyPricing) return [];
  const original = offer.originalPoolPartyPricing.find(op => op.poolPartyId === poolPartyId);
  return original?.pricingSnapshot?.foodPackages || [];
};

const processOfferForDisplay = (offer) => {
  if (!offer) return null;
  const isLocationOffer = offer.offerType === 'location';
  const isPoolPartyOffer = offer.offerType === 'poolparty';

  let totalDiscount = 0;
  let discountCount = 0;

  if (isLocationOffer && offer.originalLocationPricing) {
    offer.originalLocationPricing.forEach(original => {
      if (offer.locationPricing && offer.locationPricing.pricePerAdultDay && original.pricingSnapshot.pricePerAdultDay) {
        const originalPrice = original.pricingSnapshot.pricePerAdultDay;
        const offerPrice = offer.locationPricing.pricePerAdultDay;
        if (offerPrice < originalPrice) {
          totalDiscount += Math.round((1 - offerPrice / originalPrice) * 100);
          discountCount++;
        }
      }
    });
  } else if (isPoolPartyOffer && offer.originalPoolPartyPricing) {
    offer.originalPoolPartyPricing.forEach(original => {
      if (offer.poolPartyPricing && offer.poolPartyPricing.sessions && original.pricingSnapshot.sessions) {
        const originalMorning = original.pricingSnapshot.sessions.find(s => s.session === "Morning");
        const offerMorning = offer.poolPartyPricing.sessions.find(s => s.session === "Morning");
        if (originalMorning && offerMorning && offerMorning.perAdult < originalMorning.perAdult) {
          totalDiscount += Math.round((1 - offerMorning.perAdult / originalMorning.perAdult) * 100);
          discountCount++;
        }
      }
    });
  }

  const avgDiscount = discountCount > 0 ? Math.round(totalDiscount / discountCount) : 0;
  const includedCount = isLocationOffer ? (offer.selectedLocations?.length || 0) : (offer.selectedPoolParties?.length || 0);

  let minPrice = Infinity;
  let maxPrice = 0;

  if (isLocationOffer && offer.locationPricing) {
    const lp = offer.locationPricing;
    if (lp.pricePerAdultDay) {
      minPrice = Math.min(minPrice, lp.pricePerAdultDay);
      maxPrice = Math.max(maxPrice, lp.pricePerAdultDay);
    }
    if (lp.pricePerPersonNight) {
      minPrice = Math.min(minPrice, lp.pricePerPersonNight);
      maxPrice = Math.max(maxPrice, lp.pricePerPersonNight);
    }
  } else if (isPoolPartyOffer && offer.poolPartyPricing?.sessions) {
    offer.poolPartyPricing.sessions.forEach(session => {
      minPrice = Math.min(minPrice, session.perAdult);
      maxPrice = Math.max(maxPrice, session.perAdult);
    });
  }

  const hasPriceRange = minPrice !== Infinity && maxPrice > 0 && minPrice !== maxPrice;

  return {
    id: offer._id,
    name: offer.name,
    description: offer.description,
    offerType: offer.offerType,
    isActive: offer.isActive,
    startDate: offer.startDate,
    endDate: offer.endDate,
    includedCount,
    avgDiscount,
    hasDiscount: avgDiscount > 0,
    minPrice: minPrice !== Infinity ? minPrice : 0,
    maxPrice,
    hasPriceRange,
    locationPricing: offer.locationPricing,
    poolPartyPricing: offer.poolPartyPricing,
    selectedLocations: offer.selectedLocations || [],
    selectedPoolParties: offer.selectedPoolParties || [],
    originalLocationPricing: offer.originalLocationPricing || [],
    originalPoolPartyPricing: offer.originalPoolPartyPricing || []
  };
};

// -------------------------------
// Main Component
// -------------------------------
const Rates = () => {
  const navigate = useNavigate();
  const [activeOffers, setActiveOffers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [expandedPoolPartyId, setExpandedPoolPartyId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;
        const today = new Date().toISOString().split('T')[0];

        const offersRes = await fetch(`${API_BASE_URL}/offers/active?bookingDate=${today}`);
        const offersJson = await offersRes.json();
        if (offersJson.success && Array.isArray(offersJson.data)) {
          setActiveOffers(offersJson.data);
        }

        const locationsRes = await axios.get(`${API_BASE_URL}/locations`);
        let locationsData = [];
        if (Array.isArray(locationsRes.data)) {
          locationsData = locationsRes.data;
        } else if (locationsRes.data && Array.isArray(locationsRes.data.locations)) {
          locationsData = locationsRes.data.locations;
        }
        setLocations(locationsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleOfferExpansion = useCallback((offerId) => {
    setExpandedOfferId(prev => prev === offerId ? null : offerId);
    setExpandedPoolPartyId(null);
  }, []);

  const togglePoolPartyExpansion = useCallback((poolPartyId, e) => {
    e.stopPropagation();
    setExpandedPoolPartyId(prev => prev === poolPartyId ? null : poolPartyId);
  }, []);

  const handleLocationClick = useCallback((e, id) => {
  e.stopPropagation();
  
  // Case 1: ID is a location ID
  const location = locations.find(loc => loc._id === id);
  if (location) {
    navigate(`/locations-details/${id}`);
    return;
  }

  // Case 2: ID is a pool party ID – find the location that created it
  const locationFromPoolParty = locations.find(loc => 
    (loc.poolPartyConfig?.isPrivatePoolCreatedFromHere && loc.poolPartyConfig?.privatePoolPartyId === id) ||
    (loc.poolPartyConfig?.isSharedPoolCreatedFromHere && loc.poolPartyConfig?.sharedPoolPartyId === id)
  );

  if (locationFromPoolParty) {
    // Pass state to indicate we want to open the pool party modal
    navigate(`/locations-details/${locationFromPoolParty._id}`, {
      state: { openPoolPartyModal: true }
    });
  } else {
    console.warn('No location found for pool party ID:', id);
  }
}, [locations, navigate]);

  const processedOffers = useMemo(() => {
    return activeOffers.map(processOfferForDisplay);
  }, [activeOffers]);

  const getDisplayData = useCallback(() => {
    if (isLoading) {
      return Array(6).fill(null).map((_, index) => ({ id: `loading-${index}`, isLoading: true }));
    }
    if (activeOffers.length > 0) {
      return processedOffers;
    } else if (locations.length > 0) {
      return locations.slice(0, 6);
    } else {
      return fallbackPackages;
    }
  }, [isLoading, activeOffers.length, processedOffers, locations]);

  const displayData = useMemo(() => getDisplayData(), [getDisplayData]);

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      <Navbar />

      <div className="bg-white pt-28 pb-10 sm:pt-36 sm:pb-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our <span className="text-[#008DDA]">Packages</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {activeOffers.length > 0
              ? "Special offers available! Click on offers to see included locations and details."
              : "Choose from our popular all-inclusive packages or customize your visit with session-based rates below."}
          </p>
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeOffers.length > 0 ? "Active Offers" : "Popular Packages"}
            </h2>
            <p className="text-gray-500">
              {activeOffers.length > 0
                ? "Limited time offers - Click to expand details"
                : "Our best-selling all-inclusive options"}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(null).map((_, idx) => <LoadingCard key={idx} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
              {displayData.map((item, idx) => {
                if (item.isLoading) return <LoadingCard key={item.id} />;

                if (!item.offerType) {
                  // Regular location or fallback
                  const isFallback = !item._id && !item.offerType;
                  return <FallbackCard key={item._id || item.id || `card-${idx}`} item={item} />;
                }

                // Offer card
                const originalOffer = activeOffers.find(o => o._id === item.id);
                const isExpanded = expandedOfferId === item.id;

                return (
                  <OfferCard
                    key={item.id}
                    item={item}
                    originalOffer={originalOffer}
                    isExpanded={isExpanded}
                    toggleOfferExpansion={toggleOfferExpansion}
                    expandedPoolPartyId={expandedPoolPartyId}
                    togglePoolPartyExpansion={togglePoolPartyExpansion}
                    handleLocationClick={handleLocationClick}
                    getOfferIcon={getOfferIcon}
                    getPoolPartyPriceText={getPoolPartyPriceText}
                  />
                );
              })}
            </div>
          )}

          {!isLoading && activeOffers.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                No active offers found for today. Showing regular packages.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: DETAILED BREAKDOWN (unchanged) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Detailed Session Rates</h2>
            <p className="text-lg text-gray-600">Specific timing breakdowns for picnics and stays.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 mb-20">
            <div className="border border-gray-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-100 p-2 rounded-lg">{detailedPicnic.withoutFood.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{detailedPicnic.withoutFood.title}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{detailedPicnic.withoutFood.subtitle}</p>
                </div>
              </div>
              <div className="space-y-6">
                {detailedPicnic.withoutFood.sessions.map((session, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-[#008DDA]">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold text-sm">{session.label}</span>
                      <span className="text-xs text-gray-500 ml-auto">{session.time}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <PriceRow label="Adults" price={session.adult} />
                      <PriceRow label="Kids (5-12)" price={session.kid} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#008DDA]/30 bg-blue-50/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg text-[#008DDA]">{detailedPicnic.withFood.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{detailedPicnic.withFood.title}</h3>
                  <p className="text-xs font-bold text-[#008DDA] uppercase tracking-wide">{detailedPicnic.withFood.subtitle}</p>
                </div>
              </div>
              <div className="space-y-6">
                {detailedPicnic.withFood.sessions.map((session, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 text-[#008DDA]">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold text-sm">{session.label}</span>
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">{session.time}</span>
                    </div>
                    {session.note && (
                      <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mb-3 inline-block font-medium">
                        {session.note}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <PriceRow label="Adults" price={session.adult} />
                      <PriceRow label="Kids (5-12)" price={session.kid} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-20">
            <div className="flex items-center gap-2 mb-8">
              <Moon className="w-6 h-6 text-gray-900" />
              <h3 className="text-2xl font-bold text-gray-900">Couple Stay Options</h3>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {coupleStays.map((stay, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 border ${
                    stay.highlight ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-900 border-gray-200 hover:border-[#008DDA]"
                  } transition-colors`}
                >
                  <h4 className="font-bold text-lg mb-1">{stay.title}</h4>
                  <p className={`text-xs mb-6 ${stay.highlight ? "text-gray-400" : "text-gray-500"}`}>{stay.time}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-xs uppercase tracking-wider opacity-70">{stay.type}</span>
                    <span className={`text-2xl font-bold ${stay.highlight ? "text-[#008DDA]" : "text-[#008DDA]"}`}>
                      ₹{stay.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-blue-50 p-4 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-[#008DDA] mt-0.5" />
              <p className="text-sm text-gray-700">
                <span className="font-bold">Stay Child Policy:</span> Kids up to 5 years are complimentary. Kids above 5 years are chargeable.
              </p>
            </div>
          </div>

          <div className="bg-[#005c99] rounded-3xl overflow-hidden shadow-xl mb-20 text-white">
            <div className="p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/10 p-2 rounded-full">
                    <Moon className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold">{nightFarmHouse.title}</h2>
                </div>
                <p className="text-blue-200 text-lg mb-6">{nightFarmHouse.time}</p>
                <span className="inline-block bg-[#008DDA] px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                  ✨ {nightFarmHouse.includes}
                </span>
              </div>
              <div className="flex gap-6 w-full lg:w-auto">
                {nightFarmHouse.rates.map((rate, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-sm border border-white/10 flex-1 lg:w-48 p-6 rounded-2xl text-center"
                  >
                    <p className="text-sm text-blue-100 mb-2">{rate.type}</p>
                    <p className="text-3xl font-bold">₹{rate.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Extra Services
              </h3>
              <div className="space-y-4">
                {extras.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                    <span className="font-bold text-[#008DDA]">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white flex flex-col justify-center">
              <Users className="w-10 h-10 text-[#008DDA] mb-4" />
              <h3 className="text-2xl font-bold mb-2">Group Bookings?</h3>
              <p className="text-gray-400 mb-6">
                We offer special discounts for schools, colleges, tuition classes, and large corporate groups.
              </p>
              <button className="bg-[#008DDA] text-white py-3 px-6 rounded-xl font-bold hover:bg-[#0077b6] transition w-fit">
                Contact for Group Rates
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default memo(Rates);