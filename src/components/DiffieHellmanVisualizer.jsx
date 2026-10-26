import React, { useState, useMemo } from 'react';
import MathFormula from './MathFormula.jsx';
import { computeDiffieHellman } from '../crypto/diffieHellman.js';
import { KeyRound, ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function DiffieHellmanVisualizer() {
  const [pInput, setPInput] = useState('23');
  const [gInput, setGInput] = useState('5');
  const [aInput, setAInput] = useState('6');
  const [bInput, setBInput] = useState('15');

  const dh = useMemo(() => {
    return computeDiffieHellman({
      pStr: pInput,
      gStr: gInput,
      aStr: aInput,
      bStr: bInput
    });
  }, [pInput, gInput, aInput, bInput]);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-400" />
          Diffie-Hellman Key Exchange: Paint-Mixing Analogy & Real Numbers
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Two parties create a shared secret key over an unencrypted, public channel without revealing their secret keys to eavesdroppers.
        </p>
      </div>

      {/* Public domain parameters */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Public Prime Modulus p:</label>
          <input
            type="text"
            value={pInput}
            onChange={(e) => setPInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Public Generator g:</label>
          <input
            type="text"
            value={gInput}
            onChange={(e) => setGInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Alice's Secret a:</label>
          <input
            type="text"
            value={aInput}
            onChange={(e) => setAInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-rose-300 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Bob's Secret b:</label>
          <input
            type="text"
            value={bInput}
            onChange={(e) => setBInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-blue-300 outline-none"
          />
        </div>
      </div>

      {dh.error && (
        <div className="bg-rose-950/40 border border-rose-800 p-3 rounded-xl text-rose-300 text-xs font-mono">
          {dh.error}
        </div>
      )}

      {/* Visual Exchange Pipeline */}
      {!dh.error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {/* Alice Side */}
          <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  👩 Alice (Sender)
                </span>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-800">
                  Secret a = {dh.a}
                </span>
              </div>

              {/* Paint color: secret red */}
              <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 mb-3">
                <div className="w-5 h-5 rounded-full bg-red-500 border border-white/20"></div>
                <div className="text-xs text-slate-300">Secret Paint: <b className="text-red-400">Crimson Red</b></div>
              </div>

              {/* Alice computes public A */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-3 text-xs font-mono">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">1. Computes Public Value A:</div>
                <MathFormula tex={`A = g^a \\pmod p = ${dh.g}^{${dh.a}} \\pmod{${dh.p}} = ${dh.A}`} className="text-amber-300 mt-1" />
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-[11px] text-orange-300">Mixed Paint (Yellow + Red = Orange)</span>
                </div>
              </div>
            </div>

            {/* Alice computes secret key */}
            <div className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-xl text-xs font-mono">
              <div className="text-emerald-400 text-[10px] uppercase font-semibold">3. Computes Shared Secret:</div>
              <MathFormula tex={`K = B^a \\pmod p = ${dh.B}^{${dh.a}} \\pmod{${dh.p}} = ${dh.sharedKey}`} className="text-emerald-300 font-bold mt-1" />
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-4 h-4 rounded-full bg-amber-800"></div>
                <span className="text-[11px] text-amber-200 font-bold">Final Shared Color: Secret Amber</span>
              </div>
            </div>
          </div>

          {/* Public Channel & Eve */}
          <div className="glass-panel-subtle rounded-2xl p-5 border border-amber-500/30 flex flex-col justify-between text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-amber-400 font-bold mb-2">
                <ShieldAlert className="w-4 h-4" />
                Insecure Public Channel (Eve Eavesdropping)
              </div>

              {/* Eve intercepted data */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono mb-3 text-left">
                <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1">What Eve Sees on the Wire:</div>
                <ul className="text-slate-300 space-y-1 text-[11px]">
                  <li>• Common Prime <MathFormula tex={`p = ${dh.p}`} /></li>
                  <li>• Common Generator <MathFormula tex={`g = ${dh.g}`} /></li>
                  <li>• Alice's Public Value <MathFormula tex={`A = ${dh.A}`} /> &rarr;</li>
                  <li>• &larr; Bob's Public Value <MathFormula tex={`B = ${dh.B}`} /></li>
                </ul>
              </div>

              <div className="bg-amber-950/30 border border-amber-800/50 p-2.5 rounded-xl text-[11px] text-amber-300 text-left">
                <b>Discrete Logarithm Problem:</b> Eve cannot easily calculate <MathFormula tex="a" /> or <MathFormula tex="b" /> from <MathFormula tex="g^a \pmod p" />.
                Just like separating mixed paint is practically impossible!
              </div>
            </div>

            <div className="py-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Alice &rarr; A ({dh.A})</span>
                <span>B ({dh.B}) &larr; Bob</span>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 rounded-full my-2 animate-pulse"></div>
            </div>
          </div>

          {/* Bob Side */}
          <div className="glass-panel rounded-2xl p-5 border border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-blue-400 flex items-center gap-2">
                  👨 Bob (Receiver)
                </span>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800">
                  Secret b = {dh.b}
                </span>
              </div>

              {/* Paint color: secret blue */}
              <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 mb-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 border border-white/20"></div>
                <div className="text-xs text-slate-300">Secret Paint: <b className="text-blue-400">Ocean Blue</b></div>
              </div>

              {/* Bob computes public B */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-3 text-xs font-mono">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">2. Computes Public Value B:</div>
                <MathFormula tex={`B = g^b \\pmod p = ${dh.g}^{${dh.b}} \\pmod{${dh.p}} = ${dh.B}`} className="text-cyan-300 mt-1" />
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <span className="text-[11px] text-emerald-300">Mixed Paint (Yellow + Blue = Green)</span>
                </div>
              </div>
            </div>

            {/* Bob computes secret key */}
            <div className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-xl text-xs font-mono">
              <div className="text-emerald-400 text-[10px] uppercase font-semibold">4. Computes Shared Secret:</div>
              <MathFormula tex={`K = A^b \\pmod p = ${dh.A}^{${dh.b}} \\pmod{${dh.p}} = ${dh.sharedKey}`} className="text-emerald-300 font-bold mt-1" />
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-4 h-4 rounded-full bg-amber-800"></div>
                <span className="text-[11px] text-amber-200 font-bold">Final Shared Color: Secret Amber</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equality Confirmation */}
      {!dh.error && (
        <div className="bg-emerald-950/30 border border-emerald-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Shared secret keys matched identically: <b className="text-emerald-200 text-sm">K = {dh.sharedKey}</b></span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">(gᵃ)ᵇ ≡ (gᵇ)ᵃ ≡ gᵃᵇ (mod p)</span>
        </div>
      )}
    </div>
  );
}
