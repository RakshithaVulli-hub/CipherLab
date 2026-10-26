import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Copy,
  Download,
  Share2,
  Repeat,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Eye,
  Check
} from 'lucide-react';
import StepPlayer from '../components/StepPlayer.jsx';
import ModularClock from '../components/ModularClock.jsx';
import CipherWheel from '../components/CipherWheel.jsx';
import AffineVisualizer from '../components/AffineVisualizer.jsx';
import RailFenceVisualizer from '../components/RailFenceVisualizer.jsx';
import MathFormula from '../components/MathFormula.jsx';

import { buildSteps as buildCaesarSteps } from '../crypto/caesar.js';
import { buildSteps as buildVigSteps } from '../crypto/vigenere.js';
import { buildAffineSteps } from '../crypto/affine.js';
import { buildAtbashSteps } from '../crypto/atbash.js';
import { buildRailFenceSteps } from '../crypto/railfence.js';

const LEARN_CONTENT = {
  caesar: {
    title: 'How the Caesar Cipher Works',
    math: 'E(x) = (x + s) \\bmod 26, \\quad D(y) = (y - s) \\bmod 26',
    whyWorks: 'Each letter is mapped to an integer 0..25 (A=0, B=1, ... Z=25). Adding shift s and taking remainder mod 26 wraps cyclically from Z back to A. Decryption performs the exact inverse operation by subtracting s mod 26.',
    howBroken: 'With only 25 possible non-zero shifts, an attacker can exhaustively test every key in less than a second (brute force), or analyze single-letter frequencies since E remains the most common letter, merely shifted.'
  },
  vigenere: {
    title: 'How the Vigenère Cipher Works',
    math: 'c_i = (p_i + k_{i \\bmod L}) \\bmod 26',
    whyWorks: 'Vigenère repeats a keyword along the message. Each keyword letter defines an independent Caesar shift. Spaces and punctuation pass through without advancing the key index, preserving natural spacing.',
    howBroken: 'Although it conceals individual letter frequencies, repeating words at intervals matching multiples of the key length produce identical ciphertext chunks. The Kasiski examination and Index of Coincidence (IoC) reveal the key length.'
  },
  affine: {
    title: 'How the Affine Cipher Works',
    math: 'E(x) = (a \\cdot x + b) \\bmod 26, \\quad D(y) = a^{-1}(y - b) \\bmod 26',
    whyWorks: 'Combines multiplication by a with addition of b. The multiplier a must satisfy gcd(a, 26) = 1 so that a modular inverse a⁻¹ exists under Bézout identity, ensuring a 1-to-1 bijection without letter collisions.',
    howBroken: 'Since there are only 12 valid coprime multipliers and 26 shifts, the total key space is only 12 × 26 = 312 keys. Known plaintext of just two letters (or solving a linear system mod 26 from the two most frequent letters) breaks it completely.'
  },
  atbash: {
    title: 'How the Atbash Cipher Works',
    math: 'E(x) = (25 - x) \\bmod 26',
    whyWorks: 'Originated in ancient Hebrew. The alphabet is mirrored: the 1st letter becomes the 26th (A <-> Z), 2nd becomes 25th (B <-> Y). Because 25 - (25 - x) = x, encryption and decryption are identical (an involution).',
    howBroken: 'It has no secret key. Anyone identifying the cipher can immediately reverse it. Letter frequency analysis also mirrors standard English.'
  },
  railfence: {
    title: 'How the Rail Fence Cipher Works',
    math: '\\text{Transposition: coordinate mapping } (r, c) \\text{ along a zig-zag wave}',
    whyWorks: 'Unlike substitution ciphers that alter letter identities, Rail Fence is a transposition cipher that scrambles letter positions. The text is written down and up in a zig-zag across k rails, then read off row by row.',
    howBroken: 'Letter frequency distribution is 100% identical to English because all original letters are preserved! An attacker only needs to test small rail heights (2, 3, 4, ...).'
  }
};

export default function LabView({ initialCipher = 'caesar', isAdvanced = true }) {
  const [cipher, setCipher] = useState(initialCipher);
  const [text, setText] = useState('Hello, World! Attack at dawn.');
  const [decrypt, setDecrypt] = useState(false);

  // Key parameters
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState('LEMON');
  const [affineA, setAffineA] = useState(5);
  const [affineB, setAffineB] = useState(8);
  const [railCount, setRailCount] = useState(3);

  // Visual lens tab: 'clock' | 'wheel'
  const [lensTab, setLensTab] = useState('clock');

  // Step player state
  const [stepIdx, setStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(600);

  // Toast indicator
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Sync initialCipher when changed from outside
  useEffect(() => {
    setCipher(initialCipher);
    setStepIdx(-1);
    setIsPlaying(false);
  }, [initialCipher]);

  // Compute cipher output and step details
  const result = useMemo(() => {
    switch (cipher) {
      case 'caesar':
        return buildCaesarSteps(text, 'caesar', caesarShift, decrypt);
      case 'vigenere':
        return buildVigSteps(text, 'vigenere', vigenereKey, decrypt);
      case 'affine':
        return buildAffineSteps(text, affineA, affineB, decrypt);
      case 'atbash':
        return buildAtbashSteps(text);
      case 'railfence':
        return buildRailFenceSteps(text, railCount, decrypt);
      default:
        return { steps: [], output: '', error: null };
    }
  }, [cipher, text, decrypt, caesarShift, vigenereKey, affineA, affineB, railCount]);

  // Auto-play timer
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      if (!result.steps || result.steps.length === 0) {
        setIsPlaying(false);
        return;
      }
      if (stepIdx >= result.steps.length - 1) {
        setStepIdx(-1);
      }
      timer = setInterval(() => {
        setStepIdx((prev) => {
          if (prev >= result.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stepIdx, result.steps, speedMs]);

  // Round-trip verification
  const roundTripStatus = useMemo(() => {
    if (!result.output || result.error) return null;
    let inv;
    switch (cipher) {
      case 'caesar':
        inv = buildCaesarSteps(result.output, 'caesar', caesarShift, !decrypt);
        break;
      case 'vigenere':
        inv = buildVigSteps(result.output, 'vigenere', vigenereKey, !decrypt);
        break;
      case 'affine':
        inv = buildAffineSteps(result.output, affineA, affineB, !decrypt);
        break;
      case 'atbash':
        inv = buildAtbashSteps(result.output);
        break;
      case 'railfence':
        inv = buildRailFenceSteps(result.output, railCount, !decrypt);
        break;
      default:
        inv = { output: '' };
    }
    return inv.output === text;
  }, [cipher, text, result.output, result.error, decrypt, caesarShift, vigenereKey, affineA, affineB, railCount]);

  // Active step data for visual clock & wheel
  const activeStep = stepIdx >= 0 && stepIdx < result.steps.length ? result.steps[stepIdx] : null;

  // Active shift amount for wheel / clock rotation
  const currentVisualShift = useMemo(() => {
    if (cipher === 'caesar') return ((caesarShift % 26) + 26) % 26;
    if (cipher === 'vigenere') return activeStep?.keyVal ?? 0;
    if (cipher === 'affine') return affineB;
    return 0;
  }, [cipher, caesarShift, activeStep, affineB]);

  // ── Cipher Wheel active pair ─────────────────────────────────────────────
  // The wheel ALWAYS displays the encryption direction (outer=plaintext, inner=ciphertext).
  // In decrypt mode the step data is reversed (upperInput=ciphertext, upperOutput=plaintext),
  // so we swap the pair here before passing to the wheel.
  // When no step is active we show a useful default: the mapping of 'A'.
  const wheelActiveChar = useMemo(() => {
    if (!activeStep?.isLetter) return 'A';
    return decrypt
      ? (activeStep.upperOutput ?? 'A')
      : (activeStep.upperInput  ?? 'A');
  }, [activeStep, decrypt]);

  const wheelActiveOutput = useMemo(() => {
    if (!activeStep?.isLetter) {
      // Default: show E(A) for the current cipher
      const s = ((caesarShift % 26) + 26) % 26;
      if (cipher === 'caesar') return String.fromCharCode(65 + s);
      if (cipher === 'affine') {
        const a = ((affineA % 26) + 26) % 26;
        const b = ((affineB % 26) + 26) % 26;
        return String.fromCharCode(65 + (a * 0 + b) % 26);
      }
      if (cipher === 'atbash') return 'Z';
      return 'A';
    }
    return decrypt
      ? (activeStep.upperInput  ?? 'A')
      : (activeStep.upperOutput ?? 'A');
  }, [activeStep, decrypt, cipher, caesarShift, affineA, affineB]);

  // Safe default c for Modular Clock when stepIdx is -1
  const clockC = useMemo(() => {
    if (activeStep?.c !== null && activeStep?.c !== undefined) {
      return activeStep.c;
    }
    const defaultP = 0;
    const s = currentVisualShift;
    return decrypt ? ((defaultP - s) % 26 + 26) % 26 : (defaultP + s) % 26;
  }, [activeStep, currentVisualShift, decrypt]);

  // Handlers
  const handleSwap = () => {
    if (!result.output) return;
    setText(result.output);
    setDecrypt(!decrypt);
    setStepIdx(-1);
    setIsPlaying(false);
    showToast('Swapped output into input!');
  };

  const handleCopy = () => {
    if (!result.output) return;
    navigator.clipboard.writeText(result.output);
    showToast('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cipherlab-${cipher}-output.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded text file!');
  };

  const handleShareUrl = () => {
    const params = new URLSearchParams({
      cipher,
      mode: decrypt ? 'decrypt' : 'encrypt'
    });
    if (cipher === 'caesar') params.set('shift', String(caesarShift));
    if (cipher === 'vigenere') params.set('key', vigenereKey);
    if (cipher === 'affine') {
      params.set('a', String(affineA));
      params.set('b', String(affineB));
    }
    const fullUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('Shareable link copied to clipboard!');
  };

  const learnInfo = LEARN_CONTENT[cipher] || LEARN_CONTENT.caesar;

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-500 text-slate-950 font-mono text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" /> {toastMsg}
        </div>
      )}

      {/* Main Grid: Controls + Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls, Output, Learn Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Controls Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-wider font-bold text-slate-300 font-mono">
                Input & Parameters
              </h2>
              <button
                onClick={() => {
                  setText(decrypt ? 'Khoor, Zruog! Dwwdfn dw gdzq.' : 'Hello, World! Attack at dawn.');
                  setStepIdx(-1);
                  setIsPlaying(false);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Try Sample
              </button>
            </div>

            {/* Message input */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Message (<span className="text-cyan-300 font-semibold">{decrypt ? 'ciphertext' : 'plaintext'}</span>):
              </label>
              <textarea
                value={text}
                aria-label="Message input for encryption or decryption"
                onChange={(e) => {
                  setText(e.target.value);
                  setStepIdx(-1);
                }}
                rows={3}
                spellCheck="false"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono text-cyan-300 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* Cipher & Mode Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Cipher:</label>
                <select
                  value={cipher}
                  aria-label="Select cipher algorithm"
                  onChange={(e) => {
                    setCipher(e.target.value);
                    setStepIdx(-1);
                    setIsPlaying(false);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-400"
                >
                  <option value="caesar">Caesar (Shift)</option>
                  <option value="vigenere">Vigenère (Keyword)</option>
                  <option value="affine">Affine (ax + b)</option>
                  <option value="atbash">Atbash (A &harr; Z)</option>
                  <option value="railfence">Rail Fence (Zig-Zag)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Mode:</label>
                <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => {
                      setDecrypt(false);
                      setStepIdx(-1);
                    }}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold transition ${
                      !decrypt ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Encrypt
                  </button>
                  <button
                    onClick={() => {
                      setDecrypt(true);
                      setStepIdx(-1);
                    }}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold transition ${
                      decrypt ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Decrypt
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Key Fields */}
            {cipher === 'caesar' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">Shift Key: <b className="text-cyan-300 text-sm">{caesarShift}</b></span>
                  <span className="text-[11px] text-slate-400">wraps mod 26</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={((caesarShift % 26) + 26) % 26}
                  aria-label="Caesar shift slider"
                  aria-valuenow={caesarShift}
                  aria-valuemin="0"
                  aria-valuemax="25"
                  onChange={(e) => setCaesarShift(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={caesarShift}
                    aria-label="Caesar shift numeric input"
                    onChange={(e) => setCaesarShift(parseInt(e.target.value, 10) || 0)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-white outline-none"
                  />
                  <span className="text-[11px] text-slate-400 font-mono">Any positive or negative whole integer</span>
                </div>
              </div>
            )}

            {cipher === 'vigenere' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <label className="block text-xs font-mono text-slate-400 mb-1">Keyword (letters only):</label>
                <input
                  type="text"
                  value={vigenereKey}
                  aria-label="Vigenère keyword"
                  onChange={(e) => setVigenereKey(e.target.value)}
                  placeholder="e.g. LEMON"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-violet-300 outline-none uppercase"
                />
                <div className="text-[11px] text-slate-400 font-mono mt-1.5 leading-tight">
                  Each keyword letter sets a shift: A=0, B=1 ... Z=25. Non-letters pass through without advancing keyword position.
                </div>
              </div>
            )}

            {cipher === 'affine' && (
              <AffineVisualizer
                a={affineA}
                b={affineB}
                aInv={result.keys?.aInv ?? 21}
                onAChange={setAffineA}
                onBChange={setAffineB}
              />
            )}

            {cipher === 'atbash' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 leading-relaxed">
                <div className="text-cyan-400 font-bold mb-1">Atbash Mirror Involution:</div>
                A &harr; Z, B &harr; Y, C &harr; X. Encryption and decryption are the exact same operation!
              </div>
            )}

            {cipher === 'railfence' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Rails Count: <b className="text-cyan-300">{railCount}</b></span>
                  <div className="flex gap-1">
                    {[2, 3, 4, 5, 6].map((r) => (
                      <button
                        key={r}
                        aria-label={`Set ${r} rails`}
                        onClick={() => setRailCount(r)}
                        className={`w-6 h-6 rounded text-xs font-mono font-bold ${
                          railCount === r ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error display if invalid input */}
            {result.error && (
              <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-3 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{result.error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
              <button
                onClick={handleSwap}
                disabled={!result.output}
                title="Move output back to input and toggle mode"
                aria-label="Swap in/out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition disabled:opacity-40"
              >
                <Repeat className="w-3.5 h-3.5 text-cyan-400" /> Swap in/out
              </button>
              <button
                onClick={handleCopy}
                disabled={!result.output}
                aria-label="Copy ciphertext output"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition disabled:opacity-40"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" /> Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!result.output}
                aria-label="Download ciphertext as txt file"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" /> .txt
              </button>
              <button
                onClick={handleShareUrl}
                aria-label="Share cipher link"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Share Link
              </button>
            </div>
          </div>

          {/* Output Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col gap-2">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400 font-mono">
              Ciphertext Output
            </h2>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-base font-mono text-emerald-400 min-h-[64px] break-all select-all">
              {result.output || '(empty)'}
            </div>

            {/* Round-trip verification badge */}
            {roundTripStatus !== null && (
              <div className={`mt-1 text-xs font-mono flex items-center gap-2 p-2 rounded-lg border ${
                roundTripStatus
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/80 text-rose-300'
              }`}>
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>
                  {roundTripStatus
                    ? 'Round-trip verified: running inverse mode gives back the original message exactly.'
                    : 'Round-trip verification failed.'}
                </span>
              </div>
            )}
          </div>

          {/* Learn Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              {learnInfo.title}
            </h3>

            {isAdvanced && learnInfo.math && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <MathFormula tex={learnInfo.math} className="text-xs text-cyan-300" />
              </div>
            )}

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <div>
                <b className="text-cyan-400">Why does this work?</b> {learnInfo.whyWorks}
              </div>
              <div>
                <b className="text-rose-400">How is it broken?</b> {learnInfo.howBroken}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Math Lens & Step Player (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Visual Math Lens Container */}
          <div data-tour="modular-clock" className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Visual Math Lens
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time geometric and circular visualization of the modular arithmetic.
                </p>
              </div>

              {/* Lens Tab Buttons */}
              <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-xs font-mono">
                <button
                  onClick={() => setLensTab('clock')}
                  className={`px-3 py-1 rounded-lg transition ${
                    lensTab === 'clock'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Modular Clock
                </button>
                <button
                  onClick={() => setLensTab('wheel')}
                  className={`px-3 py-1 rounded-lg transition ${
                    lensTab === 'wheel'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cipher Wheel
                </button>
              </div>
            </div>

            {/* Lens Display */}
            <div className="flex justify-center items-center py-2 min-h-[340px]">
              {cipher === 'railfence' ? (
                <RailFenceVisualizer
                  grid={result.grid}
                  rails={railCount}
                  onRailsChange={setRailCount}
                  activeCol={activeStep?.col ?? -1}
                />
              ) : lensTab === 'clock' ? (
                <ModularClock
                  p={activeStep?.p ?? 0}
                  s={currentVisualShift}
                  c={clockC}
                  decrypt={decrypt}
                  upperInput={activeStep?.upperInput ?? 'A'}
                  upperOutput={activeStep?.upperOutput ?? 'D'}
                />
              ) : (
                <CipherWheel
                  cipherType={cipher}
                  shift={caesarShift}
                  affineA={affineA}
                  affineB={affineB}
                  decrypt={decrypt}
                  activeChar={wheelActiveChar}
                  activeOutput={wheelActiveOutput}
                />
              )}
            </div>
          </div>

          {/* Video Step Player */}
          <div data-tour="step-player">
            <StepPlayer
              steps={result.steps}
              currentIdx={stepIdx}
              isPlaying={isPlaying}
              speedMs={speedMs}
              onPlayToggle={() => {
                if (result.steps.length > 0) {
                  setIsPlaying(!isPlaying);
                }
              }}
              onStepChange={(newIdx) => {
                setIsPlaying(false);
                setStepIdx(newIdx);
              }}
              onSpeedChange={setSpeedMs}
              cipherType={cipher}
              isAdvanced={isAdvanced}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
