import { describe, it, expect } from 'vitest';
import {
  caesarEncrypt, caesarDecrypt, mod26, buildSteps as buildCaesarSteps,
  vigenereEncrypt, vigenereDecrypt, buildSteps as buildVigSteps,
  affineEncrypt, affineDecrypt, gcd, modInverse, buildAffineSteps,
  atbashEncrypt, atbashDecrypt, buildAtbashSteps,
  railFenceEncrypt, railFenceDecrypt, buildRailFenceSteps,
  extendedGcd, squareAndMultiply, validateRsaKeys, rsaEncrypt, rsaDecrypt, isProbablePrime,
  computeDiffieHellman,
  breakCaesar, getLetterFrequencies, calculateIndexOfCoincidence, kasiskiExamination
} from '../crypto/index.js';

describe('Caesar Cipher', () => {
  it('correctly shifts known vectors', () => {
    expect(caesarEncrypt('ABC xyz', 3)).toBe('DEF abc');
    expect(caesarEncrypt('XYZ', 3)).toBe('ABC');
    expect(caesarEncrypt('ABC', -1)).toBe('ZAB');
    expect(caesarEncrypt('A', 29)).toBe('D');
  });

  it('preserves roundtrip identity and non-letter passthrough', () => {
    const text = 'Hello, World! 123 😀';
    const encrypted = caesarEncrypt(text, 7);
    expect(caesarDecrypt(encrypted, 7)).toBe(text);
  });
});

describe('Vigenere Cipher', () => {
  it('handles classic LEMON example with space passthrough', () => {
    expect(vigenereEncrypt('ATTACKATDAWN', 'LEMON')).toBe('LXFOPVEFRNHR');
    expect(vigenereEncrypt('ATTACK AT DAWN', 'LEMON')).toBe('LXFOPV EF RNHR');
    expect(vigenereDecrypt('LXFOPV EF RNHR', 'LEMON')).toBe('ATTACK AT DAWN');
  });

  it('handles round-trips with various keys', () => {
    const text = 'The quick brown fox jumps over the lazy dog!';
    for (const key of ['SECRET', 'A', 'CIPHER', 'xyz']) {
      const enc = vigenereEncrypt(text, key);
      expect(vigenereDecrypt(enc, key)).toBe(text);
    }
  });
});

describe('Affine Cipher', () => {
  it('checks coprime condition and modular inverse', () => {
    expect(gcd(5, 26)).toBe(1);
    expect(gcd(4, 26)).toBe(2);
    expect(modInverse(5, 26)).toBe(21);
    expect(modInverse(3, 26)).toBe(9);
  });

  it('encrypts and decrypts correctly', () => {
    const plain = 'AFFINE CIPHER';
    const enc = affineEncrypt(plain, 5, 8);
    expect(affineDecrypt(enc, 5, 8)).toBe(plain);
  });

  it('rejects non-coprime key a', () => {
    const res = buildAffineSteps('TEST', 4, 3);
    expect(res.error).toContain('coprime to 26');
  });
});

describe('Atbash Cipher', () => {
  it('is an involution E(E(x)) = x', () => {
    const text = 'ABCXYZ Hello World!';
    const enc = atbashEncrypt(text);
    expect(enc).toBe('ZYXCBA Svool Dliow!');
    expect(atbashDecrypt(enc)).toBe(text);
  });
});

describe('Rail Fence Cipher', () => {
  it('encrypts and decrypts with 3 rails', () => {
    const text = 'WE ARE DISCOVERED FLEE AT ONCE';
    const enc = railFenceEncrypt(text, 3);
    expect(railFenceDecrypt(enc, 3)).toBe(text);
  });

  it('supports various rail heights', () => {
    const text = 'CRYPTOGRAPHY IS BEAUTIFUL';
    for (const rails of [2, 3, 4, 5]) {
      const enc = railFenceEncrypt(text, rails);
      expect(railFenceDecrypt(enc, rails)).toBe(text);
    }
  });
});

describe('RSA Cryptosystem', () => {
  it('computes Extended Euclidean Algorithm steps correctly', () => {
    // gcd(17, 3120) = 1, inverse is 2753
    const res = extendedGcd(17n, 3120n);
    expect(res.gcd).toBe(1n);
    const d = ((res.x % 3120n) + 3120n) % 3120n;
    expect(d).toBe(2753n);
    expect(res.steps.length).toBeGreaterThan(2);
  });

  it('performs square-and-multiply modular exponentiation', () => {
    // 7^5 mod 13 = 16807 mod 13 = 11
    const { result, steps } = squareAndMultiply(7n, 5n, 13n);
    expect(result).toBe(11n);
    expect(steps.length).toBe(3); // 5 in binary is 101 -> 3 bits
  });

  it('validates primes and generates valid RSA key pairs', () => {
    expect(isProbablePrime(61n)).toBe(true);
    expect(isProbablePrime(53n)).toBe(true);
    expect(isProbablePrime(60n)).toBe(false);

    const keys = validateRsaKeys('61', '53', '17');
    expect(keys.error).toBeNull();
    expect(keys.n).toBe(3233n);
    expect(keys.phi).toBe(3120n);
    expect(keys.d).toBe(2753n);
  });

  it('encrypts and decrypts messages with RSA', () => {
    const keys = validateRsaKeys('61', '53', '17');
    const msg = 'HACK';
    const { cipherNumbers } = rsaEncrypt(msg, keys.e, keys.n);
    const { plainText } = rsaDecrypt(cipherNumbers, keys.d, keys.n);
    expect(plainText).toBe(msg);
  });
});

describe('Diffie-Hellman Key Exchange', () => {
  it('reaches identical shared secret for Alice and Bob', () => {
    const res = computeDiffieHellman({ pStr: '23', gStr: '5', aStr: '6', bStr: '15' });
    expect(res.error).toBeNull();
    expect(res.match).toBe(true);
    expect(res.sharedKey).toBe('2');
  });
});

describe('Cryptanalysis & Break-It', () => {
  it('breaks Caesar cipher via frequency scoring', () => {
    const original = 'THE SECRET PLANS ARE HIDDEN IN THE CASTLE AT MIDNIGHT';
    const encrypted = caesarEncrypt(original, 7);
    const { bestShift, bestText } = breakCaesar(encrypted);
    expect(bestShift).toBe(7);
    expect(bestText).toBe(original);
  });

  it('computes letter frequencies and Index of Coincidence', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    const freqs = getLetterFrequencies(text);
    expect(freqs.totalLetters).toBe(35);
    const ioc = calculateIndexOfCoincidence(text);
    expect(ioc).toBeGreaterThan(0.02);
  });

  it('performs Kasiski examination to detect repeated distances', () => {
    const text = 'XYZABCXYZDEFXYZGHI';
    const kasiski = kasiskiExamination(text);
    expect(kasiski.repeats.length).toBeGreaterThan(0);
    expect(kasiski.estimatedKeyLength).toBeGreaterThan(1);
  });
});
