// components/Profile/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import styles from "./UserProfile.module.css";
import TutorProfile from "../../components/UserProfile/TutorProfile";
import { getUserData } from "../../utils/localStorage";
import { useAxios } from "../../hooks/useAxios";

function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(getUserData());
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const { request } = useAxios();

  useEffect(() => {
    fetchProfileData();
    fetchSubjects();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resProfileData = await request({
        url: `/user/${user.id}/profile`,
        method: "GET",
      });
      console.log("Profile data:", resProfileData?.data);
      setProfileData(resProfileData?.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data. Please try again.");
      announceToScreenReader("Error loading profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const resSubjects = await request({
        url: "/subjects/all",
        method: "GET",
      });
      console.log("Subjects:", resSubjects?.data);
      setSubjects(resSubjects?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      announceToScreenReader("Error loading subjects");
    }
  };

  const handleSaveProfile = async (updatedData) => {
    setSaving(true);
    setError(null);

    try {
      // Make API call to update profile
      const response = await request({
        url: `/user/${user.id}/profile`,
        method: "PUT", // or "PATCH" depending on your API
        body: updatedData,
      });

      console.log("Profile updated successfully:", response?.data);

      // Update local state with the response data
      setProfileData(response?.data || updatedData);
      setIsEditing(false);

      // Announce success to screen readers
      announceToScreenReader("Profile updated successfully");

      // Optional: Show success notification
      showNotification("Profile updated successfully!", "success");

    } catch (error) {
      console.error("Error saving profile:", error);
      
      // Set error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error updating profile. Please try again.";
      setError(errorMessage);
      
      announceToScreenReader(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If canceling edit, just toggle off - TutorProfile will reset from profileData
      announceToScreenReader("Edit mode cancelled. Changes discarded.");
    } else {
      announceToScreenReader("Edit mode enabled");
    }
    setIsEditing(!isEditing);
    setError(null);
  };

  // Helper function for screen reader announcements
  const announceToScreenReader = (message) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Helper function to show notifications (you can customize this)
  const showNotification = (message, type = "info") => {
    // You can implement your own notification system here
    // For now, we'll just log it
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Optional: You could use a toast notification library here
    // Example: toast.success(message) or toast.error(message)
  };

  if (loading) {
    return (
      <div className={styles.profileLoading} role="status" aria-live="polite">
        <div className={styles.spinner} aria-hidden="true"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.profileError} role="alert">
        <p>Failed to load profile data. Please refresh the page.</p>
        <button onClick={fetchProfileData} className={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <header className={styles.profileHeader}>
        <h1 id="profile-heading">My Profile</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.editToggleBtn}
            onClick={handleToggleEdit}
            aria-label={isEditing ? "Cancel editing profile" : "Edit profile"}
            aria-pressed={isEditing}
            type="button"
            disabled={saving}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className={styles.closeError}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      {saving && (
        <div className={styles.savingOverlay} role="status" aria-live="polite">
          <div className={styles.savingModal}>
            <div className={styles.spinner} aria-hidden="true"></div>
            <p>Saving your profile...</p>
          </div>
        </div>
      )}

      <main
        id="profile-content"
        className={styles.profileContent}
        aria-labelledby="profile-heading"
      >
          <TutorProfile
            user={user}
            profileData={profileData}
            isEditing={isEditing}
            onSave={handleSaveProfile}
            availableSubjects={subjects}
          />
      </main>
    </div>
  );
}

export default UserProfile;