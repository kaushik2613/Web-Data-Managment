// components/LoadingSpinner/LoadingSpinner.jsx
import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', ...props }) => {
  return (
    <span
      className={`${styles.spinner} ${styles[size]} ${styles[color]}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      {...props}
    >
      <span className={styles.spinnerCircle} aria-hidden="true" />
    </span>
  );
};

export default LoadingSpinner;
