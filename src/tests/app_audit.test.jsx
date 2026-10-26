import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App.jsx';

describe('App Full Interaction & Navigation Audit', () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('navigates to every tab without console errors', async () => {
    const errorSpy = vi.spyOn(console, 'error');

    const { container } = render(<App />);

    // 1. Home View verify
    expect(screen.getAllByText(/See the/i).length).toBeGreaterThan(0);

    // 2. Click Lab & Clock tab
    const labNavBtn = screen.getByRole('button', { name: /Lab & Clock/i });
    fireEvent.click(labNavBtn);
    expect(screen.getByText(/Input & Parameters/i)).toBeDefined();

    // In Lab: click Try Sample button
    const sampleBtn = screen.getByRole('button', { name: /Try Sample/i });
    fireEvent.click(sampleBtn);

    // In Lab: toggle Decrypt
    const decryptBtn = screen.getByRole('button', { name: /Decrypt/i });
    fireEvent.click(decryptBtn);

    // In Lab: toggle Encrypt back
    const encryptBtn = screen.getByRole('button', { name: /Encrypt/i });
    fireEvent.click(encryptBtn);

    // In Lab: cycle through every cipher select option
    const [cipherSelect] = screen.getAllByRole('combobox');
    for (const c of ['vigenere', 'affine', 'atbash', 'railfence', 'caesar']) {
      fireEvent.change(cipherSelect, { target: { value: c } });
    }

    // In Lab: toggle Wheel tab
    const wheelTabBtn = screen.getByRole('button', { name: /Cipher Wheel/i });
    fireEvent.click(wheelTabBtn);

    // In Lab: toggle Modular Clock tab
    const clockTabBtn = screen.getByRole('button', { name: /Modular Clock/i });
    fireEvent.click(clockTabBtn);

    // In Lab: click Play, Next, Prev, Reset in StepPlayer
    const playBtn = screen.getByRole('button', { name: /Play/i });
    fireEvent.click(playBtn);
    const nextBtn = screen.getByTitle(/Next step/i);
    fireEvent.click(nextBtn);
    const prevBtn = screen.getByTitle(/Previous step/i);
    fireEvent.click(prevBtn);
    const resetBtn = screen.getByTitle(/Reset to beginning/i);
    fireEvent.click(resetBtn);

    // In Lab: click action buttons (Copy, Download, Share, Swap)
    fireEvent.click(screen.getByRole('button', { name: /Copy ciphertext output/i }));
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    fireEvent.click(screen.getByRole('button', { name: /Share/i }));
    fireEvent.click(screen.getByRole('button', { name: /Swap in\/out/i }));

    // 3. Click RSA Showpiece tab
    const rsaNavBtn = screen.getByRole('button', { name: /RSA Showpiece/i });
    fireEvent.click(rsaNavBtn);
    expect(screen.getByText(/RSA Asymmetric Cryptosystem Lab/i)).toBeDefined();

    // In RSA: click Real-World Mode
    const realWorldBtn = screen.getByRole('button', { name: /Real-World Mode/i });
    fireEvent.click(realWorldBtn);

    // In RSA: click Classroom Mode
    const classroomBtn = screen.getByRole('button', { name: /Classroom Mode/i });
    fireEvent.click(classroomBtn);

    // In RSA: click presets
    const presetBtns = screen.getAllByRole('button', { name: /Classic|Small Primes|Prime Pair/i });
    if (presetBtns.length > 0) {
      fireEvent.click(presetBtns[0]);
    }

    // 4. Click Diffie-Hellman tab
    const dhNavBtn = screen.getByRole('button', { name: /Diffie-Hellman/i });
    fireEvent.click(dhNavBtn);
    expect(screen.getByText(/Diffie-Hellman Key Exchange/i)).toBeDefined();

    // 5. Click Break-It tab
    const breakitNavBtn = screen.getByRole('button', { name: /Break-It/i });
    fireEvent.click(breakitNavBtn);
    expect(screen.getByText(/Break-It: Attacker & Cryptanalyst Lab/i)).toBeDefined();

    // In Break-It: click Vigenere IoC tab
    const vigIocBtn = screen.getByRole('button', { name: /Vigenère IoC & Kasiski/i });
    fireEvent.click(vigIocBtn);

    // In Break-It: click Crack Challenges tab
    const crackBtn = screen.getByRole('button', { name: /Crack Challenges/i });
    fireEvent.click(crackBtn);

    // In Break-It: click Caesar Brute Force tab
    const caesarBruteBtn = screen.getByRole('button', { name: /Caesar Brute Force/i });
    fireEvent.click(caesarBruteBtn);

    // 6. Click Story Mode tab
    const storyNavBtn = screen.getByRole('button', { name: /Story Mode/i });
    fireEvent.click(storyNavBtn);
    expect(screen.getByText(/Alice, Bob and Eve: Cryptographic Story Mode/i)).toBeDefined();

    // In Story: click scene buttons
    const sceneNext = screen.getByRole('button', { name: /Next Scene/i });
    fireEvent.click(sceneNext);
    const scenePrev = screen.getByRole('button', { name: /Previous Scene/i });
    fireEvent.click(scenePrev);

    // 7. Click Compare tab
    const compareNavBtn = screen.getByRole('button', { name: /Compare/i });
    fireEvent.click(compareNavBtn);
    expect(screen.getByText(/Side-by-Side Cipher Comparison View/i)).toBeDefined();

    // 8. Click Quiz tab
    const quizNavBtn = screen.getByRole('button', { name: /Quiz/i });
    fireEvent.click(quizNavBtn);
    expect(screen.getByText(/Cryptography & Mathematics Mastery Quiz/i)).toBeDefined();

    // In Quiz: answer question 1
    const optButtons = screen.getAllByRole('button');
    const answerOption = optButtons.find(b => b.textContent && b.textContent.includes('A'));
    if (answerOption) fireEvent.click(answerOption);

    // 9. Toggle Beginner / Advanced KaTeX modes in Navbar
    const beginnerBtn = screen.getByRole('button', { name: /Beginner/i });
    fireEvent.click(beginnerBtn);
    const advancedBtn = screen.getByRole('button', { name: /Advanced KaTeX/i });
    fireEvent.click(advancedBtn);

    // 10. Open and close Glossary modal
    const glossaryBtn = screen.getByTitle(/Mathematical Glossary/i);
    fireEvent.click(glossaryBtn);
    expect(screen.getByText(/Mathematical Cryptography Glossary/i)).toBeDefined();
    const closeGlossaryBtn = screen.getByRole('button', { name: /Close Glossary/i });
    fireEvent.click(closeGlossaryBtn);

    // Verify zero console.error calls occurred!
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  }, 30000);
});
