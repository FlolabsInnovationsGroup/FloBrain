import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeroSection } from '.';

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    return <img {...props} />;
  },
}));

vi.mock('../../../../../assets/images/brain.svg', () => ({
  default: 'brain-svg-mock',
}));

describe('HeroSection Component', () => {
  
  it('should render the main headings correctly', () => {
    render(<HeroSection />);
    expect(screen.getByText('THE INTELLIGENCE LAYER')).toBeDefined();
    expect(screen.getByText('FOR EVERY DEVICE')).toBeDefined();
  });

  it('should render the description paragraph', () => {
    render(<HeroSection />);
    expect(screen.getByText(/FloBrain is the central intelligence layer/i)).toBeDefined();
  });

  it('should render the "Get started" button with an icon', () => {
    render(<HeroSection />);
    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeDefined();
    
    const icon = button.querySelector('svg');
    expect(icon).toBeDefined();
  });

  it('should render the hero image with correct alt text', () => {
    render(<HeroSection />);
    const image = screen.getByAltText('FloBrain');
    expect(image).toBeDefined();
    expect(image.getAttribute('src')).toBeDefined();
  });
});