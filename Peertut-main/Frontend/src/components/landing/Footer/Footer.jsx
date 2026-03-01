// components/Footer/Footer.js
import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Brand & Contact Section */}
        <div className={styles.brandSection}>
          <div>
            <h3 className={styles.brandName}>PeerTut</h3>
            <p className={styles.tagline}>
              Connecting learners with expert tutors for personalized growth
            </p>
          </div>

          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Email:</span>
              <a
                href="mailto:support@peertut.com"
                className={styles.contactLink}
              >
                support@peertut.com
              </a>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Address:</span>
              <address className={styles.address}>
                123 Education Lane
                <br />
                Learning City, LC 10101
                <br />
                Knowledge State
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContent}>
          <p className={styles.copyright}>
            © {currentYear} PeerTut. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
