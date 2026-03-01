// components/Dashboard/StatsCard.jsx
import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from './StatsCard.module.css';

const StatsCard = ({ title, value, change, icon, color, trend, suffix = '' }) => {
  const isPositive = change >= 0;
  const changeText = isPositive ? 'increased' : 'decreased';

  return (
    <article 
      className={styles.statsCard}
      role="region"
      aria-label={`${title}: ${value}${suffix}, ${changeText} by ${Math.abs(change).toFixed(1)}% compared to last period`}
    >
      <div className={styles.statsHeader}>
        <span className={styles.statsTitle}>{title}</span>
        <div 
          className={styles.statsIcon} 
          style={{ backgroundColor: `${color}15` }}
          aria-hidden="true"
        >
          {React.cloneElement(icon, { style: { color } })}
        </div>
      </div>
      <div className={styles.statsBody}>
        <h3 className={styles.statsValue}>
          {value}
          {suffix && <span className={styles.statsSuffix}>{suffix}</span>}
        </h3>
      </div>
    </article>
  );
};

export default StatsCard;
