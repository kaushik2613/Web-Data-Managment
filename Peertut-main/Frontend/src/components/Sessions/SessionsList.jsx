import React from "react";
import SessionCard from "./SessionCard";
import styles from "./SessionsList.module.css";

const SessionsList = ({ sessions, onSessionClick, onStatusUpdate, onEdit, onDelete }) => {
  // Group sessions by date
  const groupSessionsByDate = () => {
    const grouped = {};

    sessions.forEach((session) => {
      const date = new Date(session.scheduledTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    return grouped;
  };

  const groupedSessions = groupSessionsByDate();

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();

    if (date.toDateString() === today) {
      return "Today";
    } else if (date.toDateString() === tomorrow) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className={styles.sessionsList}>
      {Object.entries(groupedSessions).map(([date, dateSessions]) => (
        <div key={date} className={styles.dateGroup}>
          <h2 className={styles.dateHeader}>
            {formatDateHeader(date)}
            <span className={styles.sessionCount}>
              {dateSessions.length} {dateSessions.length === 1 ? "session" : "sessions"}
            </span>
          </h2>
          <div className={styles.sessionsGrid}>
            {dateSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => onSessionClick(session)}
                onStatusUpdate={onStatusUpdate}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionsList;
