import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App.jsx';

describe('First-Run Guided Tour Audit', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('runs through all 4 guided tour steps and closes properly', async () => {
    render(<App />);

    // Click the Tour button in Navbar to open the tour
    const tourBtn = screen.getByRole('button', { name: /Tour/i });
    fireEvent.click(tourBtn);

    // Step 1: Beginner vs Advanced Mode
    expect(screen.getByText(/1\. Beginner vs\. Advanced Mode/i)).toBeDefined();
    expect(screen.getByText(/Step 1 of 4/i)).toBeDefined();

    // Click Next -> Step 2: Break-It tab
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(screen.getByText(/2\. Break-It: The Attacker View/i)).toBeDefined();
    expect(screen.getByText(/Step 2 of 4/i)).toBeDefined();

    // Click Next -> Step 3: Modular Clock
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(screen.getByText(/3\. Visual Math Lens: Modular Clock/i)).toBeDefined();
    expect(screen.getByText(/Step 3 of 4/i)).toBeDefined();

    // Click Next -> Step 4: Step Player
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(screen.getByText(/4\. Video Step Player & Scrub Timeline/i)).toBeDefined();
    expect(screen.getByText(/Step 4 of 4/i)).toBeDefined();

    // Click Finish -> Closes tour
    fireEvent.click(screen.getByTestId('tour-next-btn'));

    // Verify localStorage has recorded completion
    expect(localStorage.getItem('cipherlab_tour_seen')).toBe('true');
  });
});
