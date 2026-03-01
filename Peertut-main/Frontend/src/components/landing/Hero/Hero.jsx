import React from 'react';
import styles from './Hero.module.css';
import Button from '../../Button/Button';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Hero() {

  const navigate = useNavigate();
  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <section 
      className={styles.hero} 
      aria-labelledby="hero-title"
      role="banner"
    >
      {/* Decorative overlay */}
      <div className={styles.overlay} aria-hidden="true"></div>
      
      <div className={styles.content}>
        <h1 id="hero-title" className={styles.title}>
          Find Your Perfect Study Partner
        </h1>
        
        <p className={styles.subtitle}>
          Connect with peer tutors and AI-powered study planning to boost your
          academic success.
        </p>
        
        <div className={styles.actions} role="group" aria-label="Primary actions">
          <Button 
            text="Get Started" 
            icon={<FaArrowRight aria-hidden="true" />}
            aria-label="Get started with PeerTut"
            onClick={handleSignUp}
            variant="primary"
          />
          <Button 
            text="Sign In" 
            variant="secondary"
            aria-label="Sign in to your account"
            onClick={handleSignIn}
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
