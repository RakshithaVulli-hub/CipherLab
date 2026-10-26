import React from 'react';
import { X, BookOpen } from 'lucide-react';
import MathFormula from './MathFormula.jsx';

const TERMS = [
  {
    term: 'Modular Arithmetic (Clock Math)',
    formula: 'a \\equiv b \\pmod m',
    definition: 'A system of arithmetic for integers where numbers wrap around upon reaching a certain value—the modulus m. In 26-letter alphabets, 25 + 3 = 28 ≡ 2 (mod 26).'
  },
  {
    term: "Euler's Totient Function φ(n)",
    formula: '\\phi(n) = (p-1)(q-1)',
    definition: 'Counts the number of positive integers up to n that are coprime to n. For the product of two distinct primes n = p·q, φ(n) = (p-1)(q-1).'
  },
  {
    term: 'Modular Multiplicative Inverse',
    formula: 'a \\cdot a^{-1} \\equiv 1 \\pmod m',
    definition: 'An integer x such that (a·x) mod m = 1. Exists if and only if gcd(a, m) = 1. Used in Affine and RSA decryption.'
  },
  {
    term: 'Coprime (Relatively Prime)',
    formula: '\\gcd(a, b) = 1',
    definition: 'Two integers a and b are coprime if their greatest common divisor is 1, meaning they share no common prime factors.'
  },
  {
    term: 'Extended Euclidean Algorithm',
    formula: 'a \\cdot s + b \\cdot t = \\gcd(a, b)',
    definition: 'An extension of Euclid algorithm that computes the Bézout identity coefficients s and t, allowing rapid calculation of modular inverses.'
  },
  {
    term: 'Square-and-Multiply Exponentiation',
    formula: 'O(\\log_2 e) \\text{ multiplications}',
    definition: 'Fast modular exponentiation algorithm. Instead of multiplying e times, it scans the binary representation of e, squaring at each step and multiplying by base only on 1 bits.'
  },
  {
    term: 'Index of Coincidence (IoC)',
    formula: 'I = \\frac{\\sum f_i(f_i - 1)}{N(N - 1)}',
    definition: 'A statistical measure of letter distribution roughness. English text has IoC ≈ 0.067, while random letters yield ≈ 0.038. Used to break polyalphabetic ciphers.'
  },
  {
    term: 'Trapdoor One-Way Function',
    formula: 'f(x) \\text{ easy, } f^{-1}(y) \\text{ hard without secret trapdoor}',
    definition: 'A function that is computationally easy to calculate in one direction, but practically impossible to invert unless specialized side information (the private key) is known.'
  }
];

export default function GlossaryModal({ isOpen, onClose }) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 id="glossary-title" className="font-bold text-white text-base">Mathematical Cryptography Glossary</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 divide-y divide-slate-800/60">
          {TERMS.map((t, idx) => (
            <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                <span className="font-bold text-cyan-300 text-sm">{t.term}</span>
                <MathFormula tex={t.formula} className="text-xs text-amber-300 font-mono" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {t.definition}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            aria-label="Close glossary dialog"
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono font-semibold transition"
          >
            Close Glossary
          </button>
        </div>
      </div>
    </div>
  );
}
