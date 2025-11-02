import React from 'react';
import { Utensils, Sparkles, Calendar, Home, Lightbulb, ArrowRight, HandshakeIcon, BarChart3, Users, MapPin } from 'lucide-react';

const PartnerWithUs = () => {
  // Define a modern, professional primary color
  const primaryColor = 'sky'; // Tailwind color: sky-600

  const partnerCategories = [
    {
      icon: Utensils,
      title: "Caterers",
      description: "Bring your culinary expertise to our events and create unforgettable dining experiences.",
      color: "text-orange-600 bg-orange-50"
    },
    {
      icon: Sparkles,
      title: "Decorators",
      description: "Transform our venues with your creative vision and stunning decorative designs.",
      color: "text-pink-600 bg-pink-50"
    },
    {
      icon: Calendar,
      title: "Event Planners",
      description: "Collaborate with us to orchestrate seamless and memorable celebrations.",
      color: `text-${primaryColor}-600 bg-${primaryColor}-50`
    },
    {
      icon: Home,
      title: "Farmhouse Owners",
      description: "List your property with us and generate consistent revenue from your prime location.",
      color: "text-green-600 bg-green-50"
    },
    {
      icon: Lightbulb,
      title: "Lighting & Sound",
      description: "Illuminate our events with your expertise in design and installation.",
      color: "text-yellow-600 bg-yellow-50"
    },
    {
      icon: HandshakeIcon,
      title: "Service Providers",
      description: "Join our trusted network of vendors and grow your business with a steady flow of events.",
      color: "text-indigo-600 bg-indigo-50"
    }
  ];

  const statistics = [
    {
      icon: BarChart3,
      value: "500+",
      label: "Annual Events",
    },
    {
      icon: Users,
      value: "50+",
      label: "Active Partners",
    },
    {
      icon: MapPin,
      value: "10+",
      label: "Premium Locations",
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-20">
          <div className={`inline-flex items-center justify-center gap-2 bg-${primaryColor}-100 text-${primaryColor}-600 px-4 py-1.5 rounded-full mb-4`}>
            <HandshakeIcon className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">Collaboration Opportunities</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl text-gray-900 tracking-tight mb-4">
            Partner With <span className={`text-${primaryColor}-600`}>Rest & Relax</span>
          </h2>
          
          <p className="text-lg text-gray-600 text-justify max-w-3xl mx-auto leading-relaxed">
            Join our growing network of trusted service providers. Together, we create exceptional experiences 
            and build lasting business relationships across Vadodara and Gujarat.
          </p>
        </div>

        {/* Partnership Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {partnerCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div 
                key={index}
                className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                
                <p className="text-gray-500 text-base leading-normal">
                  {category.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Benefits/Statistics Section */}
        <div className={`bg-white rounded-2xl shadow-2xl shadow-${primaryColor}-100/70 p-8 md:p-12 border border-${primaryColor}-100 mb-20`}>
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
              Why Partner With Us?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {statistics.map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                  <div key={index} className="space-y-2 p-4">
                    <StatIcon className={`w-10 h-10 mx-auto text-${primaryColor}-600 mb-3`} />
                    <div className={`text-5xl font-extrabold text-${primaryColor}-600`}>
                      {stat.value}
                    </div>
                    <div className="text-lg font-medium text-gray-700">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className={`bg-white rounded-2xl p-8 sm:p-12 text-black shadow-xl shadow-${primaryColor}-200`}>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Grow Your Business?
            </h3>
            
            <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">
              Let's discuss how we can create a mutually beneficial partnership. Reach out today and become part of our success story.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="tel:+919099048961"
                className={`inline-flex items-center gap-2 border-2 border-black text-black px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors duration-300 hover:bg-white/10`}
              >
                Call Us Now
                <ArrowRight className="w-5 h-5" />
              </a>
              
              <a 
                href="mailto:info@restandrelax.in"
                className={`inline-flex items-center gap-2 border-2 border-black text-black px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors duration-300 hover:bg-white/10`}
              >
                Email Us
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-base text-gray-500">
              Contact: <span className="text-gray-700 font-medium">+91 90990 48961</span> | <span className="text-gray-700 font-medium">info@restandrelax.in</span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PartnerWithUs;