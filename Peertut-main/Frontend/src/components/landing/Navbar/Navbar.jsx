// components/landing/Navbar/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
} from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import styles from "./Navbar.module.css";
import { useAuth } from "../../../hooks/useAuth";
import { getUserData } from "../../../utils/localStorage";

function Navbar() {
  const [activeLink, setActiveLink] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const menuButtonRef = useRef(null);
  const navLinksRef = useRef(null);
  const { logout } = useAuth();
  const user = getUserData();
  const navigate = useNavigate();
  const location = useLocation();

  const commonLinks = [
    { id: 1, path: "home", text: "Home" },
    { id: 2, path: "features", text: "Features" },
    { id: 3, path: "howItWorks", text: "How It Works" },
  ];

  const tutorLinks = [
    { id: 1, path: "/dashboard", text: "Dashboard" },
    { id: 2, path: "/sessions", text: "Sessions" },
    { id: 3, path: "/profile", text: "Profile", icon: <FaUser /> },
  ];

  const studentLinks = [
    { id: 1, path: "/dashboard", text: "Dashboard" },
    { id: 2, path: "/my-sessions", text: "My Sessions" },
    { id: 3, path: "/plans", text: "Plans" },
    { id: 4, path: "/find-tutors", text: "Find Tutors" },
    { id: 5, path: "/profile", text: "Profile", icon: <FaUser /> },
  ];

  const getCurrentLinks = () => {
    if (!user) return commonLinks;
    return user.role === "tutor" ? tutorLinks : studentLinks;
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const onChange = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // Set active link based on current route
    const currentPath = location.pathname;
    if (currentPath === "/") {
      setActiveLink("home");
    } else {
      // Find which link matches the current path
      const links = getCurrentLinks();
      const active = links.find((link) => link.path === currentPath);
      if (active) {
        setActiveLink(active.path);
      }
    }
  }, [location.pathname, user]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    // Move focus to first menu item when opening
    if (isMenuOpen && navLinksRef.current) {
      const first = navLinksRef.current.querySelector(
        'button, [href], [tabindex="0"]'
      );
      first?.focus();
    }
    // Restore focus to toggle on close
    if (!isMenuOpen) menuButtonRef.current?.focus();
  }, [isMenuOpen]);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({
          behavior: isReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        setActiveLink(sectionId);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location, isReducedMotion]);

  const handleScroll = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
      setIsMenuOpen(false);
      return;
    }
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: isReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      setActiveLink(sectionId);
      setIsMenuOpen(false);
      // Lightweight polite announcement
      const live = document.createElement("div");
      live.setAttribute("aria-live", "polite");
      live.className = "sr-only";
      live.textContent = `Navigated to ${
        section.getAttribute("aria-label") || sectionId
      }`;
      document.body.appendChild(live);
      setTimeout(
        () => document.body.contains(live) && document.body.removeChild(live),
        1000
      );
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setActiveLink(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
    setActiveLink("home");
  };


  // const isLinkActive = (linkPath) => location.pathname === "/" && activeLink === linkPath;
  const isLinkActive = (linkPath) => {
    if (location.pathname === "/") {
      return activeLink === linkPath;
    }
    return activeLink === linkPath;
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} role="navigation" aria-label="Primary">
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>PeerTut</h1>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          <span className={styles.hamburger} aria-hidden="true">
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </span>
        </button>

        {/* Overlay for mobile (click to close) */}
        {isMenuOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <div
          id="primary-navigation"
          ref={navLinksRef}
          className={`${styles.links} ${isMenuOpen ? styles.linksOpen : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsMenuOpen(false);
              menuButtonRef.current?.focus();
            }
          }}
        >
          {/* Landing buttons that scroll */}
          {!user &&
            commonLinks.map(({ id, path, text, icon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.link} ${
                  isLinkActive(path) ? styles.active : ""
                }`}
                aria-current={isLinkActive(path) ? "page" : undefined}
                onClick={() => handleScroll(path)}
              >
                {icon && icon}
                {text}
              </button>
            ))}

          {/* Authenticated nav */}
          {user &&
            getCurrentLinks().map(({ id, path, text, icon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.link} ${
                  isLinkActive(path) ? styles.active : ""
                }`}
                aria-current={isLinkActive(path) ? "page" : undefined}
                onClick={() => handleNavigation(path)}
              >
                {icon && icon}
                {text}
              </button>
            ))}

          {user && (
            <button
              type="button"
              className={`${styles.link} ${styles.logoutLink}`}
              onClick={handleLogout}
            >
              <IoLogOutOutline aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;