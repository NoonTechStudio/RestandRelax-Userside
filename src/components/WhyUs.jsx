import React from 'react';
import { Quote } from 'lucide-react';

import OwnerImg from '../assets/Images/owner.png';
const TestimonialSection = () => {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-tight tracking-tight mb-6">
            Why Choose Our Properties?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            You need a getaway that exceeds expectations. That's why we curated exceptional locations to create unforgettable experiences.
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 bg-white rounded-3xl shadow-2xl overflow-hidden p-8 lg:p-12">
            
            {/* Image Section */}
            <div className="w-full lg:w-6/12 flex-shrink-0">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src= {OwnerImg}
                  alt="Guest testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="w-full lg:w-7/12 space-y-6">
              <Quote className="w-12 h-12 text-[#008DDA] opacity-50" />
              
              <blockquote className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 leading-relaxed font-serif">
                "Our resort is more than just a place to stay — it’s a place to create memories, reconnect with loved ones, and experience the best of nature and hospitality."
              </blockquote>
              
              <div className="pt-4">
                <p className="text-xl font-semibold text-gray-900">Taher & Ajab Zabuawala</p>
                <p className="text-base text-[#008DDA] font-medium">Owner and Entrepreneur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid Header */}
        <div className="text-center mb-12">
          <h3 className="text-4xl sm:text-5xl text-gray-900 mb-4">Guest Experiences</h3>
          <p className="text-lg text-gray-600">Here's what our guests are saying</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Testimonial Card 1 - Focused on Events/Wedding */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The perfect wedding destination! The team at Rest and Relax handled everything flawlessly, making our big day in Vadodara absolutely magical and stress-free.
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-gray-900">Priya & Aarav Patel</p>
                <p className="text-sm text-gray-600">Newlyweds from Ahmedabad</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 2 - Focused on Corporate/Team Building */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We hosted our annual corporate retreat here, and it was outstanding! The peaceful environment and professional facilities were ideal for team building.
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-gray-900">Raj Kapoor</p>
                <p className="text-sm text-gray-600">CEO, Tech Innovations Pvt. Ltd.</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 3 - Focused on Family/Picnic */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              A fantastic spot for a family picnic! The kids loved the open space, and the peaceful location near Vadodara was a wonderful escape from the city hustle.
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-gray-900">Meena Sharma</p>
                <p className="text-sm text-gray-600">Homemaker from Baroda</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 4 - General praise/location */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The property is stunning and beautifully maintained. It truly is a haven of relaxation, making it the top choice for our events in the Gujarat area.
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-gray-900">Vikram Singh</p>
                <p className="text-sm text-gray-600">Event Planner, VMS Events</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 5 - Event service focus */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The service was impeccable. Every detail, from the catering to the setup for our conference, was handled with professionalism and a smile. Highly recommend!
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-gray-900">Sonal Desai</p>
                <p className="text-sm text-gray-600">Marketing Director, Global Soft</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 6 - Cultural/Heritage focus */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Choosing a venue that respected the rich culture of Vadodara was key for us. This location provided the perfect mix of modern amenities and local charm.
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-gray-900">Jatin Shah</p>
                <p className="text-sm text-gray-600">Historian & Travel Blogger</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;