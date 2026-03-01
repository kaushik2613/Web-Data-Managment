// components/Dashboard/RecentSessions.jsx
import React from 'react';
import { FaUser, FaBook, FaClock, FaDollarSign, FaStar } from 'react-icons/fa';
import { MdHistory } from 'react-icons/md';
import styles from './RecentSessions.module.css';

const RecentSessions = ({ sessions }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className={styles.starsContainer} aria-label={`Rating: ${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <FaStar
            key={i}
            className={i < Math.floor(rating) ? styles.starFilled : styles.starEmpty}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  return (
    <section 
      className={styles.sessionsCard}
      aria-labelledby="recent-sessions-title"
    >
      <div className={styles.cardHeader}>
        <h2 id="recent-sessions-title">
          <MdHistory className={styles.headerIcon} aria-hidden="true" />
          Recent Sessions
        </h2>
        <span className={styles.sessionCount} aria-label={`${sessions.length} sessions`}>
          {sessions.length} sessions
        </span>
      </div>

      <div className={styles.sessionsList} role="list">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <article 
              key={session.session_id} 
              className={styles.sessionItem}
              role="listitem"
              tabIndex={0}
              aria-label={`Session with ${session.student_name} for ${session.subject} on ${formatDate(session.date)}`}
            >
              <div className={styles.sessionMain}>
                <div className={styles.sessionHeader}>
                  <div className={styles.studentInfo}>
                    <div className={styles.studentAvatar} aria-hidden="true">
                      <FaUser />
                    </div>
                    <div className={styles.studentDetails}>
                      <h4 className={styles.studentName}>{session.student_name}</h4>
                      <time className={styles.sessionDate} dateTime={session.date}>
                        {formatDate(session.date)}
                      </time>
                    </div>
                  </div>
                  {renderStars(session.rating)}
                </div>

                <div className={styles.sessionMeta} role="list" aria-label="Session details">
                  <div className={styles.metaItem} role="listitem">
                    <FaBook className={styles.metaIcon} aria-hidden="true" />
                    <span>{session.subject}</span>
                  </div>
                  <div className={styles.metaItem} role="listitem">
                    <FaClock className={styles.metaIcon} aria-hidden="true" />
                    <span>{session.duration}h</span>
                  </div>
                  <div className={styles.metaItem} role="listitem">
                    <FaDollarSign className={styles.metaIcon} aria-hidden="true" />
                    <span>${session.price}</span>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState} role="status">
            <MdHistory className={styles.emptyIcon} aria-hidden="true" />
            <p>No recent sessions</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentSessions;
