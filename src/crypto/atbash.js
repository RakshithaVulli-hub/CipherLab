/**
 * Atbash Cipher Module
 * Ancient monoalphabetic substitution cipher where the alphabet is inverted:
 *   A <-> Z, B <-> Y, C <-> X, etc.
 * Mathematical definition:
 *   E(x) = (25 - x) mod 26
 * Notice that Atbash is an involution: E(E(x)) = x (encryption and decryption are identical).
 */

export function buildAtbashSteps(text) {
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
    const p = upper.charCodeAt(0) - 65; // 0..25
    const c = 25 - p;
    const outCh = String.fromCharCode(65 + c);
    const out = ch === ch.toLowerCase() ? outCh.toLowerCase() : outCh;

    steps.push({
      index: i,
      input: ch,
      output: out,
      isLetter: true,
      detail: `${upper} = ${p}, reversed = 25 - ${p} = ${c} (${outCh})`,
      formulaLatex: `25 - ${p} = ${c} \\quad (${upper} \\leftrightarrow ${outCh})`,
      p,
      c,
      upperInput: upper,
      upperOutput: outCh
    });
  }

  const output = steps.map(s => s.output).join('');
  return { steps, output, error: null };
}

export function atbashEncrypt(text) {
  return buildAtbashSteps(text).output;
}

export function atbashDecrypt(text) {
  return buildAtbashSteps(text).output;
}
