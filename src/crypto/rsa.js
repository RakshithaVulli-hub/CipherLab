/**
 * RSA Cryptosystem Module
 * Uses JavaScript native BigInt for arbitrary-precision arithmetic.
 * Includes:
 *   - Extended Euclidean Algorithm with full step table
 *   - Square-and-Multiply (Binary Modular Exponentiation) with step-by-step trace
 *   - Miller-Rabin primality testing
 *   - Classroom mode & Real-world mode presets
 *   - Factoring difficulty and security comparison data
 */

// Greatest Common Divisor for BigInt
export function bigGcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Extended Euclidean Algorithm for BigInt
 * Finds x, y such that a * x + b * y = gcd(a, b).
 * Returns { gcd, x, y, steps: Array }
 */
export function extendedGcd(a, b) {
  let old_r = BigInt(a), r = BigInt(b);
  let old_s = 1n, s = 0n;
  let old_t = 0n, t = 1n;

  const steps = [
    {
      step: 0,
      q: '-',
      r: old_r.toString(),
      s: old_s.toString(),
      t: old_t.toString(),
      formula: `r₀ = ${old_r}, s₀ = 1, t₀ = 0`
    },
    {
      step: 1,
      q: '-',
      r: r.toString(),
      s: s.toString(),
      t: t.toString(),
      formula: `r₁ = ${r}, s₁ = 0, t₁ = 1`
    }
  ];

  let stepCount = 2;
  while (r !== 0n) {
    const quotient = old_r / r;

    let temp_r = r;
    r = old_r - quotient * r;
    old_r = temp_r;

    let temp_s = s;
    s = old_s - quotient * s;
    old_s = temp_s;

    let temp_t = t;
    t = old_t - quotient * t;
    old_t = temp_t;

    steps.push({
      step: stepCount++,
      q: quotient.toString(),
      r: r.toString(),
      s: s.toString(),
      t: t.toString(),
      formula: `q = ${quotient}, r = ${old_r} - (${quotient} × ${temp_r}) = ${r}`
    });
  }

  return {
    gcd: old_r,
    x: old_s,
    y: old_t,
    steps
  };
}

/**
 * Modular inverse: d = e^(-1) mod phi
 */
export function modInverseBig(e, phi) {
  const { gcd, x } = extendedGcd(e, phi);
  if (gcd !== 1n) return null;
  return ((x % phi) + phi) % phi;
}

/**
 * Square-and-Multiply (Binary Modular Exponentiation)
 * Computes (base^exp) mod mod.
 * Returns { result, steps: Array }
 */
export function squareAndMultiply(base, exp, mod) {
  base = BigInt(base) % BigInt(mod);
  exp = BigInt(exp);
  mod = BigInt(mod);

  if (mod === 1n) return { result: 0n, steps: [] };
  if (exp === 0n) return { result: 1n, steps: [] };

  const bin = exp.toString(2);
  let current = 1n;
  const steps = [];

  for (let i = 0; i < bin.length; i++) {
    const bit = bin[i];
    const prev = current;
    
    // 1. Square
    const squared = (current * current) % mod;
    let multiplyResult = squared;
    let actionDesc = `Square: (${prev}² mod ${mod}) = ${squared}`;
    let formulaLatex = `${prev}^2 \\equiv ${squared} \\pmod{${mod}}`;

    // 2. Multiply if bit is 1
    if (bit === '1') {
      multiplyResult = (squared * base) % mod;
      actionDesc += ` | Bit is 1: Multiply by base (${squared} × ${base} mod ${mod}) = ${multiplyResult}`;
      formulaLatex += ` \\quad \\rightarrow \\quad (${squared} \\times ${base}) \\equiv ${multiplyResult} \\pmod{${mod}}`;
    }

    current = multiplyResult;

    steps.push({
      stepIndex: i + 1,
      bit,
      bitPosition: bin.length - 1 - i,
      prevVal: prev.toString(),
      squaredVal: squared.toString(),
      finalVal: current.toString(),
      actionDesc,
      formulaLatex
    });
  }

  return { result: current, steps };
}

/**
 * Miller-Rabin primality test for BigInt
 */
export function isProbablePrime(n, k = 10) {
  n = BigInt(n);
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;

  // Write n - 1 as 2^s * d
  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }

  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  const rounds = Math.min(k, bases.length);

  for (let i = 0; i < rounds; i++) {
    const a = bases[i];
    if (n <= a) break;

    let x = squareAndMultiply(a, d, n).result;
    if (x === 1n || x === n - 1n) continue;

    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = (x * x) % n;
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

/**
 * Validates RSA parameters (p, q, e)
 */
export function validateRsaKeys(pStr, qStr, eStr) {
  try {
    const p = BigInt(String(pStr).trim());
    const q = BigInt(String(qStr).trim());
    const e = BigInt(String(eStr).trim());

    if (p <= 1n || q <= 1n) {
      return { error: 'Primes p and q must be greater than 1.' };
    }
    if (p === q) {
      return { error: 'p and q must be distinct primes for security (p ≠ q).' };
    }
    if (!isProbablePrime(p)) {
      return { error: `p = ${p} is NOT a prime number!` };
    }
    if (!isProbablePrime(q)) {
      return { error: `q = ${q} is NOT a prime number!` };
    }

    const n = p * q;
    const phi = (p - 1n) * (q - 1n);

    if (e <= 1n || e >= phi) {
      return { error: `e must be in the range 1 < e < φ(n) (${phi}).` };
    }

    const g = bigGcd(e, phi);
    if (g !== 1n) {
      return {
        error: `e (${e}) and φ(n) (${phi}) are not coprime! gcd(${e}, ${phi}) = ${g}. Choose an e with gcd(e, φ(n)) = 1.`
      };
    }

    const extGcdRes = extendedGcd(e, phi);
    const d = modInverseBig(e, phi);

    if (!d) {
      return { error: 'Could not compute modular inverse d. Ensure gcd(e, φ(n)) = 1.' };
    }

    return {
      p,
      q,
      n,
      phi,
      e,
      d,
      euclidSteps: extGcdRes.steps,
      error: null
    };
  } catch (err) {
    return { error: 'Invalid numeric inputs for RSA keys: ' + err.message };
  }
}

/**
 * Encrypt a text message character-by-character using RSA.
 * c_i = (m_i^e) mod n
 */
export function rsaEncrypt(text, e, n) {
  e = BigInt(e);
  n = BigInt(n);
  const cipherNumbers = [];
  const steps = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const m = BigInt(ch.charCodeAt(0));
    const { result, steps: expSteps } = squareAndMultiply(m, e, n);
    cipherNumbers.push(result.toString());

    steps.push({
      index: i,
      char: ch,
      m: m.toString(),
      c: result.toString(),
      formula: `c = ${m}^{${e}} \\pmod{${n}} = ${result}`,
      expSteps
    });
  }

  return {
    cipherText: cipherNumbers.join(' '),
    cipherNumbers,
    steps
  };
}

/**
 * Decrypt a sequence of cipher numbers back to plaintext.
 * m_i = (c_i^d) mod n
 */
export function rsaDecrypt(cipherNumbersOrText, d, n) {
  d = BigInt(d);
  n = BigInt(n);

  let nums = [];
  if (Array.isArray(cipherNumbersOrText)) {
    nums = cipherNumbersOrText;
  } else {
    nums = String(cipherNumbersOrText).trim().split(/\s+/).filter(Boolean);
  }

  const plainChars = [];
  const steps = [];

  for (let i = 0; i < nums.length; i++) {
    const c = BigInt(nums[i]);
    const { result, steps: expSteps } = squareAndMultiply(c, d, n);
    const charCode = Number(result);
    const ch = String.fromCharCode(charCode);
    plainChars.push(ch);

    steps.push({
      index: i,
      c: c.toString(),
      m: result.toString(),
      char: ch,
      formula: `m = ${c}^{${d}} \\pmod{${n}} = ${result} \\; ('${ch}')`,
      expSteps
    });
  }

  return {
    plainText: plainChars.join(''),
    steps
  };
}

// Classroom Mode Presets
export const CLASSROOM_PRESETS = [
  { label: 'Classic (p=61, q=53)', p: '61', q: '53', e: '17', desc: 'Hand-checkable, n=3233, φ=3120, d=2753' },
  { label: 'Small Primes (p=17, q=19)', p: '17', q: '19', e: '5', desc: 'Compact, n=323, φ=288, d=173' },
  { label: 'Prime Pair (p=37, q=41)', p: '37', q: '41', e: '7', desc: 'Medium small, n=1517, φ=1440, d=1033' },
  { label: 'Prime Pair (p=89, q=97)', p: '89', q: '97', e: '13', desc: 'Large classroom, n=8633, φ=8448, d=2599' }
];

// Real-World Mode Presets
export const REAL_WORLD_PRESETS = [
  {
    label: '128-bit Demonstration Key',
    bits: 128,
    p: '340282366920938463463374607431768211507',
    q: '275421356789123456789123456789123456791',
    e: '65537',
    desc: 'Shows scale of astronomical numbers. Still fast in browser!'
  },
  {
    label: '256-bit Security Key',
    bits: 256,
    p: '115792089237316195423570985008687907853269984665640564039457584007913129639747',
    q: '8754213567891234567891234567891234567891234567891234567891234567891234567891',
    e: '65537',
    desc: '256-bit modulus demonstrates arbitrary precision BigInt processing.'
  }
];

// Time to factor comparison data
export const FACTORING_SECURITY_DATA = [
  { bits: '16 bits', modulusDigits: 5, timeClassical: '< 1 millisecond', timeQuantum: '< 1 microsecond', status: 'Insecure (trivial brute force)' },
  { bits: '64 bits', modulusDigits: 20, timeClassical: 'A few seconds', timeQuantum: '< 1 millisecond', status: 'Broken on desktop PC' },
  { bits: '512 bits', modulusDigits: 155, timeClassical: 'Factored in 1999 (months)', timeQuantum: '< 1 second', status: 'Historically broken (RSA-155)' },
  { bits: '1024 bits', modulusDigits: 309, timeClassical: '~1,000,000 CPU years', timeQuantum: 'A few minutes', status: 'Deprecated by NIST in 2013' },
  { bits: '2048 bits', modulusDigits: 617, timeClassical: '> 10^30 years (billions of years)', timeQuantum: '~Few hours (requires ~4000 logical qubits)', status: 'Current Standard (Safe against classical)' },
  { bits: '4096 bits', modulusDigits: 1234, timeClassical: '> Age of Universe × 10^10', timeQuantum: 'Days', status: 'Military Grade' }
];
