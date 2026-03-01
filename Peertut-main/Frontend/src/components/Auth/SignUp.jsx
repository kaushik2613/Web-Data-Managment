// components/Auth/SignUp.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import Input from "../Input/Input";
import Button from "../Button/Button";
import styles from "./Auth.module.css";
import { useNavigate } from "react-router-dom";

const SignUp = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    gender: "male",
    customGender: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const nameInputRef = useRef(null);
  const mainContainerRef = useRef(null);

  // Focus management for accessibility
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Include uppercase, lowercase, and numbers";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.gender === "other" && !formData.customGender.trim()) {
      newErrors.customGender = "Please specify your gender";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get fresh validation errors instead of using stale state
    const errorsObj = validateForm();

    if (Object.keys(errorsObj).length > 0) {
      const firstErrorField = Object.keys(errorsObj)[0];

      // Focus first invalid field
      if (firstErrorField === "name" && nameInputRef.current) {
        nameInputRef.current.focus();
      } else {
        document.getElementsByName(firstErrorField)[0]?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const genderValue =
        formData.gender === "other"
          ? formData.customGender.trim()
          : formData.gender;

      const responseData = await signUp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        gender: genderValue,
      });

      toast.success(responseData?.message);
      navigate("/SignIn");
    } catch (err) {
      const errorMessage =
        err?.message || "Could not create account. Please try again.";

      toast.error(errorMessage);

      // Handle duplicate email
      if (
        err?.message?.includes("email") ||
        err?.code === "auth/email-already-in-use"
      ) {
        setErrors((prev) => ({ ...prev, email: "Email already in use" }));
        document.getElementsByName("email")[0]?.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Escape key clears form
    if (e.key === "Escape") {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
      });
      setErrors({});
    }
  };

  return (
    <main
      ref={mainContainerRef}
      className={styles.authContainer}
      role="main"
      aria-label="Sign up form"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Create Account</h1>
        <p className={styles.authSubtitle}>Join our learning platform today</p>

        <form
          className={styles.authForm}
          onSubmit={handleSubmit}
          noValidate
          aria-describedby="signup-instructions"
        >
          <span id="signup-instructions" className={styles.srOnly}>
            Please fill in all fields to create your account. All fields are
            required.
          </span>

          <Input
            ref={nameInputRef}
            id="signup-name"
            label="Full name"
            name="name"
            required
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            aria-describedby={errors.name ? "signup-name-error" : undefined}
            aria-invalid={!!errors.name}
            className={styles.focusable}
          />
          {errors.name && (
            <span id="signup-name-error" className={styles.srOnly}>
              Error: {errors.name}
            </span>
          )}

          <Input
            id="signup-email"
            label="Email address"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            aria-invalid={!!errors.email}
            className={styles.focusable}
          />
          {errors.email && (
            <span id="signup-email-error" className={styles.srOnly}>
              Error: {errors.email}
            </span>
          )}

          <Input
            id="signup-password"
            label="Password"
            type="password"
            name="password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            aria-describedby={
              errors.password
                ? "signup-password-error"
                : "password-requirements"
            }
            aria-invalid={!!errors.password}
            className={styles.focusable}
          />
          <span id="password-requirements" className={styles.srOnly}>
            Password must be at least 6 characters and include uppercase
            letters, lowercase letters, and numbers.
          </span>
          {errors.password && (
            <span id="signup-password-error" className={styles.srOnly}>
              Error: {errors.password}
            </span>
          )}

          <Input
            id="signup-confirm"
            label="Confirm password"
            type="password"
            name="confirmPassword"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "signup-confirm-error" : undefined
            }
            aria-invalid={!!errors.confirmPassword}
            className={styles.focusable}
          />
          {errors.confirmPassword && (
            <span id="signup-confirm-error" className={styles.srOnly}>
              Error: {errors.confirmPassword}
            </span>
          )}

          <fieldset className={styles.radioGroup}>
            <legend className={styles.radioLegend}>Gender</legend>

            <div className={styles.radioOptions} role="radiogroup">
              {/* Male */}
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                />
                <span>Male</span>
              </label>

              {/* Female */}
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                />
                <span>Female</span>
              </label>

              {/* Other */}
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === "other"}
                  onChange={handleChange}
                />
                <span>Other</span>
              </label>
            </div>

            {/* Show custom gender input only if "other" is selected */}
            {formData.gender === "other" && (
              <Input
                id="custom-gender"
                label="Please specify"
                name="customGender"
                value={formData.customGender}
                onChange={handleChange}
                error={errors.customGender}
                className={styles.focusable}
              />
            )}
          </fieldset>

          <fieldset className={styles.radioGroup}>
            <legend className={styles.radioLegend}>Account type</legend>
            <div
              className={styles.radioOptions}
              role="radiogroup"
              aria-label="Select your account type"
            >
              <label className={styles.radioOption} htmlFor="role-student">
                <input
                  id="role-student"
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === "student"}
                  onChange={handleChange}
                  className={styles.focusable}
                  aria-checked={formData.role === "student"}
                />
                <span>Student</span>
              </label>

              <label className={styles.radioOption} htmlFor="role-tutor">
                <input
                  id="role-tutor"
                  type="radio"
                  name="role"
                  value="tutor"
                  checked={formData.role === "tutor"}
                  onChange={handleChange}
                  className={styles.focusable}
                  aria-checked={formData.role === "tutor"}
                />
                <span>Tutor</span>
              </label>
            </div>
          </fieldset>

          <Button
            text="Create Account"
            variant="primary"
            type="submit"
            loading={loading || isSubmitting}
            className={styles.submitButton}
            aria-disabled={loading || isSubmitting}
          />
        </form>

        <div className={styles.authFooter}>
          <p>
            Already have an account?{" "}
            <button
              type="button"
              className={`${styles.toggleButton} ${styles.focusable}`}
              onClick={() => onToggleMode?.("signin")}
              aria-label="Sign in to your existing account"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default SignUp;
