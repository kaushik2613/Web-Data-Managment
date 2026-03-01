// context/AuthContextProvider.js
import { useState } from 'react';
import { AuthContextProvider } from './AuthContextProvider';
import { useAxios } from '../hooks/useAxios';

export const AuthProvider = ({ children }) => {
  const { request } = useAxios();
  const [loading, setLoading] = useState(false);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const data = await request({
        url: "/auth/signin",
        method: "POST",
        body: { email, password },
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ name, email, password, role, gender }) => {
    setLoading(true);
    try {
      const data = await request({
        url: "/auth/signup",
        method: "POST",
        body: { name, email, password, role, gender },
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = { signIn, signUp, logout, loading };

  return (
    <AuthContextProvider.Provider value={value}>
      {children}
    </AuthContextProvider.Provider>
  );
};