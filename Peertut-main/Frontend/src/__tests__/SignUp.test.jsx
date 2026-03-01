// components/Auth/SignUp.test.jsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';
import { vi } from 'vitest';
import SignUp from '../components/Auth/SignUp';
import { AuthContextProvider } from '../context/AuthContextProvider';

// Mock react-router-dom
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Helper function to render with all providers
const renderWithProviders = (
  ui,
  {
    authValue = {
      signUp: vi.fn(),
      loading: false,
    },
    toastValue = {
      success: vi.fn(),
      error: vi.fn(),
    },
  } = {}
) => {
  return render(
    <BrowserRouter>
      <AuthContextProvider.Provider value={authValue}>
        <ToastContext.Provider value={toastValue}>
          {ui}
        </ToastContext.Provider>
      </AuthContextProvider.Provider>
    </BrowserRouter>
  );
};

describe('SignUp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING TESTS
  // ============================================

  describe('Rendering', () => {
    it('should render signup form with all elements', () => {
      renderWithProviders(<SignUp />);

      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText(/join our learning platform today/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument();
    });

    it('should render role selection radio buttons', () => {
      renderWithProviders(<SignUp />);

      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tutor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/student/i)).toBeChecked(); // Default selection
    });

    it('should render toggle to signin button', () => {
      renderWithProviders(<SignUp />);

      expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in to your existing account/i })).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      renderWithProviders(<SignUp />);

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Sign up form');
      expect(screen.getByRole('group', { name: /account type/i })).toBeInTheDocument();
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe('Accessibility', () => {
    it('should focus name input on mount', () => {
      renderWithProviders(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveFocus();
    });

    it('should have ARIA invalid attributes when there are errors', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignUp />);

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
        expect(confirmInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should associate error messages with fields using aria-describedby', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignUp />);

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i);
        expect(nameInput).toHaveAttribute('aria-describedby', 'signup-name-error');
      });
    });

    it('should have password requirements in aria-describedby', () => {
      renderWithProviders(<SignUp />);

      const passwordInput = screen.getByLabelText(/^password/i);
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-requirements');
    });

    it('should have proper radio button aria-checked states', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignUp />);

      const studentRadio = screen.getByLabelText(/student/i);
      const tutorRadio = screen.getByLabelText(/tutor/i);

      expect(studentRadio).toHaveAttribute('aria-checked', 'true');
      expect(tutorRadio).toHaveAttribute('aria-checked', 'false');

      await user.click(tutorRadio);

      expect(studentRadio).toHaveAttribute('aria-checked', 'false');
      expect(tutorRadio).toHaveAttribute('aria-checked', 'true');
    });
  });

  // ============================================
  // FORM SUBMISSION TESTS
  // ============================================

  describe('Form Submission', () => {

    it('should submit with tutor role when selected', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockResolvedValue({});

      renderWithProviders(<SignUp />, {
        authValue: { signUp: mockSignUp, loading: false },
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const tutorRadio = screen.getByLabelText(/tutor/i);
      
      await user.click(tutorRadio);
      await user.type(nameInput, 'Jane Smith');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'tutor' })
        );
      });
    });

    it('should show error toast on failed signup', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockRejectedValue(new Error('Registration failed'));
      const mockToastError = vi.fn();

      renderWithProviders(<SignUp />, {
        authValue: { signUp: mockSignUp, loading: false },
        toastValue: { success: vi.fn(), error: mockToastError },
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Registration failed');
      });
    });

    it('should not submit form when validation fails', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn();

      renderWithProviders(<SignUp />, {
        authValue: { signUp: mockSignUp, loading: false },
      });

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe('Loading State', () => {

    it('should show loading state during form submission', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<SignUp />, {
        authValue: { signUp: mockSignUp, loading: false },
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);

      expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not submit form multiple times when already submitting', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<SignUp />, {
        authValue: { signUp: mockSignUp, loading: false },
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ============================================
  // ROLE SELECTION TESTS
  // ============================================

  describe('Role Selection', () => {
    it('should default to student role', () => {
      renderWithProviders(<SignUp />);

      const studentRadio = screen.getByLabelText(/student/i);
      expect(studentRadio).toBeChecked();
    });

    it('should allow selecting tutor role', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignUp />);

      const tutorRadio = screen.getByLabelText(/tutor/i);
      await user.click(tutorRadio);

      expect(tutorRadio).toBeChecked();
    });

    it('should switch between roles correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignUp />);

      const studentRadio = screen.getByLabelText(/student/i);
      const tutorRadio = screen.getByLabelText(/tutor/i);

      expect(studentRadio).toBeChecked();
      expect(tutorRadio).not.toBeChecked();

      await user.click(tutorRadio);

      expect(studentRadio).not.toBeChecked();
      expect(tutorRadio).toBeChecked();

      await user.click(studentRadio);

      expect(studentRadio).toBeChecked();
      expect(tutorRadio).not.toBeChecked();
    });
  });

  // ============================================
  // KEYBOARD INTERACTION TESTS
  // ============================================

  describe('Keyboard Interactions', () => {
    it('should clear form when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
      expect(passwordInput).toHaveValue('Password123');
      expect(confirmInput).toHaveValue('Password123');

      await user.keyboard('{Escape}');

      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
      expect(confirmInput).toHaveValue('');
    });

    it('should reset role to default when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignUp />);

      const tutorRadio = screen.getByLabelText(/tutor/i);
      await user.click(tutorRadio);

      expect(tutorRadio).toBeChecked();

      await user.keyboard('{Escape}');

      const studentRadio = screen.getByLabelText(/student/i);
      expect(studentRadio).toBeChecked();
    });

    it('should allow form submission with Enter key', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockResolvedValue({});

      renderWithProviders(<SignUp />, {
        authValue: { signUp: mockSignUp, loading: false },
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // TOGGLE MODE TESTS
  // ============================================

  describe('Toggle to SignIn', () => {
    it('should call onToggleMode with "signin" when sign in button is clicked', async () => {
      const user = userEvent.setup();
      const mockToggleMode = vi.fn();
      
      renderWithProviders(<SignUp onToggleMode={mockToggleMode} />);

      const signInButton = screen.getByRole('button', { name: /sign in to your existing account/i });
      await user.click(signInButton);

      expect(mockToggleMode).toHaveBeenCalledWith('signin');
    });
  });

  // ============================================
  // EDGE CASES & ERROR HANDLING
  // ============================================

  describe('Edge Cases', () => {
    it('should handle signup error without message property', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockRejectedValue({});
      const mockToastError = vi.fn();

      renderWithProviders(<SignUp />, {
        authValue: { signUp: mockSignUp, loading: false },
        toastValue: { success: vi.fn(), error: mockToastError },
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Could not create account. Please try again.');
      });
    });

    it('should handle names with special characters', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockResolvedValue({});

      renderWithProviders(<SignUp />, {
        authValue: { signUp: mockSignUp, loading: false },
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, "O'Connor-Smith");
      await user.type(emailInput, 'oconnor@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /^create account$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          expect.objectContaining({ name: "O'Connor-Smith" })
        );
      });
    });

    it('should have proper autocomplete attributes', () => {
      renderWithProviders(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      expect(nameInput).toHaveAttribute('autocomplete', 'name');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
      expect(confirmInput).toHaveAttribute('autocomplete', 'new-password');
    });
  });
});
