import { Session } from "../models/session.model.js";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { Subject } from "../models/subject.model.js";
import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { Op } from "sequelize";

Profile.belongsTo(User, { foreignKey: "userId" });
Session.belongsTo(Profile, { foreignKey: "profileId", as: "tutorProfile" });
Session.belongsTo(Subject, { foreignKey: "subjectId" });
Session.hasMany(SessionParticipant, {
  foreignKey: "sessionId",
  as: "participants",
});
SessionParticipant.belongsTo(User, { foreignKey: "studentId" });

export const createSession = async (req, res) => {
  try {
    const {
      profileId,
      subjectId,
      scheduledTime,
      duration,
      sessionType,
      maxStudents,
      notes,
    } = req.body;

    if (!profileId || !subjectId || !scheduledTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["group", "one-on-one"].includes(sessionType)) {
      return res.status(400).json({ message: "Invalid session type" });
    }

    if (sessionType === "group" && (!maxStudents || maxStudents < 1)) {
      return res
        .status(400)
        .json({ message: "maxStudents must be > 0 for group sessions" });
    }

    const session = await Session.create({
      profileId,
      subjectId,
      scheduledTime,
      duration,
      status: "booked",
      sessionType,
      notes,
      maxStudents: sessionType === "group" ? maxStudents : null,
    });

    return res.status(201).json({ message: "Session created", data: session });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all sessions for a specific tutor
export const getAllSessions = async (req, res) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId) {
      return res.status(400).json({ message: "Tutor ID is required" });
    }

    // Find the profile for this tutor
    const tutorProfile = await Profile.findOne({
      where: { userId: tutorId },
    });

    if (!tutorProfile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Get all sessions for this tutor's profile
    const sessions = await Session.findAll({
      where: { profileId: tutorProfile.id },
      include: [
        {
          model: Profile,
          as: "tutorProfile",
          include: [
            { model: User, attributes: ["id", "name", "email", "imageUrl"] },
          ],
          attributes: ["id", "userId", "bio"],
        },
        {
          model: Subject,
          attributes: ["id", "name"],
        },
        {
          model: SessionParticipant,
          as: "participants",
          include: [
            { model: User, attributes: ["id", "name", "email", "imageUrl"] },
          ],
          attributes: ["studentId", "joinedAt"],
        },
      ],
      order: [["scheduledTime", "ASC"]],
    });

    // Compute stats
    const now = new Date();
    const bookedCount = sessions.filter((s) => s.status === "booked").length;
    const completedCount = sessions.filter(
      (s) => s.status === "completed"
    ).length;
    const cancelledCount = sessions.filter(
      (s) => s.status === "cancelled"
    ).length;
    const upcomingCount = sessions.filter(
      (s) => s.status === "booked" && new Date(s.scheduledTime) > now
    ).length;

    return res.status(200).json({
      message: "Sessions fetched successfully",
      data: sessions,
      stats: {
        booked: bookedCount,
        completed: completedCount,
        cancelled: cancelledCount,
        upcoming: upcomingCount,
      },
      total: sessions.length,
    });
  } catch (error) {
    console.error("Error fetching tutor sessions:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const updateSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const updateData = req.body;

    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Validate sessionType if present
    if (
      updateData.sessionType &&
      !["group", "one-on-one"].includes(updateData.sessionType)
    ) {
      return res.status(400).json({ message: "Invalid session type" });
    }


    // Allowed fields to update
    const allowedFields = [
      "subjectId",
      "scheduledTime",
      "duration",
      "status",
      "sessionType",
      "maxStudents",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        session[field] = updateData[field];
      }
    });

    await session.save();

    return res.status(200).json({ message: "Session updated", data: session });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    await session.destroy();

    return res.status(200).json({ message: "Session deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
export const joinSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { studentId } = req.body;

    // Validation
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Find session
    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check session status
    if (session.status === "canceled" || session.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "This session has been canceled" });
    }

    if (session.status === "completed") {
      return res
        .status(400)
        .json({ message: "This session has already been completed" });
    }

    // Check if session is in the past
    const now = new Date();
    if (new Date(session.scheduledTime) < now) {
      return res
        .status(400)
        .json({ message: "Cannot join a session that has already started" });
    }

    // Check if student is trying to join their own session (tutor cannot join as student)
    const profile = await Profile.findOne({ where: { userId: studentId } });
    if (profile && profile.id === session.profileId) {
      return res
        .status(400)
        .json({ message: "You cannot join your own session as a student" });
    }

    // Check if student already joined
    const alreadyJoined = await SessionParticipant.findOne({
      where: { sessionId, studentId },
    });
    if (alreadyJoined) {
      return res
        .status(400)
        .json({ message: "You have already joined this session" });
    }

    // Check capacity based on session type
    if (session.sessionType === "one-on-one") {
      const existingParticipant = await SessionParticipant.findOne({
        where: { sessionId },
      });
      if (existingParticipant) {
        return res
          .status(400)
          .json({ message: "This one-on-one session is already fully booked" });
      }
    } else if (session.sessionType === "group") {
      const participantCount = await SessionParticipant.count({
        where: { sessionId },
      });

      if (session.maxStudents && participantCount >= session.maxStudents) {
        return res
          .status(400)
          .json({ message: "This session is full. No more spots available" });
      }
    }

    // Create new participant
    await SessionParticipant.create({
      sessionId,
      studentId,
      joinedAt: new Date(),
    });

    // Get updated session info
    const updatedParticipantCount = await SessionParticipant.count({
      where: { sessionId },
    });

    const maxStudents =
      session.sessionType === "one-on-one" ? 1 : session.maxStudents;
    const availableSlots = maxStudents - updatedParticipantCount;

    return res.status(200).json({
      message: "Successfully joined the session!",
      data: {
        sessionId,
        enrolledStudents: updatedParticipantCount,
        availableSlots,
      },
    });
  } catch (error) {
    console.error("Error joining session:", error);
    return res.status(500).json({
      message: "Failed to join session. Please try again.",
      error: error.message,
    });
  }
};

// Get sessions registered by a student
export const getMyRegisteredSessions = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const now = new Date();

    // Find all session participants for this student (including rating info)
    const participantRecords = await SessionParticipant.findAll({
      where: { studentId },
      attributes: ["sessionId", "joinedAt", "rating", "ratedAt"],
    });

    if (!participantRecords || participantRecords.length === 0) {
      return res.status(200).json({
        message: "No registered sessions found",
        data: {
          all: [],
          upcoming: [],
          past: [],
          cancelled: [],
        },
        total: 0,
        counts: {
          total: 0,
          upcoming: 0,
          past: 0,
          cancelled: 0,
        },
      });
    }

    // Get all session IDs
    const sessionIds = participantRecords.map((p) => p.sessionId);

    // Fetch full session details
    const sessions = await Session.findAll({
      where: {
        id: { [Op.in]: sessionIds },
      },
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

        // Fetch all participants
        const participants = await SessionParticipant.findAll({
          where: { sessionId: session.id },
        });

        // Get join date and rating for this student
        const myParticipant = participantRecords.find(
          (p) => p.sessionId === session.id
        );

        // Calculate slots
        const participantCount = participants.length;
        const maxStudents =
          session.sessionType === "one-on-one" ? 1 : session.maxStudents || 1;

        // Determine session status relative to current time
        const sessionDate = new Date(session.scheduledTime);
        const sessionEndTime = new Date(
          sessionDate.getTime() + session.duration * 60 * 60 * 1000
        );

        let displayStatus = session.status;
        let canRate = false;

        if (session.status === "booked") {
          if (sessionEndTime < now) {
            // Session has ended
            displayStatus = "past";
            canRate = true;
          } else if (sessionDate < now && sessionEndTime > now) {
            // Session is ongoing
            displayStatus = "ongoing";
            canRate = false;
          } else {
            // Session is upcoming
            displayStatus = "upcoming";
            canRate = false;
          }
        } else if (session.status === "completed") {
          displayStatus = "completed";
          canRate = true;
        }

        // If already rated, can't rate again
        if (myParticipant?.rating !== null) {
          canRate = false;
        }

        return {
          sessionId: session.id,
          profileId: session.profileId,

          // Tutor information
          tutorName: tutor?.name || "Unknown Tutor",
          tutorEmail: tutor?.email || "",
          tutorImage: tutor?.imageUrl || null,
          tutorBio: profile?.bio || "No bio available",
          tutorRating: profile?.rating || 0,
          tutorReviewCount: profile?.reviewCount || 0,

          // Subject information
          subject: subject?.name || "Unknown",
          subjectId: session.subjectId,

          // Session details
          scheduledTime: session.scheduledTime,
          duration: session.duration,
          sessionType: session.sessionType,
          maxStudents: maxStudents,
          enrolledStudents: participantCount,
          notes: session.notes || "",
          status: session.status,
          displayStatus: displayStatus,

          // Student-specific info
          joinedAt: myParticipant?.joinedAt || null,
          myRating: myParticipant?.rating || null,
          ratedAt: myParticipant?.ratedAt || null,
          canRate: canRate,

          createdAt: session.createdAt,
        };
      })
    );

    // Separate into upcoming, past, and cancelled
    const upcoming = sessionsWithDetails.filter(
      (s) => s.displayStatus === "upcoming" || s.displayStatus === "ongoing"
    );

    const past = sessionsWithDetails.filter(
      (s) => s.displayStatus === "past" || s.displayStatus === "completed"
    );

    const cancelled = sessionsWithDetails.filter(
      (s) => s.status === "canceled" || s.status === "cancelled"
    );

    return res.status(200).json({
      message: "Registered sessions fetched successfully",
      data: {
        all: sessionsWithDetails,
        upcoming,
        past,
        cancelled,
      },
      total: sessionsWithDetails.length,
      counts: {
        total: sessionsWithDetails.length,
        upcoming: upcoming.length,
        past: past.length,
        cancelled: cancelled.length,
      },
    });
  } catch (error) {
    console.error("Error fetching registered sessions:", error);
    return res.status(500).json({
      message: "Failed to fetch registered sessions",
      error: error.message,
    });
  }
};
