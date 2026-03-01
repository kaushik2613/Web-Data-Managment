# 🎓 PeerTut - Phase 2 Frontend Implementation

> A modern, accessible, and responsive peer-to-peer tutoring platform built with React

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![WCAG](https://img.shields.io/badge/WCAG-2.1_AA-green?style=for-the-badge)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)  
- [Features](#-features)  
- [User Flow](#-user-flow)  
- [Accessibility Features](#-accessibility-features)  
- [Responsive Design](#-responsive-design)  
- [Installation & Running Application Guide](#-installation--running-application-guide)

---

## 🎯 Project Overview

**PeerTut** is a comprehensive peer-to-peer tutoring platform that connects students with qualified tutors for personalized learning experiences.  
Phase 2 focuses on the complete frontend implementation using **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **Recharts**, with accessibility and responsiveness as core priorities.

### 🌟 What Makes PeerTut Special?

- **Role-Based Dashboards** – Separate interfaces for students and tutors  
- **Real-Time Analytics** – Dynamic data visualizations using Recharts  
- **Study Plan Management** – Create, track, and complete study plans  
- **AI-Powered Chatbot** – Gemini AI integration for instant learning support  
- **Accessibility First** – WCAG 2.1 AA compliant with ARIA roles and focus control  
- **Responsive Design** – Optimized for mobile, tablet, and desktop devices  

---

## ✨ Features

### Authentication & Authorization
- Secure signup/login with role selection  
- JWT-based authentication  
- Protected routes for each user type  
- Session persistence and automatic logout on token expiry  

### Student Dashboard
- Overview cards for sessions, study hours, and progress  
- Upcoming sessions with countdown timers  
- Study plan widget and AI chatbot integration  

### Tutor Dashboard
- Earnings and performance analytics  
- Session scheduling and management  
- Availability and profile management  

### Find Tutors
- Real-time search and filtering  
- Tutor profiles with ratings, subjects, and prices  
- Direct booking and in-app messaging  

### Study Planner
- Create, edit, and delete study plans  
- Progress tracking with visual indicators  
- Overdue detection and completion reminders  
- AI-generated recommendations for study plans  

### AI Chatbot
- Floating chatbot interface with modal design  
- Integrated with Google Gemini API  
- Typing indicators and accessible message display  

---

## 🧭 User Flow

### 1. Getting Started
- User lands on the **home or login page**.
- New users can **sign up** as either a **Student** or **Tutor**.
- Returning users **log in** using their email and password.

### 2. Authentication Flow
- On successful login, a **JWT token** is issued and stored in session.
- Users are redirected to their respective dashboards:
  - **Students → Student Dashboard**
  - **Tutors → Tutor Dashboard**

### 3. Student Journey
1. **Dashboard Overview** – View hours studied, sessions, and progress.  
2. **Find Tutors** – Filter tutors by subject, rating, or price.  
3. **Book Session** – Choose an available slot and confirm the session.  
4. **Manage Study Plan** – Add study goals, mark completed tasks, and track progress.  
5. **AI Assistance** – Interact with the Gemini AI chatbot for personalized learning help.  
6. **Feedback** – Rate tutors and leave reviews after each completed session.

### 4. Tutor Journey
1. **Dashboard Overview** – Monitor earnings, performance, and upcoming sessions.  
2. **Manage Availability** – Set available time slots and session types.  
3. **Session Management** – Accept, reschedule, or cancel sessions.  
4. **Analytics View** – Visualize earnings and engagement trends through charts.  
5. **AI Assistance** – Use the chatbot to get session summaries or communication templates.

### 5. Accessibility & Responsiveness
- All interactions support **keyboard navigation** and **screen readers**.
- Mobile and tablet layouts adapt dynamically to ensure usability across devices.

---

## ♿ Accessibility Features

### WCAG 2.1 Level AA Compliance
- Semantic HTML and ARIA roles for interactive components  
- Full keyboard navigation and focus trapping  
- Screen reader compatibility  
- Skip links, form validation, and high-contrast visuals  

### Keyboard Shortcuts
- `Tab` – Navigate elements  
- `Enter` / `Space` – Activate buttons  
- `Escape` – Close modals  
- `Arrow Keys` – Navigate lists and menus  

---

## 📱 Responsive Design

### Device Support
- **Mobile:** 320px–480px  
- **Tablet:** 481px–1024px  
- **Desktop:** 1025px+  

### Design Patterns
- Mobile-first CSS and grid layouts  
- Fluid typography and flexible components  
- Responsive Recharts and touch-optimized UI  

---

## 🛠 Installation & Running Application Guide

### Installation

- please create a .env file in same structure as .env.example and replace the << PASTE VALUE HERE>> with your corresponding configuration values

```bash
cd frontend
npm install
````

### Run Application

```bash
npm run dev
```

### Access

Open your browser and navigate to:

```
http://localhost:5173
```
## 🧪 Running Unit Tests

PeerTut includes a suite of unit tests to ensure component reliability, accessibility compliance, and functionality across all user flows.

### Run Tests

```bash
cd frontend
npm run test
```

### Run Backend Application

- please create a .env file in same structure as .env.example and replace the << PASTE VALUE HERE >> with your corresponding configuration values

```bash
cd backend
npm i
npm run dev
```

### What’s Covered

* **Component Rendering** – Ensures all key components render correctly.
* **Accessibility Checks** – Verifies ARIA attributes, keyboard navigation, and focus states.
* **Form Validations** – Tests input handling, error states, and submission flows.
* **Dashboard Logic** – Confirms accurate data rendering for both Student and Tutor roles.

> ✅ Tests are run using **Vitest** and **React Testing Library** for fast and reliable results.
