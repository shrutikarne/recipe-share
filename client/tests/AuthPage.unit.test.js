import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthPage from '../src/pages/authentication/AuthPage';
import { AuthProvider } from '../src/context/AuthContext';
import * as api from '../src/api/api';

// Mock the API module
jest.mock('../src/api/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getGoogleAuthUrl: jest.fn(),
  getFacebookAuthUrl: jest.fn(),
}));

// Mock auth context provider
const mockSetUser = jest.fn();
jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    setUser: mockSetUser,
    isAuthenticated: false,
    loading: false,
  }),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AuthPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAuthPage = (initialMode = 'login') => {
    return render(
      <MemoryRouter initialEntries={[`/auth?mode=${initialMode}`]}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Login Mode', () => {
    it('renders login form by default', () => {
      renderAuthPage();

      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    });

    it('allows switching to register mode', () => {
      renderAuthPage();

      fireEvent.click(screen.getByText(/sign up/i));
      expect(mockNavigate).toHaveBeenCalledWith('/auth?mode=register');
    });

    it('shows error on empty form submission', async () => {
      renderAuthPage();

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('submits the form with valid data', async () => {
      api.login.mockResolvedValueOnce({
        user: { id: '123', name: 'Test User' },
        token: 'test-token',
        refreshToken: 'test-refresh-token'
      });

      renderAuthPage();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(api.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!'
        });
        expect(mockSetUser).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('shows error message on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      api.login.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      renderAuthPage();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrong-password' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Register Mode', () => {
    it('renders register form when mode is register', () => {
      renderAuthPage('register');

      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    });

    it('allows switching to login mode', () => {
      renderAuthPage('register');

      fireEvent.click(screen.getByText(/sign in/i));
      expect(mockNavigate).toHaveBeenCalledWith('/auth?mode=login');
    });

    it('shows validation errors on register form', async () => {
      renderAuthPage('register');

      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      renderAuthPage('register');

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'Password123!' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'DifferentPassword' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('submits register form with valid data', async () => {
      api.register.mockResolvedValueOnce({
        user: { id: '123', name: 'New User' },
        token: 'test-token',
        refreshToken: 'test-refresh-token'
      });

      renderAuthPage('register');

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'New User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'Password123!' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'Password123!' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(api.register).toHaveBeenCalledWith({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!'
        });
        expect(mockSetUser).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Social Authentication', () => {
    it('renders social login buttons', () => {
      renderAuthPage();

      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with facebook/i)).toBeInTheDocument();
    });

    it('handles Google login click', async () => {
      api.getGoogleAuthUrl.mockResolvedValueOnce({ url: 'https://google.com/auth' });

      renderAuthPage();

      global.window.location.assign = jest.fn();

      fireEvent.click(screen.getByText(/continue with google/i));

      await waitFor(() => {
        expect(api.getGoogleAuthUrl).toHaveBeenCalled();
        expect(global.window.location.assign).toHaveBeenCalledWith('https://google.com/auth');
      });
    });

    it('handles Facebook login click', async () => {
      api.getFacebookAuthUrl.mockResolvedValueOnce({ url: 'https://facebook.com/auth' });

      renderAuthPage();

      global.window.location.assign = jest.fn();

      fireEvent.click(screen.getByText(/continue with facebook/i));

      await waitFor(() => {
        expect(api.getFacebookAuthUrl).toHaveBeenCalled();
        expect(global.window.location.assign).toHaveBeenCalledWith('https://facebook.com/auth');
      });
    });
  });
});
