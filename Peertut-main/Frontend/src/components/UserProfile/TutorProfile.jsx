// components/Profile/TutorProfile.jsx
import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaGraduationCap,
  FaDollarSign,
  FaCamera,
  FaCheckCircle,
} from "react-icons/fa";
import { CircleArrowLeft, CircleArrowRight } from "lucide-react";
import TutorAvatar from "../../assets/tutor-profile.png";
import { MdEmail, MdPerson, MdSchedule, MdInfo } from "react-icons/md";
import { BiBookOpen } from "react-icons/bi";
import { IoMdTime } from "react-icons/io";
import styles from "./TutorProfile.module.css";

const TutorProfile = ({
  user,
  profileData,
  isEditing,
  onSave,
  availableSubjects,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    customGender: "",
    qualification: "",
    bio: "",
    availability: [],
    rating: 0,
    subjects: [],
  });
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [subjectPage, setSubjectPage] = useState(0);
  const subjectsPerPage = 10;
  const [selectedSubjectsPage, setSelectedSubjectsPage] = useState(0);

  useEffect(() => {
    if (profileData) {
      const genderValue = profileData.gender || "";
      let customGenderValue = "";

      // Check if gender is custom (not male, female, or others)
      if (
        genderValue &&
        genderValue !== "male" &&
        genderValue !== "female" &&
        genderValue !== "others"
      ) {
        customGenderValue = genderValue;
      }

      const initialAvailability =
        profileData.profile?.availability &&
        profileData.profile.availability.length > 0
          ? profileData.profile.availability
          : [];

      const initialData = {
        name: profileData.name || "",
        email: profileData.email || "",
        gender:
          genderValue === "male" ||
          genderValue === "female" ||
          genderValue === "others"
            ? genderValue
            : "others",
        customGender: customGenderValue,
        qualification: profileData.qualification || "",
        bio: profileData.profile?.bio || "",
        availability: initialAvailability,
        rating: profileData.profile?.rating || 0,
        subjects: profileData.profile?.subjects || [],
      };

      setFormData(initialData);
      setImageUrl(profileData.imageUrl || TutorAvatar);
      setSelectedSubjects(profileData.profile?.subjects || []);
    }
  }, [profileData, isEditing]); // Added isEditing to reset when cancel is clicked

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubjectToggle = (subject) => {
    const exists = selectedSubjects.find((s) => s.id === subject.id);
    if (exists) {
      setSelectedSubjects(selectedSubjects.filter((s) => s.id !== subject.id));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const paginatedSubjects = availableSubjects.slice(
    subjectPage * subjectsPerPage,
    subjectPage * subjectsPerPage + subjectsPerPage
  );

  const paginatedSelectedSubjects = selectedSubjects.slice(
    selectedSubjectsPage * subjectsPerPage,
    selectedSubjectsPage * subjectsPerPage + subjectsPerPage
  );

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...formData.availability];

    updated[index][field] = value;

    // toggle available → reset times
    if (field === "available" && value === false) {
      updated[index].start = "";
      updated[index].end = "";
    }

    setFormData({ ...formData, availability: updated });
  };

  const addAvailabilityRow = () => {
    const newRow = {
      date: "",
      available: true,
      start: "",
      end: "",
    };
    setFormData({
      ...formData,
      availability: [...formData.availability, newRow],
    });
  };

  const removeAvailabilityRow = (index) => {
    const updated = formData.availability.filter((_, i) => i !== index);
    setFormData({ ...formData, availability: updated });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.gender || formData.gender.length === 0) {
      newErrors.gender = "Please select gender";
    }

    if (formData.gender === "others" && !formData.customGender.trim()) {
      newErrors.customGender = "Please specify custom gender";
    }

    // Validate availability dates and times
    formData.availability.forEach((slot, index) => {
      if (slot.date && slot.available) {
        if (!slot.start) {
          newErrors[`availability_${index}_start`] = "Start time is required";
        }
        if (!slot.end) {
          newErrors[`availability_${index}_end`] = "End time is required";
        }
        if (slot.start && slot.end && slot.start >= slot.end) {
          newErrors[`availability_${index}_time`] =
            "End time must be after start time";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Determine final gender value
      const finalGender =
        formData.gender === "others" ? formData.customGender : formData.gender;

      // Prepare data for API
      const dataToSave = {
        name: formData.name,
        gender: finalGender,
        qualification: formData.qualification,
        bio: formData.bio,
        availability: formData.availability,
        subjects: selectedSubjects.map((s) => s.name),
      };

      onSave(dataToSave);
    }
  };

  // Helper to display gender
  const getDisplayGender = () => {
    if (formData.gender === "others" && formData.customGender) {
      return formData.customGender;
    }
    return formData.gender || "Not specified";
  };

  return (
    <div className={styles.tutorProfile}>
      <form onSubmit={handleSubmit} noValidate aria-label="Tutor profile form">
        {/* Profile Header Section */}
        <section
          className={styles.profileCard}
          aria-labelledby="basic-info-heading"
        >
          <div className={styles.profileAvatarSection}>
            <div className={styles.avatarContainer}>
              <img
                src={imageUrl || TutorAvatar}
                alt={`${formData.name}'s profile picture`}
                className={styles.profileAvatar}
              />
            </div>

            <div className={styles.profileBasicInfo}>
              <h2 id="basic-info-heading" className="sr-only">
                Basic Information
              </h2>
              {isEditing ? (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="tutor-name" className="sr-only">
                      Full Name
                    </label>
                    <div className={styles.inputWithIcon}>
                      <MdPerson className={styles.inputIcon} />
                      <input
                        id="tutor-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`${styles.inputField} ${styles.nameInput} ${
                          errors.name ? styles.inputError : ""
                        }`}
                        placeholder="Full Name"
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={
                          errors.name ? "name-error" : undefined
                        }
                      />
                    </div>
                    {errors.name && (
                      <span
                        id="name-error"
                        className={styles.errorMessage}
                        role="alert"
                      >
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="tutor-gender" className={styles.inputLabel}>
                      Gender
                    </label>
                    <select
                      id="tutor-gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`${styles.inputField} ${
                        errors.gender ? styles.inputError : ""
                      }`}
                      aria-required="true"
                      aria-invalid={!!errors.gender}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </select>
                    {errors.gender && (
                      <span className={styles.errorMessage} role="alert">
                        {errors.gender}
                      </span>
                    )}

                    {formData.gender === "others" && (
                      <>
                        <input
                          type="text"
                          name="customGender"
                          placeholder="Specify your gender"
                          value={formData.customGender}
                          onChange={handleInputChange}
                          className={`${styles.inputField} ${
                            errors.customGender ? styles.inputError : ""
                          }`}
                          aria-required="true"
                        />
                        {errors.customGender && (
                          <span className={styles.errorMessage} role="alert">
                            {errors.customGender}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label
                      htmlFor="tutor-qualification"
                      className={styles.inputLabel}
                    >
                      Qualification
                    </label>
                    <input
                      id="tutor-qualification"
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className={styles.inputField}
                      placeholder="e.g., B.Sc in Mathematics"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className={styles.userName}>{formData.name}</h2>
                  <p className={styles.userEmail}>
                    <MdEmail className={styles.inlineIcon} />
                    {formData.email}
                  </p>
                  <p>
                    <strong>Gender:</strong>{" "}
                    <span style={{ color: "#606060" }}>
                      {getDisplayGender()}
                    </span>
                  </p>
                  <p>
                    <strong>Qualification:</strong>{" "}
                    <span style={{ color: "#606060" }}>
                      {formData.qualification || "Not specified"}
                    </span>
                  </p>
                </>
              )}

              {user?.role === "tutor" && (
                <div
                  className={styles.profileStats}
                  role="list"
                  aria-label="Profile statistics"
                >
                  <div className={styles.statItem} role="listitem">
                    <div className={styles.statIconWrapper}>
                      <FaStar className={styles.statIcon} />
                    </div>
                    <div className={styles.statContent}>
                      <span
                        className={styles.statValue}
                        aria-label={`Rating: ${formData.rating} out of 5`}
                      >
                        {formData.rating?.toFixed(1) || "0.0"}
                      </span>
                      <span className={styles.statLabel} aria-hidden="true">
                        Rating
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bio Section */}
        <section className={styles.profileCard} aria-labelledby="bio-heading">
          <h3 id="bio-heading" className={styles.cardTitle}>
            <MdInfo className={styles.titleIcon} />
            About Me
          </h3>
          {isEditing ? (
            <div className={styles.inputGroup}>
              <label htmlFor="tutor-bio" className="sr-only">
                Tell students about yourself
              </label>
              <textarea
                id="tutor-bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={`${styles.inputField} ${styles.textareaField}`}
                placeholder="Tell students about yourself, your teaching style, and experience..."
                rows="6"
                aria-describedby="bio-help"
              />
              <span id="bio-help" className={styles.helpText}>
                Describe your teaching experience and approach
              </span>
            </div>
          ) : (
            <p className={styles.bioText}>
              {formData.bio || "No bio added yet."}
            </p>
          )}
        </section>

        {/* Subjects Section */}
        <section className={styles.profileCard}>
          <h3 className={styles.cardTitle}>
            <BiBookOpen className={styles.titleIcon} />
            Subjects I{user?.role === "tutor" ? " Teach" : "'m Interested In"}
          </h3>

          {isEditing ? (
            <>
              <div className={styles.subjectsGrid}>
                {paginatedSubjects.map((subject) => {
                  const selected = selectedSubjects.some(
                    (s) => s.id === subject.id
                  );

                  return (
                    <label
                      key={subject.id}
                      className={`${styles.subjectCheckbox} ${
                        selected ? styles.subjectCheckboxActive : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleSubjectToggle(subject)}
                        className={styles.checkboxInput}
                      />
                      {selected && (
                        <FaCheckCircle className={styles.checkIcon} />
                      )}
                      <span className={styles.subjectLabel}>
                        {subject.name}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Pagination buttons */}
              {availableSubjects.length > subjectsPerPage && (
                <div className={styles.pagination}>
                  <CircleArrowLeft
                    cursor={subjectPage === 0 ? "not-allowed" : "pointer"}
                    opacity={subjectPage === 0 ? 0.5 : 1}
                    onClick={() =>
                      subjectPage > 0 && setSubjectPage(subjectPage - 1)
                    }
                    size={32}
                    color="#ff5900"
                  />
                  <span>
                    Page {subjectPage + 1} of{" "}
                    {Math.ceil(availableSubjects.length / subjectsPerPage)}
                  </span>
                  <CircleArrowRight
                    cursor={
                      (subjectPage + 1) * subjectsPerPage >=
                      availableSubjects.length
                        ? "not-allowed"
                        : "pointer"
                    }
                    opacity={
                      (subjectPage + 1) * subjectsPerPage >=
                      availableSubjects.length
                        ? 0.5
                        : 1
                    }
                    onClick={() =>
                      (subjectPage + 1) * subjectsPerPage <
                        availableSubjects.length &&
                      setSubjectPage(subjectPage + 1)
                    }
                    size={32}
                    color="#ff5900"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {selectedSubjects.length > 0 ? (
                <>
                  <div className={styles.subjectsDisplay}>
                    {paginatedSelectedSubjects.map((subject) => (
                      <span key={subject.id} className={styles.subjectTag}>
                        <FaCheckCircle className={styles.tagIcon} />
                        {subject.name}
                      </span>
                    ))}
                  </div>

                  {selectedSubjects.length > subjectsPerPage && (
                    <div className={styles.pagination}>
                      <CircleArrowLeft
                        cursor={
                          selectedSubjectsPage === 0 ? "not-allowed" : "pointer"
                        }
                        opacity={selectedSubjectsPage === 0 ? 0.5 : 1}
                        onClick={() =>
                          selectedSubjectsPage > 0 &&
                          setSelectedSubjectsPage(selectedSubjectsPage - 1)
                        }
                        size={32}
                        color="#ff5900"
                      />
                      <span>
                        Page {selectedSubjectsPage + 1} of{" "}
                        {Math.ceil(selectedSubjects.length / subjectsPerPage)}
                      </span>
                      <CircleArrowRight
                        cursor={
                          (selectedSubjectsPage + 1) * subjectsPerPage >=
                          selectedSubjects.length
                            ? "not-allowed"
                            : "pointer"
                        }
                        opacity={
                          (selectedSubjectsPage + 1) * subjectsPerPage >=
                          selectedSubjects.length
                            ? 0.5
                            : 1
                        }
                        onClick={() =>
                          (selectedSubjectsPage + 1) * subjectsPerPage <
                            selectedSubjects.length &&
                          setSelectedSubjectsPage(selectedSubjectsPage + 1)
                        }
                        size={32}
                        color="#ff5900"
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.noData}>No subjects selected.</p>
              )}
            </>
          )}
        </section>

        {/* Availability Section */}
        {user?.role === "tutor" && (<section className={styles.profileCard}>
          <h3 className={styles.cardTitle}>
            <IoMdTime className={styles.titleIcon} />
            Availability
          </h3>

          {isEditing ? (
            <>
              {formData.availability.length === 0 ? (
                <p className={styles.noData}>
                  No availability slots added. Click "Add Availability Day" to
                  get started.
                </p>
              ) : (
                formData.availability.map((slot, index) => (
                  <div key={index} className={styles.availabilityCard}>
                    {/* DATE */}
                    <div>
                      <label htmlFor={`date-${index}`} className={styles.label}>
                        Date
                      </label>
                      <input
                        id={`date-${index}`}
                        type="date"
                        value={slot.date}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "date",
                            e.target.value
                          )
                        }
                        className={styles.inputField}
                      />
                    </div>

                    {/* AVAILABLE */}
                    <div className={styles.availabilityCheckboxWrapper}>
                      <label
                        htmlFor={`available-${index}`}
                        className={styles.label}
                      >
                        Available
                      </label>
                      <input
                        id={`available-${index}`}
                        type="checkbox"
                        checked={slot.available}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "available",
                            e.target.checked
                          )
                        }
                      />
                    </div>

                    {/* TIME RANGE */}
                    {slot.available && (
                      <>
                        <div>
                          <label
                            htmlFor={`start-${index}`}
                            className={styles.label}
                          >
                            Start Time
                          </label>
                          <input
                            id={`start-${index}`}
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              handleAvailabilityChange(
                                index,
                                "start",
                                e.target.value
                              )
                            }
                            className={`${styles.inputField} ${
                              errors[`availability_${index}_start`] ||
                              errors[`availability_${index}_time`]
                                ? styles.inputError
                                : ""
                            }`}
                            aria-invalid={
                              !!(
                                errors[`availability_${index}_start`] ||
                                errors[`availability_${index}_time`]
                              )
                            }
                          />
                          {errors[`availability_${index}_start`] && (
                            <span className={styles.errorMessage} role="alert">
                              {errors[`availability_${index}_start`]}
                            </span>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor={`end-${index}`}
                            className={styles.label}
                          >
                            End Time
                          </label>
                          <input
                            id={`end-${index}`}
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              handleAvailabilityChange(
                                index,
                                "end",
                                e.target.value
                              )
                            }
                            className={`${styles.inputField} ${
                              errors[`availability_${index}_end`] ||
                              errors[`availability_${index}_time`]
                                ? styles.inputError
                                : ""
                            }`}
                            aria-invalid={
                              !!(
                                errors[`availability_${index}_end`] ||
                                errors[`availability_${index}_time`]
                              )
                            }
                          />
                          {errors[`availability_${index}_end`] && (
                            <span className={styles.errorMessage} role="alert">
                              {errors[`availability_${index}_end`]}
                            </span>
                          )}
                          {errors[`availability_${index}_time`] && (
                            <span className={styles.errorMessage} role="alert">
                              {errors[`availability_${index}_time`]}
                            </span>
                          )}
                        </div>
                      </>
                    )}

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      className={styles.btnDelete}
                      onClick={() => removeAvailabilityRow(index)}
                      aria-label={`Remove availability slot ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={addAvailabilityRow}
                className={styles.btnSecondary}
                aria-label="Add new availability slot"
              >
                + Add Availability Day
              </button>
            </>
          ) : (
            <div className={styles.availabilityDisplay}>
              {formData.availability.length > 0 ? (
                formData.availability.map((slot, index) => (
                  <div key={index} className={styles.availabilityItem}>
                    <MdSchedule className={styles.availabilityIcon} />
                    <p>
                      <strong>{slot.date || "No date set"}</strong>
                      <br />
                      {slot.available
                        ? `${formatTime(slot.start) || "--:--"} to ${
                            formatTime(slot.end) || "--:--"
                          }`
                        : "Not available"}
                    </p>
                  </div>
                ))
              ) : (
                <p className={styles.noData}>No availability data available.</p>
              )}
            </div>
          )}
        </section>)
}
        {isEditing && (
          <div
            className={styles.formActions}
            role="group"
            aria-label="Form actions"
          >
            <button
              type="submit"
              className={styles.btnPrimary}
              aria-label="Save profile changes"
            >
              <FaCheckCircle />
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TutorProfile;
