import React, { useState, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaFilter,
  FaPlus
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import styles from "./SessionsPage.module.css";
import SessionsList from "../../components/Sessions/SessionsList";
import SessionFilters from "../../components/Sessions/SessionFilters";
import SessionDetails from "../../components/Sessions/SessionDetails";
import SessionForm from "../../components/Sessions/SessionForm";
import { useSessionApi } from "../../hooks/useSessionApi";
import { getUserData } from "../../utils/localStorage";

const SessionsPage = () => {
  const {
    getAllSessions,
    createSession,
    updateSession,
    deleteSession,
    joinSession,
  } = useSessionApi();

  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    subject: "all",
    dateRange: "all",
  });
  const [stats, setStats] = useState({
    booked: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0,
  });
  const [error, setError] = useState(null);
  const user = getUserData();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, filters]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllSessions(user.id);
      setSessions(res.data || []);
      setStats(res.stats || {
        booked: 0,
        completed: 0,
        cancelled: 0,
        upcoming: 0,
      });
      console.log('data sessions --> ', res.data);
      console.log('data sessions stats --> ', res.stats);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    if (filters.status !== "all") {
      filtered = filtered.filter((s) => s.status === filters.status);
    }

    if (filters.subject !== "all") {
      filtered = filtered.filter((s) => s.Subject?.name === filters.subject);
    }

    const now = new Date();
    if (filters.dateRange === "upcoming") {
      filtered = filtered.filter((s) => new Date(s.scheduledTime) > now);
    } else if (filters.dateRange === "past") {
      filtered = filtered.filter((s) => new Date(s.scheduledTime) < now);
    } else if (filters.dateRange === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (s) => new Date(s.scheduledTime).toDateString() === today
      );
    }

    filtered.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

    setFilteredSessions(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
  };

  const handleCloseDetails = () => {
    setSelectedSession(null);
  };

  const handleStatusUpdate = async (sessionId, newStatus) => {
    try {
      await updateSession(sessionId, { status: newStatus });
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
      );
      if (selectedSession?.id === sessionId) {
        setSelectedSession({ ...selectedSession, status: newStatus });
      }
      fetchSessions();
    } catch (error) {
      console.error("Error updating session status:", error);
      alert("Failed to update session status");
    }
  };

  const handleCreateSession = async (sessionData) => {
    try {
      console.log('sessionData --> ', sessionData);
      await createSession(sessionData);
      setShowSessionForm(false);
      fetchSessions();
      announceToScreenReader("Session created successfully");
    } catch (error) {
      console.error("Error creating session:", error);
      announceToScreenReader("Error creating session");
    }
  };

  const handleUpdateSession = async (sessionData) => {
    try {
      await updateSession(editingSession.id, sessionData);
      setShowSessionForm(false);
      setEditingSession(null);
      fetchSessions();
      announceToScreenReader("Session updated successfully");
    } catch (error) {
      console.error("Error updating session:", error);
      announceToScreenReader("Error updating session");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteSession(sessionId);
      setSelectedSession(null);
      fetchSessions();
      announceToScreenReader("Session deleted successfully");
    } catch (error) {
      console.error("Error deleting session:", error);
      announceToScreenReader("Error deleting session");
    }
  };

  const handleEditClick = (session) => {
    setEditingSession(session);
    setShowSessionForm(true);
    setSelectedSession(null);
  };

  const handleCreateClick = () => {
    setEditingSession(null);
    setShowSessionForm(true);
  };

  const handleCloseForm = () => {
    setShowSessionForm(false);
    setEditingSession(null);
  };

  const announceToScreenReader = (message) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  if (loading) {
    return (
      <div className={styles.sessionsPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sessionsPage}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div className={styles.headerTitle}>
            <FaCalendarAlt className={styles.headerIcon} />
            <h1>My Sessions</h1>
          </div>
          <div className={styles.headerActions}>
            {user?.role === "tutor" && (
              <button
                className={styles.createBtn}
                onClick={handleCreateClick}
                aria-label="Create new session"
              >
                <FaPlus />
                New Session
              </button>
            )}
            <button
              className={styles.filterBtn}
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              <FaFilter />
              Filters
            </button>
            <button
              className={styles.refreshBtn}
              onClick={fetchSessions}
              aria-label="Refresh sessions"
            >
              <MdRefresh />
            </button>
          </div>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#3b82f6" }}>
              <FaCalendarAlt />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.upcoming}</span>
              <span className={styles.statLabel}>Upcoming</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#10b981" }}>
              <FaCalendarAlt />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.completed}</span>
              <span className={styles.statLabel}>Completed</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#ef4444" }}>
              <FaCalendarAlt />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.cancelled}</span>
              <span className={styles.statLabel}>Cancelled</span>
            </div>
          </div>
        </div>
      </header>

      {showFilters && (
        <SessionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sessions={sessions}
        />
      )}

      <main id="sessions-content" className={styles.sessionsContent}>
        {filteredSessions.length > 0 ? (
          <SessionsList
            sessions={filteredSessions}
            onSessionClick={handleSessionClick}
            onStatusUpdate={handleStatusUpdate}
            onEdit={handleEditClick}
            onDelete={handleDeleteSession}
          />
        ) : (
          <div className={styles.emptyState}>
            <FaCalendarAlt className={styles.emptyIcon} />
            <h2>No sessions found</h2>
            <p>
              {filters.status !== "all" ||
              filters.subject !== "all" ||
              filters.dateRange !== "all"
                ? "Try adjusting your filters"
                : "Create your first session to get started"}
            </p>
            {user?.role === "tutor" && (
              <button className={styles.createBtnLarge} onClick={handleCreateClick}>
                <FaPlus />
                Create Session
              </button>
            )}
          </div>
        )}
      </main>

      {selectedSession && (
        <SessionDetails
          session={selectedSession}
          onClose={handleCloseDetails}
          onStatusUpdate={handleStatusUpdate}
          onEdit={handleEditClick}
          onDelete={handleDeleteSession}
        />
      )}

      {showSessionForm && (
        <SessionForm
          session={editingSession}
          // provide students and subjects as needed
          onSubmit={editingSession ? handleUpdateSession : handleCreateSession}
          onClose={handleCloseForm}
          isEditing={!!editingSession}
        />
      )}
    </div>
  );
};

export default SessionsPage;
