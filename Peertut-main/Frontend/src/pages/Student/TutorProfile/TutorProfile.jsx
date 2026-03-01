import React, { use } from "react";
import styles from "./TutorProfile.module.css";
import { useNavigate } from "react-router-dom";

const TutorProfile = ({ tutor: propTutor, onBack: propOnBack }) => {
  const navigate = useNavigate();

  const dummyTutor = {
    id: 1,
    name: "Dr. Sarah Chen",
    subject: "Mathematics",
    rating: 4.8,
    reviews: 127,
    price: 45,
    availability: "Mon, Wed, Fri",
    bio: "PhD in Mathematics with 5 years teaching experience. Specialized in Calculus and Linear Algebra.",
    image: "/tutor.png",
  };

  const dummyOnBack = () => {
    console.log("Back to tutors list");
    navigate(-1);
    // In a real app, this would navigate back
  };

  const tutor = propTutor || dummyTutor;
  const onBack = propOnBack || dummyOnBack;

  const otherCourses = [
    { subject: "Advanced Calculus", price: 50 },
    { subject: "Statistics", price: 40 },
    { subject: "Geometry", price: 45 },
  ];

  return (
    <div
      className={styles.profileContainer}
      role="main"
      aria-label="Tutor Profile"
    >
      <header className={styles.profileHeader}>
        <h1>{tutor.name}'s Profile</h1>
        <button onClick={onBack} className={styles.btnBack}>
          ← Back to Tutors
        </button>
      </header>

      <section className={styles.profileMain}>
        <div className={styles.profileImage}>
          <img src={tutor.image} alt={`Profile of ${tutor.name}`} />
        </div>
        <div className={styles.profileInfo}>
          <h2>{tutor.name}</h2>
          <div className={styles.subjectBadge}>{tutor.subject}</div>
          <div className={styles.rating}>
            <span className={styles.stars}>
              {"★".repeat(Math.floor(tutor.rating))}
              <span style={{ opacity: 0.5 }}>
                {"★".repeat(5 - Math.floor(tutor.rating))}
              </span>
            </span>
            <span>({tutor.reviews} reviews)</span>
          </div>
          <p className={styles.bio}>{tutor.bio}</p>
          <div className={styles.details}>
            <div className={styles.detail}>
              <strong>Rate:</strong> ${tutor.price}/hr
            </div>
            <div className={styles.detail}>
              <strong>Availability:</strong> {tutor.availability}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.otherCourses}>
        <h3>Other Courses Offered</h3>
        <div className={styles.coursesGrid}>
          {otherCourses.map((course, index) => (
            <div key={index} className={styles.courseCard}>
              <h4>{course.subject}</h4>
              <div className={styles.coursePrice}>${course.price}/hr</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TutorProfile;
