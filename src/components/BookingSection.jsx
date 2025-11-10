import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

import BookingDemo from '../assets/Images/Booking.gif';

const bookingSteps = [
  { number: "01", title: "Finalize the Location", description: "Choose from our exclusive properties" },
  { number: "02", title: "Check Availability", description: "View real-time availability calendar" },
  { number: "03", title: "Fill the form with easy steps", description: "Simple and secure booking process" },
  { number: "04", title: "Pay token amount for confirmation", description: "Secure your reservation instantly" }
];

const handleRoutingToLocation = () => {
  window.location.href = '/locations'
}

const BookingMadeEasy = () => {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        
        // Reset GIF when not visible
        if (!entry.isIntersecting && imgRef.current) {
          // Force reload the GIF to reset it
          const src = imgRef.current.src;
          imgRef.current.src = '';
          imgRef.current.src = src;
        }
      },
      {
        threshold: 0.2, // Trigger when 20% of section is visible
        rootMargin: '0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-12 sm:py-20 lg:py-28 bg-gradient-to-br from-[#f8faf9] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-10 lg:gap-16">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8 sm:space-y-12 order-2 lg:order-1">
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-gray-900 leading-tight mb-4 lg:mb-6">
                Booking Made Easy!
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                You can now book Resort in most easiest way! Just follow the below steps and you are done with your booking.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6 sm:space-y-8">
              {bookingSteps.map((step) => (
                <div key={step.number} className="flex gap-4 sm:gap-6 items-start group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#008DDA] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-1 sm:pt-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {step.description}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#008DDA] mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            <div className="pt-4 sm:pt-6">
              <button 
              onClick={handleRoutingToLocation}
              className="inline-flex items-center gap-2 px-8 py-3 text-base sm:px-10 sm:py-4 sm:text-lg font-semibold rounded-xl text-white bg-[#008DDA] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                Start Booking Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Right Side - Mobile Video Portrait */}
          <div className="w-full lg:w-1/2 flex items-center justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-xs sm:max-w-sm">
              {/* Mobile Frame Mockup */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gray-900 p-2 sm:p-3">
                {/* Video Content Area - Portrait 9:16 ratio */}
                <div className="relative aspect-[9/16] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-100">
                  {/* GIF Display - No Upload Functionality */}
                  <img 
                    ref={imgRef}
                    src={BookingDemo} 
                    alt="Booking process demonstration"
                    className="w-full h-full object-cover"
                    style={{ visibility: isVisible ? 'visible' : 'hidden' }}
                  />
                </div>

                {/* Mobile Notch (Optional - for realistic look) */}
                <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-6 bg-gray-900 rounded-b-xl sm:rounded-b-2xl z-10"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 top-4 -right-4 w-40 h-40 sm:w-64 sm:h-64 bg-[#03A791]/10 rounded-full blur-2xl sm:blur-3xl"></div>
              <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 sm:w-48 sm:h-48 bg-purple-400/10 rounded-full blur-2xl sm:blur-3xl"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BookingMadeEasy;