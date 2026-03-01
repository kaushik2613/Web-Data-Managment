// components/HowItWorks/HowItWorks.js
import React from 'react';
import StepCircle from '../StepCircle/StepCircle';
import styles from './HowItWorks.module.css';

const HowItWorks = () => {
  return (
    <section className={`${styles.howItWorks} flex-column-center`}>
      <div className={`${styles.container} flex-column-center w-full`}>
        <h2 className={`${styles.title} text-uppercase text-center`}>HOW IT WORKS</h2>
        
        <div className={`${styles.stepsContainer} flex-column w-full`}>
          <div className={`${styles.stepItem} flex-row-center gap-lg`}>
            <StepCircle number={1} />
            <span className={styles.stepText}>Sign In</span>
          </div>
          
          <div className={`${styles.stepItem} flex-row-center gap-lg`}>
            <StepCircle number={2} />
            <span className={styles.stepText}>Find a Tutor & Book a Session</span>
          </div>
          
          <div className={`${styles.stepItem} flex-row-center gap-lg`}>
            <StepCircle number={3} />
            <span className={styles.stepText}>Learn & Grow</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;