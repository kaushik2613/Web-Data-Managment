import { Op } from "sequelize";
import { Session } from "../models/session.model.js";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { Subject } from "../models/subject.model.js";
import { SessionParticipant } from "../models/sessionParticipant.model.js";

export const getAvailableSessions = async (req, res) => {
  try {
    const { subject, minRating, maxRating } = req.query;
    const now = new Date();

    // Build where clause for sessions - only booked and future
    const sessionWhere = {
      status: "booked",
      scheduledTime: { [Op.gt]: now },
    };

    // If subject filter provided, add subjectId filter
    let subjectId = null;
    if (subject) {
      const subjectRecord = await Subject.findOne({ where: { name: subject } });
      if (subjectRecord) {
        subjectId = subjectRecord.id;
        sessionWhere.subjectId = subjectId;
      } else {
        // If subject not found, return empty array
        return res.status(200).json({
          message: "No sessions found for this subject",
          data: [],
          total: 0,
        });
      }
    }

    // Fetch sessions
    const sessions = await Session.findAll({
      where: sessionWhere,
      order: [["scheduledTime", "ASC"]],
    });

    // Manually fetch related data for each session
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        // Fetch tutor profile
        const profile = await Profile.findByPk(session.profileId);
        
        // Fetch tutor user
        const tutor = profile ? await User.findByPk(profile.userId) : null;
        
        // Fetch subject
        const subject = await Subject.findByPk(session.subjectId);
        
        // Fetch participants
        const participants = await SessionParticipant.findAll({
          where: { sessionId: session.id },
        });

        // Calculate slots
        const participantCount = participants.length;
        const maxStudents = session.sessionType === "one-on-one" ? 1 : (session.maxStudents || 1);
        const availableSlots = maxStudents - participantCount;

        return {
          session,
          profile,
          tutor,
          subject,
          participantCount,
          maxStudents,
          availableSlots,
        };
      })
    );

    // Filter by rating if provided
    let filteredSessions = sessionsWithDetails;
    if (minRating !== undefined || maxRating !== undefined) {
      const min = minRating ? parseFloat(minRating) : 0;
      const max = maxRating ? parseFloat(maxRating) : 5;
      
      filteredSessions = sessionsWithDetails.filter((item) => {
        const rating = item.profile?.rating || 0;
        return rating >= min && rating <= max;
      });
    }

    // Filter out full sessions and format response
    const availableSessions = filteredSessions
      .filter((item) => item.availableSlots > 0)
      .map((item) => ({
        sessionId: item.session.id,
        profileId: item.session.profileId,
        
        // Tutor information
        tutorName: item.tutor?.name || "Unknown Tutor",
        tutorEmail: item.tutor?.email || "",
        tutorImage: item.tutor?.imageUrl || null,
        tutorBio: item.profile?.bio || "No bio available",
        tutorRating: item.profile?.rating || 0,
        
        // Subject information
        subject: item.subject?.name || "Unknown",
        subjectId: item.session.subjectId,
        
        // Session details
        scheduledTime: item.session.scheduledTime,
        duration: item.session.duration,
        sessionType: item.session.sessionType,
        maxStudents: item.maxStudents,
        enrolledStudents: item.participantCount,
        availableSlots: item.availableSlots,
        notes: item.session.notes || "",
        status: item.session.status,
        createdAt: item.session.createdAt,
      }));

    return res.status(200).json({
      message: "Available sessions fetched successfully",
      data: availableSessions,
      total: availableSessions.length,
    });
  } catch (error) {
    console.error("Error fetching available sessions:", error);
    return res.status(500).json({
      message: "Failed to fetch available sessions",
      error: error.message,
    });
  }
};

// Get unique subjects that have available sessions
export const getAvailableSubjects = async (req, res) => {
  try {
    const now = new Date();

    // Get all available sessions
    const sessions = await Session.findAll({
      where: {
        status: "booked",
        scheduledTime: { [Op.gt]: now },
      },
      attributes: ["subjectId"],
    });

    // Get unique subject IDs
    const uniqueSubjectIds = [...new Set(sessions.map(s => s.subjectId))];

    // Fetch subject details
    const subjects = await Subject.findAll({
      where: {
        id: { [Op.in]: uniqueSubjectIds },
      },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      message: "Available subjects fetched successfully",
      data: subjects,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return res.status(500).json({
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
};
