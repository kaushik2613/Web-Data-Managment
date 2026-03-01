// components/Button/Button.jsx
import React from 'react';
import styles from './Button.module.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

function Button({
  text,
  icon,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const classes = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;

  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick && onClick(e);
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" color="primary" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <span>{text}</span>
          {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;
