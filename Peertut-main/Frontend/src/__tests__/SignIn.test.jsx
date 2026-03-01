// components/Auth/SignIn.test.jsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';
import { vi } from 'vitest';
import SignIn from '../components/Auth/SignIn';
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
      signIn: vi.fn(),
      loading: false,
      defaultUsers: [
        { email: 'tutor@demo.com', password: 'password123', role: 'tutor' },
        { email: 'student@demo.com', password: 'password123', role: 'student' },
      ],
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

describe('SignIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING TESTS
  // ============================================

  describe('Rendering', () => {
    it('should render sign in form with all elements', () => {
      renderWithProviders(<SignIn />);

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/access your account to continue learning/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password-SignIn/i)).toBeInTheDocument(); // Fixed
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument(); // Fixed
    });

    it('should not render demo buttons when defaultUsers is empty', () => {
      renderWithProviders(<SignIn />, {
        authValue: { signIn: vi.fn(), loading: false, defaultUsers: [] },
      });

      expect(screen.queryByText(/quick sign in \(demo accounts\)/i)).not.toBeInTheDocument();
    });

    it('should render toggle to signup button', () => {
      renderWithProviders(<SignIn />);

      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create a new account/i })).toBeInTheDocument(); // Fixed
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe('Accessibility', () => {
    it('should focus email input on mount', () => {
      renderWithProviders(<SignIn />);

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveFocus();
    });

    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<SignIn />);

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Sign in form');
      expect(screen.getByRole('form')).toHaveAttribute('aria-describedby', 'signin-instructions');
    });

    it('should have ARIA invalid attributes when there are errors', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignIn />);

      const submitButton = screen.getByRole('button', { name: /^sign in$/i }); // Fixed
      await user.click(submitButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/Password-SignIn/i); // Fixed
        
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  // ============================================
  // FORM SUBMISSION TESTS
  // ============================================

  describe('Form Submission', () => {
    it('should call signIn with correct credentials on valid submission', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn().mockResolvedValue({});
      const mockToastSuccess = vi.fn();

      renderWithProviders(<SignIn />, {
        authValue: { signIn: mockSignIn, loading: false, defaultUsers: [] },
        toastValue: { success: mockToastSuccess, error: vi.fn() },
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/Password-SignIn/i); // Fixed
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /^sign in$/i }); // Fixed
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show error toast on failed signin', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      const mockToastError = vi.fn();

      renderWithProviders(<SignIn />, {
        authValue: { signIn: mockSignIn, loading: false, defaultUsers: [] },
        toastValue: { success: vi.fn(), error: mockToastError },
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/Password-SignIn/i); // Fixed
      
      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpass');

      const submitButton = screen.getByRole('button', { name: /^sign in$/i }); // Fixed
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Invalid credentials');
      });
    });

    it('should focus email field after failed signin', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));

      renderWithProviders(<SignIn />, {
        authValue: { signIn: mockSignIn, loading: false, defaultUsers: [] },
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/Password-SignIn/i); // Fixed
      
      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpass');

      const submitButton = screen.getByRole('button', { name: /^sign in$/i }); // Fixed
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveFocus();
      });
    });

    it('should not submit form when validation fails', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn();

      renderWithProviders(<SignIn />, {
        authValue: { signIn: mockSignIn, loading: false, defaultUsers: [] },
      });

      const submitButton = screen.getByRole('button', { name: /^sign in$/i }); // Fixed
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe('Loading State', () => {

    it('should show loading state during form submission', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<SignIn />, {
        authValue: { signIn: mockSignIn, loading: false, defaultUsers: [] },
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/Password-SignIn/i); // Fixed
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /^sign in$/i }); // Fixed
      await user.click(submitButton);

      expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ============================================
  // KEYBOARD INTERACTION TESTS
  // ============================================

  describe('Keyboard Interactions', () => {
    it('should clear form when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignIn />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/Password-SignIn/i); // Fixed
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');

      await user.keyboard('{Escape}');

      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });

    it('should allow form submission with Enter key', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn().mockResolvedValue({});

      renderWithProviders(<SignIn />, {
        authValue: { signIn: mockSignIn, loading: false, defaultUsers: [] },
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/Password-SignIn/i); // Fixed
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  // ============================================
  // TOGGLE MODE TESTS
  // ============================================

  describe('Toggle to Signup', () => {
    it('should call onToggleMode with "signup" when create account is clicked', async () => {
      const user = userEvent.setup();
      const mockToggleMode = vi.fn();
      
      renderWithProviders(<SignIn onToggleMode={mockToggleMode} />);

      const createAccountButton = screen.getByRole('button', { name: /create a new account/i }); // Fixed
      await user.click(createAccountButton);

      expect(mockToggleMode).toHaveBeenCalledWith('signup');
    });

  });

  // ============================================
  // EDGE CASES & ERROR HANDLING
  // ============================================

  describe('Edge Cases', () => {
    it('should handle signin error without message property', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn().mockRejectedValue({});
      const mockToastError = vi.fn();

      renderWithProviders(<SignIn />, {
        authValue: { signIn: mockSignIn, loading: false, defaultUsers: [] },
        toastValue: { success: vi.fn(), error: mockToastError },
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/Password-SignIn/i); // Fixed
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /^sign in$/i }); // Fixed
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Invalid email or password');
      });
    });

    it('should handle null or undefined defaultUsers gracefully', () => {
      renderWithProviders(<SignIn />, {
        authValue: { signIn: vi.fn(), loading: false, defaultUsers: null },
      });

      expect(screen.queryByText(/quick sign in/i)).not.toBeInTheDocument();
    });
  });
});
