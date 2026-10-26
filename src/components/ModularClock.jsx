import React from 'react';
import { motion } from 'framer-motion';
import MathFormula from './MathFormula.jsx';

export default function ModularClock({
  p = 0,
  s = 3,
  c = 3,
  decrypt = false,
  upperInput = 'A',
  upperOutput = 'D',
  mod = 26,
  onSelectPosition
}) {
  const size = 320;
  const center = size / 2;
  const radius = 110;
  const textRadius = radius + 24;
  const numRadius = radius - 20;

  const safeP = typeof p === 'number' && Number.isFinite(p) ? ((p % mod) + mod) % mod : 0;
  const safeC = typeof c === 'number' && Number.isFinite(c) ? ((c % mod) + mod) % mod : 0;
  const safeS = typeof s === 'number' && Number.isFinite(s) ? s : 0;

  // Compute angle for a given number (0..25) where 0 is at top (-90 degrees)
  const getAngle = (val) => {
    const frac = val / mod;
    return frac * 2 * Math.PI - Math.PI / 2;
  };

  const pAngle = getAngle(safeP);
  const cAngle = getAngle(safeC);

  const pX = center + radius * Math.cos(pAngle);
  const pY = center + radius * Math.sin(pAngle);
  const cX = center + radius * Math.cos(cAngle);
  const cY = center + radius * Math.sin(cAngle);

  // SVG arc calculation (only if p !== c)
  let diffAngle = cAngle - pAngle;
  if (!decrypt && diffAngle < 0) diffAngle += 2 * Math.PI;
  if (decrypt && diffAngle > 0) diffAngle -= 2 * Math.PI;

  const largeArcFlag = Math.abs(diffAngle) > Math.PI ? 1 : 0;
  const sweepFlag = decrypt ? 0 : 1;

  const hasArc = safeP !== safeC && Math.abs(diffAngle) > 0.001;
  const arcPath = `M ${pX} ${pY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${cX} ${cY}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="select-none">
          <defs>
            <radialGradient id="clockCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Base clock circles */}
          <circle cx={center} cy={center} r={radius + 35} fill="#0d1424" stroke="#1f2b45" strokeWidth="2" />
          <circle cx={center} cy={center} r={radius} fill="url(#clockCenterGlow)" stroke="#243049" strokeWidth="1.5" />
          <circle cx={center} cy={center} r={4} fill="#64748b" />

          {/* Clock numbers and letters */}
          {Array.from({ length: mod }).map((_, i) => {
            const angle = getAngle(i);
            const lx = center + textRadius * Math.cos(angle);
            const ly = center + textRadius * Math.sin(angle);
            const nx = center + numRadius * Math.cos(angle);
            const ny = center + numRadius * Math.sin(angle);
            const letter = String.fromCharCode(65 + (i % 26));

            const isP = safeP === i;
            const isC = safeC === i;

            return (
              <g
                key={i}
                className="cursor-pointer transition-all hover:opacity-100"
                onClick={() => onSelectPosition && onSelectPosition(i)}
              >
                {/* Tick mark */}
                <line
                  x1={center + (radius - 5) * Math.cos(angle)}
                  y1={center + (radius - 5) * Math.sin(angle)}
                  x2={center + (radius + 5) * Math.cos(angle)}
                  y2={center + (radius + 5) * Math.sin(angle)}
                  stroke={isP ? '#06b6d4' : isC ? '#10b981' : '#334155'}
                  strokeWidth={isP || isC ? 3 : 1.5}
                />

                {/* Letter */}
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight={isP || isC ? 'bold' : 'normal'}
                  fill={isP ? '#22d3ee' : isC ? '#34d399' : '#94a3b8'}
                  className="font-mono transition-colors"
                >
                  {letter}
                </text>

                {/* Index Number */}
                <text
                  x={nx}
                  y={ny}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="9.5"
                  fill={isP ? '#06b6d4' : isC ? '#10b981' : '#475569'}
                  className="font-mono"
                >
                  {i}
                </text>
              </g>
            );
          })}

          {/* Shift Arc (rendered only if p !== c) */}
          {hasArc && (
            <motion.path
              d={arcPath}
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth="4"
              strokeDasharray="6 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Hand to Plaintext (p) */}
          <line
            x1={center}
            y1={center}
            x2={pX}
            y2={pY}
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />

          {/* Hand to Ciphertext (c) */}
          <motion.line
            x1={center}
            y1={center}
            x2={cX}
            y2={cY}
            stroke="#10b981"
            strokeWidth="3.5"
            animate={{ x2: cX, y2: cY }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />

          {/* Highlight circles on p and c */}
          <circle cx={pX} cy={pY} r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
          <circle cx={cX} cy={cY} r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Math formulation badge */}
      <div className="mt-3 text-center bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 shadow-inner">
        <div className="text-xs text-slate-400 mb-1">Modular Arithmetic (Clock Mod 26)</div>
        <MathFormula
          tex={
            decrypt
              ? `(${safeP} - ${safeS}) \\equiv ${safeC} \\pmod{26}`
              : `(${safeP} + ${safeS}) \\equiv ${safeC} \\pmod{26}`
          }
          className="text-base text-cyan-300 font-bold"
        />
        <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-2">
          <span className="text-cyan-400 font-semibold">{upperInput || 'A'} ({safeP})</span>
          <span>&rarr;</span>
          <span className="text-emerald-400 font-semibold">{upperOutput || 'D'} ({safeC})</span>
          <span className="text-amber-400 font-mono text-[11px]">(shift {safeS})</span>
        </div>
      </div>
    </div>
  );
}
