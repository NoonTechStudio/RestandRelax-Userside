import React from 'react';
import { CheckCircle, Clock, Users, Sun, Moon, Sparkles, Star, Info } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

// Define the primary color for consistency
const PRIMARY_COLOR_CLASS = 'text-[#008DDA]';

const Rates = () => {
  // Data derived from the attached screenshots
  const dayPicnicRates = {
    withoutFood: [
      { 
        session: "Morning Session (8:00 am to 2:00 pm)", 
        adult: "400", 
        kids: "200" 
      },
      { 
        session: "Evening Session (3:00 pm to 9:00 pm)", 
        adult: "400", 
        kids: "200" 
      },
      { 
        session: "A full day picnic (8:00 am to 8:00 pm)", 
        adult: "800", 
        kids: "300" 
      },
    ],
    withFood: [
      { 
        session: "Morning Session (8:00 am to 2:00 pm)", 
        adult: "750", 
        kids: "400" 
      },
      { 
        session: "Evening Session (3:00 pm to 9:00 pm)", 
        adult: "750", 
        kids: "400" 
      },
      { 
        session: "A full day picnic (8:00 am to 8:00 pm)", 
        meals: "Breakfast + Lunch + High Tea + Dinner",
        adult: "1250", 
        kids: "550" 
      },
    ],
    schoolGroup: {
      heading: "Day Picnics Private School / Tuition classes / Collages / Student groups.",
      rates: [
        { age: "01 years to 15 years", price: "150" },
        { age: "15 years to 18 years above", price: "250" }
      ],
      extra: "Puppet show, Magic show, horse riding, Bullock cart ride available with extra charge."
    }
  };

  const dayStayRates = {
    dayStay: [
      {
        session: "Morning Session",
        time: "8:00 am to 2:00 pm",
        couple: "1500"
      },
      {
        session: "Evening Session",
        time: "3:00 pm to 9:00 pm",
        couple: "1500"
      },
      {
        session: "Full Day Stay",
        time: "8:00 am to 8:00 pm",
        couple: "2500"
      }
    ],
    nightStay: {
        session: "Night Stay",
        time: "9:00 pm to 9:00 am",
        couple: "3500"
    },
    nightAtFarmhouse: {
        heading: "Night At Farm House",
        time: "09 PM to 09 AM",
        includes: "With Dinner & Breakfast",
        rates: [
            { type: "Single Person", price: "1000" },
            { type: "Kid above 5 years", price: "600" }
        ]
    }
  };
  
  const extras = [
    { name: "Swimming Pool", detail: "Only Morning Session", price: "300", icon: Sparkles },
    { name: "Villa Ground Floor", detail: "Booking For Villa (Ground Floor)", price: "4500", icon: CheckCircle },
    { name: "Full Villa", detail: "Booking For Villa (Full Villa)", price: "7500", icon: CheckCircle },
  ];

  const PriceTag = ({ amount, label = "" }) => (
    <div className="flex flex-col items-center">
      <span className="text-3xl md:text-3xl font-bold text-[#008DDA] text-2xl sm:text-3xl">₹{amount}</span>
      {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
    </div>
  );

  const Badge = ({ children, color = "blue" }) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      orange: "bg-orange-100 text-orange-800"
    };
    return (
      <span className={`${colors[color]} text-xs font-semibold px-2 py-1 rounded-full sm:px-3`}>
        {children}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      <Navbar />
        
      {/* Header Section - START of ContactUs-like structure */}
      <div className="bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-gray-100 shadow-sm">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl text-gray-900 tracking-tight">
            Our Rates & Packages
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Find the perfect package for your getaway, <br className="hidden sm:inline" /> from short picnics to full night stays.
          </p>
        </header>
      </div>
      {/* Header Section - END of ContactUs-like structure */}


      <section className="py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Day Picnic Section */}
        <article className="mb-16 sm:mb-20">
          <div className="flex items-center justify-center mb-8 sm:mb-10">
            <div className="bg-[#008DDA] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full flex items-center gap-2 sm:gap-3 shadow-lg">
              <Sun className="w-5 h-5 sm:w-7 sm:h-7" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Day Picnic Packages</h2>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Without Food Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-between flex-wrap gap-2">
                  <span>Without Food</span>
                  <Badge color="blue">Entry Only</Badge>
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {dayPicnicRates.withoutFood.map((item, index) => (
                  <div key={index} className="pb-4 sm:pb-6 border-b last:border-b-0 border-gray-200">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#008DDA] flex-shrink-0" />
                      <p className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg">{item.session}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-xl text-center">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Adults</p>
                        <PriceTag amount={item.adult} />
                      </div>
                      <div className="bg-green-50 p-3 sm:p-4 rounded-xl text-center">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Kids (5-12 yrs)</p>
                        <PriceTag amount={item.kids} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* With Food Card */}
            <div className="bg-white border-2 border-[#008DDA] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
              <div className="bg-gradient-to-r from-[#008DDA] to-[#0066a8] text-white p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-between flex-wrap gap-2">
                  <span>With Food</span>
                  <Badge color="green">Meals Included</Badge>
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {dayPicnicRates.withFood.map((item, index) => (
                  <div key={index} className="pb-4 sm:pb-6 border-b last:border-b-0 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#008DDA] flex-shrink-0" />
                      <p className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg">{item.session}</p>
                    </div>
                    {item.meals && (
                      <p className="text-xs sm:text-sm text-green-700 bg-green-50 inline-block px-2 py-1 sm:px-3 rounded-full mb-3 font-medium">
                        {item.meals}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3">
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-xl text-center">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Adults</p>
                        <PriceTag amount={item.adult} />
                      </div>
                      <div className="bg-green-50 p-3 sm:p-4 rounded-xl text-center">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Kids (5-12 yrs)</p>
                        <PriceTag amount={item.kids} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* School/Group Rates */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="bg-[#008DDA] p-2 sm:p-3 rounded-full flex-shrink-0">
                <Users className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  School & Student Groups
                </h4>
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  {dayPicnicRates.schoolGroup.heading}
                </p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
              {dayPicnicRates.schoolGroup.rates.map((rate, index) => (
                <div key={index} className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-blue-100">
                  <p className="text-sm sm:text-base text-gray-700 font-medium mb-3">{rate.age}</p>
                  <PriceTag amount={rate.price} label="per person" />
                </div>
              ))}
            </div>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 sm:p-4 rounded-lg">
              <div className="flex gap-2 sm:gap-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-gray-700">
                  <span className="font-semibold">Extra Activities:</span> {dayPicnicRates.schoolGroup.extra}
                </p>
              </div>
            </div>
          </div>
        </article>
        
        {/* Day Stay & Night Stay Section */}
        <article className="mb-16 sm:mb-20">
          <div className="flex items-center justify-center mb-8 sm:mb-10">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full flex items-center gap-2 sm:gap-3 shadow-lg">
              <Moon className="w-5 h-5 sm:w-7 sm:h-7" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Day & Night Stay Packages</h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 mb-6 sm:mb-8">
            {/* Day Stay Cards */}
            {dayStayRates.dayStay.map((item, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#008DDA] to-[#0066a8] text-white p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">{item.session}</h3>
                  <p className="text-xs sm:text-sm opacity-90">{item.time}</p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="text-center mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Couple Rate</p>
                    <PriceTag amount={item.couple} />
                  </div>
                  <div className="bg-blue-50 border-l-4 border-[#008DDA] p-3 rounded">
                    <p className="text-xs text-gray-700">
                      <Info className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 text-[#008DDA]" />
                      <span className="font-semibold">Kids up to 5 years:</span> Complimentary<br/>
                      <span className="font-semibold">Above 5 years:</span> Chargeable
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Night Stay - Full Width Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-6 sm:mb-8">
            <div className="p-5 sm:p-8">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-5 sm:mb-6">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <Moon className="w-6 h-6 sm:w-8 sm:h-8 text-[#008DDA]" fill="currentColor" />
                    <h3 className="text-2xl sm:text-3xl font-bold">{dayStayRates.nightStay.session}</h3>
                  </div>
                  <p className="text-base sm:text-lg text-gray-300">{dayStayRates.nightStay.time}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl border border-white/20">
                  <p className="text-xs sm:text-sm text-gray-300 mb-2">Couple Rate</p>
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#008DDA]">₹{dayStayRates.nightStay.couple}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 sm:p-4 rounded-xl">
                <p className="text-xs sm:text-sm">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2 text-[#008DDA]" />
                  <span className="font-semibold">Child Policy:</span> Kids up to 5 years complimentary. Above 5 years will be chargeable.
                </p>
              </div>
            </div>
          </div>
          
          {/* Night at Farm House */}
          <div className="bg-gradient-to-br from-[#008DDA] to-[#0066a8] text-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 sm:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                  <Moon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold">{dayStayRates.nightAtFarmhouse.heading}</h4>
                  <p className="text-sm sm:text-base text-blue-100">{dayStayRates.nightAtFarmhouse.time}</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full inline-block mb-5 sm:mb-6 border border-white/20">
                <p className="text-xs sm:text-sm font-semibold">
                  ✨ {dayStayRates.nightAtFarmhouse.includes}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {dayStayRates.nightAtFarmhouse.rates.map((rate, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/30 text-center">
                    <p className="text-sm sm:text-base text-blue-100 mb-3 font-medium">{rate.type}</p>
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold">₹{rate.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Extras and Group Booking Section */}
        <article className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-15">
            
            {/* Extras */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
                  <Sparkles className={`w-6 h-6 sm:w-8 sm:h-8 ${PRIMARY_COLOR_CLASS}`} />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Extra Services</h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {extras.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="bg-[#008DDA]/10 p-2 sm:p-3 rounded-full flex-shrink-0">
                                  <item.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${PRIMARY_COLOR_CLASS}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-sm sm:text-base md:text-lg text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs sm:text-sm text-gray-600">{item.detail}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#008DDA]">₹{item.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-5 sm:mt-6 bg-amber-50 border-l-4 border-amber-400 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold">*Note:</span> All extra services are subject to availability and separate payment.
                  </p>
                </div>
            </div>

            {/* Special Discount for Group Booking CTA */}
            <div className="bg-gradient-to-br from-[#008DDA] to-[#0066a8] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-full inline-block mb-5 sm:mb-6">
                    <Star className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-300" fill="currentColor" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                    Special Group Discounts!
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-95 leading-relaxed">
                    Planning a <span className="font-bold">corporate event</span>, <span className="font-bold">wedding</span>, or <span className="font-bold">large family reunion</span>? 
                  </p>
                  <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 opacity-90">
                    Contact us for customized packages and exclusive group rates!
                  </p>
                  <a 
                      href="/contact-us"
                      className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-10 sm:py-5 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl text-[#008DDA] bg-white hover:bg-gray-50 transition-all duration-300 shadow-xl transform hover:scale-105 hover:shadow-2xl"
                  >
                      Get Group Pricing
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </a>
                </div>
            </div>

        </article>

      </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Rates;