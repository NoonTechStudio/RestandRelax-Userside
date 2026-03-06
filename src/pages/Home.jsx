import React from 'react'
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Events from '../components/Events';
import About from '../components/About';
import Locations from '../components/Locations';
import BookingDemo from '../components/BookingSection';
import WhyUs from '../components/WhyUs';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className='min-h-screen bg-white'>
        <Navbar />
        <Hero />
        <Events />
        <About />
        <Locations />
        <BookingDemo />
        <WhyUs />
        < Footer />
    </div>
  )
}

export default Home