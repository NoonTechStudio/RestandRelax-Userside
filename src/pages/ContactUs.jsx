import React, { useState } from 'react';
import { Mail, MapPin, Phone, MessageSquare, Briefcase, User, Send, CheckCircle } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define the primary color for consistency
const PRIMARY_COLOR = '#008DDA';
const PRIMARY_COLOR_CLASS = 'text-[#008DDA]';

// Data extracted from Footer.jsx for the client's office
const OFFICE_CONTACT_INFO = {
  address: "210, Silver Coin, Shrenikpark charrasta, B.P.C. Road, Akota, Vadodara - 390020, Gujarat",
  phones: ["+91 90990 48961", "+91 90990 48960"],
  email: "info@restandrelax.in",
  // Placeholder Google Maps embed URL for the Vadodara office
  officeMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11946.336450410793!2d73.17855734898734!3d22.28585465551275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc442e39196b7%3A0x6715f5a89326f658!2sAkota%2C%20Vadodara%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
};

// Mock data for multiple properties, based on names found in other files
const PROPERTY_LOCATIONS = [
  {
    id: 1,
    name: "Misty-Wood Villa",
    location: "15 Km from Vadodara",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11946.336450410793!2d73.17855734898734!3d22.28585465551275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc442e39196b7%3A0x6715f5a89326f658!2sMisty%20Wood!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    image: "https://placehold.co/400x250/008DDA/ffffff?text=Misty-Wood",
  },
  {
    id: 2,
    name: "Riverfront Resort",
    location: "Savli-Timba Road",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11946.336450410793!2d73.17855734898734!3d22.28585465551275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc442e39196b7%3A0x6715f5a89326f658!2sRiverfront!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    image: "https://placehold.co/400x250/008DDA/ffffff?text=Riverfront",
  },
  {
    id: 3,
    name: "Ambawadi Getaway",
    location: "Near Vadodara",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11946.336450410793!2d73.17855734898734!3d22.28585465551275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc442e39196b7%3A0x6715f5a89326f658!2sAmbawadi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    image: "https://placehold.co/400x250/008DDA/ffffff?text=Ambawadi",
  },
  {
    id: 4,
    name: "Swarg - Bunglow No. 14",
    location: "Exclusive Private Area",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11946.336450410793!2d73.17855734898734!3d22.28585465551275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc442e39196b7%3A0x6715f5a89326f658!2sSwarg%20Bunglow!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    image: "https://placehold.co/400x250/008DDA/ffffff?text=Swarg",
  },
];

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);

    // --- Placeholder Submission Logic ---
    setTimeout(() => {
      // In a real application, you would send this data to a server.
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      
      // Simulate success
      setSubmissionStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Clear status after 5 seconds
      setTimeout(() => setSubmissionStatus(null), 5000);
    }, 1500);
  };

  const InputField = ({ label, name, type = 'text', icon: Icon }) => (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 sr-only">{label}</label>
      <div className="mt-1 flex rounded-xl shadow-inner bg-white">
        {Icon && (
          <span className="inline-flex items-center px-4 rounded-l-xl border-t border-b border-l border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
            <Icon className="w-5 h-5" />
          </span>
        )}
        <input
          type={type}
          name={name}
          id={name}
          required
          value={formData[name]}
          onChange={handleChange}
          className={`flex-1 block w-full border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-[${PRIMARY_COLOR}] sm:text-base p-4 transition duration-200 ${Icon ? 'rounded-r-xl' : 'rounded-xl'}`}
          placeholder={label}
        />
      </div>
    </div>
  );

  const ContactCard = ({ Icon, title, content, isLink = false, linkHref = '' }) => (
    <div className="flex items-start p-4 rounded-xl hover:bg-white/10 transition duration-300">
      <div className="flex-shrink-0 p-3 rounded-full bg-white text-[#008DDA] shadow-md">
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {isLink ? (
          <a href={linkHref} className="text-gray-200 hover:text-white transition duration-300 font-medium">
            {content}
          </a>
        ) : (
          <p className="text-gray-200 leading-relaxed text-base">{content}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
        <Navbar />
      
      {/* Header Section */}
      <div className="bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* <p className={`text-lg font-semibold uppercase tracking-wider ${PRIMARY_COLOR_CLASS} mb-2`}>
            24/7 Support
          </p> */}
          <h1 className="text-5xl sm:text-7xl text-gray-900 tracking-tight">
            Connect with Our Team
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            We are dedicated to providing quick and <br /> comprehensive answers to all your inquiries.
          </p>
        </div>
      </div>
      
      {/* Main Content: Form & Contact Info */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Contact Information Sidebar (Col 1) */}
            <div className={`lg:col-span-1 bg-[${PRIMARY_COLOR}] p-8 sm:p-12 space-y-8 flex flex-col justify-between`}>
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-6">
                  Corporate HQ
                </h2>
                <p className="text-white/80 text-lg mb-8">
                  Find our main office location and direct contact lines here.
                </p>
                
                <div className="space-y-6">
                  <ContactCard 
                    Icon={MapPin} 
                    title="Visit Us" 
                    content={OFFICE_CONTACT_INFO.address}
                  />
                  <ContactCard 
                    Icon={Phone} 
                    title="Call Us" 
                    content={OFFICE_CONTACT_INFO.phones.join(' / ')}
                    isLink
                    linkHref={`tel:${OFFICE_CONTACT_INFO.phones[0].replace(/\s/g, '')}`}
                  />
                  <ContactCard 
                    Icon={Mail} 
                    title="Email Us" 
                    content={OFFICE_CONTACT_INFO.email}
                    isLink
                    linkHref={`mailto:${OFFICE_CONTACT_INFO.email}`}
                  />
                </div>
              </div>

              {/* Map Embed - Office Location */}
              <div className="rounded-xl overflow-hidden shadow-xl mt-8">
                  <iframe
                      src={OFFICE_CONTACT_INFO.officeMapUrl}
                      title="Office Location"
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-xl"
                  ></iframe>
              </div>
            </div>

            {/* Inquiry Form (Col 2 & 3) */}
            <div className="lg:col-span-2 bg-white p-8 sm:p-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-4 border-gray-100 pb-3">
                Send Us a Quick Message
              </h2>
              
              {submissionStatus === 'success' && (
                <div className="p-4 mb-6 text-green-800 bg-green-100 rounded-xl border border-green-300 flex items-center gap-3 font-medium">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                  <span>Success! Your inquiry has been sent. We will respond within 24 hours.</span>
                </div>
              )}
              {submissionStatus === 'error' && (
                <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-xl border border-red-300 flex items-center gap-3 font-medium">
                  <MessageSquare className="w-5 h-5 flex-shrink-0 text-red-600" />
                  <span>Error! We couldn't send your message. Please try again or call us.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Full Name" name="name" icon={User} />
                  <InputField label="Email Address" name="email" type="email" icon={Mail} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Phone Number" name="phone" type="tel" icon={Phone} />
                  <InputField label="Subject/Event Type" name="subject" icon={Briefcase} />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 sr-only">Message</label>
                  <div className="mt-1 shadow-inner rounded-xl bg-white">
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-gray-200 focus:border-[#008DDA] focus:ring-[#008DDA] sm:text-base p-4 transition duration-200"
                      placeholder="Tell us about your requirements (e.g., preferred location, dates, number of guests)..."
                    ></textarea>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-xl text-white bg-[${PRIMARY_COLOR}] hover:bg-[#0278b8] transition-all duration-300 shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Inquiry
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Property Locations Section - Enhanced Cards */}
      <section className="bg-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl text-gray-900 font-extrabold tracking-tight">
                    Find Your Perfect Location
                </h2>
                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                    Explore our properties and see exactly where your next perfect getaway awaits.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {PROPERTY_LOCATIONS.map((location) => (
                    <div 
                        key={location.id} 
                        className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 group transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                    >
                        {/* Map Embed as Card Background */}
                        <div className="relative h-48 bg-gray-200">
                            <iframe
                                src={location.mapUrl}
                                title={`${location.name} Map`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="transition-all duration-500 group-hover:opacity-70"
                            ></iframe>
                            <div className="absolute inset-0 bg-black/10"></div> {/* Subtle Overlay */}
                        </div>

                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{location.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 flex items-center">
                                <MapPin className={`w-4 h-4 mr-2 ${PRIMARY_COLOR_CLASS}`} />
                                {location.location}
                            </p>
                            
                            {/* CTA Button */}
                            <a 
                                href={location.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-white bg-[${PRIMARY_COLOR}] hover:bg-[#0278b8] transition-colors duration-300`}
                            >
                                Get Directions
                                <MapPin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
      <Footer />

    </div>
  );
};

export default ContactUs;
