// components/Input/Input.jsx
import React, { forwardRef, useId, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './Input.module.css';

const Input = forwardRef(({
  id,
  label,
  type = 'text',
  error,
  helperText,
  required,
  className = '',
  autoComplete,
  ...props
}, ref) => {
  const autoId = useId();
  const inputId = id || `inp-${autoId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helperText ? `${inputId}-help` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const visibleType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}{required ? ' *' : ''}
        </label>
      )}

      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          ref={ref}
          className={`${styles.input} ${error ? 'error' : ''} ${className}`}
          type={visibleType}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          autoComplete={isPassword ? (autoComplete || 'current-password') : autoComplete}
          spellCheck={isPassword && showPassword ? 'false' : undefined}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <FiEyeOff aria-hidden="true" focusable="false" />
            ) : (
              <FiEye aria-hidden="true" focusable="false" />
            )}
          </button>
        )}
      </div>

      {helperText && (
        <div id={helpId} className={styles.helpText}>
          {helperText}
        </div>
      )}

      {error && (
        <div id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
