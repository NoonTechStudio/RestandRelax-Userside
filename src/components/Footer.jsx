import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';

import Logo from '../assets/Images/PLogo.png';

// API base URL - replace with your actual API base URL
const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

const Footer = () => {
  const [footerLocations, setFooterLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentYear = new Date().getFullYear();

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/locations`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch locations: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match the expected format
        // Adjust this based on your actual API response structure
        const transformedLocations = data.map(location => ({
          name: location.name || location.title || 'Unnamed Location',
          slug: location.slug || location.id || 'unknown'
        }));
        
        // Limit to 4 locations for the footer
        setFooterLocations(transformedLocations.slice(0, 4));
        setError(null);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations');
        // Optionally, you can set some fallback locations here
        setFooterLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Logo and Short Description */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <img src={Logo} alt="logo" className='w-full h-18' />
            </Link>
            <p className="text-sm leading-relaxed text-gray-600">
              Curating exceptional locations to create unforgettable memories. Experience the best in nature and hospitality.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="text-gray-500 hover:text-[#008DDA] transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="text-gray-500 hover:text-[#008DDA] transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-[#008DDA] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-sm text-gray-600 hover:text-[#008DDA] transition-colors duration-300">
                  Locations
                </Link>
              </li>
              <li>
                <Link to="/rates" className="text-sm text-gray-600 hover:text-[#008DDA] transition-colors duration-300">
                  Rates
                </Link>
              </li>
              <li>
                <Link to="/memories" className="text-sm text-gray-600 hover:text-[#008DDA] transition-colors duration-300">
                  Memories
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-sm text-gray-600 hover:text-[#008DDA] transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Locations */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Our Locations</h3>
            {loading ? (
              <div className="text-sm text-gray-500">Loading locations...</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : footerLocations.length > 0 ? (
              <ul className="space-y-3">
                {footerLocations.map((location, index) => (
                  <li key={`${location.slug}-${index}`}>
                    <Link 
                      to={`/locations-details/${location.slug}`} 
                      className="text-[12px] text-gray-600 hover:text-[#008DDA] transition-colors duration-300"
                    >
                      {location.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link 
                    to="/locations" 
                    className="text-sm text-[#008DDA] hover:text-[#0278b8] font-medium transition-colors duration-300 inline-flex items-center gap-1"
                  >
                    View All →
                  </Link>
                </li>
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No locations available</div>
            )}
          </div>
          
          {/* Column 4: Contact Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-[#008DDA] flex-shrink-0 mt-1 mr-3" />
                <span>
                  17th Manjusar, <br /> 
                  Bhagyalaxmi Complex, <br />
                  Nr. Manjusar Bus Stop, <br />
                  Savli Road, Vadodara 391775
                </span>
              </li>
              <li className="flex items-center text-sm">
                <Phone className="w-4 h-4 text-[#008DDA] flex-shrink-0 mr-3" />
                <a 
                  href="tel:+919876543210" 
                  className="text-gray-600 hover:text-[#008DDA] transition-colors duration-300"
                >
                  +91 90990 48961 <br />
                  +91 90990 48960
                </a>
              </li>
              <li className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-[#008DDA] flex-shrink-0 mr-3" />
                <a 
                  href="mailto:hello@restnrelax.com" 
                  className="text-gray-600 hover:text-[#008DDA] transition-colors duration-300"
                >
                   restmanjusar@gmail.com
                </a>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            ©️ {currentYear} Rest & Relax Properties. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;