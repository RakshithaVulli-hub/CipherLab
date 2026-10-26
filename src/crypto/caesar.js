/**
 * Caesar Cipher Module
 * Pure functions for Caesar encryption, decryption, and step generation.
 * Mathematical definition:
 *   E(x) = (x + k) mod 26
 *   D(x) = (x - k) mod 26
 */

export function mod26(n) {
  return ((n % 26) + 26) % 26;
}

export function parseShift(raw) {
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n)) return { error: 'Shift must be a whole number.' };
  return { value: mod26(n), raw: n };
}

/**
 * Builds step-by-step transformation array for Caesar cipher.
 * @param {string} text - Message input
 * @param {number|string} keyRaw - Shift amount
 * @param {boolean} decrypt - Decryption flag
 * @returns {{ steps: Array, output: string, error: string|null, key: number }}
 */
export function buildSteps(text, cipherOrKey, keyRaw, decrypt) {
  // Support both buildSteps(text, 'caesar', shift, decrypt) and buildSteps(text, shift, decrypt)
  let shiftInput = keyRaw;
  let isDecrypt = decrypt;
  if (typeof cipherOrKey === 'string' && cipherOrKey.toLowerCase() === 'caesar') {
    shiftInput = keyRaw;
    isDecrypt = decrypt;
  } else if (typeof cipherOrKey === 'number' || (typeof cipherOrKey === 'string' && !isNaN(cipherOrKey))) {
    shiftInput = cipherOrKey;
    isDecrypt = Boolean(keyRaw);
  }

  const parsed = parseShift(shiftInput);
  if (parsed.error) {
    return { steps: [], output: '', error: parsed.error, key: 0 };
  }

  const s = parsed.value;
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
        formulaLatex: '\\text{Non-alphabetical: passthrough}',
        p: null,
        c: null,
        shift: s
      });
      continue;
    }

    const upper = ch.toUpperCase();
    const p = upper.charCodeAt(0) - 65; // 0..25
    let c, detail, formulaLatex;

    if (!isDecrypt) {
      const sum = p + s;
      c = mod26(sum);
      detail = `${upper} = ${p}, + shift ${s} = ${sum}, mod 26 = ${c} (${String.fromCharCode(65 + c)})`;
      formulaLatex = `(${p} + ${s}) \\equiv ${c} \\pmod{26}`;
    } else {
      const diff = p - s;
      c = mod26(diff);
      detail = `${upper} = ${p}, - shift ${s} = ${diff}, mod 26 = ${c} (${String.fromCharCode(65 + c)})`;
      formulaLatex = `(${p} - ${s}) \\equiv ${c} \\pmod{26}`;
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
      shift: s,
      upperInput: upper,
      upperOutput: outCh
    });
  }

  const output = steps.map(s => s.output).join('');
  return { steps, output, error: null, key: s };
}

export function caesarEncrypt(text, shift) {
  return buildSteps(text, 'caesar', shift, false).output;
}

export function caesarDecrypt(text, shift) {
  return buildSteps(text, 'caesar', shift, true).output;
}
