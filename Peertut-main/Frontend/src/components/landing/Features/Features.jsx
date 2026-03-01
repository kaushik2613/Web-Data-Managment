// components/landing/Features/Features.jsx
import React from 'react';
import styles from './Features.module.css';
import FeatureCard from '../FeatureCard/FeatureCard';
import { FaUserGraduate, FaRobot, FaChartLine } from 'react-icons/fa';

function Features() {
  const features = [
    {
      id: 1,
      icon: <FaUserGraduate aria-hidden="true" focusable="false" />,
      title: 'Find Expert Tutors',
      description: 'Connect with top-rated peer tutors in your subjects.',
    },
    {
      id: 2,
      icon: <FaRobot aria-hidden="true" focusable="false" />,
      title: 'AI Chatbot',
      description: 'Get assistance from AI powered chatbot for any queries.',
    },
    {
      id: 3,
      icon: <FaChartLine aria-hidden="true" focusable="false" />,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics.',
    },
  ];

  return (
    <section
      id="features"
      className={styles.features}
      role="region"
      aria-label="Features"
      tabIndex={-1}
    >
      <h2 className={styles.title}>Everything You Need to Succeed</h2>
      <div className={styles.cards}>
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}

export default Features;
