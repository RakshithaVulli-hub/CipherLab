/**
 * Cryptanalysis & Break-It Module
 * Provides tools to break ciphers using frequency analysis, chi-squared scoring,
 * Index of Coincidence (IoC), and Kasiski examination.
 */
import { caesarDecrypt } from './caesar.js';
import { vigenereDecrypt } from './vigenere.js';

// Standard English letter frequencies (in percentage 0..100)
export const ENGLISH_FREQUENCIES = {
  A: 8.167, B: 1.492, C: 2.782, D: 4.253, E: 12.702,
  F: 2.228, G: 2.015, H: 6.094, I: 6.966, J: 0.153,
  K: 0.772, L: 4.025, M: 2.406, N: 6.749, O: 7.507,
  P: 1.929, Q: 0.095, R: 5.987, S: 6.327, T: 9.056,
  U: 2.758, V: 0.978, W: 2.360, X: 0.150, Y: 1.974,
  Z: 0.074
};

export const COMMON_ENGLISH_WORDS = new Set([
  'THE', 'BE', 'TO', 'OF', 'AND', 'A', 'IN', 'THAT', 'HAVE', 'I',
  'IT', 'FOR', 'NOT', 'ON', 'WITH', 'HE', 'AS', 'YOU', 'DO', 'AT',
  'THIS', 'BUT', 'HIS', 'BY', 'FROM', 'THEY', 'WE', 'SAY', 'HER',
  'SHE', 'OR', 'AN', 'WILL', 'MY', 'ONE', 'ALL', 'WOULD', 'THERE',
  'THEIR', 'WHAT', 'SO', 'UP', 'OUT', 'IF', 'ABOUT', 'WHO', 'GET',
  'WHICH', 'GO', 'ME', 'WHEN', 'MAKE', 'CAN', 'LIKE', 'TIME', 'NO',
  'JUST', 'HIM', 'KNOW', 'TAKE', 'PEOPLE', 'INTO', 'YEAR', 'YOUR',
  'GOOD', 'SOME', 'COULD', 'THEM', 'SEE', 'OTHER', 'THAN', 'THEN',
  'NOW', 'LOOK', 'ONLY', 'COME', 'ITS', 'OVER', 'THINK', 'ALSO',
  'BACK', 'AFTER', 'USE', 'TWO', 'HOW', 'OUR', 'WORK', 'FIRST',
  'WELL', 'WAY', 'EVEN', 'NEW', 'WANT', 'BECAUSE', 'ANY', 'THESE',
  'GIVE', 'DAY', 'MOST', 'US', 'ATTACK', 'DAWN', 'SECRET', 'CIPHER'
]);

/**
 * Calculates letter counts and percentage frequencies for given text.
 */
export function getLetterFrequencies(text) {
  const counts = {};
  for (let c = 65; c <= 90; c++) {
    counts[String.fromCharCode(c)] = 0;
  }

  let totalLetters = 0;
  for (const ch of String(text).toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      counts[ch]++;
      totalLetters++;
    }
  }

  const frequencies = {};
  for (const [letter, count] of Object.entries(counts)) {
    frequencies[letter] = totalLetters > 0 ? (count / totalLetters) * 100 : 0;
  }

  return { counts, frequencies, totalLetters };
}

/**
 * Computes Chi-Squared statistic between observed text and standard English.
 * Lower chi-squared = higher probability of natural English.
 */
export function calculateChiSquared(text) {
  const { counts, totalLetters } = getLetterFrequencies(text);
  if (totalLetters === 0) return Infinity;

  let chiSq = 0;
  for (let c = 65; c <= 90; c++) {
    const letter = String.fromCharCode(c);
    const observed = counts[letter];
    const expected = (ENGLISH_FREQUENCIES[letter] / 100) * totalLetters;
    if (expected > 0) {
      chiSq += Math.pow(observed - expected, 2) / expected;
    }
  }

  return chiSq;
}

/**
 * Score how much an English text contains common dictionary words.
 */
export function countDictionaryMatches(text) {
  const words = String(text).toUpperCase().split(/[^A-Z]+/).filter(w => w.length >= 2);
  let matches = 0;
  for (const w of words) {
    if (COMMON_ENGLISH_WORDS.has(w)) {
      matches++;
    }
  }
  return { matches, totalWords: words.length };
}

/**
 * Caesar Brute Force: tries all 25 shifts and scores each candidate.
 */
export function breakCaesar(ciphertext) {
  const results = [];

  for (let s = 0; s < 26; s++) {
    const candidate = caesarDecrypt(ciphertext, s);
    const chiSquared = calculateChiSquared(candidate);
    const { matches, totalWords } = countDictionaryMatches(candidate);
    
    // Combined score: lower chi-squared is better, more dictionary hits is better
    const score = (matches * 100) - (chiSquared === Infinity ? 9999 : chiSquared);

    results.push({
      shift: s,
      text: candidate,
      chiSquared: Math.round(chiSquared * 10) / 10,
      dictionaryMatches: matches,
      totalWords,
      score
    });
  }

  // Sort with highest score first
  results.sort((a, b) => b.score - a.score);

  return {
    bestShift: results[0]?.shift ?? 0,
    bestText: results[0]?.text ?? '',
    candidates: results
  };
}

/**
 * Calculates Index of Coincidence (IoC).
 * I = sum(f_i * (f_i - 1)) / (N * (N - 1))
 */
export function calculateIndexOfCoincidence(text) {
  const { counts, totalLetters } = getLetterFrequencies(text);
  if (totalLetters < 2) return 0;

  let sum = 0;
  for (const count of Object.values(counts)) {
    sum += count * (count - 1);
  }

  return sum / (totalLetters * (totalLetters - 1));
}

/**
 * Kasiski Examination to estimate Vigenere key length.
 * Finds repeating n-grams (3+ letters), measures distances, and checks common factors.
 */
export function kasiskiExamination(text) {
  const clean = String(text).toUpperCase().replace(/[^A-Z]/g, '');
  const seqLength = 3;
  const positions = {};

  for (let i = 0; i <= clean.length - seqLength; i++) {
    const seq = clean.slice(i, i + seqLength);
    if (!positions[seq]) positions[seq] = [];
    positions[seq].push(i);
  }

  const repeats = [];
  const distances = [];

  for (const [seq, posList] of Object.entries(positions)) {
    if (posList.length > 1) {
      for (let i = 0; i < posList.length - 1; i++) {
        const dist = posList[i + 1] - posList[i];
        distances.push(dist);
        repeats.push({ seq, pos1: posList[i], pos2: posList[i + 1], distance: dist });
      }
    }
  }

  // Count factors of the distances (2 through 15)
  const factorCounts = {};
  for (let f = 2; f <= 12; f++) {
    factorCounts[f] = 0;
  }

  for (const d of distances) {
    for (let f = 2; f <= 12; f++) {
      if (d % f === 0) {
        factorCounts[f]++;
      }
    }
  }

  // Find most likely key length
  let bestFactor = 3;
  let maxCount = -1;
  for (const [f, count] of Object.entries(factorCounts)) {
    if (count > maxCount) {
      maxCount = count;
      bestFactor = parseInt(f, 10);
    }
  }

  const ioc = calculateIndexOfCoincidence(text);

  return {
    repeats: repeats.slice(0, 10), // Top 10 repeats
    distances,
    factorCounts,
    estimatedKeyLength: bestFactor,
    ioc: Math.round(ioc * 10000) / 10000
  };
}

// Mystery challenges for interactive Break-It mode
export const MYSTERY_CHALLENGES = [
  {
    id: 1,
    title: 'Level 1: Caesar In the Wild',
    cipher: 'Caesar',
    ciphertext: 'KHOOR IULHQG! BRX KDYH VXFFHVVIXOOB GHFRGHG WKH ILUVW PHVVDJH.',
    hint: 'Julius Caesar loved the shift of 3. Look at "KHOOR" -> what 5-letter greeting starts with H?',
    expectedSolution: 'HELLO FRIEND! YOU HAVE SUCCESSFULLY DECODED THE FIRST MESSAGE.',
    key: '3'
  },
  {
    id: 2,
    title: 'Level 2: The Reversed Scroll (Atbash)',
    cipher: 'Atbash',
    ciphertext: 'GSV KZHHDLIW RH ZGYZHS',
    hint: 'The first letter of the alphabet becomes the last letter (A becomes Z, B becomes Y).',
    expectedSolution: 'THE PASSWORD IS ATBASH',
    key: 'A <-> Z'
  },
  {
    id: 3,
    title: 'Level 3: Vigenère Diplomacy',
    cipher: 'Vigenere',
    ciphertext: 'LXFOPV EF RNHR',
    hint: 'Famous WWII code example. The keyword is a yellow citrus fruit (5 letters).',
    expectedSolution: 'ATTACK AT DAWN',
    key: 'LEMON'
  }
];
