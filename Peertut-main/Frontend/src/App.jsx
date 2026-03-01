// App.js
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './hooks/useToast';
import Navbar from './components/landing/Navbar/Navbar';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import ToastContainer from './components/Toast/ToastContainer';
import UserProfile from './pages/profile/UserProfile';
import SessionsPage from './pages/Sessions/SessionsPage';
import MySessions from './pages/Student/MySessions/MySessions';
import FindTutors from './pages/Student/FindTutors/FindTutors';
import Plans from './pages/Student/Plans/Plans';
import Checkout from './pages/Student/Checkout/Checkout';
import TutorProfile from './pages/Student/TutorProfile/TutorProfile';
import Chat from './pages/Student/Chat/Chat';
import NotFound from './pages/NotFound/NotFound';

// Component that uses the toast hook
const AppContent = () => {
  return (
    <Layout>
      <Navbar />
      <main id="main-content" tabIndex={-1} role="main" aria-label="Main content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/my-sessions" element={<MySessions />} />
          <Route path="/find-tutors" element={<FindTutors />} />
          <Route path="/find-tutors/book-session" element={<Checkout />} />
          <Route path="/find-tutors/tutor-profile" element={<TutorProfile />} />
          <Route path="/find-tutors/message" element={<Chat />} />
          <Route path="/plans" element={<Plans />} />
        </Routes>
      </main>
      <ToastContainer />
    </Layout>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;