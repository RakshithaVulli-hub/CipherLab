/**
 * cipher_wheel.test.jsx
 *
 * Comprehensive Vitest tests for the CipherWheel component, verifying:
 *
 *  Caesar   – inner ring label order (A-Z), per-slot highlight, connecting line,
 *             data-rotate-target changes with shift, decrypt mode legend.
 *  Affine   – inner ring permuted labels (E(i)=(a·i+b) mod 26), highlight,
 *             connector, decrypt mode, invalid-a error state.
 *  Atbash   – inner ring reversed labels (Z,Y,X…), highlight, connector,
 *             decrypt mode (same mapping in both directions).
 *
 * Pattern follows the existing test suites: vitest native expect, no jest-dom.
 */
import { describe, test, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import CipherWheel from '../components/CipherWheel.jsx';

// ── helpers ────────────────────────────────────────────────────────────────────

/** Return { text, fill } for every <text> in the SVG. */
function svgTexts(container) {
  return Array.from(container.querySelectorAll('svg text')).map(t => ({
    text: t.textContent.trim(),
    fill: t.getAttribute('fill') || '',
  }));
}

/** Return inner-ring { text, fill } entries (slots 0-25, after outer 26). */
function innerTexts(container) {
  return svgTexts(container).slice(26);
}

/** Return all <line> elements inside the SVG. */
function svgLines(container) {
  return Array.from(container.querySelectorAll('svg line'));
}

/** Return the dynamic connector <line> element (has data-testid). */
function connector(container) {
  return container.querySelector('[data-testid="cipher-connector"]');
}

/** Return the inner ring <g> element. */
function innerGroup(container) {
  return container.querySelector('[data-testid="inner-ring-group"]');
}

// ── CAESAR tests ───────────────────────────────────────────────────────────────

describe('CipherWheel – Caesar (encrypt)', () => {
  test('inner ring slot labels are standard A-Z (ring rotates, labels stay fixed)', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" />
    );
    const inner = innerTexts(container);
    expect(inner.length).toBe(26);
    expect(inner[0].text).toBe('A');
    expect(inner[3].text).toBe('D');
    expect(inner[25].text).toBe('Z');
  });

  test('outer active letter H highlighted cyan', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" />
    );
    const outer = svgTexts(container).slice(0, 26);
    const h = outer.find(e => e.text === 'H');
    expect(h).toBeDefined();
    expect(h.fill).toBe('#22d3ee');
    // All other outer letters are slate
    outer.filter(e => e.text !== 'H').forEach(e => {
      expect(e.fill).toBe('#94a3b8');
    });
  });

  test('inner active letter K highlighted emerald', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" />
    );
    const inner = innerTexts(container);
    // K is at slot index 10 (K=10 in 0-indexed alphabet)
    const kEntry = inner[10];
    expect(kEntry.text).toBe('K');
    expect(kEntry.fill).toBe('#10b981');
    // All other inner letters must still be violet
    inner.filter((_, i) => i !== 10).forEach(e => {
      expect(e.fill).toBe('#a855f7');
    });
  });

  test('connecting line is rendered between active outer and inner letters', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" />
    );
    const conn = connector(container);
    expect(conn).not.toBeNull();
    expect(conn.getAttribute('stroke')).toBe('#10b981');
    // Line endpoints are non-zero (actual positions)
    expect(Number(conn.getAttribute('x1'))).not.toBe(0);
    expect(Number(conn.getAttribute('y1'))).not.toBe(0);
  });

  test('no connector line rendered when activeChar/activeOutput are empty', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="" activeOutput="" />
    );
    expect(connector(container)).toBeNull();
  });

  test('data-rotate-target attribute on inner group reflects shift', () => {
    const { container, rerender } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" />
    );
    const g = innerGroup(container);
    const STEP = 360 / 26;
    const target3 = -3 * STEP;
    expect(Number(g.getAttribute('data-rotate-target'))).toBeCloseTo(target3, 4);

    rerender(<CipherWheel cipherType="caesar" shift={10} activeChar="H" activeOutput="R" />);
    const target10 = -10 * STEP;
    expect(Number(innerGroup(container).getAttribute('data-rotate-target'))).toBeCloseTo(target10, 4);
  });

  test('shift=0 → data-rotate-target=0, A maps to A', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={0} activeChar="A" activeOutput="A" />
    );
    expect(Number(innerGroup(container).getAttribute('data-rotate-target'))).toBeCloseTo(0, 4);
    const inner = innerTexts(container);
    expect(inner[0].fill).toBe('#10b981'); // A highlighted
  });

  test('negative shift normalised correctly (-3 → 23)', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={-3} activeChar="A" activeOutput="X" />
    );
    // safeShift = ((-3 % 26) + 26) % 26 = 23
    const STEP = 360 / 26;
    expect(Number(innerGroup(container).getAttribute('data-rotate-target'))).toBeCloseTo(-23 * STEP, 4);
  });

  test('data-cipher and data-shift attributes on <svg>', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={7} activeChar="A" activeOutput="H" />
    );
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('data-cipher')).toBe('caesar');
    expect(svg.getAttribute('data-shift')).toBe('7');
  });
});

describe('CipherWheel – Caesar (decrypt mode legend)', () => {
  test('legend says "Outer = Ciphertext" and "Inner = Plaintext" when decrypt=true', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" decrypt={true} />
    );
    const text = container.textContent;
    expect(text).toContain('Outer = Ciphertext');
    expect(text).toContain('Inner = Plaintext');
  });

  test('legend says "Outer = Plaintext" when decrypt=false (default)', () => {
    const { container } = render(
      <CipherWheel cipherType="caesar" shift={3} activeChar="H" activeOutput="K" />
    );
    const text = container.textContent;
    expect(text).toContain('Outer = Plaintext');
    expect(text).toContain('Inner = Ciphertext');
  });

  test('highlight and connector work correctly with decrypt=true (wheel always encrypt direction)', () => {
    // LabView swaps the pair before passing, so wheel still gets plain→cipher.
    // Simulating: decrypt of 'K' gives 'H'. LabView passes activeChar='H', activeOutput='K'.
    const { container } = render(
      <CipherWheel
        cipherType="caesar"
        shift={3}
        activeChar="H"
        activeOutput="K"
        decrypt={true}
      />
    );
    // Highlights must be same regardless of decrypt flag
    const outer = svgTexts(container).slice(0, 26);
    expect(outer.find(e => e.text === 'H')?.fill).toBe('#22d3ee');
    const inner = innerTexts(container);
    expect(inner[10].fill).toBe('#10b981'); // K at slot 10
    expect(connector(container)).not.toBeNull();
  });
});

// ── AFFINE tests ───────────────────────────────────────────────────────────────

describe('CipherWheel – Affine (encrypt, a=5, b=8)', () => {
  // E(i) = (5·i + 8) mod 26
  // E(0)=8='I', E(1)=13='N', E(2)=18='S', E(3)=23='X', E(4)=2='C'
  const A = 5, B = 8;

  test('inner ring slot-0 label is I (E(0)=(5·0+8)%26=8)', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="A" activeOutput="I" />
    );
    expect(innerTexts(container)[0].text).toBe('I');
  });

  test('inner ring slot-1 label is N (E(1)=(5+8)%26=13)', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="B" activeOutput="N" />
    );
    expect(innerTexts(container)[1].text).toBe('N');
  });

  test('inner ring slot-2 label is S (E(2)=(10+8)%26=18)', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="C" activeOutput="S" />
    );
    expect(innerTexts(container)[2].text).toBe('S');
  });

  test('inner ring contains all 26 distinct letters (valid permutation, no repeats)', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="A" activeOutput="I" />
    );
    const labels = innerTexts(container).map(e => e.text);
    expect(new Set(labels).size).toBe(26);
  });

  test('data-rotate-target=0 for Affine (no group rotation)', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="A" activeOutput="I" />
    );
    expect(Number(innerGroup(container).getAttribute('data-rotate-target'))).toBe(0);
  });

  test('inner active slot highlighted emerald (A→I, slot 0)', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="A" activeOutput="I" />
    );
    const inner = innerTexts(container);
    expect(inner[0].text).toBe('I');
    expect(inner[0].fill).toBe('#10b981');
    // All others remain violet
    inner.slice(1).forEach(e => expect(e.fill).toBe('#a855f7'));
  });

  test('outer active letter A highlighted cyan', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="A" activeOutput="I" />
    );
    const outer = svgTexts(container).slice(0, 26);
    expect(outer[0].fill).toBe('#22d3ee'); // A highlighted
  });

  test('connecting line present when valid pair', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="A" activeOutput="I" />
    );
    expect(connector(container)).not.toBeNull();
  });

  test('caption mentions E(x) formula', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={A} affineB={B} activeChar="A" activeOutput="I" />
    );
    expect(container.textContent).toContain('E(x)');
    expect(container.textContent).toContain('permutation');
  });
});

describe('CipherWheel – Affine (decrypt mode)', () => {
  // For a=5, b=8: D(8)=D('I')=21·(8-8)%26=0='A'. LabView passes activeChar='A', activeOutput='I'.
  test('decrypt=true: legend says Ciphertext/Plaintext', () => {
    const { container } = render(
      <CipherWheel
        cipherType="affine"
        affineA={5}
        affineB={8}
        activeChar="A"
        activeOutput="I"
        decrypt={true}
      />
    );
    expect(container.textContent).toContain('Outer = Ciphertext');
  });

  test('decrypt=true: highlights still correct (wheel always shows encode direction)', () => {
    const { container } = render(
      <CipherWheel
        cipherType="affine"
        affineA={5}
        affineB={8}
        activeChar="A"
        activeOutput="I"
        decrypt={true}
      />
    );
    const inner = innerTexts(container);
    expect(inner[0].fill).toBe('#10b981'); // slot 0 = 'I'
    expect(connector(container)).not.toBeNull();
  });
});

describe('CipherWheel – Affine (invalid a)', () => {
  test('a=2 is invalid (gcd(2,26)=2≠1) → error state shown', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={2} affineB={8} activeChar="A" activeOutput="I" />
    );
    // Error panel present
    expect(container.querySelector('[data-testid="cipher-wheel-error"]')).not.toBeNull();
    // Normal wheel NOT present
    expect(container.querySelector('[data-testid="cipher-wheel"]')).toBeNull();
  });

  test('a=4 is invalid (gcd(4,26)=2≠1) → error message mentions gcd', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={4} affineB={0} activeChar="A" activeOutput="E" />
    );
    expect(container.querySelector('[data-testid="cipher-wheel-error"]')).not.toBeNull();
    expect(container.textContent).toContain('gcd');
    expect(container.textContent).toContain('Invalid key');
  });

  test('a=13 is invalid (gcd(13,26)=13≠1) → error state shown', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={13} affineB={0} activeChar="A" activeOutput="N" />
    );
    expect(container.querySelector('[data-testid="cipher-wheel-error"]')).not.toBeNull();
  });

  test('a=1 is valid (gcd(1,26)=1) → normal wheel shown', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={1} affineB={0} activeChar="A" activeOutput="A" />
    );
    expect(container.querySelector('[data-testid="cipher-wheel"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="cipher-wheel-error"]')).toBeNull();
  });

  test('a=25 is valid (gcd(25,26)=1) → normal wheel shown', () => {
    const { container } = render(
      <CipherWheel cipherType="affine" affineA={25} affineB={0} activeChar="A" activeOutput="Z" />
    );
    expect(container.querySelector('[data-testid="cipher-wheel"]')).not.toBeNull();
  });
});

// ── ATBASH tests ───────────────────────────────────────────────────────────────

describe('CipherWheel – Atbash', () => {
  test('inner ring slot-0 label is Z (reversed alphabet)', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" />
    );
    expect(innerTexts(container)[0].text).toBe('Z');
  });

  test('inner ring slot-1 label is Y', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="B" activeOutput="Y" />
    );
    expect(innerTexts(container)[1].text).toBe('Y');
  });

  test('inner ring slot-25 label is A', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="Z" activeOutput="A" />
    );
    expect(innerTexts(container)[25].text).toBe('A');
  });

  test('inner ring slot-7 label is S (H=7, 25-7=18=S)', () => {
    // E(7) = 25 - 7 = 18 → 'S'. H ↔ S in Atbash.
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="H" activeOutput="S" />
    );
    expect(innerTexts(container)[7].text).toBe('S');
  });

  test('inner ring contains all 26 distinct letters (valid permutation)', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" />
    );
    const labels = innerTexts(container).map(e => e.text);
    expect(new Set(labels).size).toBe(26);
  });

  test('data-rotate-target=0 for Atbash (no group rotation)', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" />
    );
    expect(Number(innerGroup(container).getAttribute('data-rotate-target'))).toBe(0);
  });

  test('outer A highlighted cyan', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" />
    );
    const outer = svgTexts(container).slice(0, 26);
    expect(outer[0].fill).toBe('#22d3ee');
  });

  test('inner Z (slot 0) highlighted emerald when A→Z active', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" />
    );
    const inner = innerTexts(container);
    expect(inner[0].text).toBe('Z');
    expect(inner[0].fill).toBe('#10b981');
    inner.slice(1).forEach(e => expect(e.fill).toBe('#a855f7'));
  });

  test('connecting line present for A→Z pair', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" />
    );
    expect(connector(container)).not.toBeNull();
  });

  test('H→S active: inner slot-7 (S) highlighted, outer H highlighted', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="H" activeOutput="S" />
    );
    const outer = svgTexts(container).slice(0, 26);
    expect(outer[7].fill).toBe('#22d3ee'); // H = slot 7
    const inner = innerTexts(container);
    expect(inner[7].text).toBe('S');
    expect(inner[7].fill).toBe('#10b981');
  });

  test('caption mentions reversed alphabet', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" />
    );
    expect(container.textContent).toContain('reversed');
  });

  test('decrypt=true: legend text changes to Ciphertext/Plaintext', () => {
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" decrypt={true} />
    );
    expect(container.textContent).toContain('Outer = Ciphertext');
  });

  test('decrypt=true: highlights identical (Atbash is its own inverse)', () => {
    // E(A)=Z, D(Z)=A — same pair in both directions.
    const { container } = render(
      <CipherWheel cipherType="atbash" activeChar="A" activeOutput="Z" decrypt={true} />
    );
    expect(svgTexts(container).slice(0, 26)[0].fill).toBe('#22d3ee');
    expect(innerTexts(container)[0].fill).toBe('#10b981');
    expect(connector(container)).not.toBeNull();
  });
});
