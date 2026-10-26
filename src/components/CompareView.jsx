import React, { useState, useMemo } from 'react';
import { Columns, ArrowRight, ShieldCheck, Scale } from 'lucide-react';
import MathFormula from './MathFormula.jsx';
import { caesarEncrypt } from '../crypto/caesar.js';
import { vigenereEncrypt } from '../crypto/vigenere.js';
import { affineEncrypt } from '../crypto/affine.js';
import { atbashEncrypt } from '../crypto/atbash.js';
import { railFenceEncrypt } from '../crypto/railfence.js';
import { validateRsaKeys, rsaEncrypt } from '../crypto/rsa.js';

export default function CompareView() {
  const [text, setText] = useState('ATTACK AT DAWN ON THE CASTLE');
  const [cipher1, setCipher1] = useState('caesar');
  const [cipher2, setCipher2] = useState('vigenere');

  const getCipherDetails = (type, input) => {
    switch (type) {
      case 'caesar': {
        const out = caesarEncrypt(input, 3);
        return {
          name: 'Caesar Cipher (Shift 3)',
          type: 'Monoalphabetic Substitution',
          keySpace: '25 keys (Trivial brute-force)',
          frequencyPreserved: 'Yes (1-to-1 letter mapping)',
          output: out
        };
      }
      case 'vigenere': {
        const out = vigenereEncrypt(input, 'LEMON');
        return {
          name: 'Vigenère Cipher (Key: LEMON)',
          type: 'Polyalphabetic Substitution',
          keySpace: '26⁵ ≈ 1.18 × 10⁷ keys',
          frequencyPreserved: 'No (Flattens frequency spikes)',
          output: out
        };
      }
      case 'affine': {
        const out = affineEncrypt(input, 5, 8);
        return {
          name: 'Affine Cipher (a=5, b=8)',
          type: 'Monoalphabetic Linear',
          keySpace: '12 × 26 = 312 keys',
          frequencyPreserved: 'Yes (Permutes frequencies)',
          output: out
        };
      }
      case 'atbash': {
        const out = atbashEncrypt(input);
        return {
          name: 'Atbash Cipher',
          type: 'Monoalphabetic Reflection (Involution)',
          keySpace: '1 fixed key (Symmetric)',
          frequencyPreserved: 'Yes (Mirror frequency)',
          output: out
        };
      }
      case 'railfence': {
        const out = railFenceEncrypt(input, 3);
        return {
          name: 'Rail Fence (3 Rails)',
          type: 'Transposition (Permutation)',
          keySpace: 'Rails 2..N',
          frequencyPreserved: 'Preserves letter counts, scrambles order',
          output: out
        };
      }
      case 'rsa': {
        const keys = validateRsaKeys('61', '53', '17');
        const enc = rsaEncrypt(input, keys.e, keys.n);
        return {
          name: 'RSA Asymmetric (e=17, n=3233)',
          type: 'Asymmetric Public-Key (Number Theory)',
          keySpace: 'Exponential in modulus bits (O(exp(c (ln n)^(1/3))))',
          frequencyPreserved: 'No (Transforms characters into numerical blocks mod n)',
          output: enc.cipherText
        };
      }
      default:
        return { name: '', type: '', keySpace: '', frequencyPreserved: '', output: '' };
    }
  };

  const res1 = useMemo(() => getCipherDetails(cipher1, text), [cipher1, text]);
  const res2 = useMemo(() => getCipherDetails(cipher2, text), [cipher2, text]);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          Side-by-Side Cipher Comparison View
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Pass the exact same plaintext message through two different cryptographic algorithms simultaneously to contrast their mathematical mechanisms.
        </p>
      </div>

      {/* Input Message */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl">
        <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
          Input Plaintext Message:
        </label>
        <input
          type="text"
          value={text}
          aria-label="Input plaintext message for comparison"
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 focus:border-cyan-400 outline-none"
        />
      </div>

      {/* Side-by-side Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cipher 1 */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Algorithm A
              </span>
              <select
                value={cipher1}
                aria-label="Select Algorithm A"
                onChange={(e) => setCipher1(e.target.value)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded-xl px-2.5 py-1.5 outline-none"
              >
                <option value="caesar">Caesar (Shift 3)</option>
                <option value="vigenere">Vigenère (LEMON)</option>
                <option value="affine">Affine (5, 8)</option>
                <option value="atbash">Atbash (A &harr; Z)</option>
                <option value="railfence">Rail Fence (3 Rails)</option>
                <option value="rsa">RSA Asymmetric (e=17, n=3233)</option>
              </select>
            </div>

            <div className="text-base font-bold text-white mb-2">{res1.name}</div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-4 text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Ciphertext Output:</div>
              <div className="text-cyan-300 font-bold text-sm break-all mt-1">{res1.output || '(empty)'}</div>
            </div>

            {/* Properties */}
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Cipher Class: </span>
                <span className="text-slate-200">{res1.type}</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Key Space: </span>
                <span className="text-amber-300">{res1.keySpace}</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Frequency Analysis: </span>
                <span className="text-slate-300">{res1.frequencyPreserved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cipher 2 */}
        <div className="glass-panel rounded-2xl p-5 border border-violet-500/30 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-violet-400 uppercase">
                Algorithm B
              </span>
              <select
                value={cipher2}
                aria-label="Select Algorithm B"
                onChange={(e) => setCipher2(e.target.value)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded-xl px-2.5 py-1.5 outline-none"
              >
                <option value="vigenere">Vigenère (LEMON)</option>
                <option value="caesar">Caesar (Shift 3)</option>
                <option value="affine">Affine (5, 8)</option>
                <option value="atbash">Atbash (A &harr; Z)</option>
                <option value="railfence">Rail Fence (3 Rails)</option>
                <option value="rsa">RSA Asymmetric (e=17, n=3233)</option>
              </select>
            </div>

            <div className="text-base font-bold text-white mb-2">{res2.name}</div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-4 text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Ciphertext Output:</div>
              <div className="text-violet-300 font-bold text-sm break-all mt-1">{res2.output || '(empty)'}</div>
            </div>

            {/* Properties */}
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Cipher Class: </span>
                <span className="text-slate-200">{res2.type}</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Key Space: </span>
                <span className="text-amber-300">{res2.keySpace}</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Frequency Analysis: </span>
                <span className="text-slate-300">{res2.frequencyPreserved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
