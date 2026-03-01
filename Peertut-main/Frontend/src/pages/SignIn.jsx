// pages/SignIn.js
import React from 'react';
import SignInComponent from '../components/Auth/SignIn';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
    const navigate = useNavigate();
    const handleToggleMode = () => {
    navigate('/signup');
  };

  return <SignInComponent onToggleMode={handleToggleMode} />;
};

export default SignIn;