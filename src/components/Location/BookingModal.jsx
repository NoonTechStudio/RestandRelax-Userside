import { X, CheckCircle, Calendar, User, Phone, MapPin, Utensils, Star, Shield, Clock, CreditCard, Download } from 'lucide-react';
import { formatDate } from '../../utils/locations/locationUitls';
import { useState, useEffect } from 'react';

const BookingModal = ({ 
  showBookingModal, 
  setShowBookingModal, 
  bookingForm, 
  onInputChange, 
  onSubmit, 
  checkInDate, 
  checkOutDate, 
  adults, 
  kids, 
  location 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [paymentStep, setPaymentStep] = useState('booking');
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(3000); // Default token amount

  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // Load Razorpay script
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

    if (showBookingModal) {
      loadRazorpay();
    }
  }, [showBookingModal]);

  // Fetch booked dates when modal opens
  useEffect(() => {
    if (showBookingModal && location?._id) {
      fetchBookedDates();
      setBookingConfirmed(false);
      setBookingData(null);
      setPaymentStep('booking');
    }
  }, [showBookingModal, location]);

  const fetchBookedDates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/dates/${location._id}`);
      const result = await response.json();
      if (result.success) {
        setBookedDates(result.bookedDates);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  // Check if night stay is available at this location
  const isNightStayAvailable = location?.propertyDetails?.nightStay || false;

  const calculateTotalPrice = () => {
    // If night stay is not available, treat as single day booking (1 night)
    const nights = isNightStayAvailable 
      ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      : 1;

    const basePrice = location?.pricing?.pricePerAdult || location?.basePrice || 1000;
    const adultPrice = (basePrice * adults * nights);
    const kidPrice = (location?.pricing?.pricePerKid || 500) * kids * nights;
    // Removed food charge calculation
    // const foodCharge = bookingForm.food ? (adults + kids) * 500 * nights : 0;
    
    return adultPrice + kidPrice; // Removed foodCharge from total
  };

  const calculateRemainingAmount = () => {
    const totalPrice = calculateTotalPrice();
    return Math.max(0, totalPrice - tokenAmount);
  };

  // PDF Download Function
  const downloadPDF = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/download-pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const totalPrice = calculateTotalPrice();
      const remainingAmount = calculateRemainingAmount();

      const bookingPayload = {
        locationId: location._id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        name: bookingForm.name,
        phone: bookingForm.phone,
        address: bookingForm.address,
        adults: adults,
        kids: kids,
        withFood: bookingForm.food,
        paymentType: 'token',
        amountPaid: tokenAmount,
        remainingAmount: remainingAmount,
        pricing: {
          pricePerAdult: location?.pricing?.pricePerAdult || 1000,
          pricePerKid: location?.pricing?.pricePerKid || 500,
          extraPersonCharge: location?.pricing?.extraPersonCharge || 0,
          totalPrice: totalPrice
        }
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: amount,
          currency: 'INR',
          userEmail: bookingForm.email || '',
          userPhone: bookingForm.phone
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
      name: 'Your Resort Name',
      description: `Token payment for ${location.name}`,
      image: '/logo.png',
      order_id: razorpayOrder.order.id,
      handler: async function (response) {
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
        paymentType: 'token'
      },
      theme: {
        color: '#4F46E5'
      },
      modal: {
        ondismiss: function() {
          setPaymentProcessing(false);
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          bookingId: bookingData._id
        }),
      });

      const result = await verifyResponse.json();

      if (result.success) {
        setPaymentStep('confirmed');
        setBookingConfirmed(true);
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
    const bookedInSelection = bookedDates.filter(booked => {
      const bookedDate = new Date(booked.date);
      return bookedDate >= checkInDate && bookedDate < checkOutDate;
    });

    if (bookedInSelection.length > 0) {
      const paidBookings = bookedInSelection.filter(b => b.status === 'paid');
      const pendingBookings = bookedInSelection.filter(b => b.status === 'pending');
      
      return {
        hasConflict: true,
        paidCount: paidBookings.length,
        pendingCount: pendingBookings.length
      };
    }

    return { hasConflict: false, paidCount: 0, pendingCount: 0 };
  };

  const bookingConflict = getBookedDatesInfo();

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setBookingConfirmed(false);
    setBookingData(null);
    setPaymentStep('booking');
    setRazorpayOrder(null);
  };

  // Payment View
  if (paymentStep === 'payment' && bookingData) {
    const totalPrice = calculateTotalPrice();
    const remainingAmount = calculateRemainingAmount();

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto">
          <div className="p-4 sm:p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                  <CreditCard className="h-12 w-12 text-blue-600 relative z-10" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pay Token Amount
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                Secure token payment processed by Razorpay
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Booking ID:</span>
                    <span className="font-semibold bg-blue-100 px-2 py-1 rounded text-blue-800 text-xs">
                      #{bookingData._id?.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Location:</span>
                    <span className="font-medium text-xs truncate ml-2">{location.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Total Amount:</span>
                    <span className="font-medium text-xs">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Remaining Amount:</span>
                    <span className="font-medium text-xs">₹{remainingAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-semibold text-sm">
                      Token Amount:
                    </span>
                    <span className="font-bold text-blue-600 text-base">
                      ₹{tokenAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Non-refundable notice */}
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <p className="font-medium">⚠️ Important Notice:</p>
                  <p className="mt-1">This token amount is <strong>non-refundable</strong> and will not be returned in case of cancellation.</p>
                </div>

                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <p className="font-medium">💡 Payment Note:</p>
                  <p className="mt-1">Remaining ₹{remainingAmount.toLocaleString()} to be paid at the property during check-in.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={initiateRazorpayPayment}
                  disabled={paymentProcessing}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Pay Token Amount (₹{tokenAmount.toLocaleString()})
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setPaymentStep('booking')}
                  className="w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 text-sm"
                  disabled={paymentProcessing}
                >
                  Back to Booking
                </button>
              </div>

              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span className="text-xs">Secure SSL Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation View
  if (paymentStep === 'confirmed' && bookingData) {
    const totalPrice = calculateTotalPrice();
    const remainingAmount = calculateRemainingAmount();

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto">
          <div className="p-4 sm:p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                  <CheckCircle className="h-12 w-12 text-green-500 relative z-10" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Token Payment Confirmed!
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                Your token payment has been successfully processed.
                {bookingForm.email && (
                  <span className="block text-green-600 font-medium mt-1 text-xs">
                    Confirmation sent to {bookingForm.email}
                  </span>
                )}
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Booking ID:</span>
                    <span className="font-semibold bg-green-100 px-2 py-1 rounded text-green-800 text-xs">
                      #{bookingData._id?.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Location:</span>
                    <span className="font-medium text-xs truncate ml-2">{location.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Check-in:</span>
                    <span className="font-medium text-xs">{formatDate(checkInDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Check-out:</span>
                    <span className="font-medium text-xs">{formatDate(checkOutDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Guests:</span>
                    <span className="font-medium text-xs">{adults} adults, {kids} kids</span>
                  </div>
                  {bookingForm.food && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Food Service:</span>
                      <span className="font-medium text-green-600 text-xs">Included</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Total Amount:</span>
                    <span className="font-medium text-xs">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Amount Paid:</span>
                    <span className="font-medium text-green-600 text-xs">₹{tokenAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs">Remaining:</span>
                    <span className="font-medium text-orange-600 text-xs">₹{remainingAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-semibold text-sm">
                      Token Paid:
                    </span>
                    <span className="font-bold text-green-600 text-base">
                      ₹{tokenAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Non-refundable notice in confirmation */}
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <p className="font-medium">⚠️ Non-Refundable Token:</p>
                  <p className="mt-1">This token amount of ₹{tokenAmount.toLocaleString()} is <strong>non-refundable</strong> and will not be returned in case of cancellation.</p>
                </div>

                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <p className="font-medium">📝 Important:</p>
                  <p className="mt-1">Please pay the remaining ₹{remainingAmount.toLocaleString()} at the property during check-in.</p>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => downloadPDF(bookingData._id)}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
              >
                Close
              </button>

              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs">
                    Token confirmed • PDF available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showBookingModal) return null;

  const totalPrice = calculateTotalPrice();
  const nights = isNightStayAvailable 
    ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    : 1;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Compact */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">Complete Booking</h3>
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1 truncate">
              <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
              <span className="truncate">{location.rating || '4.8'} • {location.name}</span>
            </p>
          </div>
          <button 
            onClick={handleCloseModal}
            className="p-1 hover:bg-gray-100 rounded transition-all duration-200 group flex-shrink-0 ml-2"
          >
            <X size={18} className="text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Content - Optimized for no scrolling */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            {/* Booking Conflict Warning - Compact */}
            {bookingConflict.hasConflict && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-yellow-800 font-semibold text-xs mb-1">
                      Date Availability Notice
                    </h4>
                    <p className="text-yellow-700 text-xs">
                      Some dates in your selection may be booked. We'll confirm availability within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left Column - Form - Compact */}
              <div className="flex-1">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Personal Information
                  </h4>
                  
                  <form onSubmit={handleBookingSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={bookingForm.name}
                          onChange={onInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={bookingForm.phone}
                            onChange={onInputChange}
                            required
                            pattern="[0-9]{10}"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                            placeholder="10-digit number"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={bookingForm.email || ''}
                            onChange={onInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <textarea
                          name="address"
                          value={bookingForm.address}
                          onChange={onInputChange}
                          required
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm resize-none"
                          placeholder="Enter your complete address"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Confirmation PDF will be sent to your email
                        </p>
                      </div>
                    </div>

                    {/* Token Amount Selection */}
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h5 className="text-xs font-semibold text-gray-900 mb-2">Token Amount</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={tokenAmount}
                            onChange={(e) => setTokenAmount(Number(e.target.value))}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value={1000}>₹1,000</option>
                            <option value={3000}>₹3,000</option>
                            <option value={5000}>₹5,000</option>
                          </select>
                          <span className="text-xs text-gray-500">
                            (Remaining: ₹{Math.max(0, totalPrice - tokenAmount).toLocaleString()})
                          </span>
                        </div>
                      </div>
                      
                      {/* Non-refundable notice */}
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        <p className="font-medium">⚠️ Non-Refundable Token:</p>
                        <p>This token amount is <strong>non-refundable</strong> and will not be returned in case of cancellation.</p>
                      </div>

                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        <p>💡 Pay ₹{tokenAmount.toLocaleString()} now as token amount. Remaining ₹{Math.max(0, totalPrice - tokenAmount).toLocaleString()} to be paid at the property during check-in.</p>
                      </div>
                    </div>

                    {/* Food Service Checkbox - UPDATED: Removed amount calculation, added text */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                      <input
                        type="checkbox"
                        name="food"
                        checked={bookingForm.food}
                        onChange={onInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <label className="text-xs font-medium text-gray-700 block">
                          Include food service
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          Food per person: ₹500 each time
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          Pay Token Amount (₹{tokenAmount.toLocaleString()})
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column - Summary - Compact */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Booking Summary
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600 text-xs">Dates</span>
                      <span className="font-medium text-right text-xs">
                        {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600 text-xs">Duration</span>
                      <span className="font-medium text-xs">
                        {nights} {isNightStayAvailable ? 'nights' : 'day'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600 text-xs">Guests</span>
                      <span className="font-medium text-xs">
                        {adults} adults, {kids} kids
                      </span>
                    </div>

                    {bookingForm.food && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-gray-600 text-xs">Food Service:</span>
                        <span className="font-medium text-green-600 text-xs">Included</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 text-xs">Base Price</span>
                        <span className="text-xs">₹{((location?.pricing?.pricePerAdult || 1000) * adults * nights).toLocaleString()}</span>
                      </div>
                      {kids > 0 && (
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600 text-xs">Kids Price</span>
                          <span className="text-xs">₹{((location?.pricing?.pricePerKid || 500) * kids * nights).toLocaleString()}</span>
                        </div>
                      )}
                      {/* Removed food charges calculation from summary */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                        <span className="text-sm font-bold text-gray-900">Total</span>
                        <span className="text-base font-bold text-blue-600">₹{totalPrice.toLocaleString()}</span>
                      </div>

                      {/* Payment Breakdown for Token Payment */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600 text-xs">Token Amount:</span>
                          <span className="text-xs font-medium text-green-600">₹{tokenAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Remaining:</span>
                          <span className="text-xs font-medium text-orange-600">₹{Math.max(0, totalPrice - tokenAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators - Compact */}
                  <div className="mt-3 bg-white border border-gray-200 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-800 text-xs">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <CreditCard className="w-3 h-3 text-green-600" />
                      <span>Powered by Razorpay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;