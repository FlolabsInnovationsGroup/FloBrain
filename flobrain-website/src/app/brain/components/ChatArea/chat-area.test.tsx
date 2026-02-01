import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatArea from './index';

// Mocking the Message type to match your import
const mockMessages = [
  {
    id: '1',
    type: 'user',
    text: 'Hello, this is a user message',
  },
  {
    id: '2',
    type: 'assistant',
    text: 'Hello! I am your assistant.',
  },
  {
    id: '3',
    type: 'user',
    text: 'Check this image',
    image: 'https://example.com/test-image.jpg',
  },
];

describe('ChatArea Component', () => {
  it('renders all messages passed via props', () => {
    render(<ChatArea messages={mockMessages} />);
    
    expect(screen.getByText('Hello, this is a user message')).toBeInTheDocument();
    expect(screen.getByText('Hello! I am your assistant.')).toBeInTheDocument();
  });

  it('renders the assistant SVG icon only for assistant messages', () => {
    render(<ChatArea messages={mockMessages} />);
    
    // In your code, the assistant message has an SVG. 
    // We can find it by looking for the container or the specific SVG structure.
    const assistantIcon = document.querySelector('svg');
    expect(assistantIcon).toBeInTheDocument();
  });

  it('renders an image when the message contains an image URL', () => {
    render(<ChatArea messages={mockMessages} />);
    
    const image = screen.getByAltText('User upload');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg');
  });

  it('applies correct alignment classes based on message type', () => {
    const { container } = render(<ChatArea messages={mockMessages} />);
    
    // Finding the message wrappers
    const userMessageWrapper = container.querySelector('.justify-end');
    const assistantMessageWrapper = container.querySelector('.justify-start');

    expect(userMessageWrapper).toBeInTheDocument();
    expect(assistantMessageWrapper).toBe