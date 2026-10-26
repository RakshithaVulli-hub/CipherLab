/**
 * Diffie-Hellman Key Exchange Module
 * Explains and computes modular exponentiation key exchange alongside
 * the paint-mixing physical analogy.
 */
import { squareAndMultiply, isProbablePrime } from './rsa.js';

export function computeDiffieHellman({ pStr = '23', gStr = '5', aStr = '6', bStr = '15' }) {
  try {
    const p = BigInt(pStr);
    const g = BigInt(gStr);
    const a = BigInt(aStr);
    const b = BigInt(bStr);

    if (p <= 2n || !isProbablePrime(p)) {
      return { error: `Modulus p = ${p} must be a prime number.` };
    }
    if (g <= 1n || g >= p) {
      return { error: `Generator g must be in range 1 < g < p.` };
    }
    if (a <= 0n || a >= p) {
      return { error: `Alice's secret 'a' must be in range 1 <= a < p.` };
    }
    if (b <= 0n || b >= p) {
      return { error: `Bob's secret 'b' must be in range 1 <= b < p.` };
    }

    // Alice calculates A = g^a mod p
    const { result: A, steps: alicePublicSteps } = squareAndMultiply(g, a, p);

    // Bob calculates B = g^b mod p
    const { result: B, steps: bobPublicSteps } = squareAndMultiply(g, b, p);

    // Alice calculates shared secret K = B^a mod p
    const { result: keyAlice, steps: aliceSecretSteps } = squareAndMultiply(B, a, p);

    // Bob calculates shared secret K = A^b mod p
    const { result: keyBob, steps: bobSecretSteps } = squareAndMultiply(A, b, p);

    const match = keyAlice === keyBob;

    return {
      p: p.toString(),
      g: g.toString(),
      a: a.toString(),
      b: b.toString(),
      A: A.toString(),
      B: B.toString(),
      sharedKey: keyAlice.toString(),
      match,
      alicePublicSteps,
      bobPublicSteps,
      aliceSecretSteps,
      bobSecretSteps,
      error: null
    };
  } catch (err) {
    return { error: 'Error computing Diffie-Hellman: ' + err.message };
  }
}
