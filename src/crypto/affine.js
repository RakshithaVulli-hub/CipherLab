/**
 * Affine Cipher Module
 * Monoalphabetic substitution cipher based on modular linear arithmetic:
 *   E(x) = (a * x + b) mod 26
 *   D(y) = a^(-1) * (y - b) mod 26
 * Constraint: gcd(a, 26) === 1
 */
import { mod26 } from './caesar.js';

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Calculates modular multiplicative inverse of a mod m using Extended Euclidean Algorithm.
 * Returns null if gcd(a, m) !== 1.
 */
export function modInverse(a, m = 26) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  return null;
}

export const VALID_A_VALUES = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

export function parseAffineKeys(rawA, rawB) {
  const a = parseInt(String(rawA).trim(), 10);
  const b = parseInt(String(rawB).trim(), 10);

  if (!Number.isFinite(a)) {
    return { error: 'Key "a" (multiplier) must be an integer.' };
  }
  if (!Number.isFinite(b)) {
    return { error: 'Key "b" (shift) must be an integer.' };
  }

  const g = gcd(a, 26);
  if (g !== 1) {
    return {
      error: `Key "a" must be coprime to 26 (gcd(${a}, 26) = ${g} ≠ 1). Choose from: ${VALID_A_VALUES.join(', ')}. When gcd ≠ 1, different letters collide into the same ciphertext letter, making decryption ambiguous.`
    };
  }

  const aMod = mod26(a);
  const bMod = mod26(b);
  const aInv = modInverse(aMod, 26);

  return { a: aMod, b: bMod, aInv };
}

export function buildAffineSteps(text, rawA = 5, rawB = 8, decrypt = false) {
  const keys = parseAffineKeys(rawA, rawB);
  if (keys.error) {
    return { steps: [], output: '', error: keys.error, keys: null };
  }

  const { a, b, aInv } = keys;
  const steps = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const isAlpha = /^[A-Za-z]$/.test(ch);

    if (!isAlpha) {
      steps.push({
        index: i,
        input: ch,
        output: ch,
        isLetter: false,
        detail: 'not a letter, passed through unchanged',
        formulaLatex: '\\text{Non-alphabetical: passthrough}'
      });
      continue;
    }

    const upper = ch.toUpperCase();
    const p = upper.charCodeAt(0) - 65;
    let c, detail, formulaLatex;

    if (!decrypt) {
      // E(x) = (a * x + b) mod 26
      const mult = a * p;
      const sum = mult + b;
      c = mod26(sum);
      detail = `${upper} = ${p}, (${a} × ${p} + ${b}) = ${sum}, mod 26 = ${c} (${String.fromCharCode(65 + c)})`;
      formulaLatex = `(${a} \\cdot ${p} + ${b}) \\equiv ${c} \\pmod{26}`;
    } else {
      // D(y) = a^(-1) * (y - b) mod 26
      const diff = mod26(p - b);
      const mult = aInv * diff;
      c = mod26(mult);
      detail = `${upper} = ${p}, a⁻¹ = ${aInv}, ${aInv} × (${p} - ${b} mod 26 = ${diff}) = ${mult}, mod 26 = ${c} (${String.fromCharCode(65 + c)})`;
      formulaLatex = `${aInv} \\cdot (${p} - ${b}) \\equiv ${c} \\pmod{26}`;
    }

    const outCh = String.fromCharCode(65 + c);
    const out = ch === ch.toLowerCase() ? outCh.toLowerCase() : outCh;

    steps.push({
      index: i,
      input: ch,
      output: out,
      isLetter: true,
      detail,
      formulaLatex,
      p,
      c,
      a,
      b,
      aInv,
      upperInput: upper,
      upperOutput: outCh
    });
  }

  const output = steps.map(s => s.output).join('');
  return { steps, output, error: null, keys: { a, b, aInv } };
}

export function affineEncrypt(text, a = 5, b = 8) {
  return buildAffineSteps(text, a, b, false).output;
}

export function affineDecrypt(text, a = 5, b = 8) {
  return buildAffineSteps(text, a, b, true).output;
}
