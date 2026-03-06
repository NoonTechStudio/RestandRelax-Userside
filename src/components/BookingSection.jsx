import React from 'react';
import { ArrowRight, CheckCircle, Upload } from 'lucide-react';

import BookingDemo from '../assets/Images/BookingDemo.jpg';

const bookingSteps = [
  { number: "01", title: "Finalize the Location", description: "Choose from our exclusive properties" },
  { number: "02", title: "Check Availability", description: "View real-time availability calendar" },
  { number: "03", title: "Fill the form with easy steps", description: "Simple and secure booking process" },
  { number: "04", title: "Pay token amount for confirmation", description: "Secure your reservation instantly" }
];

const BookingMadeEasy = () => {
  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-gradient-to-br from-[#f8faf9] to-white"> {/* Adjusted vertical padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-10 lg:gap-16">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8 sm:space-y-12 order-2 lg:order-1"> {/* Mobile order adjustment for content above image */}
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-gray-900 leading-tight mb-4 lg:mb-6"> {/* Responsive font sizing */}
                Booking Made Easy!
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                You can now book Resort in most easiest way! Just follow the below steps and you are done with your booking.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6 sm:space-y-8"> {/* Adjusted vertical spacing */}
              {bookingSteps.map((step) => (
                <div key={step.number} className="flex gap-4 sm:gap-6 items-start group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#008DDA] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"> {/* Smaller step number circle */}
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-1 sm:pt-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600"> {/* Smaller description text */}
                      {step.description}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#008DDA] mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            <div className="pt-4 sm:pt-6">
              <button className="inline-flex items-center gap-2 px-8 py-3 text-base sm:px-10 sm:py-4 sm:text-lg font-semibold rounded-xl text-white bg-[#008DDA] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"> {/* Responsive CTA button size */}
                Start Booking Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Right Side - Mobile Video Portrait */}
          <div className="w-full lg:w-1/2 flex items-center justify-center order-1 lg:order-2"> {/* Mobile order adjustment for image above content */}
            <div className="relative w-full max-w-xs sm:max-w-sm"> {/* Responsive maximum width */}
              {/* Mobile Frame Mockup */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gray-900 p-2 sm:p-3"> {/* Smaller frame padding */}
                {/* Video Content Area - Portrait 9:16 ratio */}
                <div className="relative aspect-[9/16] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-100">
                  {/* Sample Image/Video Placeholder */}
                  <img 
                    src= {BookingDemo} 
                    alt="Booking process video"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer group">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#03A791] flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> {/* Responsive icon size */}
                      </div>
                      <p className="text-white font-medium text-xs sm:text-sm">Click to upload video</p>
                      <p className="text-gray-300 text-xs mt-0.5">Portrait mode (9:16)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          console.log('Video uploaded:', e.target.files[0].name);
                          // Handle video upload here
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Mobile Notch (Optional - for realistic look) */}
                <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-6 bg-gray-900 rounded-b-xl sm:rounded-b-2xl z-10"></div> {/* Responsive notch size */}
              </div>

              {/* Decorative Elements - Reduced size and blur on small screens */}
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