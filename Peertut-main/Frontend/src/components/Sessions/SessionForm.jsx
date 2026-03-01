import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaBook,
  FaClock,
  FaCalendarAlt,
  FaSave,
  FaUsers,
} from "react-icons/fa";
import { MdNotes, MdInfo } from "react-icons/md";
import styles from "./SessionForm.module.css";
import { useAxios } from "../../hooks/useAxios";
import { getUserData } from "../../utils/localStorage";

const SessionForm = ({ session, onSubmit, onClose, isEditing }) => {
  const { request } = useAxios();

  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subjectId: "",
    sessionDate: "",
    sessionTime: "",
    duration: 1,
    maxStudents: 1,
    notes: "",
    sessionType: "one-on-one",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getUserData();

  // Load subjects from backend on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await request({
          url: "/subjects/all",
          method: "GET",
        });
        setSubjects(res?.data || []);
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      }
    };
    fetchSubjects();
  }, [request]);

  // On edit, initialize form with session data
  useEffect(() => {
    if (session) {
      // Split scheduledTime into date and time input formats
      const dateObj = new Date(session.scheduledTime);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;

      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const time = `${hours}:${minutes}`;

      setFormData({
        subjectId: session.subjectId || "",
        sessionDate: date,
        sessionTime: time,
        duration: session.duration || 1,
        maxStudents: session.sessionType === "group" ? session.maxStudents || 2 : 1,
        notes: session.notes || "",
        sessionType: session.sessionType || "one-on-one",
      });
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxStudents" || name === "duration" ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.subjectId) newErrors.subjectId = "Please select a subject";
    if (!formData.sessionDate) newErrors.sessionDate = "Please select a date";
    if (!formData.sessionTime) newErrors.sessionTime = "Please select a time";
    if (!formData.notes || formData.notes.trim() === "") {
      newErrors.notes = "Please provide session details";
    }

    if (formData.sessionDate && formData.sessionTime) {
      const selectedDateTime = new Date(`${formData.sessionDate}T${formData.sessionTime}`);
      const now = new Date();
      if (!isEditing && selectedDateTime < now) {
        newErrors.sessionDate = "Cannot schedule session in the past";
      }
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }

    if (formData.sessionType === "group" && (!formData.maxStudents || formData.maxStudents < 2)) {
      newErrors.maxStudents = "Group sessions must allow at least 2 students";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const scheduledTime = new Date(`${formData.sessionDate}T${formData.sessionTime}`).toISOString();

      const submissionData = {
        profileId: user.id,
        subjectId: formData.subjectId,
        scheduledTime,
        duration: formData.duration,
        maxStudents: formData.sessionType === "group" ? formData.maxStudents : 1,
        notes: formData.notes,
        sessionType: formData.sessionType,
      };

      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error("Error submitting session form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-form-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close form" type="button">
          <FaTimes />
        </button>

        <header className={styles.modalHeader}>
          <h2 id="session-form-title">{isEditing ? "Edit Session" : "Create Session"}</h2>
          <p className={styles.headerSubtext}>Students will be able to book this session.</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formBody}>
            {/* Session Details - MOVED TO TOP */}
            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.formLabel}>
                <MdNotes className={styles.labelIcon} /> Session Details
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className={`${styles.formTextarea} ${errors.notes ? styles.inputError : ""}`}
                placeholder="Describe what will be covered in this session, prerequisites, materials needed etc."
                rows="4"
                required
                aria-required="true"
                aria-invalid={!!errors.notes}
              />
              {errors.notes && (
                <span className={styles.errorMessage} role="alert">
                  {errors.notes}
                </span>
              )}
            </div>

            {/* Session Type */}
            <div className={styles.formGroup}>
              <label htmlFor="sessionType" className={styles.formLabel}>
                <FaUsers className={styles.labelIcon} /> Session Type
              </label>
              <select
                id="sessionType"
                name="sessionType"
                value={formData.sessionType}
                onChange={handleInputChange}
                className={styles.formInput}
                required
              >
                <option value="one-on-one">Individual (1-on-1)</option>
                <option value="group">Group Session</option>
              </select>
              <span className={styles.helpText}>
                {formData.sessionType === "one-on-one"
                  ? "One student can book this session."
                  : "Multiple students can join this session."}
              </span>
            </div>

            {/* Max Students for Group */}
            {formData.sessionType === "group" && (
              <div className={styles.formGroup}>
                <label htmlFor="maxStudents" className={styles.formLabel}>
                  <FaUsers className={styles.labelIcon} /> Maximum Students
                </label>
                <input
                  id="maxStudents"
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.maxStudents ? styles.inputError : ""}`}
                  min="2"
                  max="20"
                  required
                />
                {errors.maxStudents && (
                  <span className={styles.errorMessage} role="alert">
                    {errors.maxStudents}
                  </span>
                )}
                <span className={styles.helpText}>How many students can join this session?</span>
              </div>
            )}

            {/* Subject */}
            <div className={styles.formGroup}>
              <label htmlFor="subjectId" className={styles.formLabel}>
                <FaBook className={styles.labelIcon} /> Subject
              </label>
              <select
                id="subjectId"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.subjectId ? styles.inputError : ""}`}
                required
                aria-required="true"
                aria-invalid={!!errors.subjectId}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id || subject.subject_id} value={subject.id || subject.subject_id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <span className={styles.errorMessage} role="alert">
                  {errors.subjectId}
                </span>
              )}
            </div>

            {/* Date */}
            <div className={styles.formGroup}>
              <label htmlFor="sessionDate" className={styles.formLabel}>
                <FaCalendarAlt className={styles.labelIcon} /> Date
              </label>
              <input
                id="sessionDate"
                type="date"
                name="sessionDate"
                value={formData.sessionDate}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.sessionDate ? styles.inputError : ""}`}
                required
                aria-required="true"
                aria-invalid={!!errors.sessionDate}
              />
              {errors.sessionDate && (
                <span className={styles.errorMessage} role="alert">
                  {errors.sessionDate}
                </span>
              )}
            </div>

            {/* Time */}
            <div className={styles.formGroup}>
              <label htmlFor="sessionTime" className={styles.formLabel}>
                <FaClock className={styles.labelIcon} /> Time
              </label>
              <input
                id="sessionTime"
                type="time"
                name="sessionTime"
                value={formData.sessionTime}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.sessionTime ? styles.inputError : ""}`}
                required
                aria-required="true"
                aria-invalid={!!errors.sessionTime}
              />
              {errors.sessionTime && (
                <span className={styles.errorMessage} role="alert">
                  {errors.sessionTime}
                </span>
              )}
            </div>

            {/* Duration */}
            <div className={styles.formGroup}>
              <label htmlFor="duration" className={styles.formLabel}>
                <FaClock className={styles.labelIcon} /> Duration (hours)
              </label>
              <input
                id="duration"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.duration ? styles.inputError : ""}`}
                min="0.5"
                step="0.5"
                required
                aria-required="true"
                aria-invalid={!!errors.duration}
              />
              {errors.duration && (
                <span className={styles.errorMessage} role="alert">
                  {errors.duration}
                </span>
              )}
            </div>

            {/* Info Box */}
            <div className={styles.infoBox}>
              <MdInfo className={styles.infoIcon} />
              <div className={styles.infoContent}>
                <strong>How it works:</strong>
                <p>
                  Once created, this session will be visible to students who can register for it. You'll be notified when students enroll.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              <FaSave />
              {isSubmitting ? "Saving..." : isEditing ? "Update Session" : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;
