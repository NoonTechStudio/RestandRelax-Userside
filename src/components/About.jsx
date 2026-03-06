import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Sparkles } from 'lucide-react';

// Use a placeholder image path until the actual image is added to your project
import aboutImage from '../assets/Images/AboutBG.jpg'; 

// --- Styled Components ---

const SectionWrapper = styled.section`
  padding: 3rem 1rem; /* Reduced padding for mobile */
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 5rem 2rem; /* Standard padding for desktop */
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  padding: 0 0.5rem; /* Reduced horizontal padding for better mobile use of space */

  @media (min-width: 768px) {
    padding: 0 2rem;
  }
`;

const TextGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem; /* Reduced gap for mobile */
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr; /* Two columns on md and up */
    gap: 2rem;
    margin-bottom: 2rem;
  }
`;

const TextContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Heading = styled.h2`
  font-family: 'Crimson Text', serif;
  font-size: 2.5rem; /* Smaller size for mobile */
  margin-bottom: 1.5rem; /* Adjusted margin for mobile */
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (min-width: 768px) {
    font-size: 4rem; /* Standard desktop size */
    margin-bottom: 2rem;
  }
  @media (min-width: 1024px) {
    font-size: 5rem; /* Large desktop size */
  }
`;

const BodyText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1rem; /* Smaller font for mobile readability */
  color: #5D688A;
  margin: 1rem 0; /* Reduced vertical margin */
  line-height: 1.7;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:first-child {
    font-weight: 500;
  }

  @media (min-width: 768px) {
    font-size: 1.2rem; /* Standard font size for desktop */
    margin: 1.5rem 0;
    line-height: 1.8;
  }
`;

const ImageContainer = styled(motion.div)`
  width: 95%; /* Slightly narrower for mobile to avoid edge-to-edge look */
  margin: 2rem auto; /* Adjusted margins and centered */
  height: auto;
  min-height: 250px; /* Reduced min height for mobile */
  border-radius: 1rem; /* Slightly smaller radius for mobile */
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); /* Slightly lighter shadow */
  border: 4px solid white;

  @media (min-width: 768px) {
    width: 100%; /* Full width within the ContentContainer max-width */
    margin: 3rem 0; /* Standard desktop margin */
    min-height: 400px; 
    border-radius: 1.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  @media (min-width: 1024px) {
    min-height: 600px;
  }
`;

const AboutImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FeaturesWrapper = styled.div`
  width: 100%;
  padding: 0;
  margin-top: 3rem; /* Adjusted margin */

  @media (min-width: 768px) {
    margin-top: 4rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem; /* Reduced gap for mobile */
  width: 100%;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
`;

const FeatureCard = styled(motion.div)`
  padding: 1.5rem; /* Reduced padding for mobile */
  background: white;
  border-radius: 0.75rem; /* Slightly smaller radius */
  text-align: left;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-top: 4px solid #008DDA; 
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 640px) {
    padding: 2.5rem; /* Standard padding for tablet/desktop */
    border-radius: 1rem;
  }
`;

const FeatureIconWrapper = styled.div`
  color: #008DDA;
  margin-bottom: 0.75rem; /* Adjusted margin */
`;

const FeatureTitle = styled.h4`
  font-size: 1rem; /* Smaller font size for mobile */
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.4rem;

  @media (min-width: 640px) {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem; /* Smaller font size for mobile */
  color: #718096;
  line-height: 1.5;
  text-align: justify;

  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

// --- Component ---

const AboutSection = () => {
    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    return (
        <SectionWrapper>
            <ContentContainer>
                {/* Text Section */}
                <Heading>About Rest And Relax</Heading>

                <TextContainer>
                    <TextGrid>
                        <BodyText className='text-justify'>
                            Welcome to <span className='font-bold'> Rest and Relax </span>, your premier destination for unforgettable experiences in the heart of Gujarat! Nestled in the vibrant city of Vadodara, we are dedicated to creating memorable moments for people from all walks of life across India.
                        </BodyText>
                        <BodyText className='text-justify'>
                            Vadodara, a city steeped in culture and history, serves as the perfect backdrop for your special occasions. With its picturesque landscapes and rich heritage, our location offers an ideal escape from the hustle and bustle of everyday life.
                        </BodyText>
                    </TextGrid>
                    <BodyText className='text-justify'>
                        At Rest and Relax, we specialize in a diverse range of services designed to cater to your every need. Whether you're planning a delightful one-day picnic with family, an elegant wedding destination, or a fun-filled corporate event, we've got you covered.
                    </BodyText>
                </TextContainer>
            </ContentContainer>

            {/* Full-width Image Section - Moved outside ContentContainer for full width */}
            <ImageContainer
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <AboutImage src={aboutImage} alt="Scenic Valley" />
            </ImageContainer>

            <ContentContainer>
                {/* Features/Value Proposition Grid */}
                <FeaturesWrapper>
                    <FeaturesGrid
                        as={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <FeatureCard variants={itemVariants}>
                            <FeatureIconWrapper><Calendar size={32} /></FeatureIconWrapper>
                            <FeatureTitle>Diverse Event Services</FeatureTitle>
                            <FeatureDescription>
                                From intimate family picnics to grand weddings and corporate gatherings, we offer comprehensive event planning tailored to your vision and budget.
                            </FeatureDescription>
                        </FeatureCard>
                        
                        <FeatureCard variants={itemVariants}>
                            <FeatureIconWrapper><MapPin size={32} /></FeatureIconWrapper>
                            <FeatureTitle>Prime Vadodara Location</FeatureTitle>
                            <FeatureDescription>
                                Enjoy the perfect blend of accessibility and natural beauty in Gujarat's cultural capital, with scenic landscapes and rich heritage at your doorstep.
                            </FeatureDescription>
                        </FeatureCard>
                        
                        <FeatureCard variants={itemVariants}>
                            <FeatureIconWrapper><Users size={32} /></FeatureIconWrapper>
                            <FeatureTitle>For Every Occasion</FeatureTitle>
                            <FeatureDescription>
                                Whether it's a day out with loved ones, a milestone celebration, or a team-building retreat, we create experiences that bring people together.
                            </FeatureDescription>
                        </FeatureCard>
                        
                        <FeatureCard variants={itemVariants}>
                            <FeatureIconWrapper><Sparkles size={32} /></FeatureIconWrapper>
                            <FeatureTitle>Memorable Experiences</FeatureTitle>
                            <FeatureDescription>
                                We transform ordinary gatherings into extraordinary memories with personalized service, attention to detail, and a passion for excellence.
                            </FeatureDescription>
                        </FeatureCard>
                    </FeaturesGrid>
                </FeaturesWrapper>
            </ContentContainer>
        </SectionWrapper>
    );
};

export default AboutSection;