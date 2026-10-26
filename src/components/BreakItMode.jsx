import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Skull,
  Search,
  KeyRound,
  Trophy,
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import FrequencyChart from './FrequencyChart.jsx';
import MathFormula from './MathFormula.jsx';
import {
  breakCaesar,
  kasiskiExamination,
  MYSTERY_CHALLENGES
} from '../crypto/cryptanalysis.js';
import { caesarDecrypt } from '../crypto/caesar.js';

export default function BreakItMode() {
  const [activeTab, setActiveTab] = useState('caesar-brute'); // 'caesar-brute' | 'vigenere-ioc' | 'mystery'
  
  // Caesar Brute Force State
  const [caesarInput, setCaesarInput] = useState('KHOOR ZRUOG! BRX KDYH FUDFNHG WKH FDHVDU FLSKHU.');
  const [highlightedShift, setHighlightedShift] = useState(null);

  const caesarBreakResult = useMemo(() => {
    return breakCaesar(caesarInput);
  }, [caesarInput]);

  // Vigenere Analysis State
  const [vigInput, setVigInput] = useState('LXFOPVEFRNHRLXFOPVEFRNHRLXFOPVEFRNHR ATTACK AT DAWN');
  const vigAnalysis = useMemo(() => {
    return kasiskiExamination(vigInput);
  }, [vigInput]);

  // Mystery Challenges State
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [feedback, setFeedback] = useState(null);

  const curChallenge = MYSTERY_CHALLENGES[challengeIdx];

  const handleVerifyGuess = () => {
    const cleanGuess = userGuess.trim().toUpperCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, "").replace(/\s+/g, " ");
    const cleanExpected = curChallenge.expectedSolution.trim().toUpperCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, "").replace(/\s+/g, " ");

    if (cleanGuess === cleanExpected) {
      setFeedback({ type: 'success', msg: 'Correct! Ciphertext deciphered successfully!' });
      if (!completedLevels.has(curChallenge.id)) {
        setScore((prev) => prev + 100);
        setCompletedLevels((prev) => new Set([...prev, curChallenge.id]));
      }
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    } else {
      setFeedback({ type: 'error', msg: 'Incorrect decipherment. Check your key and try again!' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Skull className="w-5 h-5 text-rose-400" />
            Break-It: Attacker & Cryptanalyst Lab
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Wear the black hat. Break ciphers using frequency analysis, chi-squared metrics, and Kasiski examination.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('caesar-brute')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'caesar-brute'
                ? 'bg-rose-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Caesar Brute Force
          </button>
          <button
            onClick={() => setActiveTab('vigenere-ioc')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'vigenere-ioc'
                ? 'bg-violet-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vigenère IoC & Kasiski
          </button>
          <button
            onClick={() => setActiveTab('mystery')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'mystery'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Crack Challenges ({score} pts)
          </button>
        </div>
      </div>

      {/* TAB 1: Caesar Brute Force Table */}
      {activeTab === 'caesar-brute' && (
        <div className="flex flex-col gap-5">
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-bold text-slate-300">
                Intercepted Ciphertext to Crack:
              </label>
              <button
                onClick={() => {
                  setCaesarInput('KHOOR ZRUOG! BRX KDYH FUDFNHG WKH FDHVDU FLSKHU.');
                  setHighlightedShift(null);
                }}
                className="text-[11px] text-cyan-400 hover:underline font-mono"
              >
                Reset sample
              </button>
            </div>
            <textarea
              value={caesarInput}
              aria-label="Intercepted ciphertext to crack"
              onChange={(e) => {
                setCaesarInput(e.target.value);
                setHighlightedShift(null);
              }}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono text-cyan-300 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Letter frequency bar chart */}
          <FrequencyChart
            ciphertext={caesarInput}
            onApplyGuessedShift={(s) => setHighlightedShift(s)}
          />

          {/* Guessed shift notification banner if selected */}
          {highlightedShift !== null && (
            <div className="bg-cyan-950/40 border border-cyan-800/80 rounded-xl p-3 text-xs font-mono text-cyan-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>
                  Frequency Analysis Guessed Shift <b>+{highlightedShift}</b>: "{caesarDecrypt(caesarInput, highlightedShift)}"
                </span>
              </div>
              <button
                onClick={() => setHighlightedShift(null)}
                className="text-slate-400 hover:text-white text-[11px] underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* All 25 Shifts Table */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                Exhaustive Key Search: All 25 Shifts Scored
              </h4>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
                Best Statistical Match: <b>Shift +{caesarBreakResult.bestShift}</b>
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 border border-slate-800 rounded-xl">
              <table className="w-full min-w-[580px] text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-3">Decrypted Candidate Plaintext</th>
                    <th className="py-2.5 px-3">Word Matches</th>
                    <th className="py-2.5 px-3">Chi-Squared (χ²)</th>
                    <th className="py-2.5 px-3">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {caesarBreakResult.candidates.map((cand) => {
                    const isBest = cand.shift === caesarBreakResult.bestShift;
                    const isHighlighted = cand.shift === highlightedShift;

                    return (
                      <tr
                        key={cand.shift}
                        className={`transition cursor-pointer ${
                          isHighlighted
                            ? 'bg-cyan-950/60 ring-2 ring-cyan-400 font-bold'
                            : isBest
                            ? 'bg-emerald-950/50 font-semibold'
                            : 'hover:bg-slate-900/50'
                        }`}
                        onClick={() => setHighlightedShift(cand.shift)}
                      >
                        <td className="py-2 px-3 text-cyan-300 font-bold">
                          +{cand.shift}
                        </td>
                        <td className="py-2 px-3 text-slate-200 break-all max-w-md">
                          {cand.text}
                        </td>
                        <td className="py-2 px-3 text-amber-300">
                          {cand.dictionaryMatches} words
                        </td>
                        <td className="py-2 px-3 text-slate-400">
                          {cand.chiSquared}
                        </td>
                        <td className="py-2 px-3">
                          {isHighlighted ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400 text-slate-950">
                              Selected
                            </span>
                          ) : isBest ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                              Top Match
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Unlikely</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Vigenere Cryptanalysis (IoC & Kasiski) */}
      {activeTab === 'vigenere-ioc' && (
        <div className="flex flex-col gap-5">
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl">
            <label className="block text-xs font-mono font-bold text-slate-300 mb-2">
              Intercepted Polyalphabetic Ciphertext:
            </label>
            <textarea
              value={vigInput}
              aria-label="Intercepted polyalphabetic ciphertext"
              onChange={(e) => setVigInput(e.target.value)}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono text-violet-300 focus:border-violet-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Index of Coincidence Card */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-2">
                  1. Index of Coincidence (IoC)
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Measures the probability that two randomly picked letters from the text are identical.
                </p>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono mb-3">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Observed IoC:</div>
                  <div className="text-2xl font-bold text-violet-400 mt-1">
                    {vigAnalysis.ioc}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Standard English IoC: <b className="text-emerald-400">≈ 0.0667</b> | Random Mono: <b className="text-slate-400">≈ 0.0385</b>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-violet-950/20 border border-violet-800/40 p-2.5 rounded-xl">
                  {vigAnalysis.ioc > 0.055 ? (
                    <span className="text-emerald-300">
                      High IoC ({vigAnalysis.ioc}) indicates either monoalphabetic cipher or very short keyword!
                    </span>
                  ) : (
                    <span className="text-violet-300">
                      Flattened IoC ({vigAnalysis.ioc}) confirms a polyalphabetic cipher (different alphabets used).
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Kasiski Examination Card */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-2">
                  2. Kasiski Examination
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Finds repeated sequences of 3+ letters. The distances between repetitions share the keyword length as a common factor!
                </p>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono mb-3">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Estimated Keyword Length:</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {vigAnalysis.estimatedKeyLength} letters
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Repeated 3-grams found:
                  {vigAnalysis.repeats.length === 0 ? (
                    <div className="text-slate-400 italic mt-1">No repeated 3-grams in current sample.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vigAnalysis.repeats.slice(0, 6).map((r, i) => (
                        <span key={i} className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-cyan-300">
                          "{r.seq}" (distance: {r.distance})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mystery Challenges Game */}
      {activeTab === 'mystery' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold">
                {curChallenge.title}
              </span>
              <span className="text-xs text-slate-400">Cipher: <b className="text-white">{curChallenge.cipher}</b></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1 font-bold">
                <Trophy className="w-4 h-4" /> Score: {score} XP
              </span>
              <div className="flex gap-1 ml-2">
                {MYSTERY_CHALLENGES.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setChallengeIdx(idx);
                      setUserGuess('');
                      setFeedback(null);
                      setShowHint(false);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold border transition ${
                      challengeIdx === idx
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : completedLevels.has(ch.id)
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {ch.id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Intercepted ciphertext */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-mono mb-1">INTERCEPTED CIPHERTEXT:</div>
            <div className="text-base font-mono font-bold text-rose-300 tracking-wide select-all">
              {curChallenge.ciphertext}
            </div>
          </div>

          {/* Hint toggle */}
          <div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? 'Hide Clue' : 'Need a Clue / Historical Hint?'}
            </button>
            {showHint && (
              <div className="mt-2 text-xs font-mono text-slate-300 bg-cyan-950/30 border border-cyan-800/60 p-3 rounded-xl">
                💡 <b>Clue:</b> {curChallenge.hint} (Key: {curChallenge.key})
              </div>
            )}
          </div>

          {/* User input decipherment */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-slate-300">
              Your Decrypted Plaintext Guess:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userGuess}
                aria-label="Your decrypted plaintext guess"
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Type decrypted message here..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-amber-400 outline-none"
              />
              <button
                onClick={handleVerifyGuess}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20"
              >
                Submit Code
              </button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
