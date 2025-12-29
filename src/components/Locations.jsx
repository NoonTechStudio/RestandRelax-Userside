import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';


// importing images of locations
import mistywood from '../assets/Images/Mistywood.jpg';
import swarg from '../assets/Images/Swarg.jpeg';
import Ambawadi from '../assets/Images/Ambawadi.jpeg';
import Riverfront from '../assets/Images/Riverfront.jpeg';

// Static Data Array based on your screenshots
const LOCATIONS_DATA = [
  {
    id: '1',
    name: 'One-Day Picnic at Misty Woods',
    city: 'Diwalipura, Vadodara',
    description: 'Nestled amidst nature’s embrace, only 8 km from Kapurai Chokdi and 15 km from Baroda city, Misty Woods offers a perfect blend of tranquility and luxury. Experience serene surroundings, fresh air, and world-class amenities.',
    image: mistywood 
  },
  {
    id: '2',
    name: 'Swarg Maru Gaam',
    city: 'Padra, Vadodara',
    description: 'Welcome to Swarg, Maru Gaam - Your 20-Acre Village-Style Resort Escape. Spread across 20 acres, Swarg, Maru Gaam is a serene haven where over 80% of the land is lush, landscaped greenery with 73 spacious units.',
    image: swarg 
  },
  {
    id: '3',
    name: 'Ambawadi Resort',
    city: 'Hetampura, Vadodara',
    description: 'Welcome to Swarg, Maru Gaam - Your 20-Acre Village-Style Resort Escape. Featuring 73 spacious units from 4,000 to 8,000 sq.ft. The clubhouse and amenities ensure a comfortable and luxurious stay for your entire group.',
    image: Ambawadi 
  },
  {
    id: '4',
    name: 'Riverfront Resport',
    city: 'Ranu Road, Padra',
    description: 'A premium stay experience featuring wide open garden views and private sit-outs. Perfect for families looking for a peaceful weekend getaway away from the city noise while enjoying resort-style hospitality.',
    image: Riverfront
  }
];

const Locations = () => {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-24">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-tight tracking-tight mb-6">
          Our Locations
        </h1>
        <p className="mt-4 text-justify sm:text-center text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Explore our curated collection of world-class properties, each offering a unique and unforgettable experience
        </p>
      </div>

      {/* Location Cards List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {LOCATIONS_DATA.map((location, index) => (
          <div 
            key={location.id}
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16 group`}
          >
            {/* Image Section */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative h-72 sm:h-80 lg:h-[450px] overflow-hidden rounded-3xl shadow-xl">
                <img 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                  src={location.image} 
                  alt={location.name}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="w-full lg:w-1/2 space-y-6">
              {/* Location Tag */}
              <div className="flex items-center gap-2 text-[#008DDA]">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  {location.city}
                </span>
              </div>
              
              {/* Title */}
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight">
                {location.name}
              </h2>
              
              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {location.description}
              </p>
              
              {/* CTA Button */}
              <div className="pt-4">
                <Link 
                  to={`/locations`} 
                  className="inline-flex items-center justify-center px-10 py-4 text-base font-bold rounded-xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-lg hover:shadow-[#008DDA]/30 transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  View Details
                </Link>
              </div> 
            </div>
          </div>
        ))}
      </div>

      {/* Centered View All Locations button */}
      <div className='mt-20 flex justify-center px-4'>
        <Link 
          to={`/locations`} 
          className="inline-flex items-center justify-center px-12 py-5 text-lg font-bold rounded-2xl text-white bg-[#008DDA] hover:bg-[#0278b8] transition-all duration-300 shadow-xl hover:shadow-[#008DDA]/40 transform hover:-translate-y-1 w-full sm:w-auto"
        >
          View All Locations
        </Link>
      </div>
    </section>
  );
};

export default Locations;