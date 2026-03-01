import { Profile } from "../models/profile.model.js";
import { Session } from "../models/session.model.js";
import { SessionParticipant } from "../models/sessionParticipant.model.js";


// Submit a rating for a completed session
export const rateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentId, rating } = req.body;

    // Validation
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    }

    // Find the session
    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if session is completed or past
    const now = new Date();
    const sessionDate = new Date(session.scheduledTime);
    const sessionEndTime = new Date(
      sessionDate.getTime() + session.duration * 60 * 60 * 1000
    );

    if (sessionEndTime > now && session.status !== "completed") {
      return res.status(400).json({
        message: "You can only rate a session after it has been completed",
      });
    }

    // Find participant record
    const participant = await SessionParticipant.findOne({
      where: { sessionId, studentId },
    });

    if (!participant) {
      return res.status(403).json({
        message: "You can only rate sessions you have attended",
      });
    }

    // Check if already rated
    if (participant.rating !== null) {
      return res.status(400).json({
        message: "You have already rated this session",
      });
    }

    // Get tutor profile
    const tutorProfile = await Profile.findByPk(session.profileId);
    if (!tutorProfile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Calculate new average rating
    const currentRating = tutorProfile.rating || 0;
    const currentReviewCount = tutorProfile.reviewCount || 0;
    const totalRating = currentRating * currentReviewCount + parseInt(rating);
    const newReviewCount = currentReviewCount + 1;
    const newAverageRating = totalRating / newReviewCount;

    // Update participant with rating
    await participant.update({
      rating: parseInt(rating),
      ratedAt: new Date(),
    });

    // Update tutor profile
    await tutorProfile.update({
      rating: parseFloat(newAverageRating.toFixed(2)),
      reviewCount: newReviewCount,
    });

    return res.status(200).json({
      message: "Rating submitted successfully! Thank you for your feedback.",
      data: {
        participantRating: {
          sessionId: participant.sessionId,
          rating: participant.rating,
          ratedAt: participant.ratedAt,
        },
        tutorProfile: {
          id: tutorProfile.id,
          rating: parseFloat(newAverageRating.toFixed(2)),
          reviewCount: newReviewCount,
        },
      },
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return res.status(500).json({
      message: "Failed to submit rating",
      error: error.message,
    });
  }
};

// Update a rating (optional - if you want to allow editing)
export const updateRating = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentId, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    }

    // Find participant record
    const participant = await SessionParticipant.findOne({
      where: { sessionId, studentId },
    });

    if (!participant) {
      return res.status(404).json({ message: "Participant record not found" });
    }

    if (participant.rating === null) {
      return res.status(400).json({ message: "You haven't rated this session yet" });
    }

    const oldRating = participant.rating;
    const session = await Session.findByPk(sessionId);
    const tutorProfile = await Profile.findByPk(session.profileId);

    // Recalculate average rating
    const currentTotalRating = tutorProfile.rating * tutorProfile.reviewCount;
    const newTotalRating = currentTotalRating - oldRating + parseInt(rating);
    const newAverageRating = newTotalRating / tutorProfile.reviewCount;

    // Update participant rating
    await participant.update({
      rating: parseInt(rating),
      ratedAt: new Date(),
    });

    // Update tutor profile
    await tutorProfile.update({
      rating: parseFloat(newAverageRating.toFixed(2)),
    });

    return res.status(200).json({
      message: "Rating updated successfully",
      data: {
        participantRating: {
          sessionId: participant.sessionId,
          rating: participant.rating,
          ratedAt: participant.ratedAt,
        },
        tutorProfile: {
          rating: parseFloat(newAverageRating.toFixed(2)),
          reviewCount: tutorProfile.reviewCount,
        },
      },
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    return res.status(500).json({
      message: "Failed to update rating",
      error: error.message,
    });
  }
};

// Get all ratings for a tutor
export const getTutorRatings = async (req, res) => {
  try {
    const { profileId } = req.params;

    // Get all participants who rated sessions for this tutor
    const sessions = await Session.findAll({
      where: { profileId },
      attributes: ["id"],
    });

    const sessionIds = sessions.map(s => s.id);

    const ratings = await SessionParticipant.findAll({
      where: {
        sessionId: { [Op.in]: sessionIds },
        rating: { [Op.not]: null },
      },
      attributes: ["sessionId", "rating", "ratedAt"],
      order: [["ratedAt", "DESC"]],
    });

    const profile = await Profile.findByPk(profileId);

    return res.status(200).json({
      message: "Tutor ratings fetched successfully",
      data: {
        ratings,
        averageRating: profile?.rating || 0,
        totalReviews: profile?.reviewCount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching tutor ratings:", error);
    return res.status(500).json({
      message: "Failed to fetch tutor ratings",
      error: error.message,
    });
  }
};
