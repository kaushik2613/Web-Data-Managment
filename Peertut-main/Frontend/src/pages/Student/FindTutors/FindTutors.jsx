import { useAxios } from "../../../hooks/useAxios";
import React, { useState, useEffect } from "react";
import styles from "./FindTutors.module.css";
import { useToast } from "../../../hooks/useToast";
import { getUserData } from "../../../utils/localStorage";

const FindTutors = () => {
  const { request } = useAxios();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({
    subject: "",
  });
  const user = getUserData();

  const toast = useToast();
  const [bookingSessionId, setBookingSessionId] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [filters.subject]);

  const fetchSubjects = async () => {
    try {
      const res = await request({
        url: "/tutors/subjects",
        method: "GET",
      });
      setSubjects(res.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (filters.subject) {
        queryParams.append("subject", filters.subject);
      }

      const res = await request({
        url: `/tutors/available-sessions?${queryParams.toString()}`,
        method: "GET",
      });
      setSessions(res.data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleEmailClick = (tutorEmail, tutorName, subject) => {
    const emailSubject = `Inquiry about ${subject} Session`;
    const emailBody = `Hi ${tutorName},\n\nI am interested in your ${subject} session. Please let me know your availability.\n\nThank you!`;
    const mailtoLink = `mailto:${tutorEmail}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
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

  // Fixed: duration is in HOURS, not minutes
  const getTimeRange = (scheduledTime, durationHours) => {
    const start = new Date(scheduledTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000); // Convert hours to milliseconds
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

  const handleBookSession = async (sessionId) => {
    if (!user || !user.id) {
      toast.error("Please log in to book a session");
      return;
    }

    setBookingSessionId(sessionId);

    try {
      const res = await request({
        url: `/sessions/${sessionId}/join`,
        method: "POST",
        body: {
          studentId: user.id,
        },
      });

      toast.success(res?.message || "Successfully booked the session!");

      // Refresh sessions list to update available slots
      fetchSessions();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to book session. Please try again.";
      toast.error(errorMessage);
    } finally {
      setBookingSessionId(null);
    }
  };

  // Format duration display
  const formatDuration = (hours) => {
    if (hours === 1) return "1 hour";
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    // Handle decimals like 1.5 hours
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) return `${wholeHours} hours`;
    return `${wholeHours}h ${minutes}m`;
  };

  const getDaysUntil = (dateString) => {
    const now = new Date();
    const sessionDate = new Date(dateString);
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDateOnly = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    );
    const diffTime = sessionDateOnly - nowDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return formatDate(dateString);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className={styles.starsContainer}>
        {"★".repeat(fullStars)}
        {hasHalfStar && <span className={styles.halfStar}>★</span>}
        <span className={styles.emptyStars}>{"★".repeat(emptyStars)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.findTutorsContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading available sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.findTutorsContainer}
      role="main"
      aria-label="Find Tutors"
    >
      <header className={styles.tutorsHeader}>
        <h1>Find Your Perfect Tutor</h1>
        <p>Connect with qualified peer tutors and book available sessions</p>
      </header>

      {/* Filters Section */}
      <section
        className={styles.filtersSection}
        aria-labelledby="filters-title"
      >
        <h2 id="filters-title" className={styles.visuallyHidden}>
          Filter Sessions
        </h2>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label htmlFor="subject-filter">Subject</label>
            <select
              id="subject-filter"
              value={filters.subject}
              onChange={(e) => handleFilterChange("subject", e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className={styles.btnReset}
            onClick={() => setFilters({ subject: "" })}
            aria-label="Reset all filters"
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* Sessions Grid */}
      <section
        className={styles.tutorsGrid}
        aria-labelledby="sessions-list-title"
      >
        <h2 id="sessions-list-title" className={styles.visuallyHidden}>
          Available Sessions
        </h2>
        <div className={styles.tutorsList}>
          {sessions.map((session) => (
            <article key={session.sessionId} className={styles.tutorCard}>
              <div className={styles.sessionBadge}>
                {getDaysUntil(session.scheduledTime)}
              </div>

              <div className={styles.tutorHeader}>
                <div className={styles.tutorImage}>
                  {session.tutorImage ? (
                    <img
                      src={session.tutorImage}
                      alt={`Profile of ${session.tutorName}`}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `<span>${session.tutorName
                          .charAt(0)
                          .toUpperCase()}</span>`;
                      }}
                    />
                  ) : (
                    <span>{session.tutorName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.tutorInfo}>
                  <h3>{session.tutorName}</h3>
                  <span className={styles.tutorSubject}>{session.subject}</span>
                </div>
              </div>

              <div className={styles.tutorRating}>
                <div
                  className={styles.stars}
                  aria-label={`Rating: ${session.tutorRating} out of 5 stars`}
                >
                  {renderStars(session.tutorRating)}
                  <span className={styles.ratingText}>
                    {session.tutorRating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              <div className={styles.sessionInfo}>
                <div className={styles.sessionDetail}>
                  <span className={styles.detailLabel}>📅 Date</span>
                  <span className={styles.detailValue}>
                    {formatDate(session.scheduledTime)}
                  </span>
                </div>
                <div className={styles.sessionDetail}>
                  <span className={styles.detailLabel}>🕒 Time</span>
                  <span className={styles.detailValue}>
                    {getTimeRange(session.scheduledTime, session.duration)}
                  </span>
                </div>
                <div className={styles.sessionDetail}>
                  <span className={styles.detailLabel}>⏱️ Duration</span>
                  <span className={styles.detailValue}>
                    {formatDuration(session.duration)}
                  </span>
                </div>
                <div className={styles.sessionDetail}>
                  <span className={styles.detailLabel}>
                    {session.sessionType === "one-on-one"
                      ? "👤 Type"
                      : "👥 Slots"}
                  </span>
                  <span className={styles.detailValue}>
                    {session.sessionType === "one-on-one"
                      ? "One-on-One"
                      : `${session.availableSlots}/${session.maxStudents} left`}
                  </span>
                </div>
              </div>

              {session.notes && (
                <div className={styles.sessionNotes}>
                  <strong>📝 Session Notes:</strong>
                  <p>{session.notes}</p>
                </div>
              )}

              {session.tutorBio && !session.notes && (
                <p className={styles.tutorBio}>{session.tutorBio}</p>
              )}

              <div className={styles.tutorActions}>
                <button
                  className={styles.btnBook}
                  onClick={() => handleBookSession(session.sessionId)}
                  aria-label={`Book session with ${session.tutorName} for ${session.subject}`}
                  disabled={
                    session.availableSlots === 0 ||
                    bookingSessionId === session.sessionId
                  }
                >
                  {bookingSessionId === session.sessionId ? (
                    <>
                      <span className={styles.buttonSpinner}></span>
                      Booking...
                    </>
                  ) : session.availableSlots === 0 ? (
                    "🔒 Fully Booked"
                  ) : (
                    "📚 Book Session"
                  )}
                </button>

                <button
                  onClick={() =>
                    handleEmailClick(
                      session.tutorEmail,
                      session.tutorName,
                      session.subject
                    )
                  }
                  className={styles.btnMessage}
                  aria-label={`Send email to ${session.tutorName}`}
                >
                  📧 Message
                </button>
              </div>
            </article>
          ))}
        </div>

        {sessions.length === 0 && !loading && (
          <div className={styles.noResults} role="alert">
            <div className={styles.noResultsIcon}>😔</div>
            <p>No sessions found matching your criteria.</p>
            <span>
              Try adjusting your filters or check back later for new sessions.
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default FindTutors;
