import React, { useState } from "react";
import {
  FaTimes,
  FaUser,
  FaBook,
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
  FaBan,
  FaEdit,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import styles from "./SessionDetails.module.css";

const SessionDetails = ({ session, onClose, onStatusUpdate, onEdit, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const isGroupSession = session.participants && session.participants.length > 1;
  const participantNames = session.participants?.map((p) => p.User?.name || "Unknown") || [];

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    await onStatusUpdate(session.id, newStatus);
    setIsUpdating(false);
  };

  const handleEdit = () => {
    onEdit(session);
  };

  const handleDelete = () => {
    onDelete(session.id);
  };

  const { date, time } = formatDateTime(session.scheduledTime);

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-details-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeBtn} 
          onClick={onClose} 
          aria-label="Close session details" 
          type="button"
        >
          <FaTimes />
        </button>

        <header className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 id="session-details-title">Session Details</h2>
            {/* <span
              className={`${styles.statusBadge} ${
                styles[`status${session.status.charAt(0).toUpperCase() + session.status.slice(1)}`]
              }`}
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span> */}
          </div>
        </header>

        <div className={styles.modalBody}>
          {/* Student Info */}
          <section className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              {isGroupSession ? (
                <FaUsers className={styles.sectionIcon} />
              ) : (
                <FaUser className={styles.sectionIcon} />
              )}
              {isGroupSession ? "Registered Students List " : "Participant Information"}
            </h3>

            {isGroupSession ? (
              <div className={styles.groupStudentsContainer}>
                <div className={styles.groupHeader}>
                  <FaUsers className={styles.groupIcon} />
                  <span className={styles.groupText}>
                    Group Session - {participantNames.length} Students
                  </span>
                </div>
                <div className={styles.studentChipsContainer}>
                  {participantNames.map((name, index) => (
                    <div key={index} className={styles.studentChipLarge}>
                      <FaUser className={styles.chipIcon} />
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.studentCard}>
                <div className={styles.studentAvatar}>
                  {session.participants?.[0]?.User?.imageUrl ? (
                    <img
                      src={session.participants[0].User.imageUrl}
                      alt={session.participants[0].User.name}
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className={styles.studentInfo}>
                  <h4>{session.participants?.[0]?.User?.name || "Unknown"}</h4>
                  <p className={styles.studentEmail}>
                    <MdEmail />
                    {session.participants?.[0]?.User?.email || "No email"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Session Info */}
          <section className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              <FaBook className={styles.sectionIcon} />
              Session Information
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Subject</span>
                <span className={styles.infoValue}>{session.Subject?.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date</span>
                <span className={styles.infoValue}>
                  <FaCalendarAlt className={styles.infoIcon} />
                  {date}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Time</span>
                <span className={styles.infoValue}>
                  <FaClock className={styles.infoIcon} />
                  {time}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Duration</span>
                <span className={styles.infoValue}>
                  <FaClock className={styles.infoIcon} />
                  {session.duration} {session.duration === 1 ? "hour" : "hours"}
                </span>
              </div>
              {session.sessionType === "group" && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Maximum Students</span>
                  <span className={styles.infoValue}>
                    <FaUsers className={styles.infoIcon} />
                    {session.maxStudents}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Notes */}
          {session.notes && (
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Notes</h3>
              <p className={styles.notes}>{session.notes}</p>
            </section>
          )}

          {/* Actions */}
          <section className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>Actions</h3>
            <div className={styles.actionButtons}>
              <button
                className={`${styles.actionBtn} ${styles.editBtn}`}
                onClick={handleEdit}
                type="button"
              >
                <FaEdit />
                Edit Session
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={handleDelete}
                type="button"
              >
                <FaTrash />
                Delete Session
              </button>
            </div>
          </section>

          {/* Status Update (only visible if session is booked) */}
          {session.status === "booked" && (
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Update Status</h3>
              <div className={styles.actionButtons}>
                <button
                  className={`${styles.actionBtn} ${styles.completeBtn}`}
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={isUpdating}
                  type="button"
                >
                  <FaCheckCircle />
                  Mark as Completed
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.cancelBtn}`}
                  onClick={() => handleStatusUpdate("cancelled")}
                  disabled={isUpdating}
                  type="button"
                >
                  <FaBan />
                  Cancel Session
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
