import React, { useState, useEffect } from "react";
import styles from "./PlansModal.module.css";
import { X, Eye } from 'lucide-react';

const PlansModal = ({ isOpen, onClose, mode, plan, onSave }) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (plan && (mode === "edit" || mode === "view")) {
      setTitle(plan.title || "");
      setSubject(plan.subject || "");
      setDeadline(plan.deadline || "");
      setDescription(plan.description || "");
    } else {
      setTitle("");
      setSubject("");
      setDeadline("");
      setDescription("");
    }
  }, [plan, mode, isOpen]);

  const handleSave = () => {
    if (title.trim() === "" || subject.trim() === "") return;

    const updatedPlan = {
      title,
      subject,
      deadline,
      description,
    };

    if (mode === "create") {
      updatedPlan.id = Date.now();
      updatedPlan.progress = 0;
      updatedPlan.tasks = 0;
      updatedPlan.completed = 0;
      updatedPlan.tasksList = [];
    } else {
      updatedPlan.id = plan.id;
      updatedPlan.progress = plan.progress;
      updatedPlan.tasks = plan.tasks;
      updatedPlan.completed = plan.completed;
      updatedPlan.tasksList = plan.tasksList;
    }

    onSave(updatedPlan);
    onClose();
  };

  if (!isOpen) return null;

  const isView = mode === "view";

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>
            {mode === "create"
              ? "Create New Plan"
              : mode === "edit"
              ? "Edit Plan"
              : "View Plan"}
          </h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {isView ? (
            <>
              <div className={styles.viewField}>
                <strong>Title:</strong> {title}
              </div>
              <div className={styles.viewField}>
                <strong>Subject:</strong> {subject}
              </div>
              <div className={styles.viewField}>
                <strong>Deadline:</strong> {deadline}
              </div>
              <div className={styles.viewField}>
                <strong>Description:</strong> {description}
              </div>
            </>
          ) : (
            <>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <label>Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}
        </div>
        {!isView && (
          <div className={styles.modalFooter}>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansModal;