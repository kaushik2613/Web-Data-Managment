import React, { useState, useEffect } from "react";
import {
  FaCalendarCheck,
  FaUsers,
  FaClock,
  FaBookOpen,
} from "react-icons/fa";
import { MdSchedule } from "react-icons/md";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StatsCard from "./StatsCard";
import UpcomingSessions from "./UpcomingSessions";
import styles from "./TutorDashboard.module.css";
import { useAxios } from "../../hooks/useAxios";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

const TutorDashboard = ({ user }) => {
  const { request } = useAxios();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    canceledSessions: 0,
    totalHours: 0,
    activeStudents: 0,
  });
  const [sessionsPerMonth, setSessionsPerMonth] = useState([]);
  const [subjectDistribution, setSubjectDistribution] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await request({
        url: `/dashboard/tutor/${user.id}/${timeRange}`,
        method: "GET",
      });
      setStats(res.stats || {});
      setSessionsPerMonth(res.sessionsPerMonth || []);
      setSubjectDistribution(res.subjectDistribution || []);
      setUpcomingSessions(res.upcomingSessions || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.loadingContainer} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden="true"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardPage}>
      {/* Header with Time Range Filter */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <h1 id="dashboard-title">Dashboard</h1>
          <p className={styles.welcomeText}>Welcome back, {user.name}! 👋</p>
        </div>
        <div className={styles.headerActions}>
          <label htmlFor="time-range-select" className="sr-only">
            Select time range for statistics
          </label>
          <select
            id="time-range-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.timeRangeSelect}
            aria-label="Select time range"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </header>

      {/* Stats Cards */}
      <section
        id="main-stats"
        className={styles.statsGrid}
        aria-labelledby="stats-heading"
      >
        <h2 id="stats-heading" className="sr-only">
          Statistics Overview
        </h2>
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={<FaCalendarCheck />}
          color="#3b82f6"
        />
        <StatsCard
          title="Completed Sessions"
          value={stats.completedSessions}
          icon={<FaCalendarCheck />}
          color="#10b981"
        />
        <StatsCard
          title="Upcoming Sessions"
          value={stats.upcomingSessions}
          icon={<MdSchedule />}
          color="#f59e0b"
        />
        <StatsCard
          title="Total Hours"
          value={`${stats.totalHours}h`}
          icon={<FaClock />}
          color="#8b5cf6"
        />
      </section>

      {/* Charts Section */}
      <div id="charts-section" className={styles.chartsGrid}>
        {/* Sessions Overview Bar Chart */}
        <section className={styles.chartCard} aria-labelledby="sessions-chart-title">
          <div className={styles.chartHeader}>
            <h2 id="sessions-chart-title">
              <MdSchedule className={styles.chartIcon} aria-hidden="true" />
              Sessions Overview
            </h2>
            <span className={styles.chartSubtitle}>Monthly session count</span>
          </div>
          <div
            className={styles.chartContainer}
            role="img"
            aria-label="Bar chart showing monthly session count"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sessionsPerMonth}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="sessions"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Sessions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Subject Distribution - Full Width */}
      <div className={styles.secondaryGrid}>
        <section className={styles.chartCard} aria-labelledby="subject-dist-title">
          <div className={styles.chartHeader}>
            <h2 id="subject-dist-title">
              <FaBookOpen className={styles.chartIcon} aria-hidden="true" />
              Subject Distribution
            </h2>
            <span className={styles.chartSubtitle}>Sessions by subject</span>
          </div>
          <div className={styles.chartBody}>
            <div
              className={styles.chartContainer}
              role="img"
              aria-label="Pie chart showing distribution of sessions across different subjects"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {subjectDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.legendGrid} role="list" aria-label="Subject legend">
              {subjectDistribution.map((item, index) => (
                <div key={item.name} className={styles.legendItem} role="listitem">
                  <span
                    className={styles.legendDot}
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    aria-hidden="true"
                  ></span>
                  <span className={styles.legendText}>{item.name}</span>
                  <span className={styles.legendValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Upcoming Sessions */}
      <div id="sessions-section" className={styles.sessionsGrid}>
        <UpcomingSessions sessions={upcomingSessions} />
      </div>
    </div>
  );
};

export default TutorDashboard;
