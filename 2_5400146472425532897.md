# CipherLab

Interactive cryptography learning tool. Caesar and Vigenere ciphers, with a step-by-step view that shows each letter's transformation.

## Run it

Option 1: double-click `index.html`. It opens in any modern browser. No install, no server, no build.

Option 2: deploy to Vercel. Drag the `crypto-tool` folder into the Vercel dashboard (or run `npx vercel` inside it). It is a static site with a single `index.html` at the root, so no config is needed.

Tailwind is not used. All styling is inline CSS in `index.html`, so it works offline.

## What is in it

- Message box, cipher picker (Caesar or Vigenere), encrypt or decrypt toggle.
- Caesar: shift slider plus number box (any whole number, wraps mod 26).
- Vigenere: keyword box (letters only; non-letters are stripped).
- Output panel with a round-trip check: it runs the inverse mode on the output and confirms the original comes back.
- Step-by-step panel: Play, Pause, Prev, Next, reset, adjustable speed. Each step shows the input letter, the output letter, and the arithmetic. Vigenere steps show the key letter used. Click any tile to jump to that character.
- Learn card: one paragraph per cipher.
- Spaces and punctuation pass through unchanged. For Vigenere they do not advance the key.

## Tests

`node test_core.js` runs the cipher logic in node: known vectors (including the classic ATTACKATDAWN / LEMON example), wrap-around, negative and large shifts, round-trips across many inputs, and passthrough of non-letters. Expected last line: `ALL PASSED`.

## Demo script (about 3 minutes)

1. Open the page. Say: "This is a Caesar cipher with shift 3. Each letter moves three places in the alphabet."
2. Click Play at slow speed. Point at the step card: "H plus 3 is K. The math is right there, not hidden."
3. Click the Vigenere option. Keyword is LEMON. Say: "Now each letter uses a different shift from the keyword. Watch the key letter change."
4. Click a space tile in the step panel. Say: "Spaces pass through and don't use up a key letter."
5. Hit Swap in/out, then Decrypt. Say: "Same tool, opposite direction. The round-trip check shows the original comes back exactly."
6. Open the Learn card. One sentence on why Caesar breaks (only 25 keys) and why Vigenere is stronger but still breakable with a short key (Kasiski).
7. Close on the roadmap: "RSA key exchange is the next module. It is not built yet; this is the prototype."

## Known limits

- Educational only. Do not use these ciphers to protect real data.
- Letters only (A-Z). Accented letters pass through unchanged.
- RSA key exchange is planned future work and is not implemented.
