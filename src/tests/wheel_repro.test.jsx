/**
 * wheel_repro.test.jsx
 *
 * Originally written to REPRODUCE CipherWheel bugs; now updated to CONFIRM the
 * fixes. Kept as a regression guard. The full test suite is in cipher_wheel.test.jsx.
 *
 * Root causes confirmed by the original repro run:
 *  1. Caesar outer highlight: worked before fix (H = cyan '#22d3ee') ✓
 *  2. Caesar inner highlight: ALL inner letters were '#a855f7' — no per-slot highlight.
 *     FIXED: inner active slot now uses '#10b981'.
 *  3. Caesar connector: 0 dynamic lines before fix (only static indicator existed).
 *     FIXED: <line data-testid="cipher-connector"> rendered when pair is valid.
 *  4. Affine inner ring: slot-0 was 'A'; should be 'I' for a=5,b=8.
 *     FIXED: inner ring uses permuted labels E(i)=(a·i+b) mod 26.
 *  5. Atbash inner ring: slot-0 was 'A'; should be 'Z' (reversed alphabet).
 *     FIXED: inner ring uses reversed labels Z,Y,X,…,A.
 */
import { describe, test, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import CipherWheel from '../components/CipherWheel.jsx';

function innerTexts(container) {
  return Array.from(container.querySelectorAll('svg text'))
    .slice(26)
    .map(t => ({ text: t.textContent.trim(), fill: t.getAttribute('fill') || '' }));
}

describe('CipherWheel – bug regression guard', () => {
  test('Caesar: inner ring K (slot 10) is highlighted emerald (was: all uniform violet)', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" />
    );
    const inner = innerTexts(container);
    expect(inner[10].fill).toBe('#10b981');
    // Others remain violet
    inner.filter((_, i) => i !== 10).forEach(e => expect(e.fill).toBe('#a855f7'));
  });

  test('Caesar: dynamic connector line is rendered (was: only static indicator)', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" />
    );
    expect(container.querySelector('[data-testid="cipher-connector"]')).not.toBeNull();
  });

  test('Affine: inner ring slot-0 is I for a=5,b=8 (was: A — wrong permutation)', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={5} affineB={8} activeChar="A" activeOutput="I" />
    );
    expect(innerTexts(container)[0].text).toBe('I');
  });

  test('Atbash: inner ring slot-0 is Z (was: A — no reversal)', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" />
    );
    expect(innerTexts(container)[0].text).toBe('Z');
  });
});
