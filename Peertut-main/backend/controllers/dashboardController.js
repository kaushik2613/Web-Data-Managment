import { Session } from "../models/session.model.js";
import { Subject } from "../models/subject.model.js";
import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { User } from "../models/user.model.js";
import { Profile } from "../models/profile.model.js";
import { Op } from "sequelize";

export const getTutorDashboard = async (req, res) => {
  try {
    const { profileId, timeRange = "month" } = req.params;

    if (!profileId) {
      return res.status(400).json({ message: "Profile ID is required" });
    }

    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const now = new Date();
    
    // Calculate date range based on timeRange parameter
    let startDate = new Date();
    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Fetch sessions within the time range
    const tutorSessions = await Session.findAll({
      where: {
        profileId,
        scheduledTime: {
          [Op.gte]: startDate, // Filter by time range
        },
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name"],
        },
        {
          model: SessionParticipant,
          as: "participants",
          include: [
            {
              model: User,
              attributes: ["id", "name", "email", "imageUrl"],
            },
          ],
          attributes: ["studentId", "joinedAt"],
        },
      ],
      order: [["scheduledTime", "DESC"]],
    });

    // ... rest of the calculations remain the same ...
    const totalSessions = tutorSessions.length;
    const completedSessions = tutorSessions.filter(
      (s) => s.status === "completed"
    ).length;
    const bookedSessions = tutorSessions.filter(
      (s) => s.status === "booked"
    ).length;
    const canceledSessions = tutorSessions.filter(
      (s) => s.status === "canceled"
    ).length;

    const upcomingSessionsCount = tutorSessions.filter(
      (s) => s.status === "booked" && new Date(s.scheduledTime) > now
    ).length;

    const totalMinutes = tutorSessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const totalHours = parseFloat((totalMinutes / 60).toFixed(1));

    const uniqueStudentIds = new Set();
    tutorSessions.forEach((session) => {
      (session.participants || []).forEach((participant) => {
        if (participant.studentId) {
          uniqueStudentIds.add(participant.studentId);
        }
      });
    });
    const activeStudents = uniqueStudentIds.size;

    // Monthly sessions for charts
    const monthlySessionsMap = {};
    tutorSessions.forEach((session) => {
      const date = new Date(session.scheduledTime);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthlySessionsMap[monthKey] = (monthlySessionsMap[monthKey] || 0) + 1;
    });

    const sessionsPerMonth = Object.entries(monthlySessionsMap)
      .map(([month, sessions]) => ({ month, sessions }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // Subject distribution
    const subjectCountMap = {};
    tutorSessions.forEach((session) => {
      const subjectName = session.Subject?.name || "Unknown";
      subjectCountMap[subjectName] = (subjectCountMap[subjectName] || 0) + 1;
    });

    const subjectDistribution = Object.entries(subjectCountMap).map(
      ([name, value]) => ({ name, value })
    );

    // Upcoming sessions (always future regardless of timeRange filter)
    const allUpcomingSessions = await Session.findAll({
      where: {
        profileId,
        status: "booked",
        scheduledTime: { [Op.gt]: now },
      },
      include: [
        { model: Subject, attributes: ["id", "name"] },
        {
          model: SessionParticipant,
          as: "participants",
          include: [{ model: User, attributes: ["id", "name", "email", "imageUrl"] }],
          attributes: ["studentId", "joinedAt"],
        },
      ],
      order: [["scheduledTime", "ASC"]],
      limit: 5,
    });

    return res.status(200).json({
      message: "Tutor dashboard data fetched successfully",
      stats: {
        totalSessions,
        completedSessions,
        upcomingSessions: upcomingSessionsCount,
        bookedSessions,
        canceledSessions,
        totalHours,
        activeStudents,
      },
      sessionsPerMonth,
      subjectDistribution,
      upcomingSessions: allUpcomingSessions,
    });
  } catch (error) {
    console.error("Error fetching tutor dashboard:", error);
    return res.status(500).json({
      message: "Failed to fetch tutor dashboard data",
      error: error.message,
    });
  }
};

