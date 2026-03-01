// components/StepCircle/StepCircle.js
import React from 'react';
import styles from './StepCircle.module.css';

const StepCircle = ({ number, className = '' }) => {
  return (
    <div className={`${styles.stepCircle} ${className} hover-scale`}>
      <span className={styles.stepNumber}>{number}</span>
    </div>
  );
};

export default StepCircle;