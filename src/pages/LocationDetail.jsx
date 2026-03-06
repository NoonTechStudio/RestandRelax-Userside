import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import {
  Share2, Heart, Star, MapPin, Calendar, Flag,
  Users, Bed, Bath, Clock, CheckCircle, Gift, X, Check, FileText
} from 'lucide-react';
import {
  BookingModal, ImageGallery, GuestSelector, ReviewSection,
  LocationMap, Calenderdates, PoolPartyModal
} from '../components/Location';

// Components
import LoadingSkeleton from '../components/Location/LoadingSkeletion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Utils
import {
  generateMonths,
  sanitizeHTML,
  processAmenities,
  formatDate
} from '../utils/locations/locationUitls';

// Define the primary color for consistency
const PRIMARY_COLOR = '#008DDA';
const PRIMARY_COLOR_CLASS = 'text-[#008DDA]';

function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [location, setLocation] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  // Calendar and booking states
  const [currentMonth, setCurrentMonth] = useState(0);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  // Separate states for desktop and mobile guest selectors
  const [showDesktopGuestSelector, setShowDesktopGuestSelector] = useState(false);
  const [showMobileGuestSelector, setShowMobileGuestSelector] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [showPoolPartyModal, setShowPoolPartyModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    address: '',
    food: false,
    foodPackage: ''
  });

  // Terms and Conditions states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // NEW: Pool Party Terms Modal state
  const [showPoolPartyTermsModal, setShowPoolPartyTermsModal] = useState(false);

  // New state for same-day checkout option
  const [sameDayCheckout, setSameDayCheckout] = useState(false);

  const calendarRef = useRef(null);

  // Memoized values (all hooks before early returns)
  const months = useMemo(() => generateMonths(6), []);

  const amenities = useMemo(() => processAmenities(location?.amenities), [location]);
  const averageRating = useMemo(() => reviews?.summary?.averageRating || 0, [reviews]);
  const totalReviews = useMemo(() => reviews?.summary?.totalReviews || 0, [reviews]);
  const recommendedPercentage = useMemo(() => reviews?.summary?.recommendedPercentage || 0, [reviews]);

  const propertyDetails = useMemo(() => [
    { value: location?.capacityOfPersons, label: 'Guests', icon: Users, color: 'bg-blue-100 text-blue-800' },
    { value: location?.propertyDetails?.bedrooms, label: 'Bedrooms', icon: Bed, color: 'bg-green-100 text-green-800' },
    { value: location?.propertyDetails?.bathrooms || 1, label: 'Bathrooms', icon: Bath, color: 'bg-yellow-100 text-yellow-800' },
  ].filter(detail => detail.value), [location]);

  const showSameDayOption = useMemo(() => location?.propertyDetails?.nightStay === true, [location]);

  const totalPrice = useMemo(() => {
    if (!checkInDate || !location?.pricing) return 0;

    const pricing = location.pricing;
    const capacity = location.capacityOfPersons || 0;
    const totalGuests = adults + kids;
    const isNightStayAvailable = location?.propertyDetails?.nightStay === true && !sameDayCheckout;

    let nights = 0;
    if (isNightStayAvailable && checkOutDate) {
      nights = checkOutDate > checkInDate
        ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
        : 1;
    }

    let days = 1;
    if (checkOutDate) {
      const diffTime = Math.abs(checkOutDate - checkInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      days = Math.max(1, diffDays);
    }

    const perNightRate = pricing.pricePerPersonNight || 0;
    const nightPrice = perNightRate > 0 && nights > 0
      ? perNightRate * totalGuests * nights
      : 0;

    const dayAdultRate = pricing.pricePerAdultDay || 0;
    const dayKidRate = pricing.pricePerKidDay || 0;

    let dayPrice = 0;
    if (dayAdultRate || dayKidRate) {
      dayPrice = (dayAdultRate * adults * days) + (dayKidRate * kids * days);
    }

    let extraCharge = 0;
    if (capacity && totalGuests > capacity) {
      const extraGuests = totalGuests - capacity;
      const extraRate = pricing.extraPersonCharge || 0;
      const extraMultiplier = isNightStayAvailable ? (nights || 1) : days;
      extraCharge = extraGuests * extraRate * (extraMultiplier || 1);
    }

    let foodPrice = 0;
    if (bookingForm.food && bookingForm.foodPackage && pricing) {
      const pkgKey = bookingForm.foodPackage === 'package1' ? 'foodPackage1' : 'foodPackage2';
      const pkg = pricing[pkgKey];
      if (pkg) {
        foodPrice = pkg.price * totalGuests * days;
      }
    }

    return nightPrice + dayPrice + extraCharge + foodPrice;
  }, [checkInDate, checkOutDate, location, adults, kids, sameDayCheckout, bookingForm.food, bookingForm.foodPackage]);

  // Stable callbacks
  const scrollToCalendar = useCallback(() => {
    if (calendarRef.current) {
      calendarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleDateClick = useCallback((day, monthIndex) => {
    if (!day || !months[monthIndex]) return;

    const month = months[monthIndex];
    const clickedDate = new Date(month.year, month.month, day);

    if (location?.propertyDetails?.nightStay === false || sameDayCheckout) {
      setCheckInDate(clickedDate);
      setCheckOutDate(clickedDate);
      setSelectedDates([clickedDate]);
    } else if (location?.propertyDetails?.nightStay) {
      if (!checkInDate) {
        setCheckInDate(clickedDate);
        setSelectedDates([clickedDate]);
      } else if (!checkOutDate && clickedDate > checkInDate) {
        setCheckOutDate(clickedDate);
        const datesBetween = [];
        let currentDate = new Date(checkInDate);
        currentDate.setDate(currentDate.getDate() + 1);
        while (currentDate <= clickedDate) {
          datesBetween.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setSelectedDates([checkInDate, ...datesBetween]);
      } else {
        setCheckInDate(clickedDate);
        setCheckOutDate(null);
        setSelectedDates([clickedDate]);
      }
    } else {
      setCheckInDate(clickedDate);
      setCheckOutDate(null);
      setSelectedDates([clickedDate]);
    }
  }, [location, sameDayCheckout, checkInDate, checkOutDate, months]);

  const handleGuestChange = useCallback((type, value) => {
    if (type === 'adults') setAdults(value);
    else setKids(value);
  }, []);

  const handleBookNow = useCallback(() => {
    if (!checkInDate) {
      toast.error('Please select check-in date');
      return;
    }
    if (location?.propertyDetails?.nightStay && !checkOutDate && !sameDayCheckout) {
      toast.error('Please select check-out date');
      return;
    }
    setShowBookingModal(true);
  }, [checkInDate, checkOutDate, sameDayCheckout, location]);

  useEffect(() => {
    if (location && routeLocation.state?.openPoolPartyModal) {
      // Clear the state so it doesn't reopen on subsequent renders
      navigate(routeLocation.pathname, { replace: true, state: {} });
      // Open the pool party terms modal
      setShowPoolPartyTermsModal(true);
    }
  }, [location, routeLocation.state, routeLocation.pathname, navigate]);
  
  const handleBookingSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(bookingForm.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      let nights = 0;
      if (location?.propertyDetails?.nightStay && !sameDayCheckout) {
        nights = checkInDate && checkOutDate && checkOutDate > checkInDate
          ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
          : 1;
      }

      const bookingData = {
        locationId: id,
        name: bookingForm.name.trim(),
        phone: bookingForm.phone.trim(),
        address: bookingForm.address.trim(),
        food: bookingForm.food,
        foodPackage: bookingForm.foodPackage || null,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate?.toISOString(),
        nights,
        adults,
        kids,
        totalGuests: adults + kids,
        totalPrice,
        sameDayCheckout: sameDayCheckout || location?.propertyDetails?.nightStay === false
      };

      console.log('Booking data:', bookingData);
      // Placeholder for actual API call
      // await axios.post(`${API_BASE_URL}/bookings`, bookingData);

      toast.success('Booking submitted successfully! We will contact you shortly.');
      setShowBookingModal(false);
      setBookingForm({ name: '', phone: '', address: '', food: false, foodPackage: '' });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Error submitting booking. Please try again.');
    }
  }, [bookingForm, checkInDate, checkOutDate, adults, kids, totalPrice, sameDayCheckout, location, id]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const toggleReviewExpansion = useCallback((reviewId) => {
    setExpandedReviews(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  }, []);

  const renderStars = useCallback((rating) => {
    const numericRating = Number(rating) || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= numericRating ? `${PRIMARY_COLOR_CLASS} fill-current` : "text-gray-300"}
          />
        ))}
      </div>
    );
  }, []);

  const handleSameDayCheckoutToggle = useCallback(() => {
    if (sameDayCheckout) {
      setSameDayCheckout(false);
      setCheckOutDate(null);
      setSelectedDates(checkInDate ? [checkInDate] : []);
    } else {
      setSameDayCheckout(true);
      if (checkInDate) {
        setCheckOutDate(checkInDate);
        setSelectedDates([checkInDate]);
      }
    }
  }, [sameDayCheckout, checkInDate]);

  const handleClearDates = useCallback(() => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectedDates([]);
    setSameDayCheckout(location?.propertyDetails?.nightStay === false);
  }, [location]);

  // Fetch location data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        setReviewsLoading(true);
        setError(null);

        const [locationRes, reviewsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/locations/${id}`),
          axios.get(`${API_BASE_URL}/reviews/location/${id}`)
        ]);

        setLocation(locationRes.data);
        setReviews(reviewsRes.data);

        if (locationRes.data?.propertyDetails?.nightStay === false) {
          setSameDayCheckout(true);
        }

        setLoading(false);
        setReviewsLoading(false);
      } catch (err) {
        console.error('Error fetching location data:', err);
        setError('Failed to load location data. Please refresh the page.');
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    fetchLocationData();
  }, [id, API_BASE_URL]);

  // Update sameDayCheckout when checkInDate changes
  useEffect(() => {
    if (sameDayCheckout && checkInDate) {
      setCheckOutDate(checkInDate);
      setSelectedDates([checkInDate]);
    }
  }, [sameDayCheckout, checkInDate]);

  // ===== Terms and Conditions Modal for Location (unchanged) =====
  const TermsAndConditionsModal = useMemo(() => {
    return function Modal() {
      const [terms, setTerms] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        fetchTerms();
      }, []);

      const fetchTerms = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `${API_BASE_URL}/terms-and-conditions/active/location/${id}`
          );
          const data = await response.json();

          if (data.success && data.data) {
            setTerms(data.data);
          } else {
            setTerms({
              title: "Standard Terms and Conditions",
              terms: [
                { pointNumber: 1, title: "Charges for Children", description: "Children aged between 5 and 8 years will be charged at half rate." },
                { pointNumber: 2, title: "Charges for Adults", description: "Individuals above 8 years will be charged at the full rate." },
                { pointNumber: 3, title: "Advance Payment", description: "Entry to the resort is permitted only after the advance payment is cleared." },
                { pointNumber: 4, title: "Cancellation Policy", description: "No refunds will be issued for canceled bookings." },
                { pointNumber: 5, title: "Personal Responsibility", description: "Participation in activities and use of the swimming pool is at the individual's own risk. The resort is not liable for any injuries or accidents." }
              ]
            });
          }
        } catch (err) {
          console.error("Error fetching terms:", err);
          setError("Failed to load terms and conditions");
          setTerms({
            title: "Terms and Conditions",
            terms: [{ pointNumber: 1, title: "Standard Terms", description: "Please contact the property for specific terms and conditions." }]
          });
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowTermsModal(false)} />
          <div className="relative bg-white/95 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {loading ? "Loading..." : terms?.title || "Terms and Conditions"}
                </h2>
                {terms?.description && !loading && (
                  <p className="text-sm text-gray-600 mt-1 truncate">{terms.description}</p>
                )}
              </div>
              <button onClick={() => setShowTermsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0 ml-2">
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading terms and conditions...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
                  <p className="text-gray-600">Please try again or contact support.</p>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    Please read and accept the following terms and conditions:
                  </div>
                  <div className="space-y-4">
                    {terms?.terms?.filter(term => term.isActive !== false).map((term) => (
                      <div key={term.pointNumber} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <p className="font-semibold text-gray-900 mb-2">
                          {term.pointNumber}. {term.title}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{term.description}</p>
                      </div>
                    ))}
                    {(!terms?.terms || terms.terms.length === 0) && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Terms Available</h3>
                        <p className="text-gray-600">No specific terms and conditions are set for this location.</p>
                      </div>
                    )}
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 text-[#008DDA] border-gray-300 rounded focus:ring-[#008DDA]"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        I agree to the Terms and Conditions
                      </span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button onClick={() => setShowTermsModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (agreedToTerms) {
                    setShowTermsModal(false);
                  } else {
                    toast.error('Please agree to the Terms and Conditions to continue.');
                  }
                }}
                disabled={!agreedToTerms}
                className="px-6 py-2 bg-[#008DDA] text-white font-medium rounded-lg hover:bg-[#0066a8] disabled:opacity-50"
              >
                Confirm Agreement
              </button>
            </div>
          </div>
        </div>
      );
    };
  }, [id, API_BASE_URL, agreedToTerms]);

  // ===== NEW: Pool Party Terms Modal =====
  const PoolPartyTermsModal = () => {
    const [terms, setTerms] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [agreed, setAgreed] = useState(false);

    const poolPartyId = location?.poolPartyDetails?._id;

    useEffect(() => {
      const fetchTerms = async () => {
        if (!poolPartyId) return;
        try {
          setLoading(true);
          const response = await fetch(
            `${API_BASE_URL}/terms-and-conditions/active/poolParty/${poolPartyId}`
          );
          const data = await response.json();
          if (data.success && data.data) {
            setTerms(data.data);
          } else {
            // Fallback terms if none are defined
            setTerms({
              title: "Pool Party Terms and Conditions",
              terms: [
                {
                  pointNumber: 1,
                  title: "Standard Terms",
                  description: "Please follow the pool party guidelines provided by the resort."
                }
              ]
            });
          }
        } catch (err) {
          console.error("Error fetching pool party terms:", err);
          setError("Failed to load terms");
          setTerms({
            title: "Terms and Conditions",
            terms: [
              {
                pointNumber: 1,
                title: "Standard Terms",
                description: "Please contact the property for specific terms."
              }
            ]
          });
        } finally {
          setLoading(false);
        }
      };
      fetchTerms();
    }, [poolPartyId]);

    if (!showPoolPartyTermsModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowPoolPartyTermsModal(false)}
        />
        <div className="relative bg-white/95 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                {loading ? "Loading..." : terms?.title || "Pool Party Terms and Conditions"}
              </h2>
              {terms?.description && !loading && (
                <p className="text-sm text-gray-600 mt-1 truncate">{terms.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowPoolPartyTermsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0 ml-2"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading terms and conditions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
                <p className="text-gray-600">Please try again or contact support.</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  Please read and accept the following terms and conditions for the pool party:
                </div>
                <div className="space-y-4">
                  {terms?.terms
                    ?.filter((term) => term.isActive !== false)
                    .map((term) => (
                      <div key={term.pointNumber} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <p className="font-semibold text-gray-900 mb-2">
                          {term.pointNumber}. {term.title}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{term.description}</p>
                      </div>
                    ))}
                  {(!terms?.terms || terms.terms.length === 0) && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Terms Available</h3>
                      <p className="text-gray-600">No specific terms and conditions are set for this pool party.</p>
                    </div>
                  )}
                </div>

                {/* Agreement Checkbox */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 text-[#008DDA] border-gray-300 rounded focus:ring-[#008DDA]"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      I agree to the Pool Party Terms and Conditions
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowPoolPartyTermsModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (agreed) {
                  setShowPoolPartyTermsModal(false);
                  setShowPoolPartyModal(true);
                } else {
                  toast.error("Please agree to the Terms and Conditions to continue.");
                }
              }}
              disabled={!agreed}
              className="px-6 py-2 bg-[#008DDA] text-white font-medium rounded-lg hover:bg-[#0066a8] disabled:opacity-50"
            >
              Confirm & Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Early returns after all hooks
  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 flex items-center justify-center font-inter">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <div className="text-red-600 text-xl mb-4 font-semibold">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#008DDA] text-white px-6 py-3 rounded-lg hover:bg-[#0066a8] transition-colors font-semibold"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 flex items-center justify-center font-inter">
        <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg">Location not found</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 font-inter">
        <Toaster position="top-center" reverseOrder={false} />
        {showTermsModal && <TermsAndConditionsModal />}
        {/* Render the new Pool Party Terms Modal */}
        {showPoolPartyTermsModal && <PoolPartyTermsModal />}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Main Title and Meta */}
          <div className="mb-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">
              {location.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {reviewsLoading ? (
                <div className="flex items-center gap-1 text-gray-500">
                  <Star size={16} className="text-gray-300" />
                  <span className="font-semibold">Loading ratings...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 font-semibold">
                  {renderStars(Math.round(averageRating))}
                  <span className="ml-1 text-gray-900">{averageRating.toFixed(1)}</span>
                  <span className="mx-1 text-gray-400">·</span>
                  <button
                    onClick={() => navigate(`/location/${id}/reviews`)}
                    className="underline hover:text-gray-700 transition-colors"
                  >
                    {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
              <span className="text-gray-400">·</span>
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-gray-400" />
                <span className="underline">
                  {location.address?.city ?? 'Location TBD'}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors text-gray-700 text-sm font-medium">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors text-gray-700 text-sm font-medium">
                  <Heart size={16} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Images Section - unchanged */}
          <ImageGallery
            locationId={location._id}
            images={{
              mainImage: location.images[0],
              otherImages: location.images?.slice(1, 5),
              allImages: location.images
            }}
          />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* LEFT SECTION */}
            <div className="lg:col-span-2 space-y-10">
              {/* 1. Property Summary & Badges */}
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  {location.propertyDetails?.nightStay ? 'Farmhouse Night Stay' : 'Exclusive Day Picnic Spot'} hosted by Owner
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                  {propertyDetails.map((detail, index) => (
                    <div key={index} className={`flex items-center gap-2 px-3 py-1 rounded-full ${detail.color}`}>
                      <detail.icon size={16} className="shrink-0" />
                      <span>{detail.value} {detail.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Highlights */}
              <div className="pb-6 border-b border-gray-200 space-y-5">
                <h3 className="font-semibold text-xl mb-4 text-gray-900">Key Highlights</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Highlight 1: Check-in */}
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <CheckCircle size={24} className={`mt-1 shrink-0 ${PRIMARY_COLOR_CLASS}`} />
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-900">Smooth Check-in</h4>
                      <p className="text-sm text-gray-600">
                        {totalReviews > 0
                          ? `${recommendedPercentage}% of guests gave the check-in process a 5-star rating.`
                          : "Guests consistently rate our check-in process 5 stars."}
                      </p>
                    </div>
                  </div>

                  {/* Highlight 2: Timings */}
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Clock size={24} className={`mt-1 shrink-0 ${PRIMARY_COLOR_CLASS}`} />
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-900">Timings</h4>
                      <p className="text-sm text-gray-600">
                        {location?.propertyDetails?.nightStay === false || sameDayCheckout
                          ? "Check-in 10:00 AM · Checkout 10:00 PM (Same day)"
                          : "Check-in 10:00 AM · Checkout next day 10:00 AM (For night stay)"}
                      </p>
                    </div>
                  </div>

                  {/* Highlight 3: Address with Pool Party */}
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm sm:col-span-2">
                    <MapPin size={24} className={`mt-1 shrink-0 ${PRIMARY_COLOR_CLASS}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-gray-900">Location Address</h4>
                      <p className="text-sm text-gray-600">
                        {location.address?.line1 ?? 'Address unavailable'}
                        {location.address?.line2 && `, ${location.address.line2}`}
                        {location.address?.city && `, ${location.address.city}`}
                        {location.address?.state && `, ${location.address.state}`}
                        {location.address?.pincode && ` - ${location.address.pincode}`}
                      </p>

                      {/* Pool Party Information */}
                      {(location.poolPartyConfig?.isPrivatePoolCreatedFromHere || location.poolPartyConfig?.isSharedPoolCreatedFromHere) && (
                        <div className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900 text-sm mb-1">Pool Party Booking Available</h5>
                                <p className="flex items-center gap-1 text-xs text-gray-700">
                                  <Check size={12} className="text-green-500" />
                                  <span>Pool party only with food packages</span>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowPoolPartyTermsModal(true)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] whitespace-nowrap text-sm flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Book Pool Party
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Booking Card - appears after highlights on mobile, hidden on desktop */}
              <div className="block lg:hidden">
                <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-2xl p-5">
                  <div className="flex items-center justify-center mb-4 pb-4 border-b border-gray-100">
                    <span className="text-xl font-bold text-gray-900 mr-2">Check Availability</span>
                    {totalReviews > 0 && (
                      <div className="flex items-center text-sm font-semibold ml-auto">
                        {renderStars(Math.round(averageRating))}
                        <span className="ml-1 text-gray-800">{averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-300 rounded-xl overflow-visible mb-4">
                    <div className="grid grid-cols-2 border-b border-gray-300">
                      <div className="border-r border-gray-300 p-3 hover:bg-gray-50 cursor-pointer" onClick={scrollToCalendar}>
                        <div className="text-xs font-semibold text-gray-700 mb-1">CHECK-IN</div>
                        <div className="font-medium text-gray-900 flex justify-between">
                          <span>{checkInDate ? formatDate(checkInDate) : 'Select date'}</span>
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                      </div>
                      <div className="p-3 hover:bg-gray-50 cursor-pointer" onClick={scrollToCalendar}>
                        <div className="text-xs font-semibold text-gray-700 mb-1">CHECKOUT</div>
                        <div className="font-medium text-gray-900">
                          <span>
                            {checkOutDate ? formatDate(checkOutDate) :
                              location?.propertyDetails?.nightStay ? 'Select date' :
                              checkInDate ? formatDate(checkInDate) : 'Select date'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <GuestSelector
                      adults={adults}
                      kids={kids}
                      onGuestChange={handleGuestChange}
                      showGuestSelector={showMobileGuestSelector}
                      setShowGuestSelector={setShowMobileGuestSelector}
                      maxCapacity={location.capacityOfPersons}
                      onCalendarClick={scrollToCalendar}
                      checkInDate={checkInDate}
                      checkOutDate={checkOutDate}
                      locationPricing={location.pricing}
                      isDayPicnic={location?.propertyDetails?.nightStay === false || sameDayCheckout}
                      totalPrice={totalPrice}
                    />

                    {showSameDayOption && (
                      <div className="border-t border-gray-300 p-3">
                        <label className="flex items-start sm:items-center cursor-pointer gap-3">
                          <input
                            type="checkbox"
                            checked={sameDayCheckout}
                            onChange={handleSameDayCheckoutToggle}
                            className="w-4 h-4 text-[#008DDA] border-gray-300 rounded focus:ring-[#008DDA] mt-1 sm:mt-0"
                          />
                          <div>
                            <div className="text-sm text-gray-900">Same-day checkout</div>
                            <div className="text-xs text-gray-600">Checkout at 10:00 PM on same day (Day picnic)</div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-start gap-3 text-sm">
                      <Users size={24} className={`${PRIMARY_COLOR_CLASS} shrink-0 mt-1`} />
                      <div>
                        <h4 className="font-semibold mb-1">Maximum Capacity</h4>
                        <p className="text-gray-600">This location accommodates maximum <span className="font-bold">{location.capacityOfPersons} guest{location.capacityOfPersons !== 1 ? 's' : ''}</span>.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-start gap-3 text-sm mb-3">
                      <Gift size={24} className={`${PRIMARY_COLOR_CLASS} shrink-0 mt-1`} />
                      <div>
                        <h4 className="font-semibold mb-1">Terms and Conditions</h4>
                        <p className="text-gray-600 mb-3">Please read and accept our terms and conditions before proceeding.</p>
                        <button onClick={() => setShowTermsModal(true)} className="text-[#008DDA] hover:text-[#0066a8] underline font-medium text-sm">
                          Read Terms and Conditions
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBookNow}
                    disabled={adults + kids > location.capacityOfPersons || !checkInDate || (location?.propertyDetails?.nightStay && !checkOutDate && !sameDayCheckout) || !agreedToTerms}
                    className="w-full bg-[#008DDA] text-white font-extrabold py-3.5 rounded-xl hover:bg-[#0066a8] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {adults + kids > location.capacityOfPersons
                      ? `Maximum ${location.capacityOfPersons} guests allowed`
                      : !agreedToTerms
                      ? 'Accept Terms to Reserve'
                      : 'Reserve Now'}
                  </button>
                </div>
                <div className="mt-6 text-center">
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:underline mx-auto">
                    <Flag size={16} /> Report this listing
                  </button>
                </div>
              </div>

              {/* 3. Description */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-2xl mb-4 text-gray-900">About this Place</h3>
                <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHTML(location.description || 'No description available.') }} />
              </div>

              {/* 4. Amenities */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-2xl mb-6 text-gray-900">What this place offers</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {amenities.map((amenity, idx) => {
                    const IconComponent = amenity.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 py-2">
                        <IconComponent size={20} className={`text-gray-700 shrink-0 ${PRIMARY_COLOR_CLASS}`} />
                        <span className="text-gray-800 font-medium">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Calendar Section */}
              <div className="pb-6 border-b border-gray-200" ref={calendarRef}>
                <h3 className="font-semibold text-2xl mb-6 text-gray-900">Select Your Dates</h3>
                <Calenderdates
                  months={months}
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  selectedDates={selectedDates}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  onDateClick={handleDateClick}
                  locationId={id}
                />
                <div className="mt-6 flex justify-end">
                  <button onClick={handleClearDates} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    Clear dates
                  </button>
                </div>
              </div>

              {/* 6. Reviews Section */}
              <ReviewSection reviews={reviews} expandedReviews={expandedReviews} onToggleReviewExpansion={toggleReviewExpansion} locationId={id} />

              {/* 7. Map Section */}
              {location && <LocationMap location={location} />}
            </div>

            {/* RIGHT SECTION - Booking Card (desktop only) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="lg:sticky lg:top-18">
                <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-2xl p-5">
                  <div className="flex items-center justify-center mb-4 pb-4 border-b border-gray-100">
                    <span className="text-xl font-bold text-gray-900 mr-2">Check Availability</span>
                    {totalReviews > 0 && (
                      <div className="flex items-center text-sm font-semibold ml-auto">
                        {renderStars(Math.round(averageRating))}
                        <span className="ml-1 text-gray-800">{averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-300 rounded-xl overflow-visible mb-4">
                    <div className="grid grid-cols-2 border-b border-gray-300">
                      <div className="border-r border-gray-300 p-3 hover:bg-gray-50 cursor-pointer" onClick={scrollToCalendar}>
                        <div className="text-xs font-semibold text-gray-700 mb-1">CHECK-IN</div>
                        <div className="font-medium text-gray-900 flex justify-between">
                          <span>{checkInDate ? formatDate(checkInDate) : 'Select date'}</span>
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                      </div>
                      <div className="p-3 hover:bg-gray-50 cursor-pointer" onClick={scrollToCalendar}>
                        <div className="text-xs font-semibold text-gray-700 mb-1">CHECKOUT</div>
                        <div className="font-medium text-gray-900">
                          <span>
                            {checkOutDate ? formatDate(checkOutDate) :
                              location?.propertyDetails?.nightStay ? 'Select date' :
                              checkInDate ? formatDate(checkInDate) : 'Select date'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <GuestSelector
                      adults={adults}
                      kids={kids}
                      onGuestChange={handleGuestChange}
                      showGuestSelector={showDesktopGuestSelector}
                      setShowGuestSelector={setShowDesktopGuestSelector}
                      maxCapacity={location.capacityOfPersons}
                      onCalendarClick={scrollToCalendar}
                      checkInDate={checkInDate}
                      checkOutDate={checkOutDate}
                      locationPricing={location.pricing}
                      isDayPicnic={location?.propertyDetails?.nightStay === false || sameDayCheckout}
                      totalPrice={totalPrice}
                    />

                    {showSameDayOption && (
                      <div className="border-t border-gray-300 p-3">
                        <label className="flex items-start sm:items-center cursor-pointer gap-3">
                          <input
                            type="checkbox"
                            checked={sameDayCheckout}
                            onChange={handleSameDayCheckoutToggle}
                            className="w-4 h-4 text-[#008DDA] border-gray-300 rounded focus:ring-[#008DDA] mt-1 sm:mt-0"
                          />
                          <div>
                            <div className="text-sm text-gray-900">Same-day checkout</div>
                            <div className="text-xs text-gray-600">Checkout at 10:00 PM on same day (Day picnic)</div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-start gap-3 text-sm">
                      <Users size={24} className={`${PRIMARY_COLOR_CLASS} shrink-0 mt-1`} />
                      <div>
                        <h4 className="font-semibold mb-1">Maximum Capacity</h4>
                        <p className="text-gray-600">This location accommodates maximum <span className="font-bold">{location.capacityOfPersons} guest{location.capacityOfPersons !== 1 ? 's' : ''}</span>.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-start gap-3 text-sm mb-3">
                      <Gift size={24} className={`${PRIMARY_COLOR_CLASS} shrink-0 mt-1`} />
                      <div>
                        <h4 className="font-semibold mb-1">Terms and Conditions</h4>
                        <p className="text-gray-600 mb-3">Please read and accept our terms and conditions before proceeding.</p>
                        <button onClick={() => setShowTermsModal(true)} className="text-[#008DDA] hover:text-[#0066a8] underline font-medium text-sm">
                          Read Terms and Conditions
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBookNow}
                    disabled={adults + kids > location.capacityOfPersons || !checkInDate || (location?.propertyDetails?.nightStay && !checkOutDate && !sameDayCheckout) || !agreedToTerms}
                    className="w-full bg-[#008DDA] text-white font-extrabold py-3.5 rounded-xl hover:bg-[#0066a8] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {adults + kids > location.capacityOfPersons
                      ? `Maximum ${location.capacityOfPersons} guests allowed`
                      : !agreedToTerms
                      ? 'Accept Terms to Reserve'
                      : 'Reserve Now'}
                  </button>
                </div>
                <div className="mt-6 text-center">
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:underline mx-auto">
                    <Flag size={16} /> Report this listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <BookingModal
          showBookingModal={showBookingModal}
          setShowBookingModal={setShowBookingModal}
          bookingForm={bookingForm}
          onInputChange={handleInputChange}
          onSubmit={handleBookingSubmit}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          adults={adults}
          kids={kids}
          location={location}
          totalPrice={totalPrice}
          sameDayCheckout={sameDayCheckout}
        />

        <PoolPartyModal
          isOpen={showPoolPartyModal}
          onClose={() => setShowPoolPartyModal(false)}
          location={location}
          adults={adults}
          kids={kids}
          onAdultsChange={setAdults}
          onKidsChange={setKids}
        />
      </div>
      <Footer />
    </>
  );
}

export default React.memo(LocationDetail);