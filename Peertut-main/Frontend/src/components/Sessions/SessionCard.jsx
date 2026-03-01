import React, { useState } from "react";
import {
  FaClock,
  FaUser,
  FaBook,
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaInfoCircle,
  FaUsers,
  FaVideo,
  FaPaperPlane,
} from "react-icons/fa";
import { SiGooglemeet } from "react-icons/si";
import styles from "./SessionCard.module.css";
import { useAxios } from "../../hooks/useAxios";
import { useToast } from "../../hooks/useToast";

const SessionCard = ({ session, onClick, onStatusUpdate, onEdit, onDelete, onEmailSent }) => {
  const { request } = useAxios();
  const toast = useToast();
  const [showActions, setShowActions] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const isGroupSession = session.participants && session.participants.length > 1;
  const studentCount = isGroupSession ? session.participants.length : session.participants?.length === 1 ? 1 : 0;

  const participantNames = isGroupSession
    ? session.participants.map((p) => p.User?.name || "None")
    : session.participants?.[0]?.User?.name || "None";

  const participantAvatar = !isGroupSession && session.participants?.[0]?.User?.imageUrl;

  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "booked":
        return styles.statusBooked;
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return "";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "booked":
        return "Upcoming";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onEdit(session);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onDelete(session.id);
  };

  const handleActionsToggle = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  const handleCreateGoogleMeet = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  const handleSendEmail = async (e) => {
    e.stopPropagation();

    if (!meetingLink.trim()) {
      toast.error("Please enter a meeting link before sending email");
      return;
    }

    try {
      new URL(meetingLink);
    } catch {
      toast.error("Please enter a valid meeting link URL");
      return;
    }

    setSendingEmail(true);

    try {
      const res = await request({
        url: "/sendEmail/send-email",
        method: "POST",
        body: {
          sessionId: session.id,
          meetingLink: meetingLink,
        },
      });

      toast.success(res?.message || "Email sent successfully to all students and tutor!");
      setMeetingLink("");
      
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      const errorMessage = error?.message || "Failed to send email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <article
      className={`${styles.sessionCard} ${getStatusClass(session.status)}`}
      role="article"
      aria-label={`Session with ${isGroupSession ? `${studentCount} students` : participantNames} for ${session.Subject?.name}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.studentInfo}>
          <div className={styles.studentAvatar}>
            {isGroupSession ? (
              <FaUsers />
            ) : participantAvatar ? (
              <img src={participantAvatar} alt={participantNames} />
            ) : (
              <FaUser />
            )}
          </div>
          <div className={styles.studentDetails}>
            {isGroupSession ? (
              <>
                <h3 className={styles.studentName}>Group Session</h3>
                <span className={styles.studentCount}>
                  <FaUsers className={styles.countIcon} />
                  {studentCount} students
                </span>
              </>
            ) : (
              <>
                <h3 className={styles.studentName}>{participantNames}</h3>
              </>
            )}
          </div>
        </div>
        <div className={styles.cardActions}>
          <span className={`${styles.statusBadge} ${getStatusClass(session.status)}`}>
            {getStatusBadge(session.status)}
          </span>
          <div className={styles.actionsMenu}>
            <button
              className={styles.actionsBtn}
              onClick={handleActionsToggle}
              aria-label="Session actions"
              aria-expanded={showActions}
              type="button"
            >
              <FaEllipsisV />
            </button>
            {showActions && (
              <div className={styles.actionsDropdown}>
                <button className={styles.actionItem} onClick={handleEditClick} type="button">
                  <FaEdit />
                  Edit
                </button>
                <button className={`${styles.actionItem} ${styles.deleteAction}`} onClick={handleDeleteClick} type="button">
                  <FaTrash />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.sessionDetail}>
          <FaBook className={styles.detailIcon} />
          <span>{session.Subject?.name}</span>
        </div>
        <div className={styles.sessionDetail}>
          <FaClock className={styles.detailIcon} />
          <span>{formatTime(session.scheduledTime)}</span>
        </div>
        <div className={styles.sessionDetail}>
          <FaClock className={styles.detailIcon} />
          <span>{session.duration} {session.duration === 1 ? "hour" : "hours"}</span>
        </div>
      </div>

      {isGroupSession && (
        <div className={styles.studentsList}>
          {participantNames.slice(0, 3).map((name, index) => (
            <span key={index} className={styles.studentChip}>
              {name}
            </span>
          ))}
          {participantNames.length > 3 && (
            <span className={styles.moreStudents}>+{participantNames.length - 3} more</span>
          )}
        </div>
      )}

      {session.notes && (
        <div className={styles.cardFooter}>
          <p className={styles.notes}>{session.notes}</p>
        </div>
      )}

      {session.status === "booked" && (
        <div className={styles.meetingSection}>
          <div className={styles.meetingInputGroup}>
            <FaVideo className={styles.meetingIcon} />
            <input
              type="text"
              className={styles.meetingInput}
              placeholder="Enter meeting link..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Meeting link input"
            />
            <button
              className={styles.googleMeetBtn}
              onClick={handleCreateGoogleMeet}
              title="Create Google Meet"
              type="button"
              aria-label="Create Google Meet"
            >
              <SiGooglemeet />
            </button>
            <button
              className={styles.sendEmailBtn}
              onClick={handleSendEmail}
              disabled={sendingEmail || !meetingLink.trim()}
              title="Send email to students and tutor"
              type="button"
              aria-label="Send email notification"
            >
              {sendingEmail ? (
                <span className={styles.spinner}></span>
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
          <p className={styles.meetingHint}>
            Create a Google Meet link or paste any meeting URL, then send it to all participants
          </p>
        </div>
      )}

      <button
        className={styles.detailsBtn}
        onClick={handleDetailsClick}
        aria-label="View session details"
        type="button"
      >
        <FaInfoCircle />
        <span>Details</span>
      </button>
    </article>
  );
};

export default SessionCard;
