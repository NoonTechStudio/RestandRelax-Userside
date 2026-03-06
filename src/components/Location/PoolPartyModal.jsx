// components/Location/PoolPartyModal.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  X, Clock, User, Mail, Phone, Calendar, AlertCircle, Users,
  CheckCircle, Loader2, ShieldCheck, CreditCard, Download, MapPin, Utensils
} from 'lucide-react';

const PoolPartyModal = ({
  isOpen,
  onClose,
  location,
  adults,
  kids,
  onAdultsChange,
  onKidsChange
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    bookingDate: new Date().toISOString().split('T')[0],
    totalAdults: adults || 1,
    totalKids: kids || 0,
    session: '',
    withFood: false,
    foodPackage: ''
  });

  const [poolPartyData, setPoolPartyData] = useState(null);
  const [sessionsAvailability, setSessionsAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('booking');
  const [bookingData, setBookingData] = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // ========== OFFER STATE ==========
  const [activeOffer, setActiveOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // ----- Load Razorpay script -----
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    if (isOpen) {
      loadRazorpay();
    }
  }, [isOpen]);

  // ----- Reset form when modal opens/closes -----
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      bookingDate: new Date().toISOString().split('T')[0],
      totalAdults: adults || 1,
      totalKids: kids || 0,
      session: ''
    });
    setPaymentStep('booking');
    setBookingData(null);
    setRazorpayOrder(null);
    setPaymentError('');
    setAvailabilityError('');
    setActiveOffer(null);
  }, [adults, kids]);

  // ----- Fetch pool party data -----
  const fetchPoolPartyData = useCallback(async () => {
    try {
      setLoading(true);

      let poolPartyId;
      const poolPartyConfig = location?.poolPartyConfig;

      if (poolPartyConfig?.poolPartyType === 'shared') {
        poolPartyId = poolPartyConfig.sharedPoolPartyId;
      } else if (poolPartyConfig?.poolPartyType === 'private') {
        poolPartyId = poolPartyConfig.privatePoolPartyId;
      }

      if (!poolPartyId) {
        console.error('No pool party ID found for location');
        setPoolPartyData(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/pool-parties/${poolPartyId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setPoolPartyData(data.poolParty);
        await fetchAllSessionsAvailability(data.poolParty);
      } else {
        console.error('Error fetching pool party:', data.error);
        setPoolPartyData(null);
      }
    } catch (error) {
      console.error('Error fetching pool party data:', error);
      setPoolPartyData(null);
    } finally {
      setLoading(false);
    }
  }, [location, API_BASE_URL]);

  // ----- Fetch session availability -----
  const fetchAllSessionsAvailability = useCallback(async (poolParty, selectedDate) => {
    const dateToUse = selectedDate || formData.bookingDate;
    try {
      const response = await fetch(
        `${API_BASE_URL}/pool-parties/sessions-availability/${location._id}?date=${dateToUse}`
      );
      const data = await response.json();

      if (data.success) {
        setSessionsAvailability(data.sessions);
      } else {
        console.error('Error fetching sessions availability:', data.error);
        setSessionsAvailability([]);
      }
    } catch (error) {
      console.error('Error fetching sessions availability:', error);
      setSessionsAvailability([]);
    }
  }, [location, API_BASE_URL, formData.bookingDate]);

  // ----- Fetch active offer -----
  const fetchActiveOffer = useCallback(async () => {
    if (!poolPartyData || !formData.bookingDate) return;
    setOfferLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/offers/active/poolparty?poolPartyId=${poolPartyData._id}&bookingDate=${formData.bookingDate}`
      );
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setActiveOffer(result.data[0]);
        console.log('Active offer loaded:', result.data[0].name);
      } else {
        setActiveOffer(null);
      }
    } catch (error) {
      console.error('Error fetching active offer:', error);
      setActiveOffer(null);
    } finally {
      setOfferLoading(false);
    }
  }, [poolPartyData, formData.bookingDate, API_BASE_URL]);

  // ----- Effects -----
  useEffect(() => {
    if (isOpen && location?._id) {
      fetchPoolPartyData();
      resetForm();
    }
  }, [isOpen, location, fetchPoolPartyData, resetForm]);

  useEffect(() => {
    if (poolPartyData?._id && formData.bookingDate) {
      fetchActiveOffer();
    } else {
      setActiveOffer(null);
    }
  }, [poolPartyData, formData.bookingDate, fetchActiveOffer]);

  // ========== OFFER HELPERS ==========
  const getSessionPricing = useCallback((sessionName) => {
    if (activeOffer && activeOffer.poolPartyPricing?.sessions) {
      const offerSession = activeOffer.poolPartyPricing.sessions.find(
        s => s.session === sessionName && s.poolPartyId === poolPartyData?._id
      );
      if (offerSession) {
        return {
          perAdult: offerSession.perAdult,
          perKid: offerSession.perKid
        };
      }
    }
    // Fallback to original session pricing
    const originalSession = sessionsAvailability.find(s => s.session === sessionName);
    return originalSession?.pricing || { perAdult: 0, perKid: 0 };
  }, [activeOffer, poolPartyData, sessionsAvailability]);

  const getFoodPackages = useCallback(() => {
    if (activeOffer && activeOffer.poolPartyPricing?.foodPackages) {
      return activeOffer.poolPartyPricing.foodPackages.filter(
        fp => fp.poolPartyId === poolPartyData?._id
      );
    }
    return poolPartyData?.selectedFoodPackages || [];
  }, [activeOffer, poolPartyData]);

  // ========== PRICE CALCULATIONS ==========
  const calculateTotalPrice = useCallback(() => {
    if (!poolPartyData || !formData.session) return 0;

    const pricing = getSessionPricing(formData.session);
    const adultPrice = pricing.perAdult * formData.totalAdults;
    const kidPrice = pricing.perKid * formData.totalKids;

    let foodPrice = 0;
    if (formData.withFood && formData.foodPackage) {
      const foodPkgs = getFoodPackages();
      const selectedFoodPkg = foodPkgs.find(
        pkg => pkg.foodPackageId === formData.foodPackage || pkg._id === formData.foodPackage
      );
      if (selectedFoodPkg) {
        foodPrice = (selectedFoodPkg.pricePerAdult * formData.totalAdults) +
                    (selectedFoodPkg.pricePerKid * formData.totalKids);
      }
    }
    return adultPrice + kidPrice + foodPrice;
  }, [poolPartyData, formData, getSessionPricing, getFoodPackages]);

  const getTokenAmount = useCallback(() => {
    const total = calculateTotalPrice();
    return total * 0.5;
  }, [calculateTotalPrice]);

  const getRemainingAmount = useCallback(() => {
    const total = calculateTotalPrice();
    return total - getTokenAmount();
  }, [calculateTotalPrice, getTokenAmount]);

  // ----- Memoized derived values -----
  const selectedSession = useMemo(() => 
    sessionsAvailability.find(s => s.session === formData.session),
    [sessionsAvailability, formData.session]
  );

  const totalGuests = useMemo(() => 
    formData.totalAdults + formData.totalKids,
    [formData.totalAdults, formData.totalKids]
  );

  const isSelectedSessionAvailable = useMemo(() => 
    selectedSession?.isAvailable && selectedSession.availableCapacity >= totalGuests,
    [selectedSession, totalGuests]
  );

  const isAnySessionAvailable = useMemo(() => 
    sessionsAvailability.some(s => s.isAvailable),
    [sessionsAvailability]
  );

  const allSessionsFullyBooked = useMemo(() => 
    sessionsAvailability.length > 0 &&
    sessionsAvailability.every(s => !s.isAvailable || s.availableCapacity === 0),
    [sessionsAvailability]
  );

  const isFormValid = useMemo(() => 
    formData.name.trim() &&
    /^\d{10}$/.test(formData.phone) &&
    /\S+@\S+\.\S+/.test(formData.email) &&
    formData.address.trim() &&
    formData.session &&
    isSelectedSessionAvailable,
    [formData, isSelectedSessionAvailable]
  );

  const totalPrice = useMemo(() => calculateTotalPrice(), [calculateTotalPrice]);
  const tokenAmount = useMemo(() => getTokenAmount(), [getTokenAmount]);
  const remainingAmount = useMemo(() => getRemainingAmount(), [getRemainingAmount]);

  // ========== EVENT HANDLERS ==========
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'bookingDate') {
      setFormData(prev => ({ ...prev, bookingDate: value, session: '' }));
      setAvailabilityError('');
      if (poolPartyData) {
        fetchAllSessionsAvailability(poolPartyData, value);
      }
    }
  }, [poolPartyData, fetchAllSessionsAvailability]);

  const handleSessionChange = useCallback((session) => {
    setFormData(prev => ({ ...prev, session }));
    setAvailabilityError('');
  }, []);

  const handleNumberChange = useCallback((field, operation) => {
    setFormData(prev => {
      const newValue = operation === 'increase'
        ? prev[field] + 1
        : Math.max(field === 'totalAdults' ? 1 : 0, prev[field] - 1);
      return { ...prev, [field]: newValue };
    });
  }, []);

  // ========== BOOKING SUBMIT ==========
  const handleBookingSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!poolPartyData) {
      toast.error('Pool party data not loaded');
      return;
    }

    if (!formData.session) {
      toast.error('Please select a session');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your address');
      return;
    }

    // Availability check
    const selectedSession = sessionsAvailability.find(s => s.session === formData.session);
    if (!selectedSession) {
      toast.error('Please select a valid session');
      return;
    }
    if (!selectedSession.isAvailable) {
      toast.error('Selected session is no longer available. Please select another session.');
      return;
    }
    if (selectedSession.availableCapacity === 0) {
      toast.error('This session is fully booked. Please select another session.');
      return;
    }
    if (totalGuests > selectedSession.availableCapacity) {
      toast.error(`Not enough capacity. Only ${selectedSession.availableCapacity} spots available.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setPaymentError('');

      const totalPrice = calculateTotalPrice();
      const tokenAmount = getTokenAmount();
      const remainingAmount = getRemainingAmount();

      const foodPkgs = getFoodPackages();
      const selectedFoodPkg = foodPkgs.find(
        pkg => pkg.foodPackageId === formData.foodPackage || pkg._id === formData.foodPackage
      );

      const bookingPayload = {
        poolPartyId: poolPartyData._id,
        locationId: location._id,
        guestName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        bookingDate: formData.bookingDate,
        session: formData.session,
        adults: formData.totalAdults,
        kids: formData.totalKids,
        totalGuests,
        paymentType: 'token',
        amountPaid: tokenAmount,
        remainingAmount,
        withFood: formData.withFood,
        foodPackage: formData.withFood && selectedFoodPkg ? {
          foodPackageId: selectedFoodPkg.foodPackageId || selectedFoodPkg._id,
          name: selectedFoodPkg.name,
          pricePerAdult: selectedFoodPkg.pricePerAdult,
          pricePerKid: selectedFoodPkg.pricePerKid
        } : null,
        pricing: {
          pricePerAdult: getSessionPricing(formData.session).perAdult,
          pricePerKid: getSessionPricing(formData.session).perKid,
          totalPrice
        }
      };

      const bookingResponse = await fetch(`${API_BASE_URL}/pool-parties/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      const bookingResult = await bookingResponse.json();
      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Booking creation failed');
      }

      const paymentResponse = await fetch(`${API_BASE_URL}/payments/create-poolparty-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingResult.booking._id,
          amount: tokenAmount,
          currency: 'INR',
          userEmail: formData.email,
          userPhone: formData.phone,
          userName: formData.name,
          paymentType: 'token'
        })
      });

      const paymentResult = await paymentResponse.json();
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment initialization failed');
      }

      setBookingData(bookingResult.booking);
      setRazorpayOrder(paymentResult);
      setPaymentStep('payment');
    } catch (error) {
      console.error('Booking error:', error);
      setPaymentError(error.message || 'Booking failed. Please try again.');
      toast.error('Booking failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    poolPartyData, formData, sessionsAvailability, totalGuests, location,
    API_BASE_URL, calculateTotalPrice, getTokenAmount, getRemainingAmount,
    getFoodPackages, getSessionPricing
  ]);

  // ========== PAYMENT ==========
  const initiateRazorpayPayment = useCallback(() => {
    if (!razorpayOrder || !window.Razorpay) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    setPaymentProcessing(true);
    const bookingId = bookingData._id || bookingData.id;

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: razorpayOrder.order.amount,
      currency: razorpayOrder.order.currency,
      name: 'Rest & Relax',
      description: `Pool Party Booking - ${location.name} (${formData.session}) - Token Payment`,
      image: '/images/Logo.png',
      order_id: razorpayOrder.order.id,
      handler: async (response) => {
        await verifyPayment(response);
      },
      prefill: {
        name: formData.name,
        contact: formData.phone,
        email: formData.email
      },
      notes: {
        bookingId,
        location: location.name,
        session: formData.session,
        paymentType: 'token',
        amountPaid: tokenAmount
      },
      theme: { color: '#4F46E5' },
      modal: {
        ondismiss: () => setPaymentProcessing(false)
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  }, [razorpayOrder, bookingData, RAZORPAY_KEY_ID, location, formData, tokenAmount]);

  const verifyPayment = useCallback(async (paymentResponse) => {
    if (isVerifyingPayment || paymentVerified) {
      console.warn('Duplicate payment verification blocked');
      return;
    }

    try {
      setIsVerifyingPayment(true);
      setPaymentLoading(true);

      const bookingId = bookingData._id || bookingData.id;
      const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify-poolparty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          bookingId
        })
      });

      const result = await verifyResponse.json();
      if (result.success) {
        setPaymentVerified(true);
        const updatedBookingData = {
          _id: result.booking.id,
          id: result.booking.id,
          email: result.booking.email,
          guestName: result.booking.guestName,
          phone: result.booking.phone,
          session: result.booking.session,
          bookingDate: result.booking.bookingDate,
          totalGuests: result.booking.totalGuests,
          totalAmount: result.booking.totalAmount,
          paymentStatus: result.booking.paymentStatus,
          amountPaid: result.booking.amountPaid,
          remainingAmount: result.booking.remainingAmount
        };
        setBookingData(updatedBookingData);
        setPaymentStep('confirmed');
        toast.success('Payment successful! Booking confirmed.');
      } else {
        throw new Error(result.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentError(error.message);
      toast.error('Payment verification failed. Please contact support.');
      setPaymentStep('booking');
    } finally {
      setPaymentLoading(false);
      setPaymentProcessing(false);
      setIsVerifyingPayment(false);
    }
  }, [isVerifyingPayment, paymentVerified, bookingData, API_BASE_URL]);

  const downloadPoolPartyPDF = useCallback(async (bookingId) => {
    try {
      setPaymentLoading(true);
      const response = await fetch(`${API_BASE_URL}/pool-parties/${bookingId}/download-pdf`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download PDF: ${response.status}`);
      }
      const blob = await response.blob();
      if (blob.size === 0) throw new Error('PDF file is empty');

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poolparty-booking-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error(`Failed to download PDF: ${error.message}\n\nYou can access the PDF from your email.`);
    } finally {
      setPaymentLoading(false);
    }
  }, [API_BASE_URL]);

  // ----- Render logic -----
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8 text-center w-full max-w-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-base">Loading pool party details...</p>
        </div>
      </div>
    );
  }

  if (!poolPartyData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-6 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Pool Party Not Available</h3>
          <p className="text-gray-600 mb-6">
            Pool party is not available at this location.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ----- PAYMENT STEP -----
  if (paymentStep === 'payment' && bookingData) {
    const bookingId = bookingData._id || bookingData.id;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header with step indicator */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
                disabled={paymentProcessing || paymentLoading}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {/* Step indicator */}
            <div className="flex items-center justify-between">
              {['Booking', 'Payment', 'Confirmation'].map((step, index) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    index === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${index === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step}
                  </span>
                  {index < 2 && <div className="flex-1 h-0.5 mx-2 bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Payment summary card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-mono font-semibold text-blue-700">#{bookingId?.slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900">{location.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Session</span>
                  <span className="font-medium text-gray-900">{formData.session}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(formData.bookingDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium text-gray-900">
                    {formData.totalAdults} Adult{formData.totalAdults !== 1 && 's'}, {formData.totalKids} Kid{formData.totalKids !== 1 && 's'}
                  </span>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">Token (50%)</span>
                    <span className="text-lg font-semibold text-green-600">₹{tokenAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Remaining at property</span>
                    <span className="font-medium text-orange-600">₹{remainingAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important notices */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Non-Refundable Token</h4>
                  <p className="text-sm text-red-700">
                    This token amount of <span className="font-bold">₹{tokenAmount.toLocaleString()}</span> is <strong>non-refundable</strong> and will not be returned in case of cancellation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Important</h4>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    <li>No refunds for cancellations within 24 hours</li>
                    <li>Arrive 15 minutes before session start</li>
                    <li>Remaining ₹{remainingAmount.toLocaleString()} to be paid at property</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={initiateRazorpayPayment}
                disabled={paymentProcessing || paymentLoading}
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {paymentProcessing || paymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ₹{tokenAmount.toLocaleString()} Now
                  </>
                )}
              </button>
              <button
                onClick={() => setPaymentStep('booking')}
                disabled={paymentProcessing || paymentLoading}
                className="w-full bg-gray-500 text-white font-semibold py-3 rounded-xl hover:bg-gray-600 transition-all text-sm"
              >
                Back to Booking
              </button>
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure SSL Encryption • Powered by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- CONFIRMATION STEP -----
  if (paymentStep === 'confirmed' && bookingData) {
    const sessionTiming = selectedSession ? `${selectedSession.startTime} - ${selectedSession.endTime}` : '';
    const bookingId = bookingData._id || bookingData.id;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {/* Step indicator */}
            <div className="flex items-center justify-between">
              {['Booking', 'Payment', 'Confirmation'].map((step, index) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    index === 2 ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
                  }`}>
                    {index === 2 ? '✓' : index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${index === 2 ? 'text-green-600' : 'text-green-700'}`}>
                    {step}
                  </span>
                  {index < 2 && <div className="flex-1 h-0.5 mx-2 bg-green-200" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Success animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
                <CheckCircle className="w-16 h-16 text-green-500 relative z-10" />
              </div>
            </div>

            {/* Booking summary card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-mono font-semibold text-green-700">#{bookingId?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{location.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session</span>
                  <span className="font-medium">{formData.session} ({sessionTiming})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">
                    {new Date(formData.bookingDate).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{formData.totalAdults} Adults, {formData.totalKids} Kids</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Token Paid</span>
                    <span className="font-semibold text-green-600">₹{tokenAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-semibold text-orange-600">₹{remainingAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  Remaining ₹{remainingAmount.toLocaleString()} to be paid at the property.
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                  <Mail className="w-4 h-4" />
                  <span>Confirmation sent to {bookingData.email || formData.email}</span>
                </div>
              </div>
            </div>

            {/* Important info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Important Information
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Please arrive 15 minutes before your session starts</li>
                <li>Children must be accompanied by adults at all times</li>
                <li>Carry valid ID proof for verification</li>
                <li>Outside food and drinks are not allowed</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => downloadPoolPartyPDF(bookingId)}
                disabled={!bookingId || paymentLoading}
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download PDF Confirmation
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg"
              >
                Close
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
              Booking confirmed • PDF available
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- BOOKING FORM -----
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
        {/* Sticky header with step indicator */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Book Your Pool Party</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {/* Step indicator */}
          <div className="flex items-center justify-between">
            {['Booking', 'Payment', 'Confirmation'].map((step, index) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${index === 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step}
                </span>
                {index < 2 && <div className="flex-1 h-0.5 mx-2 bg-gray-200" />}
              </div>
            ))}
          </div>
          {activeOffer && (
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              🔥 Special offer applied
            </div>
          )}
        </div>

        <form onSubmit={handleBookingSubmit} className="p-6 space-y-8">
          {/* Personal Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-base"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{10}"
                    maxLength="10"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-base"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-base"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-base"
                    placeholder="Enter your complete address"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Type (read-only) */}
          <section className="border border-gray-200 rounded-xl p-5 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Type</h4>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="tokenPayment"
                name="paymentType"
                checked={true}
                readOnly
                className="w-5 h-5 text-blue-600"
              />
              <label htmlFor="tokenPayment" className="text-base font-medium text-gray-700">
                Pay 50% Token Amount (non-refundable)
              </label>
            </div>
            <div className="mt-3 ml-7 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <p className="font-medium">⚠️ Non-Refundable Token</p>
              <p className="mt-1">This token amount of <span className="font-bold">₹{tokenAmount.toLocaleString()}</span> will not be refunded in case of cancellation.</p>
              <p className="mt-2 text-yellow-800 bg-yellow-50 p-2 rounded">Remaining ₹{remainingAmount.toLocaleString()} to be paid at the property.</p>
            </div>
          </section>

          {/* Booking Date */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Date
            </h3>
            <div>
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                Booking Date *
              </label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={isSubmitting || availabilityLoading || offerLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-base"
              />
              {(availabilityLoading || offerLoading) && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking availability...
                </div>
              )}
            </div>
          </section>

          {/* Availability Messages */}
          {availabilityError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Availability Alert</span>
              </div>
              <p className="text-red-600 text-sm">{availabilityError}</p>
            </div>
          )}

          {allSessionsFullyBooked && !availabilityLoading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-700 mb-1">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Fully Booked</span>
              </div>
              <p className="text-yellow-600 text-sm">
                All sessions are fully booked for {new Date(formData.bookingDate).toLocaleDateString()}. Please select another date.
              </p>
            </div>
          )}

          {/* Guest Count */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Guest Count</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adults */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Adults</h4>
                    <p className="text-sm text-gray-600">Ages 13+</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleNumberChange('totalAdults', 'decrease')}
                      disabled={formData.totalAdults <= 1 || isSubmitting || !isAnySessionAvailable}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 text-xl font-bold"
                      aria-label="Decrease adults"
                    >
                      -
                    </button>
                    <span className="font-bold text-xl w-8 text-center">{formData.totalAdults}</span>
                    <button
                      type="button"
                      onClick={() => handleNumberChange('totalAdults', 'increase')}
                      disabled={formData.totalAdults >= (poolPartyData.totalCapacity || 10) || isSubmitting || !isAnySessionAvailable}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 text-xl font-bold"
                      aria-label="Increase adults"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Price: {formData.session ? `₹${getSessionPricing(formData.session).perAdult.toLocaleString()}` : 'Select session'} per adult
                </p>
              </div>

              {/* Kids */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Kids</h4>
                    <p className="text-sm text-gray-600">Ages 2-12</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleNumberChange('totalKids', 'decrease')}
                      disabled={formData.totalKids <= 0 || isSubmitting || !isAnySessionAvailable}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 text-xl font-bold"
                      aria-label="Decrease kids"
                    >
                      -
                    </button>
                    <span className="font-bold text-xl w-8 text-center">{formData.totalKids}</span>
                    <button
                      type="button"
                      onClick={() => handleNumberChange('totalKids', 'increase')}
                      disabled={(formData.totalAdults + formData.totalKids) >= (poolPartyData.totalCapacity || 10) || isSubmitting || !isAnySessionAvailable}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 text-xl font-bold"
                      aria-label="Increase kids"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Price: {formData.session ? `₹${getSessionPricing(formData.session).perKid.toLocaleString()}` : 'Select session'} per kid
                </p>
              </div>
            </div>
          </section>

          {/* Session Selection */}
          {!allSessionsFullyBooked && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Select Session *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessionsAvailability.map((session) => {
                  const sessionPricing = getSessionPricing(session.session);
                  const isAvailable = session.isAvailable && session.availableCapacity >= totalGuests;

                  return (
                    <div
                      key={session.session}
                      onClick={() => !isSubmitting && isAvailable && handleSessionChange(session.session)}
                      className={`cursor-pointer border-2 rounded-xl p-5 transition-all ${
                        formData.session === session.session
                          ? isAvailable
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-red-500 bg-red-50'
                          : isAvailable
                            ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-base truncate">{session.session}</h4>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          formData.session === session.session
                            ? isAvailable ? 'border-blue-500 bg-blue-500' : 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`} />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{session.startTime} - {session.endTime}</p>
                      <div className="flex justify-between text-sm text-gray-500 mb-3">
                        <span>Adult: ₹{sessionPricing.perAdult}</span>
                        <span>Kid: ₹{sessionPricing.perKid}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        {isAvailable ? (
                          <div className="flex items-center justify-between">
                            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Available
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {session.availableCapacity}/{session.totalCapacity}
                            </span>
                          </div>
                        ) : (
                          <span className="text-red-600 text-sm font-medium">
                            {session.availableCapacity === 0 ? 'Fully booked' : `Only ${session.availableCapacity} spots left`}
                          </span>
                        )}
                      </div>
                      {activeOffer && sessionPricing.perAdult !== session.pricing.perAdult && (
                        <div className="mt-2 text-xs text-green-600 font-semibold">
                          🔥 Special offer price!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Food Packages */}
          {formData.session !== '' && getFoodPackages().length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Food Packages (Optional)
                {activeOffer && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Special offer</span>
                )}
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="foodPackage"
                    value=""
                    checked={!formData.withFood}
                    onChange={() => setFormData(prev => ({ ...prev, withFood: false, foodPackage: '' }))}
                    className="mt-1 w-5 h-5 text-blue-600"
                  />
                  <span className="text-gray-700">No food package</span>
                </label>

                {getFoodPackages().map((pkg, index) => (
                  <label key={pkg.foodPackageId || index} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="foodPackage"
                      value={pkg.foodPackageId || pkg._id}
                      checked={formData.foodPackage === (pkg.foodPackageId || pkg._id)}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        withFood: true,
                        foodPackage: pkg.foodPackageId || pkg._id
                      }))}
                      className="mt-1 w-5 h-5 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{pkg.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{pkg.pricePerAdult || 0} per adult, ₹{pkg.pricePerKid || 0} per kid
                      </p>
                      {activeOffer && pkg.foodPackageId && (
                        <span className="text-xs text-green-600">Special offer</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Price Summary */}
          {selectedSession && isSelectedSessionAvailable && (
            <section className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Session</span>
                  <span className="font-medium text-gray-900">
                    {selectedSession.session} ({selectedSession.startTime} - {selectedSession.endTime})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Adults ({formData.totalAdults} × ₹{getSessionPricing(formData.session).perAdult.toLocaleString()})</span>
                  <span className="font-semibold">₹{(getSessionPricing(formData.session).perAdult * formData.totalAdults).toLocaleString()}</span>
                </div>
                {formData.totalKids > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kids ({formData.totalKids} × ₹{getSessionPricing(formData.session).perKid.toLocaleString()})</span>
                    <span className="font-semibold">₹{(getSessionPricing(formData.session).perKid * formData.totalKids).toLocaleString()}</span>
                  </div>
                )}
                {formData.withFood && formData.foodPackage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Food Package</span>
                    <span className="font-semibold text-green-600">
                      ₹{(() => {
                        const selectedFoodPkg = getFoodPackages().find(
                          pkg => pkg.foodPackageId === formData.foodPackage || pkg._id === formData.foodPackage
                        );
                        if (selectedFoodPkg) {
                          return ((selectedFoodPkg.pricePerAdult * formData.totalAdults) +
                            (selectedFoodPkg.pricePerKid * formData.totalKids)).toLocaleString();
                        }
                        return '0';
                      })()}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-blue-600">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Token (50%)</span>
                    <span className="font-semibold text-green-600">₹{tokenAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining at property</span>
                    <span className="font-semibold text-orange-600">₹{remainingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 mt-2 border-t border-gray-300">
                    <span>Amount to Pay Now</span>
                    <span className="text-blue-600">₹{tokenAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Payment Error */}
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Payment Error</span>
              </div>
              <p className="text-red-600 text-sm">{paymentError}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting || allSessionsFullyBooked}
              className={`w-full text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-base ${
                isFormValid && !isSubmitting && !allSessionsFullyBooked
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Booking...
                </div>
              ) : allSessionsFullyBooked ? (
                'All Sessions Fully Booked'
              ) : !formData.session ? (
                'Please Select a Session'
              ) : !isSelectedSessionAvailable ? (
                selectedSession?.availableCapacity === 0
                  ? 'Session Fully Booked'
                  : 'Not Enough Capacity'
              ) : (
                `Pay Token ₹{tokenAmount.toLocaleString()}`
              )}
            </button>
            <p className="text-sm text-gray-500 text-center mt-3">
              By continuing, you agree to our Terms & Conditions
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure payment powered by Razorpay</span>
            <CreditCard className="w-4 h-4" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default PoolPartyModal;