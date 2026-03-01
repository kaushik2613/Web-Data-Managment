// components/Auth/SignIn.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import Input from "../Input/Input";
import Button from "../Button/Button";
import styles from "./Auth.module.css";
import { useNavigate } from "react-router-dom";

const SignIn = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  // Focus management for accessibility
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField === "email" && emailInputRef.current) {
        emailInputRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const responseData = await signIn(formData.email, formData.password);
      toast.success(`${responseData?.message}`);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err?.message || "Invalid email or password";
      toast.error(errorMessage);
      setErrors((prev) => ({
        ...prev,
        email: "Invalid credentials",
        password: "Invalid credentials",
      }));

      // Focus email field on error for better UX
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Escape key clears form
    if (e.key === "Escape") {
      setFormData({ email: "", password: "" });
      setErrors({});
    }
  };

  return (
    <main
      className={styles.authContainer}
      role="main"
      aria-label="Sign in form"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Sign In</h1>
        <p className={styles.authSubtitle}>
          Access your account to continue learning
        </p>

        <form
          role="form"
          className={styles.authForm}
          onSubmit={handleSubmit}
          noValidate
          aria-describedby="signin-instructions"
        >
          <span id="signin-instructions" className={styles.srOnly}>
            Please enter your email and password to sign in. All fields are
            required.
          </span>

          <Input
            ref={emailInputRef}
            id="signin-email"
            label="Email address"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            aria-describedby={errors.email ? "signin-email-error" : undefined}
            aria-invalid={!!errors.email}
            className={styles.focusable}
          />
          {errors.email && (
            <span id="signin-email-error" className={styles.srOnly}>
              Error: {errors.email}
            </span>
          )}

          <Input
            id="signin-password"
            label="Password-SignIn"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            aria-describedby={
              errors.password ? "signin-password-error" : undefined
            }
            aria-invalid={!!errors.password}
            className={styles.focusable}
          />
          {errors.password && (
            <span id="signin-password-error" className={styles.srOnly}>
              Error: {errors.password}
            </span>
          )}

          <Button
            text="Sign In"
            variant="primary"
            type="submit"
            loading={loading || isSubmitting}
            className={styles.submitButton}
            aria-disabled={loading || isSubmitting}
          />
        </form>
        
        <div className={styles.authFooter}>
          <p>
            Don't have an account?{" "}
            <button
              type="button"
              className={`${styles.toggleButton} ${styles.focusable}`}
              onClick={() => onToggleMode?.("signup")}
              aria-label="Create a new account"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default SignIn;
