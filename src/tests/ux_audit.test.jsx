import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App.jsx';
import LabView from '../views/LabView.jsx';
import RsaVisualizer from '../components/RsaVisualizer.jsx';
import { validateRsaKeys, rsaEncrypt, rsaDecrypt } from '../crypto/rsa.js';

describe('Audited UX & Cryptographic Calculations', () => {
  beforeEach(() => {
    localStorage.setItem('cipherlab_tour_seen', 'true');
    Element.prototype.scrollIntoView = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('verifies Space key does NOT toggle playback while typing a sentence with spaces in the message textarea', () => {
    render(<LabView isAdvanced={true} />);

    const textarea = screen.getByLabelText(/Message input for encryption or decryption/i);
    expect(textarea).toBeDefined();

    // Focus textarea
    textarea.focus();

    // Type a sentence containing multiple spaces
    fireEvent.change(textarea, { target: { value: 'ATTACK AT DAWN TODAY' } });
    expect(textarea.value).toBe('ATTACK AT DAWN TODAY');

    // Dispatch a keydown event for 'Space' on the focused textarea
    const spaceEvent = new KeyboardEvent('keydown', {
      code: 'Space',
      key: ' ',
      bubbles: true,
      cancelable: true
    });
    const defaultPrevented = !textarea.dispatchEvent(spaceEvent);

    // Default should NOT be prevented because e.target is TEXTAREA
    expect(defaultPrevented).toBe(false);

    // Verify play button still says "Play" (playback did not toggle into playing)
    const playBtn = screen.getByRole('button', { name: /Play/i });
    expect(playBtn).toBeDefined();
    expect(screen.getByText(/Ready to step through/i)).toBeDefined();
  });

  it('verifies RSA exact stage math: pow(82, 17, 3233) equals 1859 and roundtrips to R', () => {
    // p=61, q=53, e=17
    const keys = validateRsaKeys('61', '53', '17');
    expect(keys.error).toBeNull();
    expect(keys.n).toBe(3233n);
    expect(keys.phi).toBe(3120n);
    expect(keys.d).toBe(2753n);

    // Encrypt 'RSA'
    const enc = rsaEncrypt('RSA', 17n, 3233n);
    expect(enc.cipherNumbers).toEqual(['1859', '2680', '2790']);
    expect(enc.steps[0].char).toBe('R');
    expect(enc.steps[0].m).toBe('82');
    expect(enc.steps[0].c).toBe('1859');

    // Decrypt
    const dec = rsaDecrypt(['1859', '2680', '2790'], 2753n, 3233n);
    expect(dec.plainText).toBe('RSA');
  });

  it('verifies Factoring Security Table has Approx. / Illustrative labels and educational footer', () => {
    render(<RsaVisualizer isAdvanced={true} />);

    // Check table headers
    expect(screen.getByText(/Classical Factoring Time \(Approx\. \/ Illustrative\)/i)).toBeDefined();
    expect(screen.getByText(/Quantum Shor's Algorithm \(Illustrative\)/i)).toBeDefined();

    // Check educational note
    expect(screen.getByText(/Educational & Illustrative:/i)).toBeDefined();
  });

  it('verifies Educational Only banner in App footer', () => {
    render(<App />);
    expect(screen.getByText(/Educational only\. Do not use these implementations to protect real-world sensitive data\./i)).toBeDefined();
  });
});
