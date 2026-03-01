import { User } from "../models/user.model.js";
import { Profile } from "../models/profile.model.js";
import { UserSkill } from "../models/userskill.model.js";
import { Subject } from "../models/subject.model.js";

User.hasOne(Profile, { foreignKey: "userId" });

Profile.belongsTo(User, { foreignKey: "userId" });
UserSkill.belongsTo(Profile, { foreignKey: "profileId" });
UserSkill.belongsTo(Subject, { foreignKey: "subjectId" });

/**
 * @description Gets User profile details
 * @param {*} req
 * @param {*} res
 * @returns JSON object.
 */
export const getUserProfile = async (req, res) => {
  try {
    const id = Number(req.params.userId);
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile = await Profile.findOne({ where: { userId: user.id } });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const skills = await UserSkill.findAll({
      where: { profileId: profile.id },
      include: [{ model: Subject }],
    });
    const subjects = skills.map((s) => s.Subject);

    // Ensure availability is always an array
    const availability = Array.isArray(profile.availability) 
      ? profile.availability 
      : (profile.availability ? [profile.availability] : []);

    return res.status(201).json({
      message: "profile data fetched successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        qualification: user.qualification,
        imageUrl: user.imageUrl,
        role: user.role,
        profile: {
          id: profile.id,
          bio: profile.bio,
          rating: profile.rating,
          availability: availability,
          subjects,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @description updates user profile information based on user role.
 * @param {*} req
 * @param {*} res
 * @returns JSON object.
 */
export const updateUserProfile = async (req, res) => {
  try {
    const id = Number(req.params.userId);
    const { name, gender, bio, availability, subjects, qualification } = req.body;

    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await user.update({ name, gender, qualification });
    const profile = await Profile.findOne({ where: { userId: user.id } });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Ensure availability is always stored as an array
    let availabilityArray = [];
    if (availability) {
      if (Array.isArray(availability)) {
        availabilityArray = availability;
      } else if (typeof availability === 'string') {
        // If it's a string, try to parse it as JSON
        try {
          const parsed = JSON.parse(availability);
          availabilityArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // If parsing fails, wrap it in an array
          availabilityArray = [availability];
        }
      } else {
        // For any other type, wrap in array
        availabilityArray = [availability];
      }
    }

    const updatedProfile =
      user.role === "tutor"
        ? await profile.update({ bio, availability: availabilityArray })
        : await profile.update({ bio });

    const subjectList = [];
    if (subjects && subjects.length > 0) {
      await UserSkill.destroy({ where: { profileId: profile.id } });

      // Handle subject objects instead of strings
      for (const subjectObj of subjects) {
        // Extract the subject name from the object
        const subjectName = subjectObj.name || subjectObj;
        const subjectId = subjectObj.id;

        // Try to find by ID first, then by name
        let subject = subjectId
          ? await Subject.findOne({ where: { id: subjectId } })
          : await Subject.findOne({ where: { name: subjectName } });

        if (!subject) {
          subject = await Subject.create({ name: subjectName });
        }

        subjectList.push(subject);
        await UserSkill.create({
          profileId: profile.id,
          subjectId: subject.id,
        });
      }
    }

    // Ensure availability is always an array in response
    const finalAvailability = Array.isArray(updatedProfile.availability)
      ? updatedProfile.availability
      : (updatedProfile.availability ? [updatedProfile.availability] : []);

    return res.status(200).json({
      message: "User profile updated successfully",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        gender: updatedUser.gender,
        qualification: updatedUser.qualification,
        imageUrl: updatedUser.imageUrl,
        role: updatedUser.role,
        profile: {
          id: updatedProfile.id,
          bio: updatedProfile.bio,
          rating: updatedProfile.rating,
          availability: finalAvailability,
          subjects: subjectList,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
