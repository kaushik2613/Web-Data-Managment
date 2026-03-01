// pages/SignUp.js
import React from 'react';
import SignUpComponent from '../components/Auth/SignUp';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const navigate = useNavigate();
    const handleToggleMode = () => {
    navigate('/signin');
  };

  return <SignUpComponent onToggleMode={handleToggleMode} />;
};

export default SignUp;