import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SettingsDialog from './index';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('SettingsDialog', () => {
  it('hides the Billing tab from settings navigation', () => {
    render(<SettingsDialog open onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /account & security/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /billing/i })).not.toBeInTheDocument();
  });
});
