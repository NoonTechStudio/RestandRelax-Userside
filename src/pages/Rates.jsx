import React from 'react';
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
  Users
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const Rates = () => {
  
  // --- SECTION 1 DATA: The "Nice Format" Overview (from WhatsApp Image) ---
  const overviewPackages = [
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
        "No Food Included"
      ]
    },
    {
      id: 2,
      title: "Entry + Food",
      price: "1000",
      duration: "Morning to Evening",
      icon: <Utensils className="w-6 h-6" />,
      color: "teal",
      highlight: true, // The "Most Popular" card
      tag: "Most Popular",
      features: [
        "Entry Ticket",
        "Buffet Breakfast",
        "Buffet Lunch",
        "High-Tea",
        "Access to Amenities"
      ]
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
        "Full Day Enjoyment"
      ]
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
        "Full Day & Night Access"
      ]
    }
  ];

  // --- SECTION 2 DATA: Detailed Breakdowns (from Screenshots) ---
  const detailedPicnic = {
    withoutFood: {
      title: "Without Food",
      subtitle: "Entry Only",
      icon: <Sun className="w-5 h-5" />,
      sessions: [
        { label: "Morning Session", time: "8:00 am to 2:00 pm", adult: "500", kid: "200" },
        { label: "Evening Session", time: "3:00 pm to 9:00 pm", adult: "500", kid: "200" },
        { label: "Full Day Picnic", time: "8:00 am to 8:00 pm", adult: "800", kid: "300" },
      ]
    },
    withFood: {
      title: "With Food",
      subtitle: "Meals Included",
      icon: <Utensils className="w-5 h-5" />,
      sessions: [
        { label: "Morning Session", time: "8:00 am to 2:00 pm", adult: "750", kid: "400" },
        { label: "Evening Session", time: "3:00 pm to 9:00 pm", adult: "750", kid: "400" },
        { 
          label: "Full Day Picnic", 
          time: "8:00 am to 8:00 pm", 
          adult: "1300", 
          kid: "550",
          note: "Includes: Breakfast + Lunch + High Tea + Dinner"
        },
      ]
    }
  };

  const coupleStays = [
    { title: "Morning Session", time: "8:00 am to 2:00 pm", price: "1500", type: "Couple Rate" },
    { title: "Evening Session", time: "3:00 pm to 9:00 pm", price: "1500", type: "Couple Rate" },
    { title: "Full Day Stay", time: "8:00 am to 8:00 pm", price: "2500", type: "Couple Rate" },
    { title: "Night Stay", time: "9:00 pm to 9:00 am", price: "3500", type: "Couple Rate", highlight: true }
  ];

  const nightFarmHouse = {
    title: "Night At Farm House",
    time: "09 PM to 09 AM",
    includes: "With Dinner & Breakfast",
    rates: [
        { type: "Single Person", price: "1000" },
        { type: "Kid above 5 years", price: "600" }
    ]
  };

  const extras = [
    { name: "Swimming Pool", detail: "Morning Session Add-on", price: "300" },
    { name: "Villa Ground Floor", detail: "Private Villa Booking", price: "4500" },
    { name: "Full Villa", detail: "Full Private Villa Booking", price: "7500" },
  ];

  const PriceRow = ({ label, price }) => (
    <div className="flex justify-between items-end border-b border-dashed border-gray-200 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="font-bold text-[#008DDA]">₹{price}</span>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-white pt-28 pb-10 sm:pt-36 sm:pb-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our <span className="text-[#008DDA]">Packages</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our popular all-inclusive packages or customize your visit with session-based rates below.
          </p>
        </div>
      </div>

      {/* ==========================================
          SECTION 1: OVERVIEW (The "Nice Format") 
         ========================================== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Popular Packages</h2>
            <p className="text-gray-500">Our best-selling all-inclusive options</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {overviewPackages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`relative bg-white rounded-3xl flex flex-col
                  ${pkg.highlight ? 'ring-4 ring-[#008DDA]/20 shadow-2xl scale-105 z-10' : 'border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300'}
                `}
              >
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#008DDA] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      {pkg.tag}
                    </span>
                  </div>
                )}

                <div className="p-8 flex-grow">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6
                    ${pkg.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                    ${pkg.color === 'teal' ? 'bg-teal-50 text-teal-600' : ''}
                    ${pkg.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}
                    ${pkg.color === 'violet' ? 'bg-violet-50 text-violet-600' : ''}
                  `}>
                    {pkg.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.title}</h3>
                  <p className="text-sm text-gray-400 mb-6">{pkg.duration}</p>

                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-gray-900">₹{pkg.price}</span>
                    <span className="text-gray-400 ml-1">/ person</span>
                  </div>

                  <ul className="space-y-4">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`mt-1 p-0.5 rounded-full
                          ${pkg.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                          ${pkg.color === 'teal' ? 'bg-teal-100 text-teal-600' : ''}
                          ${pkg.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : ''}
                          ${pkg.color === 'violet' ? 'bg-violet-100 text-violet-600' : ''}
                        `}>
                           <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* <div className="p-8 pt-0">
                  <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors
                    ${pkg.highlight 
                      ? 'bg-[#008DDA] text-white hover:bg-[#0077b6] shadow-lg shadow-blue-200' 
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'}
                  `}>
                    Book Now
                  </button>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4"><hr className="border-gray-200" /></div>

      {/* ==========================================
          SECTION 2: DETAILED BREAKDOWN
         ========================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-16">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Detailed Session Rates</h2>
             <p className="text-lg text-gray-600">Specific timing breakdowns for picnics and stays.</p>
          </div>

          {/* Part A: Day Picnic Detail Grid */}
          <div className="grid lg:grid-cols-2 gap-10 mb-20">
            {/* Without Food */}
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

            {/* With Food */}
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

          {/* Part B: Couple Stays */}
          <div className="mb-20">
            <div className="flex items-center gap-2 mb-8">
               <Moon className="w-6 h-6 text-gray-900" />
               <h3 className="text-2xl font-bold text-gray-900">Couple Stay Options</h3>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {coupleStays.map((stay, idx) => (
                    <div key={idx} className={`rounded-2xl p-6 border ${stay.highlight ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-200 hover:border-[#008DDA]'} transition-colors`}>
                        <h4 className="font-bold text-lg mb-1">{stay.title}</h4>
                        <p className={`text-xs mb-6 ${stay.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{stay.time}</p>
                        <div className="flex justify-between items-end">
                             <span className="text-xs uppercase tracking-wider opacity-70">{stay.type}</span>
                             <span className={`text-2xl font-bold ${stay.highlight ? 'text-[#008DDA]' : 'text-[#008DDA]'}`}>₹{stay.price}</span>
                        </div>
                    </div>
                ))}
            </div>
             {/* Child Policy */}
            <div className="mt-6 bg-blue-50 p-4 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-[#008DDA] mt-0.5" />
                <p className="text-sm text-gray-700">
                    <span className="font-bold">Stay Child Policy:</span> Kids up to 5 years are complimentary. Kids above 5 years are chargeable.
                </p>
            </div>
          </div>

          {/* Part C: Night at Farmhouse (Blue Card) */}
          <div className="bg-[#005c99] rounded-3xl overflow-hidden shadow-xl mb-20 text-white">
            <div className="p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/10 p-2 rounded-full"><Moon className="w-6 h-6" /></div>
                        <h2 className="text-3xl font-bold">{nightFarmHouse.title}</h2>
                    </div>
                    <p className="text-blue-200 text-lg mb-6">{nightFarmHouse.time}</p>
                    <span className="inline-block bg-[#008DDA] px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                       ✨ {nightFarmHouse.includes}
                    </span>
                </div>
                <div className="flex gap-6 w-full lg:w-auto">
                     {nightFarmHouse.rates.map((rate, idx) => (
                         <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/10 flex-1 lg:w-48 p-6 rounded-2xl text-center">
                             <p className="text-sm text-blue-100 mb-2">{rate.type}</p>
                             <p className="text-3xl font-bold">₹{rate.price}</p>
                         </div>
                     ))}
                </div>
            </div>
          </div>

          {/* Part D: Extras */}
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
             
             {/* Group Booking CTA */}
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

export default Rates;