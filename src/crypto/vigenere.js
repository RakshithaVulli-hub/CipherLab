/**
 * Vigenere Cipher Module
 * Polyalphabetic substitution cipher.
 * Mathematical definition:
 *   c_i = (p_i + k_i) mod 26
 *   p_i = (c_i - k_i) mod 26
 */
import { mod26 } from './caesar.js';

export function parseKeyword(raw) {
  const letters = String(raw || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters) return { error: 'Keyword needs at least one letter A-Z.' };
  return { value: letters };
}

/**
 * Builds step-by-step transformation array for Vigenere cipher.
 * @param {string} text - Message input
 * @param {string} keyRaw - Keyword
 * @param {boolean} decrypt - Decryption flag
 * @returns {{ steps: Array, output: string, error: string|null, key: string }}
 */
export function buildSteps(text, cipherOrKey, keyRaw, decrypt) {
  let kwInput = keyRaw;
  let isDecrypt = decrypt;

  if (typeof cipherOrKey === 'string' && cipherOrKey.toLowerCase() === 'vigenere') {
    kwInput = keyRaw;
    isDecrypt = decrypt;
  } else if (typeof cipherOrKey === 'string' && typeof keyRaw === 'boolean') {
    kwInput = cipherOrKey;
    isDecrypt = keyRaw;
  }

  const parsed = parseKeyword(kwInput);
  if (parsed.error) {
    return { steps: [], output: '', error: parsed.error, key: '' };
  }

  const kw = parsed.value;
  const steps = [];
  let keyPos = 0; // Advances only on letters

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
        formulaLatex: '\\text{Non-alphabetical: passthrough}',
        keyChar: null,
        keyVal: null,
        keyPos: null,
        p: null,
        c: null
      });
      continue;
    }

    const upper = ch.toUpperCase();
    const p = upper.charCodeAt(0) - 65; // 0..25
    const kch = kw[keyPos % kw.length];
    const k = kch.charCodeAt(0) - 65; // 0..25
    let c, detail, formulaLatex;

    if (!isDecrypt) {
      const sum = p + k;
      c = mod26(sum);
      detail = `${upper} = ${p}, key ${kch} = ${k}, ${p} + ${k} = ${sum}, mod 26 = ${c} (${String.fromCharCode(65 + c)})`;
      formulaLatex = `(${p} + ${k}) \\equiv ${c} \\pmod{26}`;
    } else {
      const diff = p - k;
      c = mod26(diff);
      detail = `${upper} = ${p}, key ${kch} = ${k}, ${p} - ${k} = ${diff}, mod 26 = ${c} (${String.fromCharCode(65 + c)})`;
      formulaLatex = `(${p} - ${k}) \\equiv ${c} \\pmod{26}`;
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
      keyChar: kch,
      keyVal: k,
      keyPos,
      keyIndexInKw: keyPos % kw.length,
      p,
      c,
      upperInput: upper,
      upperOutput: outCh
    });

    keyPos++;
  }

  const output = steps.map(s => s.output).join('');
  return { steps, output, error: null, key: kw };
}

export function vigenereEncrypt(text, kw) {
  return buildSteps(text, 'vigenere', kw, false).output;
}

export function vigenereDecrypt(text, kw) {
  return buildSteps(text, 'vigenere', kw, true).output;
}
