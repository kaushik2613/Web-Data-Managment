// pages/Dashboard.js
import { useAuth } from '../hooks/useAuth';
import TutorDashboard from '../components/Dashboard/TutorDashboard';
import StudentDashboard from './Student/Dashboard/StudentDashboard';
import ChatbotWidget from '../components/ChatBot/ChatbotWidget';
import { getUserData } from '../utils/localStorage';

const Dashboard = () => {
  const user  = getUserData();

  return (
    <>
      <div style={{ minHeight: '100vh' }}>
        {/* Role-Specific Content */}
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {user.role === 'student' && (
            <StudentDashboard />
          )}
          
          {user.role === 'tutor' && (
            <TutorDashboard user={user} />
          )}
        </div>
      </div>
      
      {/* Chatbot Widget - Fixed position */}
      <ChatbotWidget geminiApiKey={""} />
    </>
  );
};

export default Dashboard;