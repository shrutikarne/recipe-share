import React from 'react';
import { render, screen } from "@testing-library/react";

// Avoid importing axios via API in tests
jest.mock('./api/api', () => ({ __esModule: true, default: { logout: jest.fn(), post: jest.fn() } }));
// Avoid side effects from token refresh manager
jest.mock('./components/TokenRefreshManager', () => () => null);

// Mock ESM-only router to avoid Jest ESM interop issues
jest.mock('react-router-dom', () => ({
  __esModule: true,
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: () => null,
  Route: () => null,
  Navigate: ({ to }) => <div>Navigate to {to}</div>,
  Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => jest.fn(),
}), { virtual: true });

// Mock framer-motion to render plain children/elements
jest.mock('framer-motion', () => ({
  __esModule: true,
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: new Proxy({}, { get: () => (props) => <div {...props} /> }),
}));

// Mock Swiper which is ESM-only in tests
jest.mock('swiper/react', () => ({
  __esModule: true,
  Swiper: ({ children }) => <div>{children}</div>,
  SwiperSlide: ({ children }) => <div>{children}</div>,
}), { virtual: true });
jest.mock('swiper/css', () => ({}), { virtual: true });

import App from "./App";

test("renders navbar brand text", () => {
  render(<App />);
  expect(screen.getByText('🍳 RecipeShare')).toBeInTheDocument();
});
