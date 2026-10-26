import React from 'react';
import { motion } from 'framer-motion';

export default function RailFenceVisualizer({
  grid = [],
  rails = 3,
  onRailsChange,
  activeCol = -1
}) {
  if (!grid || grid.length === 0) return null;

  const numCols = grid[0]?.length || 0;

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">
          Rail Fence Zig-Zag Grid ({rails} Rails)
        </h4>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Rails:</span>
          {[2, 3, 4, 5, 6].map((r) => (
            <button
              key={r}
              onClick={() => onRailsChange(r)}
              className={`w-7 h-7 rounded-lg border text-xs font-mono font-bold transition ${
                rails === r
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Characters are written down and up in a zig-zag wave along the rails, then read off row by row for ciphertext.
      </p>

      {/* Grid Canvas */}
      <div className="overflow-x-auto p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
        <div className="flex flex-col gap-1.5 min-w-max">
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1.5">
              <span className="w-12 text-[11px] font-mono font-semibold text-slate-400 text-right pr-2">
                Rail {rIdx + 1}
              </span>
              <div className="flex gap-1.5">
                {row.map((cell, cIdx) => {
                  const isActive = cIdx === activeCol;
                  const hasLetter = cell !== null;

                  return (
                    <div
                      key={cIdx}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-all ${
                        hasLetter
                          ? isActive
                            ? 'bg-cyan-500 text-slate-950 font-bold border-2 border-cyan-300 shadow-md shadow-cyan-500/40 scale-110'
                            : 'bg-slate-800/90 text-cyan-300 border border-slate-700 font-semibold'
                          : 'bg-slate-900/30 border border-slate-800/40 text-slate-700'
                      }`}
                    >
                      {cell !== null ? cell : '·'}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
