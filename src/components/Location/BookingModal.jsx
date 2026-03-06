import { X, CheckCircle, Calendar, User, Phone, MapPin, Utensils, Star, Shield, Clock, CreditCard, Download, ChevronDown, Mail, Home, Users } from 'lucide-react';
import { formatDate } from '../../utils/locations/locationUitls';
import { useState, useEffect, useCallback } from 'react';

// HELPER: Get YYYY-MM-DD in Local Time (prevents timezone shift)
const getLocalDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BookingModal = ({ 
  showBookingModal, 
  setShowBookingModal, 
  bookingForm, 
  onInputChange, 
  checkInDate, 
  checkOutDate, 
  sameDayCheckout,
  adults, 
  kids, 
  location 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [paymentStep, setPaymentStep] = useState('booking'); // 'booking' | 'payment' | 'confirmed'
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [selectedFoodPackage, setSelectedFoodPackage] = useState(null);
  const [dailyFoodSelections, setDailyFoodSelections] = useState({});
  const [showDailySelection, setShowDailySelection] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // Load Razorpay script
  useEffect(() => {
    if (!showBookingModal) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [showBookingModal]);

  // Fetch booked dates
  const fetchBookedDates = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/dates/${location._id}`);
      const result = await response.json();
      if (result.success) {
        setBookedDates(result.bookedDates);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  }, [API_BASE_URL, location]);

  // Fetch active offer
  const fetchActiveOffer = useCallback(async () => {
    if (!location?._id || !checkInDate) return;
    setOfferLoading(true);
    try {
      const dateStr = getLocalDateKey(checkInDate);
      const response = await fetch(
        `${API_BASE_URL}/offers/active/location?locationId=${location._id}&bookingDate=${dateStr}`
      );
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setActiveOffer(result.data[0]);
      } else {
        setActiveOffer(null);
      }
    } catch (error) {
      console.error('Error fetching active offer:', error);
      setActiveOffer(null);
    } finally {
      setOfferLoading(false);
    }
  }, [API_BASE_URL, location, checkInDate]);

  // Calculate days
  const calculateDays = useCallback(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const timeDiff = Math.abs(checkOutDate - checkInDate);
    return Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  }, [checkInDate, checkOutDate]);

  // Calculate nights
  const calculateNights = useCallback(() => {
    if (!checkInDate || !checkOutDate) return 0;
    if (sameDayCheckout || location?.propertyDetails?.nightStay === false) return 0;
    const days = calculateDays();
    return Math.max(0, days);
  }, [checkInDate, checkOutDate, sameDayCheckout, location, calculateDays]);

  // Get base pricing (offer if available)
  const getBasePricing = useCallback(() => {
    if (activeOffer && activeOffer.locationPricing) return activeOffer.locationPricing;
    return location?.pricing || {};
  }, [activeOffer, location]);

  // Get food packages
  const getFoodPackages = useCallback(() => {
    if (activeOffer && activeOffer.locationPricing?.foodPackages) {
      return activeOffer.locationPricing.foodPackages.filter(pkg => pkg.locationId === location._id);
    }
    return location?.pricing?.foodPackages || [];
  }, [activeOffer, location]);

  // Calculate food price
  const calculateFoodPrice = useCallback(() => {
    if (!selectedFoodPackage) return 0;
    const packages = getFoodPackages();
    if (sameDayCheckout) {
      return selectedFoodPackage.pricePerAdult * adults + selectedFoodPackage.pricePerKid * kids;
    }
    if (Object.keys(dailyFoodSelections).length > 0) {
      let total = 0;
      Object.values(dailyFoodSelections).forEach(packageId => {
        if (packageId) {
          const pkg = packages.find(p => p.foodPackageId === packageId || p._id === packageId);
          if (pkg) total += pkg.pricePerAdult * adults + pkg.pricePerKid * kids;
        }
      });
      return total;
    }
    const days = calculateDays();
    const foodDays = sameDayCheckout ? days : days + 1;
    return (selectedFoodPackage.pricePerAdult * adults + selectedFoodPackage.pricePerKid * kids) * foodDays;
  }, [selectedFoodPackage, getFoodPackages, sameDayCheckout, adults, kids, dailyFoodSelections, calculateDays]);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    if (!checkInDate || !location?.pricing) return 0;
    const basePricing = getBasePricing();
    const capacity = location.capacityOfPersons || 0;
    const totalGuests = adults + kids;
    const isNightStayAvailable = location?.propertyDetails?.nightStay === true && !sameDayCheckout;
    const days = calculateDays();
    const nights = isNightStayAvailable ? calculateNights() : 0;

    const perNightRate = basePricing.pricePerPersonNight || 0;
    const nightPrice = perNightRate > 0 && nights > 0 ? perNightRate * totalGuests * nights : 0;

    const dayAdultRate = basePricing.pricePerAdultDay || 0;
    const dayKidRate = basePricing.pricePerKidDay || 0;
    const dayPrice = dayAdultRate * adults * days + dayKidRate * kids * days;

    let extraCharge = 0;
    if (capacity && totalGuests > capacity) {
      const extraGuests = totalGuests - capacity;
      const extraRate = basePricing.extraPersonCharge || 0;
      const extraMultiplier = isNightStayAvailable ? Math.max(nights, days) : days;
      extraCharge = extraGuests * extraRate * extraMultiplier;
    }

    const foodPrice = calculateFoodPrice();
    return nightPrice + dayPrice + extraCharge + foodPrice;
  }, [checkInDate, location, getBasePricing, adults, kids, sameDayCheckout, calculateDays, calculateNights, calculateFoodPrice]);

  // Calculate remaining amount
  const calculateRemainingAmount = useCallback(() => {
    const totalPrice = calculateTotalPrice();
    return Math.max(0, totalPrice - tokenAmount);
  }, [calculateTotalPrice, tokenAmount]);

  // Price breakdown
  const calculatePriceBreakdown = useCallback(() => {
    if (!location?.pricing || !checkInDate) {
      return { adultTotal: 0, kidTotal: 0, foodPrice: 0, nights: 0, days: 0, isDayPicnic: true };
    }
    const basePricing = getBasePricing();
    const isNightStayAvailable = location?.propertyDetails?.nightStay === true && !sameDayCheckout;
    const days = calculateDays();
    const nights = isNightStayAvailable ? calculateNights() : 0;
    const perNightRate = basePricing.pricePerPersonNight || 0;
    const dayAdultRate = basePricing.pricePerAdultDay || 0;
    const dayKidRate = basePricing.pricePerKidDay || 0;
    let adultTotal = 0, kidTotal = 0;
    if (perNightRate > 0 && nights > 0) {
      adultTotal += perNightRate * adults * nights;
      kidTotal += perNightRate * kids * nights;
    }
    if (dayAdultRate || dayKidRate) {
      adultTotal += dayAdultRate * adults * days;
      kidTotal += dayKidRate * kids * days;
    }
    const foodPrice = calculateFoodPrice();
    return { adultTotal, kidTotal, foodPrice, nights, days, isDayPicnic: !isNightStayAvailable };
  }, [location, checkInDate, getBasePricing, sameDayCheckout, calculateDays, calculateNights, adults, kids, calculateFoodPrice]);

  // Get daily breakdown
  const getDailyBreakdown = useCallback(() => {
    const days = calculateDays();
    const foodDays = sameDayCheckout ? days : days + 1;
    const breakdown = [];
    for (let i = 0; i < foodDays; i++) {
      const currentDate = new Date(checkInDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateKey = getLocalDateKey(currentDate);
      const packageId = dailyFoodSelections[dateKey];
      const packages = getFoodPackages();
      const pkg = packageId ? packages.find(p => p.foodPackageId === packageId || p._id === packageId) : null;
      breakdown.push({ date: currentDate, dateKey, package: pkg });
    }
    return breakdown;
  }, [calculateDays, sameDayCheckout, checkInDate, dailyFoodSelections, getFoodPackages]);

  // Update token amount when total price changes
  useEffect(() => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice > 0) {
      const halfAmount = Math.round((totalPrice * 0.5) / 100) * 100;
      setTokenAmount(halfAmount);
    } else {
      setTokenAmount(0);
    }
  }, [calculateTotalPrice]);

  // Fetch booked dates when modal opens
  useEffect(() => {
    if (showBookingModal && location?._id) {
      fetchBookedDates();
      setBookingData(null);
      setPaymentStep('booking');
      setSelectedFoodPackage(null);
      setDailyFoodSelections({});
      setShowDailySelection(false);
    }
  }, [showBookingModal, location, fetchBookedDates]);

  // Fetch active offer when check-in date changes
  useEffect(() => {
    if (location?._id && checkInDate) {
      fetchActiveOffer();
    } else {
      setActiveOffer(null);
    }
  }, [location, checkInDate, fetchActiveOffer]);

  // Initialize daily food selections when dates or package changes
  useEffect(() => {
    if (checkInDate && checkOutDate && selectedFoodPackage && !sameDayCheckout) {
      const days = calculateDays();
      const foodDays = sameDayCheckout ? days : days + 1;
      const newSelections = {};
      for (let i = 0; i < foodDays; i++) {
        const currentDate = new Date(checkInDate);
        currentDate.setDate(currentDate.getDate() + i);
        newSelections[getLocalDateKey(currentDate)] = selectedFoodPackage.id;
      }
      setDailyFoodSelections(newSelections);
    }
  }, [checkInDate, checkOutDate, selectedFoodPackage, sameDayCheckout, calculateDays]);

  // PDF Download
  const downloadPDF = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/download-pdf`);
      if (!response.ok) throw new Error('Failed to download PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-confirmation-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleDailySelectionChange = (dateKey, packageId) => {
    setDailyFoodSelections(prev => ({ ...prev, [dateKey]: packageId }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const totalPrice = calculateTotalPrice();
      const remainingAmount = calculateRemainingAmount();
      const dailyFoodSelectionsArray = Object.entries(dailyFoodSelections)
        .filter(([_, packageId]) => packageId)
        .map(([date, packageId]) => ({ date, packageId }));

      const bookingPayload = {
        locationId: location._id,
        checkInDate: getLocalDateKey(checkInDate),
        checkOutDate: checkOutDate ? getLocalDateKey(checkOutDate) : null,
        checkInTime: bookingForm.checkInTime || '10:00 AM',
        name: bookingForm.name,
        phone: bookingForm.phone,
        email: bookingForm.email || '',
        address: bookingForm.address,
        adults,
        kids,
        withFood: !!selectedFoodPackage,
        foodPackageId: selectedFoodPackage?.id || null,
        dailyFoodSelections: dailyFoodSelectionsArray,
        paymentType: 'token',
        amountPaid: tokenAmount,
        remainingAmount,
        pricing: {
          pricePerPersonNight: location?.pricing?.pricePerPersonNight || 0,
          pricePerAdultDay: location?.pricing?.pricePerAdultDay || 0,
          pricePerKidDay: location?.pricing?.pricePerKidDay || 0,
          extraPersonCharge: location?.pricing?.extraPersonCharge || 0,
          totalPrice,
        },
        sameDayCheckout: sameDayCheckout || location?.propertyDetails?.nightStay === false,
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();
      if (result.success) {
        setBookingData(result.booking);
        await createPaymentOrder(result.booking._id, tokenAmount);
        setPaymentStep('payment');
      } else {
        alert(result.error || 'Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createPaymentOrder = async (bookingId, amount) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          currency: 'INR',
          userEmail: bookingForm.email || '',
          userPhone: bookingForm.phone,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setRazorpayOrder(result);
        return result;
      } else {
        throw new Error(result.error || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment order creation error:', error);
      alert('Payment initialization failed. Please try again.');
      throw error;
    }
  };

  const initiateRazorpayPayment = () => {
    if (!razorpayOrder || !window.Razorpay) {
      alert('Payment system not ready. Please try again.');
      return;
    }
    setPaymentProcessing(true);
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: razorpayOrder.order.amount,
      currency: razorpayOrder.order.currency,
      name: location.name,
      description: `Token payment for ${location.name}`,
      image: '/logo.png',
      order_id: razorpayOrder.order.id,
      handler: async (response) => {
        await verifyPayment(response);
      },
      prefill: {
        name: bookingForm.name,
        contact: bookingForm.phone,
        email: bookingForm.email || '',
      },
      notes: {
        bookingId: bookingData._id,
        location: location.name,
        paymentType: 'token',
      },
      theme: { color: '#3B82F6' },
      modal: {
        ondismiss: () => setPaymentProcessing(false),
      },
    };
    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          bookingId: bookingData._id,
        }),
      });
      const result = await verifyResponse.json();
      if (result.success) {
        setPaymentStep('confirmed');
        await fetchBookedDates();
      } else {
        alert('Payment verification failed: ' + result.error);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getBookedDatesInfo = () => {
    if (!checkInDate || !checkOutDate) return { hasConflict: false, paidCount: 0, pendingCount: 0 };
    const bookedInSelection = bookedDates.filter(booked => {
      const bookedDate = new Date(booked.date);
      return bookedDate >= checkInDate && bookedDate < checkOutDate;
    });
    if (bookedInSelection.length > 0) {
      const paidBookings = bookedInSelection.filter(b => b.status === 'paid');
      const pendingBookings = bookedInSelection.filter(b => b.status === 'pending');
      return { hasConflict: true, paidCount: paidBookings.length, pendingCount: pendingBookings.length };
    }
    return { hasConflict: false, paidCount: 0, pendingCount: 0 };
  };

  const bookingConflict = getBookedDatesInfo();

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setBookingData(null);
    setPaymentStep('booking');
    setRazorpayOrder(null);
    setSelectedFoodPackage(null);
    setDailyFoodSelections({});
    setShowDailySelection(false);
    setActiveOffer(null);
  };

  const priceBreakdown = calculatePriceBreakdown();
  const totalPrice = calculateTotalPrice();
  const remainingAmount = calculateRemainingAmount();
  const foodPackages = getFoodPackages();
  const dailyBreakdown = getDailyBreakdown();
  const nights = calculateNights();
  const days = priceBreakdown.days || 0;

  // Payment View
  if (paymentStep === 'payment' && bookingData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                  <CreditCard className="h-12 w-12 text-blue-600 relative z-10" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pay Token Amount</h3>
              <p className="text-gray-500 text-sm mb-6">Secure payment via Razorpay</p>

              <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">#{bookingData._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium truncate ml-2">{location.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">₹{remainingAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Token (50%):</span>
                  <span className="font-bold text-blue-600 text-xl">₹{tokenAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={initiateRazorpayPayment}
                  disabled={paymentProcessing}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      <span>Pay ₹{tokenAmount.toLocaleString()}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={async () => {
                    if (bookingData?._id) {
                      try {
                        await fetch(`${API_BASE_URL}/bookings/${bookingData._id}`, { method: 'DELETE' });
                      } catch (err) {
                        console.warn('Delete failed', err);
                      }
                    }
                    setPaymentStep('booking');
                  }}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                  disabled={paymentProcessing}
                >
                  Back
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SSL Encrypted • Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation View
  if (paymentStep === 'confirmed' && bookingData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                  <CheckCircle className="h-12 w-12 text-green-500 relative z-10" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Confirmed!</h3>
              <p className="text-gray-500 text-sm mb-6">
                Your token payment was successful.
                {bookingForm.email && <span className="block mt-1 text-green-600">Confirmation sent to {bookingForm.email}</span>}
              </p>

              <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono text-sm bg-green-100 text-green-800 px-2 py-1 rounded">#{bookingData._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{location.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{formatDate(checkInDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{formatDate(checkOutDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{adults} adults, {kids} kids</span>
                </div>
                {selectedFoodPackage && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Food Service:</span>
                    <span className="font-medium text-green-600">{selectedFoodPackage.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total Paid (50%):</span>
                  <span className="font-bold text-green-600 text-xl">₹{tokenAmount.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Remaining: <span className="font-medium text-orange-600">₹{remainingAmount.toLocaleString()}</span> (pay at property)
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <button
                  onClick={() => downloadPDF(bookingData._id)}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showBookingModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header with progress indicator */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Complete your booking</h2>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{location.rating || '4.8'} • {location.name}</span>
              {activeOffer && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">Special offer</span>
              )}
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-sm">
          <div className={`flex items-center ${paymentStep === 'booking' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-xs">1</span>
            Booking Details
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
          <div className={`flex items-center ${paymentStep === 'payment' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 text-xs">2</span>
            Payment
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
          <div className={`flex items-center ${paymentStep === 'confirmed' ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 text-xs">3</span>
            Confirmation
          </div>
        </div>

        {/* Conflict warning */}
        {bookingConflict.hasConflict && (
          <div className="mx-6 mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
            <div className="shrink-0 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
            <p className="text-sm text-yellow-800">
              Some selected dates may already be booked. We'll confirm availability within 24 hours.
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - Form */}
            <div className="flex-1 space-y-6">
              {/* Personal Information */}
              <section className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={bookingForm.name}
                        onChange={onInputChange}
                        required
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={bookingForm.phone}
                          onChange={onInputChange}
                          required
                          pattern="[0-9]{10}"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={bookingForm.email || ''}
                          onChange={onInputChange}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        name="address"
                        value={bookingForm.address}
                        onChange={onInputChange}
                        required
                        rows={2}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                        placeholder="Your full address"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Confirmation PDF will be sent to your email</p>
                  </div>
                </div>
              </section>

              {/* Check-in Time */}
              <section className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Check-in Time
                </h3>
                <select
                  name="checkInTime"
                  value={bookingForm.checkInTime || '10:00 AM'}
                  onChange={onInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-2">
                  {sameDayCheckout ? 'Checkout: 10:00 PM (same day)' : 'Checkout: Next day 10:00 AM'}
                </p>
              </section>

              {/* Food Packages */}
              <section className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-blue-600" />
                  Food Packages {activeOffer && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Special offer</span>}
                </h3>
                {foodPackages.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">No food packages available</p>
                ) : (
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition">
                      <input
                        type="radio"
                        name="foodOption"
                        checked={!selectedFoodPackage}
                        onChange={() => {
                          setSelectedFoodPackage(null);
                          setDailyFoodSelections({});
                          setShowDailySelection(false);
                        }}
                        className="mt-1 w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">No food required</p>
                        <p className="text-sm text-gray-600">Arrange your own meals</p>
                      </div>
                    </label>
                    {foodPackages.map(pkg => {
                      const pkgId = pkg.foodPackageId || pkg._id;
                      return (
                        <label key={pkgId} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition">
                          <input
                            type="radio"
                            name="foodOption"
                            checked={selectedFoodPackage?.id === pkgId}
                            onChange={() => setSelectedFoodPackage({
                              id: pkgId,
                              name: pkg.name,
                              pricePerAdult: pkg.pricePerAdult,
                              pricePerKid: pkg.pricePerKid,
                              description: pkg.description,
                            })}
                            className="mt-1 w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{pkg.name}</p>
                                <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                                {activeOffer && pkg.foodPackageId && (
                                  <span className="text-xs text-green-600 font-medium">Special offer price</span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">₹{pkg.pricePerAdult} <span className="text-sm font-normal">/adult</span></p>
                                <p className="text-sm text-gray-600">₹{pkg.pricePerKid} /kid</p>
                              </div>
                            </div>
                            {selectedFoodPackage?.id === pkgId && checkInDate && checkOutDate && !sameDayCheckout && (
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <button
                                  type="button"
                                  onClick={() => setShowDailySelection(!showDailySelection)}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                >
                                  {showDailySelection ? 'Hide' : 'Customize'} daily selections
                                  <ChevronDown size={16} className={`transition-transform ${showDailySelection ? 'rotate-180' : ''}`} />
                                </button>
                                {showDailySelection && (
                                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                    {dailyBreakdown.map(day => (
                                      <div key={day.dateKey} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm font-medium">
                                          {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <select
                                          value={dailyFoodSelections[day.dateKey] || ''}
                                          onChange={e => handleDailySelectionChange(day.dateKey, e.target.value)}
                                          className="text-sm border border-gray-300 rounded px-2 py-1"
                                        >
                                          <option value="">No food</option>
                                          {foodPackages.map(p => {
                                            const pid = p.foodPackageId || p._id;
                                            return <option key={pid} value={pid}>{p.name}{activeOffer && p.foodPackageId ? ' (offer)' : ''}</option>;
                                          })}
                                        </select>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Token Amount Info */}
              {totalPrice > 0 && (
                <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Token Amount</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-blue-700">50% of total</p>
                      <p className="text-3xl font-bold text-blue-800">₹{tokenAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Remaining: ₹{remainingAmount.toLocaleString()}</p>
                      <p className="text-xs text-blue-600">(to be paid at property)</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    <p className="font-medium">⚠️ Non-refundable</p>
                    <p className="mt-1">This token amount (50%) is non-refundable in case of cancellation.</p>
                  </div>
                </section>
              )}
            </div>

            {/* Right column - Summary (sticky) */}
            <div className="hidden lg:block lg:w-80 xl:w-96 shrink-0">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 sticky top-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Booking Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Dates</span>
                    <span className="font-medium text-right max-w-[60%]">{formatDate(checkInDate)} – {formatDate(checkOutDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in</span>
                    <span className="font-medium">{bookingForm.checkInTime || '10:00 AM'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{priceBreakdown.isDayPicnic ? `${days} day${days !== 1 ? 's' : ''}` : `${nights} night${nights !== 1 ? 's' : ''}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-medium">{adults} adult{adults !== 1 ? 's' : ''}, {kids} kid{kids !== 1 ? 's' : ''}</span>
                  </div>
                  {selectedFoodPackage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Food</span>
                      <span className="font-medium text-green-600">{selectedFoodPackage.name}{activeOffer && ' (offer)'}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between">
                    <span>Base price</span>
                    <span>₹{priceBreakdown.adultTotal.toLocaleString()}</span>
                  </div>
                  {kids > 0 && (
                    <div className="flex justify-between">
                      <span>Kids price</span>
                      <span>₹{priceBreakdown.kidTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedFoodPackage && priceBreakdown.foodPrice > 0 && (
                    <div className="flex justify-between">
                      <span>Food package</span>
                      <span className="text-green-600">₹{priceBreakdown.foodPrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-300 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {showDailySelection && dailyBreakdown.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Daily food selection</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                      {dailyBreakdown.map(day => {
                        const pkgId = dailyFoodSelections[day.dateKey];
                        const pkg = pkgId ? foodPackages.find(p => p.foodPackageId === pkgId || p._id === pkgId) : null;
                        return pkg ? (
                          <div key={day.dateKey} className="flex justify-between">
                            <span className="text-gray-600">{day.date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
                            <span className="text-green-600">{pkg.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    form="bookingForm"
                    disabled={isSubmitting || totalPrice <= 0 || offerLoading}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : offerLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Checking offers...</span>
                      </>
                    ) : totalPrice <= 0 ? (
                      'Select dates & guests'
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>Pay Token ₹{tokenAmount.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Secure payment</p>
                    <p className="text-xs text-gray-600">Powered by Razorpay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky footer */}
        <div className="lg:hidden p-4 border-t border-gray-200 bg-white">
          <button
            type="submit"
            form="bookingForm"
            disabled={isSubmitting || totalPrice <= 0 || offerLoading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : offerLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Checking offers...</span>
              </>
            ) : totalPrice <= 0 ? (
              'Select dates & guests'
            ) : (
              <>
                <CreditCard size={18} />
                <span>Pay Token ₹{tokenAmount.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>

        {/* Hidden form to allow submit from outside */}
        <form id="bookingForm" onSubmit={handleBookingSubmit} className="hidden" />
      </div>
    </div>
  );
};

export default BookingModal;