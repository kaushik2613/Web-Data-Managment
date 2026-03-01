import React, { useState, useEffect } from 'react';
import styles from './StudentDashboard.module.css';
import { BookOpen, CheckCircle } from 'lucide-react';
import { getUserData } from "../../../utils/localStorage";
import { useAxios } from '../../../hooks/useAxios';

export default function StudentDashboard() {
  const [selectedSession, setSelectedSession] = useState(null);

  const [studyPlans, setStudyPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState(null);

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);

  const [completedSessions, setCompletedSessions] = useState(0);

  const user = getUserData();
  const { request } = useAxios();

  useEffect(() => {
    if (user?.id) {
      fetchStudyPlans();
      fetchRegisteredSessions();
    }
  }, [user?.id]);

  const fetchStudyPlans = async () => {
    setLoadingPlans(true);
    setPlansError(null);
    try {
      const res = await request({ url: `/study-plans/user/${user.id}`, method: "GET" });
      setStudyPlans(res.studyPlans || []);
    } catch (err) {
      setPlansError("Failed to load study plans.");
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchRegisteredSessions = async () => {
    setLoadingSessions(true);
    setSessionsError(null);
    try {
      const res = await request({ url: `/sessions/student/${user.id}/registered`, method: "GET" });
      setUpcomingSessions(res.data?.upcoming || []);
      const completedCount =
        res.data?.past?.filter(s => s.displayStatus === "completed" || s.status === "completed").length || 0;
      setCompletedSessions(completedCount);
    } catch (err) {
      setSessionsError("Failed to load registered sessions.");
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const tasksRemaining = (plan) => {
    if (!plan.tasks || !plan.completed) return '-';
    return Math.max(plan.tasks - plan.completed, 0);
  };

  const stats = [
    { label: 'Sessions Completed', value: completedSessions.toString(), icon: CheckCircle, color: '#2e7d32' },
    { label: 'Study Plans Active', value: studyPlans.length.toString(), icon: BookOpen, color: '#388e3c' },
  ];

  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };



  const renderStudyPlans = () => {
    if (loadingPlans) return <p>Loading study plans...</p>;
    if (plansError) return <p style={{color: 'red'}}>{plansError}</p>;
    if (studyPlans.length === 0) return <p>No active study plans found.</p>;

    return studyPlans.map((plan) => (
      <article key={plan.id} className={styles.planCard}>
        <div className={styles.planHeader}>
          <h3>{plan.subject} - {plan.title || "Untitled Plan"}</h3>
          <span
            className={styles.planStatus}
            style={{ backgroundColor: plan.progress >= 80 ? '#4caf50' : '#388e3c' }}
          >
            {plan.progress >= 100 ? "Completed" : "In Progress"}
          </span>
        </div>
        <p className={styles.planProgressLabel}>Progress: {plan.progress ?? 0}%</p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${plan.progress ?? 0}%`, backgroundColor: plan.progress >= 80 ? '#4caf50' : '#388e3c' }}
          />
        </div>
        <p className={styles.planMeta}>Tutor: {plan.tutorName || "N/A"} • {tasksRemaining(plan)} tasks remaining</p>
      </article>
    ));
  };

  const renderUpcomingSessions = () => {
    if (loadingSessions) return <p>Loading sessions...</p>;
    if (sessionsError) return <p style={{color: 'red'}}>{sessionsError}</p>;
    if (upcomingSessions.length === 0) return <p>No upcoming sessions found.</p>;

    return upcomingSessions.map((session) => (
      <article key={session.sessionId} className={styles.sessionPreview}>
        <div className={styles.sessionPreviewHeader}>
          <h4>{session.notes || session.title}</h4>
          <time dateTime={session.scheduledTime}>
            {new Date(session.scheduledTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {" • "}
            {formatTimeForDisplay(new Date(session.scheduledTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))}
          </time>
        </div>
        <p className={styles.sessionTutor}>With {session.tutorName}</p>
        <p className={styles.sessionTutor}> {session.subject}</p>
      
      </article>
    ));
  };

  return (
    <div className={styles.dashboardWrapper}>
      <header className={styles.dashboardHeader}>
        <h1>Welcome back, {user.name}!</h1>
        <p>Track your learning progress and manage your tutoring sessions</p>
      </header>

      <section className={styles.statsGrid} aria-label="Learning statistics">
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard} style={{ borderTopColor: stat.color }}>
            <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}20` }}>
              <stat.icon size={24} style={{ color: stat.color }} aria-hidden="true" />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statValue}>{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.studyPlansSection} aria-labelledby="study-plans-title">
          <h2 id="study-plans-title">Active Study Plans</h2>
          <div className={styles.plansList}>
            {renderStudyPlans()}
          </div>
        </section>

        <section className={styles.upcomingSessionsSection} aria-labelledby="upcoming-title">
          <h2 id="upcoming-title">Upcoming Sessions</h2>
          <div className={styles.sessionsList}>
            {renderUpcomingSessions()}
          </div>

          {selectedSession && (
            <div className={styles.sessionDetails}>
              <h3>Session Details</h3>
              <p><strong>Title:</strong> {selectedSession.notes || selectedSession.title}</p>
              <p><strong>Tutor:</strong> {selectedSession.tutorName}</p>
              <p><strong>Subject:</strong> {selectedSession.subject}</p>
              <p><strong>Date & Time:</strong> {new Date(selectedSession.scheduledTime).toLocaleString()}</p>
              <p><strong>Duration:</strong> {selectedSession.duration} hour{selectedSession.duration > 1 ? 's' : ''}</p>
              {selectedSession.maxStudents && <p><strong>Max Students:</strong> {selectedSession.maxStudents}</p>}
              <p><strong>Status:</strong> {selectedSession.displayStatus}</p>
              <button onClick={() => setSelectedSession(null)}>Close Details</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
