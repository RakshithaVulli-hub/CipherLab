import React from 'react';
import MathFormula from './MathFormula.jsx';
import { VALID_A_VALUES, gcd } from '../crypto/affine.js';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function AffineVisualizer({
  a = 5,
  b = 8,
  aInv = 21,
  onAChange,
  onBChange
}) {
  const g = gcd(a, 26);
  const isValid = g === 1;

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          Affine Cipher Key Controls
        </h4>
        {isValid ? (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> gcd({a}, 26) = 1 &check; Coprime
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800 px-2.5 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" /> gcd({a}, 26) = {g} &cross; Invalid
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Multiplier a */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Multiplier a: <b className="text-cyan-400">{a}</b>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={a}
              aria-label="Affine multiplier a"
              onChange={(e) => onAChange(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400"
            >
              {VALID_A_VALUES.map((val) => (
                <option key={val} value={val}>
                  a = {val} (coprime to 26)
                </option>
              ))}
            </select>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Modular inverse: <MathFormula tex={`a^{-1} \\equiv ${aInv} \\pmod{26}`} className="text-cyan-300" />
          </div>
        </div>

        {/* Shift b */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Additive Shift b (0..25): <b className="text-violet-400">{b}</b>
          </label>
          <input
            type="range"
            min="0"
            max="25"
            value={b}
            aria-label="Affine additive shift b"
            aria-valuenow={b}
            aria-valuemin="0"
            aria-valuemax="25"
            onChange={(e) => onBChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-400"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>b = 0</span>
            <span>b = 13</span>
            <span>b = 25</span>
          </div>
        </div>
      </div>

      {/* Mathematical Transformation Formulas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Encryption Function</div>
          <MathFormula tex={`E(x) = (${a} \\cdot x + ${b}) \\pmod{26}`} className="text-cyan-300 text-sm mt-1" />
        </div>
        <div>
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Decryption Function</div>
          <MathFormula tex={`D(y) = ${aInv} \\cdot (y - ${b}) \\pmod{26}`} className="text-emerald-300 text-sm mt-1" />
        </div>
      </div>
    </div>
  );
}
