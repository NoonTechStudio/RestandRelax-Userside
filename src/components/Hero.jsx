import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/pagination';

const Hero = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  // Fetch active hero images from backend
  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/homepage-hero/active`);
      
      if (response.data.data && response.data.data.images) {
        // Map the database images to the format needed for the slider
        const images = response.data.data.images.map(img => ({
          src: `${img.url}`,
          alt: `Hero image ${img.order + 1}`,
          originalName: img.originalName
        }));
        setHeroImages(images);
      } else {
        setHeroImages([]);
      }
    } catch (err) {
      console.error('Error fetching hero images:', err);
      setError('Failed to load hero images');
      // Fallback to empty array
      setHeroImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <section className="relative h-auto pt-20 pb-10 md:min-h-screen md:pt-24 flex flex-col items-center justify-center bg-white overflow-hidden">
        <div className="w-full text-center py-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif text-black tracking-tight leading-snug">
            Discover Peace
          </h1>
        </div>
        <div className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-6xl rounded-xl sm:rounded-2xl shadow-4xl overflow-hidden mt-4 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hero images...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error && heroImages.length === 0) {
    return (
      <section className="relative h-auto pt-20 pb-10 md:min-h-screen md:pt-24 flex flex-col items-center justify-center bg-white overflow-hidden">
        <div className="w-full text-center py-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif text-black tracking-tight leading-snug">
            Discover Peace
          </h1>
        </div>
        <div className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-6xl rounded-xl sm:rounded-2xl shadow-4xl overflow-hidden mt-4 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No hero images available</p>
            <p className="text-sm mt-2">Please upload images in the admin panel</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-auto pt-20 pb-10 md:min-h-screen md:pt-24 flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Title section with animation */}
      <motion.div
        className="w-full text-center py-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif text-black tracking-tight leading-snug"> 
          Discover Peace
        </h1>
      </motion.div>

      {/* Image Swiper section with refined animation */}
      <motion.div
        className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-6xl rounded-xl sm:rounded-2xl shadow-4xl overflow-hidden mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.8 }}
      >
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active bg-white',
            bulletClass: 'swiper-pagination-bullet bg-gray-400'
          }}
          className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]"
        >
          {heroImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="flex justify-center bg-[#03A791] w-full h-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    console.error(`Failed to load image: ${image.src}`);
                    e.target.src = '/api/placeholder/800/600';
                  }}
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};

export default Hero;