import React from 'react';
import { FaFilter } from 'react-icons/fa';
import styles from './SessionFilters.module.css';

const SessionFilters = ({ filters, onFilterChange, sessions }) => {
  const uniqueSubjects = [...new Set(sessions.map(s => s.Subject?.name).filter(Boolean))];

  const handleChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <FaFilter className={styles.filterIcon} />
        <h3>Filter Sessions</h3>
      </div>

      <div className={styles.filtersGrid}>
        {/* Status Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter" className={styles.filterLabel}>
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="booked">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="subject-filter" className={styles.filterLabel}>
            Subject
          </label>
          <select
            id="subject-filter"
            value={filters.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="date-filter" className={styles.filterLabel}>
            Date Range
          </label>
          <select
            id="date-filter"
            value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SessionFilters;
