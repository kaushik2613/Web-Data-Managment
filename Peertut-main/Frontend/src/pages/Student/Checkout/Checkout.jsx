import React, { useState } from "react";
import styles from "./Checkout.module.css";
import { useNavigate } from "react-router-dom";

const Checkout = ({ tutor: propTutor, onBack: propOnBack }) => {
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

  const [selectedSlot, setSelectedSlot] = useState("");
  const [duration, setDuration] = useState("1");

  const availableSlots = [
    "2025-10-21 10:00 AM",
    "2025-10-21 2:00 PM",
    "2025-10-23 11:00 AM",
    "2025-10-23 4:00 PM",
  ];

  const handleBook = () => {
    if (!selectedSlot || !duration) {
      alert("Please select a time slot and duration.");
      return;
    }
    // Simulate booking
    alert(
      `Booked ${duration} hour session with ${
        tutor.name
      } on ${selectedSlot} for $${tutor.price * parseInt(duration)}.`
    );
    onBack();
  };

  return (
    <div className={styles.checkoutContainer} role="main" aria-label="Checkout">
      <header className={styles.checkoutHeader}>
        <h1>Book Session with {tutor.name}</h1>
        <p>Confirm your tutoring session details</p>
        <button onClick={onBack} className={styles.btnBack}>
          ← Back to Tutors
        </button>
      </header>

      <section className={styles.checkoutForm}>
        <div className={styles.tutorSummary}>
          <div className={styles.tutorImage}>
            <img src={tutor.image} alt={`Profile of ${tutor.name}`} />
          </div>
          <div>
            <h2>{tutor.name}</h2>
            <span className={styles.tutorSubject}>{tutor.subject}</span>
            <div className={styles.stars}>
              {"★".repeat(Math.floor(tutor.rating))}
              <span style={{ opacity: 0.5 }}>
                {"★".repeat(5 - Math.floor(tutor.rating))}
              </span>
              ({tutor.reviews} reviews)
            </div>
            <div className={styles.price}>${tutor.price}/hr</div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="slot-select">Select Time Slot</label>
          <select
            id="slot-select"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
          >
            <option value="">Choose a slot</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="duration-select">Session Duration (hours)</label>
          <select
            id="duration-select"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="1">1 hour</option>
            <option value="1.5">1.5 hours</option>
            <option value="2">2 hours</option>
          </select>
        </div>

        <div className={styles.total}>
          <strong>Total: ${tutor.price * parseInt(duration)}</strong>
        </div>

        <button onClick={handleBook} className={styles.btnConfirm}>
          Confirm & Pay
        </button>
      </section>
    </div>
  );
};

export default Checkout;
