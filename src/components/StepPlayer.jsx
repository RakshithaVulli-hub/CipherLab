import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
import MathFormula from './MathFormula.jsx';

export default function StepPlayer({
  steps = [],
  currentIdx = -1,
  isPlaying = false,
  speedMs = 600,
  onPlayToggle,
  onStepChange,
  onSpeedChange,
  cipherType = 'caesar',
  isAdvanced = true
}) {
  const activeTileRef = useRef(null);

  // Auto-scroll active tile into view
  useEffect(() => {
    if (activeTileRef.current) {
      activeTileRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIdx]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea/select or contenteditable
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
        e.target.isContentEditable ||
        e.target.getAttribute('role') === 'textbox'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayToggle();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentIdx < steps.length - 1) {
          onStepChange(currentIdx + 1);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentIdx > 0) {
          onStepChange(currentIdx - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, steps.length, onPlayToggle, onStepChange]);

  const total = steps.length;
  const currentStep = currentIdx >= 0 && currentIdx < total ? steps[currentIdx] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Active Step Card */}
      <div
        role="region"
        aria-label="Current character transformation step"
        className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl relative overflow-hidden min-h-[140px] flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {total === 0 ? (
          <div className="text-center py-6 text-slate-300">
            Enter a message and select parameters to generate steps.
          </div>
        ) : !currentStep ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Playback Status
              </div>
              <div className="text-xl font-bold text-slate-100">Ready to step through</div>
              <p className="text-sm text-slate-300 mt-1">
                Press <span className="text-cyan-400 font-mono font-semibold">Play</span> or use keyboard arrows to inspect each letter transform.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-cyan-400">{total}</span>
              <div className="text-xs text-slate-400">total steps</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded-full font-bold">
                Step {currentIdx + 1} of {total}
              </span>
              {currentStep.keyChar && (
                <span className="text-xs font-mono bg-violet-950/80 border border-violet-800 text-violet-200 px-2.5 py-0.5 rounded-full">
                  Key letter: <b className="text-white font-bold">{currentStep.keyChar}</b> (shift +{currentStep.keyVal})
                </span>
              )}
            </div>

            {/* Letter pair transformation display */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-cyan-300">
                  {currentStep.input === ' ' ? '␣ (space)' : currentStep.input}
                </span>
                {currentStep.p !== null && currentStep.p !== undefined && (
                  <span className="text-xs text-cyan-300 font-mono font-semibold">#{currentStep.p}</span>
                )}
              </div>

              <span className="text-2xl text-slate-400 font-bold" aria-hidden="true">&rarr;</span>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-emerald-400">
                  {currentStep.output === ' ' ? '␣ (space)' : currentStep.output}
                </span>
                {currentStep.c !== null && currentStep.c !== undefined && (
                  <span className="text-xs text-emerald-300 font-mono font-semibold">#{currentStep.c}</span>
                )}
              </div>
            </div>

            {/* Detail explanation */}
            <div className="text-sm font-mono text-slate-200 mt-2 bg-slate-900/80 rounded-lg p-2.5 border border-slate-700">
              {currentStep.detail}
            </div>

            {/* KaTeX formula view if available */}
            {isAdvanced && currentStep.formulaLatex && (
              <div className="mt-2 text-xs flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-slate-400">Formula:</span>
                <MathFormula tex={currentStep.formulaLatex} className="text-cyan-300" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video-style Timeline Scrub Slider */}
      {total > 0 && (
        <div className="flex flex-col gap-1.5 px-1">
          <div className="flex justify-between text-xs font-mono text-slate-300">
            <span>Progress: {currentIdx < 0 ? 0 : Math.round(((currentIdx + 1) / total) * 100)}%</span>
            <span>{currentIdx < 0 ? '0' : currentIdx + 1} / {total} characters</span>
          </div>
          <input
            type="range"
            min="-1"
            max={total - 1}
            value={currentIdx}
            onChange={(e) => onStepChange(parseInt(e.target.value, 10))}
            aria-label="Timeline scrubber"
            aria-valuemin="-1"
            aria-valuemax={total - 1}
            aria-valuenow={currentIdx}
            aria-valuetext={currentIdx < 0 ? 'Not started' : `Step ${currentIdx + 1} of ${total}`}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
          />
        </div>
      )}

      {/* Video Controls Bar */}
      <div
        role="toolbar"
        aria-label="Step playback controls"
        className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl"
      >
        <div className="flex items-center gap-2">
          {/* Reset button */}
          <button
            onClick={() => onStepChange(-1)}
            disabled={total === 0}
            aria-label="Reset to beginning"
            title="Reset to beginning"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Prev button */}
          <button
            onClick={() => onStepChange(Math.max(0, currentIdx - 1))}
            disabled={total === 0 || currentIdx <= 0}
            aria-label="Previous step (Arrow Left)"
            title="Previous step (Arrow Left)"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause button */}
          <button
            onClick={onPlayToggle}
            disabled={total === 0}
            aria-label={isPlaying ? 'Pause playback (Space)' : 'Start playback (Space)'}
            title="Play / Pause (Space)"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold transition shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Play
              </>
            )}
          </button>

          {/* Next button */}
          <button
            onClick={() => onStepChange(Math.min(total - 1, currentIdx + 1))}
            disabled={total === 0 || currentIdx >= total - 1}
            aria-label="Next step (Arrow Right)"
            title="Next step (Arrow Right)"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed selection */}
        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span>Speed:</span>
          <select
            value={speedMs}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            aria-label="Playback speed"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none focus:border-cyan-500"
          >
            <option value={1000}>0.5x (1000ms)</option>
            <option value={600}>1.0x (600ms)</option>
            <option value={350}>1.5x (350ms)</option>
            <option value={180}>2.5x (180ms)</option>
          </select>
        </div>
      </div>

      {/* Interactive Letter Tiles Strip */}
      <div className="glass-panel-subtle rounded-xl p-3 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-300 mb-2 font-mono">
          <span>Message Tiles (click to jump):</span>
          <span className="text-slate-400">{total} chars</span>
        </div>

        <div
          role="listbox"
          aria-label="Character transformation tiles"
          className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1"
        >
          {steps.map((s, i) => {
            const isCur = i === currentIdx;
            const isDone = i < currentIdx;

            return (
              <button
                key={i}
                ref={isCur ? activeTileRef : null}
                onClick={() => onStepChange(i)}
                role="option"
                aria-selected={isCur}
                aria-label={`Step ${i + 1}: ${s.input === ' ' ? 'space' : s.input} transformed to ${s.output === ' ' ? 'space' : s.output}`}
                className={`min-w-[36px] px-2 py-1.5 rounded-lg border text-xs font-mono flex flex-col items-center justify-center transition-all ${
                  isCur
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 ring-2 ring-cyan-400/50 scale-105 shadow-md shadow-cyan-500/30'
                    : isDone
                    ? 'bg-slate-800/90 text-emerald-300 border-slate-700'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="font-bold">{s.input === ' ' ? '␣' : s.input}</span>
                <span className={`text-[10px] mt-0.5 ${isCur ? 'text-slate-900 font-bold' : isDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {s.isLetter ? s.output : '='}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
