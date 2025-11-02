import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';

import Logo from '../assets/Images/PLogo.png';

import Doc1 from '../assets/Images/PrivacyPolicy.pdf';
import Doc2 from '../assets/Images/Terms&Conditions.pdf';




const PRIVACY_POLICY_URL = Doc1;
const TERMS_CONDITIONS_URL = Doc2;
// -----------------------------------------------------------------------------------

// Sample locations to populate the footer
const footerLocations = [
  { name: "Misty-Wood", slug: "misty-wood" },
  { name: "Riverfront", slug: "azure-coastal" },
  { name: "Ambawadi", slug: "summit-ridge" },
  { name: "Swarg - Bunglow No. 14", slug: "desert-oasis" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
                href="https://www.facebook.com/RestnRelaxbaroda" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="text-gray-500 hover:text-[#008DDA] transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/restnrelax.events/" 
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
            <ul className="space-y-3">
              {footerLocations.map((location, index) => (
                <li key={index}>
                  <Link 
                    to={`/locations/${location.slug}`} 
                    className="text-sm text-gray-600 hover:text-[#008DDA] transition-colors duration-300"
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
          </div>
          
          {/* Column 4: Contact Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-[#008DDA] flex-shrink-0 mt-1 mr-3" />
                <span>
                  210, Silver Coin, <br /> 
                  Shrenikpark charrasta, <br />
                  B.P.C. Road, Akota, <br />
                  Vadodara - 390020, Gujarat
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
                   info@restandrelax.in
                </a>
              </li>
            </ul>
          </div>
          
        </div>
        <div className='mt-12 pt-8 border-t border-gray-200'>
          {/* Mobile: Stacked layout, Desktop: Flex layout */}
          <div className='flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0 text-center md:text-left'>
            {/* Copyright Section */}
            <p className='text-xs text-gray-500'>
               © {currentYear} Rest & Relax Properties. All rights reserved.
            </p> 
            
            {/* Terms & Conditions section */}
            <div className='flex justify-center space-x-4 text-xs text-gray-600'>
              <a 
                href={PRIVACY_POLICY_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className='hover:text-[#008DDA] font-medium transition-colors duration-300'
              >
                Privacy Policy
              </a>
              <a 
                href={TERMS_CONDITIONS_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className='hover:text-[#008DDA] font-medium transition-colors duration-300'
              >
                Terms & Conditions
              </a>
            </div>

            {/* Designed By */}
            <p className='text-xs text-gray-500'>
              Designed by <a href="https://www.noontechstudio.com" target="_blank" rel="noopener noreferrer" className='hover:text-[#008DDA]'>Noon Tech Studio</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;