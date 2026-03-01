import React, { useState, useEffect } from "react";
import styles from "./MySessions.module.css";
import { useAxios } from "../../../hooks/useAxios";
import { useToast } from "../../../hooks/useToast";
import { getUserData } from "../../../utils/localStorage";

const MySessions = () => {
  const { request } = useAxios();
  const toast = useToast();
  const user = getUserData();
  
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState({
    all: [],
    upcoming: [],
    past: [],
    cancelled: [],
  });
  const [activeTab, setActiveTab] = useState("upcoming");
  const [counts, setCounts] = useState({
    total: 0,
    upcoming: 0,
    past: 0,
    cancelled: 0,
  });
  const [ratingSessionId, setRatingSessionId] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchMySessions();
    }
  }, [user?.id]);

  const fetchMySessions = async () => {
    setLoading(true);
    try {
      const res = await request({
        url: `/sessions/student/${user.id}/registered`,
        method: "GET",
      });

      setSessions(res.data);
      setCounts(res.counts);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load your sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleRateSession = async (sessionId, rating) => {
    try {
      const res = await request({
        url: `/ratings/session/${sessionId}`,
        method: "POST",
        body: {
          studentId: user.id,
          rating: rating,
        },
      });

      toast.success(res?.message || "Rating submitted successfully!");
      
      // Close rating modal and refresh sessions
      setRatingSessionId(null);
      setSelectedRating(0);
      setHoverRating(0);
      fetchMySessions();
    } catch (error) {
      const errorMessage = error?.message || "Failed to submit rating. Please try again.";
      toast.error(errorMessage);
    }
  };

  const openRatingModal = (sessionId) => {
    setRatingSessionId(sessionId);
    setSelectedRating(0);
    setHoverRating(0);
  };

  const closeRatingModal = () => {
    setRatingSessionId(null);
    setSelectedRating(0);
    setHoverRating(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeRange = (scheduledTime, durationHours) => {
    const start = new Date(scheduledTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    const startTime = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endTime = end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${startTime} - ${endTime}`;
  };

  const formatDuration = (hours) => {
    if (hours === 1) return "1 hour";
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) return `${wholeHours} hours`;
    return `${wholeHours}h ${minutes}m`;
  };

  const getStatusBadge = (session) => {
    if (session.status === "cancelled" || session.status === "canceled") {
      return <span className={styles.badgeCancelled}>Cancelled</span>;
    }
    if (session.displayStatus === "completed") {
      return <span className={styles.badgeCompleted}>Completed</span>;
    }
    if (session.displayStatus === "past") {
      return <span className={styles.badgePast}>Past</span>;
    }
    if (session.displayStatus === "ongoing") {
      return <span className={styles.badgeOngoing}>Ongoing</span>;
    }
    return <span className={styles.badgeUpcoming}>Upcoming</span>;
  };

  const renderStars = (rating, interactive = false, sessionId = null) => {
    return (
      <div className={`${styles.starsContainer} ${interactive ? styles.interactive : ""}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${
              star <= (interactive ? (hoverRating || selectedRating) : rating)
                ? styles.filled
                : styles.empty
            }`}
            onClick={interactive ? () => setSelectedRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderTutorRating = (rating, reviewCount) => {
    return (
      <div className={styles.tutorRating}>
        <div className={styles.tutorStars}>
          {renderStars(rating, false)}
          <span className={styles.ratingText}>
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>
      </div>
    );
  };

  const currentSessions = sessions[activeTab] || [];

  if (loading) {
    return (
      <div className={styles.mySessionsContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mySessionsContainer}>
      <header className={styles.header}>
        <h1>My Sessions</h1>
        <p>View and manage your registered tutoring sessions</p>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "upcoming" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming ({counts.upcoming})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "past" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Past ({counts.past})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "cancelled" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled ({counts.cancelled})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "all" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All ({counts.total})
        </button>
      </div>

      {/* Sessions List */}
      <div className={styles.sessionsList}>
        {currentSessions.length > 0 ? (
          currentSessions.map((session) => (
            <article key={session.sessionId} className={styles.sessionCard}>
              <div className={styles.sessionHeader}>
                <div className={styles.tutorInfo}>
                  <div className={styles.tutorAvatar}>
                    {session.tutorImage ? (
                      <img src={session.tutorImage} alt={session.tutorName} />
                    ) : (
                      <span>{session.tutorName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3>{session.tutorName}</h3>
                    <span className={styles.subject}>{session.subject}</span>
                    {renderTutorRating(session.tutorRating, session.tutorReviewCount)}
                  </div>
                </div>
                {getStatusBadge(session)}
              </div>

              <div className={styles.sessionDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>📅 Date:</span>
                  <span className={styles.value}>{formatDate(session.scheduledTime)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>🕒 Time:</span>
                  <span className={styles.value}>{getTimeRange(session.scheduledTime, session.duration)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>⏱️ Duration:</span>
                  <span className={styles.value}>{formatDuration(session.duration)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>👥 Type:</span>
                  <span className={styles.value}>
                    {session.sessionType === "one-on-one" 
                      ? "One-on-One" 
                      : `Group (${session.enrolledStudents}/${session.maxStudents})`}
                  </span>
                </div>
                {session.joinedAt && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>✓ Joined:</span>
                    <span className={styles.value}>{formatDate(session.joinedAt)}</span>
                  </div>
                )}
              </div>

              {session.notes && (
                <div className={styles.notes}>
                  <strong>📝 Notes:</strong>
                  <p>{session.notes}</p>
                </div>
              )}

              {/* Show rating if already rated */}
              {session.myRating !== null && (
                <div className={styles.myRatingDisplay}>
                  <strong>Your Rating:</strong>
                  {renderStars(session.myRating, false)}
                  <span className={styles.ratingDate}>
                    Rated on {formatDate(session.ratedAt)}
                  </span>
                </div>
              )}

              <div className={styles.actions}>
                <button 
                  className={styles.btnEmail} 
                  onClick={() => window.location.href = `mailto:${session.tutorEmail}`}
                >
                  📧 Contact Tutor
                </button>
                
                {/* Show rate button only if session can be rated */}
                {session.canRate && (
                  <button
                    className={styles.btnRate}
                    onClick={() => openRatingModal(session.sessionId)}
                  >
                    ⭐ Rate Session
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <p>No {activeTab} sessions found</p>
            <span>Book a session to get started with your learning journey!</span>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingSessionId && (
        <div className={styles.modalOverlay} onClick={closeRatingModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Rate This Session</h2>
              <button className={styles.closeBtn} onClick={closeRatingModal}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>How would you rate your experience?</p>
              {renderStars(selectedRating, true, ratingSessionId)}
              <p className={styles.ratingLabel}>
                {selectedRating === 0 && "Select a rating"}
                {selectedRating === 1 && "Poor"}
                {selectedRating === 2 && "Fair"}
                {selectedRating === 3 && "Good"}
                {selectedRating === 4 && "Very Good"}
                {selectedRating === 5 && "Excellent"}
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={closeRatingModal}>
                Cancel
              </button>
              <button
                className={styles.btnSubmit}
                onClick={() => handleRateSession(ratingSessionId, selectedRating)}
                disabled={selectedRating === 0}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
