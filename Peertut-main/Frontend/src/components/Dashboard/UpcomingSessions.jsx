import React from "react";
import { FaUser, FaBook, FaClock, FaCalendarAlt, FaUsers } from "react-icons/fa";
import { MdSchedule } from "react-icons/md";
import styles from "./UpcomingSessions.module.css";

const UpcomingSessions = ({ sessions }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntil = (dateString) => {
    const now = new Date();
    const sessionDate = new Date(dateString);
    
    // Reset time to midnight for both dates to compare only the date part
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDateOnly = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    );
    
    // Calculate difference in days
    const diffTime = sessionDateOnly - nowDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return "Past";
    return `In ${diffDays} days`;
  };

  // Get student display name from participants
  const getStudentDisplay = (session) => {
    const participants = session.participants || [];
    
    if (participants.length === 0) {
      return "No students yet";
    }
    
    if (session.sessionType === "one-on-one") {
      return participants[0]?.User?.name || "Unknown Student";
    }
    
    // Group session
    return `${participants.length} student${participants.length > 1 ? "s" : ""}`;
  };

  return (
    <section
      className={styles.sessionsCard}
      aria-labelledby="upcoming-sessions-title"
    >
      <div className={styles.cardHeader}>
        <h2 id="upcoming-sessions-title">
          <MdSchedule className={styles.headerIcon} aria-hidden="true" />
          Upcoming Sessions
        </h2>
        <span
          className={styles.sessionCount}
          aria-label={`${sessions.length} scheduled sessions`}
        >
          {sessions.length} scheduled
        </span>
      </div>

      <div className={styles.sessionsList} role="list">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <article
              key={session.id}
              className={styles.sessionItem}
              role="listitem"
              tabIndex={0}
              aria-label={`Upcoming session for ${session.Subject?.name} on ${formatDate(
                session.scheduledTime
              )}, ${getDaysUntil(session.scheduledTime)}`}
            >
              <div className={styles.sessionMain}>
                <div className={styles.sessionHeader}>
                  <div className={styles.studentInfo}>
                    <div className={styles.studentAvatar} aria-hidden="true">
                      {session.sessionType === "group" ? <FaUsers /> : <FaUser />}
                    </div>
                    <div className={styles.studentDetails}>
                      <h4 className={styles.studentName}>
                        {getStudentDisplay(session)}
                      </h4>
                      <time
                        className={styles.sessionDate}
                        dateTime={session.scheduledTime}
                      >
                        {formatDate(session.scheduledTime)}
                      </time>
                    </div>
                  </div>
                  <span
                    className={styles.sessionBadge}
                    aria-label={getDaysUntil(session.scheduledTime)}
                  >
                    {getDaysUntil(session.scheduledTime)}
                  </span>
                </div>

                <div className={styles.sessionMeta} role="list" aria-label="Session details">
                  <div className={styles.metaItem} role="listitem">
                    <FaBook className={styles.metaIcon} aria-hidden="true" />
                    <span>{session.Subject?.name || "Unknown Subject"}</span>
                  </div>
                  <div className={styles.metaItem} role="listitem">
                    <FaClock className={styles.metaIcon} aria-hidden="true" />
                    <span>{session.duration} min</span>
                  </div>
                  {session.sessionType === "group" && (
                    <div className={styles.metaItem} role="listitem">
                      <FaUsers className={styles.metaIcon} aria-hidden="true" />
                      <span>
                        {session.participants?.length || 0}/{session.maxStudents} enrolled
                      </span>
                    </div>
                  )}
                </div>

                {/* Show notes if available */}
                {session.notes && (
                  <div className={styles.sessionNotes}>
                    <p>{session.notes}</p>
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState} role="status">
            <FaCalendarAlt className={styles.emptyIcon} aria-hidden="true" />
            <p>No upcoming sessions</p>
            <span className={styles.emptySubtext}>
              Create a new session to get started
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingSessions;
