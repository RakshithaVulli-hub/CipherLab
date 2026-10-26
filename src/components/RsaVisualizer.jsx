import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Key, ShieldCheck, Lock, Unlock, Zap, HelpCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import MathFormula from './MathFormula.jsx';
import {
  validateRsaKeys,
  rsaEncrypt,
  rsaDecrypt,
  CLASSROOM_PRESETS,
  REAL_WORLD_PRESETS,
  FACTORING_SECURITY_DATA
} from '../crypto/rsa.js';

export default function RsaVisualizer({ isAdvanced = true }) {
  const [mode, setMode] = useState('classroom'); // 'classroom' | 'realworld'
  const [pInput, setPInput] = useState('61');
  const [qInput, setQInput] = useState('53');
  const [eInput, setEInput] = useState('17');
  const [plainMessage, setPlainMessage] = useState('RSA');
  const [selectedCharIdx, setSelectedCharIdx] = useState(0);

  // Validate and compute key pair
  const keyValidation = useMemo(() => {
    return validateRsaKeys(pInput, qInput, eInput);
  }, [pInput, qInput, eInput]);

  // Check if any character exceeds modulus n
  const exceedsModulus = useMemo(() => {
    if (keyValidation.error || !keyValidation.n || !plainMessage) return null;
    for (const ch of plainMessage) {
      if (BigInt(ch.charCodeAt(0)) >= keyValidation.n) {
        return { char: ch, code: ch.charCodeAt(0), n: keyValidation.n.toString() };
      }
    }
    return null;
  }, [plainMessage, keyValidation]);

  // Encryption result
  const encryptionResult = useMemo(() => {
    if (keyValidation.error || !keyValidation.e || !keyValidation.n || !plainMessage) return null;
    return rsaEncrypt(plainMessage, keyValidation.e, keyValidation.n);
  }, [plainMessage, keyValidation]);

  // Decryption verification
  const decryptionResult = useMemo(() => {
    if (!encryptionResult || keyValidation.error || !keyValidation.d || !keyValidation.n) return null;
    return rsaDecrypt(encryptionResult.cipherNumbers, keyValidation.d, keyValidation.n);
  }, [encryptionResult, keyValidation]);

  // Handle Preset Selection
  const applyPreset = (preset) => {
    setPInput(preset.p);
    setQInput(preset.q);
    setEInput(preset.e);
    setSelectedCharIdx(0);
  };

  const activeStep = encryptionResult?.steps && selectedCharIdx < encryptionResult.steps.length
    ? encryptionResult.steps[selectedCharIdx]
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Mode Selector & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Key className="w-5 h-5 text-cyan-400" />
            RSA Asymmetric Cryptosystem Lab
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Explore key generation, the Extended Euclidean Algorithm, and Square-and-Multiply modular exponentiation.
          </p>
        </div>

        {/* Classroom vs Real-world toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => {
              setMode('classroom');
              applyPreset(CLASSROOM_PRESETS[0]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'classroom'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Classroom Mode (Small Primes)
          </button>
          <button
            onClick={() => {
              setMode('realworld');
              applyPreset(REAL_WORLD_PRESETS[0]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'realworld'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Real-World Mode (BigInt)
          </button>
        </div>
      </div>

      {/* Preset bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-mono flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> Presets:
        </span>
        {(mode === 'classroom' ? CLASSROOM_PRESETS : REAL_WORLD_PRESETS).map((p, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(p)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 transition whitespace-nowrap"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Step 1: Key Generation Parameters */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
            <h3 className="font-bold text-white text-base">Key Generation Parameters</h3>
          </div>
          {keyValidation.error ? (
            <span className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" /> Validation Error
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Keypair Valid & Ready
            </span>
          )}
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Prime p:
            </label>
            <input
              type="text"
              value={pInput}
              aria-label="Prime p input"
              onChange={(e) => setPInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-cyan-300 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Prime q:
            </label>
            <input
              type="text"
              value={qInput}
              aria-label="Prime q input"
              onChange={(e) => setQInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-cyan-300 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Public Exponent e:
            </label>
            <input
              type="text"
              value={eInput}
              aria-label="Public exponent e input"
              onChange={(e) => setEInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-cyan-300 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Error notification */}
        {keyValidation.error && (
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-3 text-rose-300 text-xs font-mono mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>{keyValidation.error}</div>
          </div>
        )}

        {/* Modulus size warning if m >= n */}
        {exceedsModulus && (
          <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-3 text-amber-300 text-xs font-mono mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <b>RSA Block Size Warning:</b> Character '{exceedsModulus.char}' has ASCII value {exceedsModulus.code} &ge; modulus n ({exceedsModulus.n}). In RSA, message blocks must be smaller than n (m &lt; n) for unique decryption. Use primes where n &gt; 255.
            </div>
          </div>
        )}

        {/* Mathematical Computations Dashboard */}
        {!keyValidation.error && keyValidation.n && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="border-r border-slate-800/80 pr-2">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Modulus n = p × q</div>
              <div className="text-sm font-mono font-bold text-white mt-1 break-all">
                {keyValidation.n.toString()}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Part of Public & Private keys</div>
            </div>

            <div className="border-r border-slate-800/80 pr-2">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Euler's Totient φ(n)</div>
              <div className="text-sm font-mono font-bold text-cyan-300 mt-1 break-all">
                {keyValidation.phi.toString()}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">(p - 1)(q - 1)</div>
            </div>

            <div className="border-r border-slate-800/80 pr-2">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Public Key (e, n)</div>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-1 break-all">
                ({keyValidation.e.toString()}, {keyValidation.n.toString()})
              </div>
              <div className="text-[10px] text-emerald-500/80 font-mono mt-0.5">Shared openly on network</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Private Key (d, n)</div>
              <div className="text-sm font-mono font-bold text-violet-400 mt-1 break-all">
                ({keyValidation.d.toString()}, {keyValidation.n.toString()})
              </div>
              <div className="text-[10px] text-violet-400/80 font-mono mt-0.5">Kept strictly secret!</div>
            </div>
          </div>
        )}

        {/* Extended Euclidean Algorithm Table */}
        {!keyValidation.error && keyValidation.euclidSteps && (
          <div className="mt-5 border-t border-slate-800 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Extended Euclidean Algorithm: Computing d ≡ e⁻¹ (mod φ(n))
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Bézout's identity: e · s + φ · t = 1
              </span>
            </div>

            <div className="overflow-x-auto max-h-48 border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Step</th>
                    <th className="py-2 px-3">Quotient (q)</th>
                    <th className="py-2 px-3">Remainder (r)</th>
                    <th className="py-2 px-3">Coefficient s</th>
                    <th className="py-2 px-3">Coefficient t</th>
                    <th className="py-2 px-3">Formula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {keyValidation.euclidSteps.map((step, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition">
                      <td className="py-1.5 px-3 text-slate-400">{step.step}</td>
                      <td className="py-1.5 px-3 text-slate-300">{step.q}</td>
                      <td className="py-1.5 px-3 text-cyan-300 font-bold">{step.r}</td>
                      <td className="py-1.5 px-3 text-violet-300">{step.s}</td>
                      <td className="py-1.5 px-3 text-amber-300">{step.t}</td>
                      <td className="py-1.5 px-3 text-slate-400 text-[11px]">{step.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-emerald-400/90 font-mono mt-2 flex flex-wrap items-center gap-1.5">
              <span>✓ Computed modular inverse:</span>
              <MathFormula tex={`d = ${keyValidation.d?.toString()} \\pmod{${keyValidation.phi?.toString()}}`} />
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Interactive Message Encryption & Square-and-Multiply */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
          <h3 className="font-bold text-white text-base">Message Encryption & Square-and-Multiply Exponentiation</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Plaintext Message:</label>
            <input
              type="text"
              value={plainMessage}
              aria-label="Plaintext message to encrypt with RSA"
              onChange={(e) => {
                setPlainMessage(e.target.value);
                setSelectedCharIdx(0);
              }}
              placeholder="e.g. RSA"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Ciphertext (Cipher Numbers c = mᵉ mod n):</label>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 break-all min-h-[38px]">
              {encryptionResult?.cipherText || '—'}
            </div>
          </div>
        </div>

        {/* Character selector buttons */}
        {encryptionResult && encryptionResult.steps.length > 0 && (
          <div>
            <div className="text-xs text-slate-400 font-mono mb-2">
              Select character to inspect binary Square-and-Multiply execution:
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {encryptionResult.steps.map((st, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCharIdx(i)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono border transition flex flex-col items-center min-w-[50px] ${
                    selectedCharIdx === i
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold">{st.char}</span>
                  <span className="text-[10px] opacity-75">m={st.m}</span>
                </button>
              ))}
            </div>

            {/* Active Square-and-Multiply Trace Table */}
            {activeStep && keyValidation.e && keyValidation.n && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                    <span>Exponentiation for '{activeStep.char}' (ASCII m = {activeStep.m}):</span>
                    <MathFormula tex={`c = ${activeStep.m}^{${keyValidation.e.toString()}} \\pmod{${keyValidation.n.toString()}} = ${activeStep.c}`} className="text-cyan-300" />
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Binary exponent: <span className="text-emerald-400 font-bold">{keyValidation.e.toString(2)}₂</span> ({keyValidation.e.toString(2).length} bits)
                  </div>
                </div>

                <div className="overflow-x-auto max-h-56 border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Bit #</th>
                        <th className="py-2 px-3">Bit Val</th>
                        <th className="py-2 px-3">Operation & Detail</th>
                        <th className="py-2 px-3">Result mod n</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {activeStep.expSteps.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50 transition">
                          <td className="py-1.5 px-3 text-slate-400">{s.stepIndex}</td>
                          <td className="py-1.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              s.bit === '1' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {s.bit}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-slate-300">{s.actionDesc}</td>
                          <td className="py-1.5 px-3 text-emerald-400 font-bold">{s.finalVal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Round-Trip Decryption Verification */}
        {decryptionResult && (
          <div className="mt-4 bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Decryption verification (m = cᵈ mod n): <b>"{decryptionResult.plainText}"</b> matched original exactly!</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 uppercase tracking-widest font-bold">Involution Verified</span>
          </div>
        )}
      </div>

      {/* Step 3: Security & Time-To-Factor Comparison (Educational Showpiece) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
            <h3 className="font-bold text-white text-base">Why Large Keys are Secure: Factoring Complexity</h3>
          </div>
          <span className="text-xs text-amber-400 font-mono bg-amber-950/50 border border-amber-800 px-3 py-1 rounded-full">
            Integer Factorization Problem
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          RSA's security relies on the mathematical asymmetry that multiplying two large primes is trivial, but finding the prime factors of <MathFormula tex="n = p \times q" /> is believed to be computationally intractable for classical computers (General Number Field Sieve takes sub-exponential time).
        </p>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Key Size</th>
                <th className="py-2.5 px-3">Modulus Digits</th>
                <th className="py-2.5 px-3">Classical Factoring Time (Approx. / Illustrative)</th>
                <th className="py-2.5 px-3">Quantum Shor's Algorithm (Illustrative)</th>
                <th className="py-2.5 px-3">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {FACTORING_SECURITY_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition">
                  <td className="py-2 px-3 font-bold text-cyan-300">{row.bits}</td>
                  <td className="py-2 px-3 text-slate-400">~{row.modulusDigits}</td>
                  <td className="py-2 px-3 text-slate-200">{row.timeClassical}</td>
                  <td className="py-2 px-3 text-amber-300">{row.timeQuantum}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      row.status.includes('Standard') || row.status.includes('Military')
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : row.status.includes('Insecure') || row.status.includes('Broken')
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Educational & Illustrative Label Note */}
        <div className="mt-3 flex items-start gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <b className="text-amber-300">Educational & Illustrative:</b> Factoring times and quantum resource estimates are theoretical approximations based on the General Number Field Sieve (GNFS) asymptotic complexity and historical literature benchmarks (NIST / Lenstra). Real-world cryptosystems rely on 2048+ bit keys.
          </span>
        </div>
      </div>
    </div>
  );
}
