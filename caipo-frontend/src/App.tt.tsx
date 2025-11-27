// Mock all dependencies BEFORE imports
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }: any) => <div data-testid="routes">{children}</div>,
  Route: ({ element }: any) => <div data-testid="route">{element}</div>,
  Navigate: () => <div data-testid="navigate">Navigate</div>,
}));

jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('./components/GlobalError', () => ({
  __esModule: true,
  default: () => <div data-testid="global-error">GlobalError</div>,
}));

jest.mock('./components/GlobalLoading', () => ({
  __esModule: true,
  default: () => <div data-testid="global-loading">GlobalLoading</div>,
}));

import React from 'react';
// @ts-ignore - @testing-library/react is installed, this is a TypeScript resolution issue
import { render } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  const { container } = render(<App />);
  // Just check that the app renders without crashing
  expect(container).toBeTruthy();
});

// test('renders learn react link', () => {
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });