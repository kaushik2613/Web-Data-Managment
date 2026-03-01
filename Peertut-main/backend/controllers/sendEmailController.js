import transporter from "../util/emailConfig.js";
import { Session } from "../models/session.model.js";
import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { User } from "../models/user.model.js";
import { Subject } from "../models/subject.model.js";
import { Profile } from "../models/profile.model.js";

export const sendSessionEmailsToStudents = async (req, res) => {
  try {
    const { sessionId, meetingLink } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    if (!meetingLink) {
      return res.status(400).json({ message: "Meeting link is required" });
    }

    // Fetch session details
    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Fetch tutor details
    const tutorProfile = await Profile.findByPk(session.profileId);
    const tutor = tutorProfile ? await User.findByPk(tutorProfile.userId) : null;

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Fetch subject
    const subject = await Subject.findByPk(session.subjectId);

    // Fetch all participants
    const participants = await SessionParticipant.findAll({
      where: { sessionId },
    });

    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: "No students enrolled in this session" });
    }

    // Fetch student details
    const studentIds = participants.map(p => p.studentId);
    const students = await User.findAll({
      where: { id: studentIds },
    });

    if (!students || students.length === 0) {
      return res.status(400).json({ message: "No student emails found" });
    }

    // Format session date and time
    const sessionDate = new Date(session.scheduledTime);
    const formattedDate = sessionDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = sessionDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const sessionEndTime = new Date(sessionDate.getTime() + session.duration * 60 * 60 * 1000);
    const formattedEndTime = sessionEndTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Email to students
    const studentEmailPromises = students.map(async (student) => {
      const emailSubject = `Session Reminder: ${subject?.name || "Your Session"} with ${tutor.name}`;
      
      const emailBody = `
Hello ${student.name},

This is a reminder about your upcoming tutoring session:

📚 Subject: ${subject?.name || "N/A"}
👨‍🏫 Tutor: ${tutor.name}
📅 Date: ${formattedDate}
🕒 Time: ${formattedTime} - ${formattedEndTime}
⏱️ Duration: ${session.duration} hour${session.duration > 1 ? 's' : ''}

🔗 Join the session here: ${meetingLink}

${session.notes ? `\n📝 Session Notes:\n${session.notes}\n` : ''}

Please join the meeting on time. If you have any questions, feel free to contact your tutor.

Best regards,
PeerTut Team
      `;

      return transporter.sendMail({
        to: student.email,
        subject: emailSubject,
        text: emailBody,
      });
    });

    // Email to tutor
    const studentNames = students.map(s => s.name).join(", ");
    const tutorEmailSubject = `Session Reminder: ${subject?.name || "Your Session"} with ${students.length} student${students.length > 1 ? 's' : ''}`;
    
    const tutorEmailBody = `
Hello ${tutor.name},

This is a reminder about your upcoming tutoring session:

📚 Subject: ${subject?.name || "N/A"}
👥 Students: ${studentNames}
📅 Date: ${formattedDate}
🕒 Time: ${formattedTime} - ${formattedEndTime}
⏱️ Duration: ${session.duration} hour${session.duration > 1 ? 's' : ''}

🔗 Meeting Link: ${meetingLink}

${session.notes ? `\n📝 Session Notes:\n${session.notes}\n` : ''}

Total Students Enrolled: ${students.length}

This meeting link has been shared with all enrolled students. Please join on time.

Best regards,
PeerTut Team
    `;

    const tutorEmailPromise = transporter.sendMail({
      to: tutor.email,
      subject: tutorEmailSubject,
      text: tutorEmailBody,
    });

    // Send all emails
    await Promise.all([...studentEmailPromises, tutorEmailPromise]);

    return res.status(200).json({
      message: `Email sent successfully to ${students.length} student${students.length > 1 ? 's' : ''} and the tutor`,
      data: {
        emailsSent: students.length + 1,
        students: students.map(s => ({ id: s.id, name: s.name, email: s.email })),
        tutor: { id: tutor.id, name: tutor.name, email: tutor.email },
      },
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return res.status(500).json({
      message: "Failed to send emails",
      error: error.message,
    });
  }
};
