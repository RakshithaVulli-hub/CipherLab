import React, { useMemo } from 'react';
import { getLetterFrequencies, ENGLISH_FREQUENCIES } from '../crypto/cryptanalysis.js';
import { BarChart3, Sparkles } from 'lucide-react';

export default function FrequencyChart({ ciphertext = '', onApplyGuessedShift }) {
  const { frequencies, totalLetters, counts } = useMemo(() => {
    return getLetterFrequencies(ciphertext);
  }, [ciphertext]);

  // Find most frequent letter in ciphertext
  const topLetter = useMemo(() => {
    let best = 'E';
    let maxCount = -1;
    for (let c = 65; c <= 90; c++) {
      const ch = String.fromCharCode(c);
      if (counts[ch] > maxCount) {
        maxCount = counts[ch];
        best = ch;
      }
    }
    return { letter: best, count: maxCount };
  }, [counts]);

  // Guessed Caesar shift assuming top letter corresponds to 'E' (index 4)
  const guessedShift = useMemo(() => {
    if (totalLetters === 0) return 0;
    const topIdx = topLetter.letter.charCodeAt(0) - 65;
    return ((topIdx - 4) % 26 + 26) % 26;
  }, [topLetter, totalLetters]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Letter Frequency Distribution Analysis
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare observed letter frequencies ({totalLetters} total letters) with standard English frequencies.
          </p>
        </div>

        {totalLetters > 0 && onApplyGuessedShift && (
          <button
            onClick={() => onApplyGuessedShift(guessedShift)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Guess Caesar Shift: <b>+{guessedShift}</b> (assuming '{topLetter.letter}' &rarr; 'E')
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-cyan-400"></span> Observed in Ciphertext
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-600"></span> Expected English Standard
        </span>
      </div>

      {/* Bar Chart Container */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-end gap-1.5 h-44 pt-6 px-1 min-w-[620px]">
          {alphabet.map((letter) => {
            const obs = frequencies[letter] || 0;
            const exp = ENGLISH_FREQUENCIES[letter] || 0;
            const maxVal = 15; // Max scale percentage
            const obsHeight = Math.min(100, (obs / maxVal) * 100);
            const expHeight = Math.min(100, (exp / maxVal) * 100);
            const isTop = letter === topLetter.letter && totalLetters > 0;

            return (
              <div key={letter} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                  {letter}: {obs.toFixed(1)}% ({counts[letter] || 0}) | Exp: {exp.toFixed(1)}%
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  {/* Expected English Bar */}
                  <div
                    style={{ height: `${expHeight}%` }}
                    className="w-1.5 bg-slate-700/80 rounded-t transition-all"
                  />
                  {/* Observed Bar */}
                  <div
                    style={{ height: `${obsHeight}%` }}
                    className={`w-2.5 rounded-t transition-all ${
                      isTop
                        ? 'bg-gradient-to-t from-cyan-500 to-teal-300 ring-1 ring-cyan-300'
                        : 'bg-cyan-500/80 group-hover:bg-cyan-400'
                    }`}
                  />
                </div>

                {/* Letter Label */}
                <span className={`text-[11px] font-mono mt-1.5 transition-colors ${
                  isTop ? 'text-cyan-300 font-bold' : 'text-slate-400 group-hover:text-white'
                }`}>
                  {letter}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
