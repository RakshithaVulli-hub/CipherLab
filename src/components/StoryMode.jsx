import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Eye,
  Lock,
  Unlock,
  Key,
  Wifi,
  Shield,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import MathFormula from './MathFormula.jsx';
import { caesarEncrypt, caesarDecrypt } from '../crypto/caesar.js';
import { vigenereEncrypt, vigenereDecrypt } from '../crypto/vigenere.js';
import { affineEncrypt, affineDecrypt } from '../crypto/affine.js';
import { atbashEncrypt, atbashDecrypt } from '../crypto/atbash.js';
import { railFenceEncrypt, railFenceDecrypt } from '../crypto/railfence.js';
import { rsaEncrypt, rsaDecrypt, validateRsaKeys } from '../crypto/rsa.js';

export default function StoryMode() {
  const [selectedCipher, setSelectedCipher] = useState('rsa');
  const [message, setMessage] = useState('MEET AT NOON');
  const [step, setStep] = useState(0); // 0: compose, 1: Bob sends pubkey (if RSA), 2: Alice encrypts, 3: in transit (Eve intercepts), 4: Bob receives & decrypts
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Compute cipher output for current parameters
  const cipherData = React.useMemo(() => {
    switch (selectedCipher) {
      case 'caesar': {
        const enc = caesarEncrypt(message, 3);
        const dec = caesarDecrypt(enc, 3);
        return { keyDesc: 'Shift = 3', ciphertext: enc, decrypted: dec };
      }
      case 'vigenere': {
        const enc = vigenereEncrypt(message, 'LEMON');
        const dec = vigenereDecrypt(enc, 'LEMON');
        return { keyDesc: 'Keyword = LEMON', ciphertext: enc, decrypted: dec };
      }
      case 'affine': {
        const enc = affineEncrypt(message, 5, 8);
        const dec = affineDecrypt(enc, 5, 8);
        return { keyDesc: 'a=5, b=8', ciphertext: enc, decrypted: dec };
      }
      case 'atbash': {
        const enc = atbashEncrypt(message);
        const dec = atbashDecrypt(enc);
        return { keyDesc: 'Reverse Alphabet', ciphertext: enc, decrypted: dec };
      }
      case 'railfence': {
        const enc = railFenceEncrypt(message, 3);
        const dec = railFenceDecrypt(enc, 3);
        return { keyDesc: '3 Rails', ciphertext: enc, decrypted: dec };
      }
      case 'rsa':
      default: {
        const keys = validateRsaKeys('61', '53', '17');
        const enc = rsaEncrypt(message, keys.e, keys.n);
        const dec = rsaDecrypt(enc.cipherNumbers, keys.d, keys.n);
        return {
          keyDesc: `Public: (e=${keys.e?.toString()}, n=${keys.n?.toString()}) | Private: d=${keys.d?.toString()}`,
          keys,
          ciphertext: enc.cipherText,
          decrypted: dec.plainText
        };
      }
    }
  }, [selectedCipher, message]);

  // Auto-play timer
  useEffect(() => {
    let timer = null;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setStep((prev) => {
          if (prev >= 4) {
            setIsAutoPlaying(false);
            return 4;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const maxSteps = 4;

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            Alice, Bob and Eve: Cryptographic Story Mode
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Follow the journey of a secret transmission across an insecure network wire monitored by Eve.
          </p>
        </div>

        {/* Cipher selection */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Cipher:</span>
          <select
            value={selectedCipher}
            aria-label="Select Story Cipher"
            onChange={(e) => {
              setSelectedCipher(e.target.value);
              setStep(0);
              setIsAutoPlaying(false);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-cyan-400"
          >
            <option value="rsa">RSA Asymmetric (Key Exchange)</option>
            <option value="caesar">Caesar (Symmetric)</option>
            <option value="vigenere">Vigenère (Symmetric)</option>
            <option value="affine">Affine (Symmetric)</option>
            <option value="railfence">Rail Fence (Transposition)</option>
            <option value="atbash">Atbash (Involution)</option>
          </select>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStep(0);
              setIsAutoPlaying(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Auto-Play Story
          </button>
          <button
            onClick={() => {
              setStep(0);
              setIsAutoPlaying(false);
            }}
            aria-label="Reset story to scene 1"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <span>Scene:</span>
          {[0, 1, 2, 3, 4].map((s) => (
            <button
              key={s}
              aria-label={`Jump to Scene ${s + 1}`}
              onClick={() => {
                setStep(s);
                setIsAutoPlaying(false);
              }}
              className={`w-7 h-7 rounded-lg font-bold border transition ${
                step === s
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : step > s
                  ? 'bg-slate-800 text-emerald-400 border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {s + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Story Stage Animation Scene */}
      <div className="relative glass-panel rounded-3xl p-6 border border-slate-700/60 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between">
        {/* Network wire in the background (desktop only) */}
        <div className="hidden md:block absolute top-[160px] left-28 right-28 h-0.5 z-0 pointer-events-none">
          <div className="w-full h-full border-b-2 border-dashed border-cyan-400/50"></div>
        </div>

        {/* Top: Narrative banner */}
        <div className="relative z-10 text-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="inline-block bg-slate-900/95 border border-slate-700/80 rounded-2xl px-5 py-2.5 shadow-xl max-w-xl text-xs font-mono"
            >
              {step === 0 && (
                <span className="text-slate-200">
                  <b className="text-rose-400">Scene 1:</b> Alice composes a secret message: <span className="text-cyan-300">"{message}"</span>.
                </span>
              )}
              {step === 1 && (
                <span className="text-slate-200">
                  {selectedCipher === 'rsa' ? (
                    <span>
                      <b className="text-blue-400">Scene 2:</b> Bob creates a key pair and sends his <b className="text-emerald-400">Public Key (e={cipherData.keys?.e?.toString()}, n={cipherData.keys?.n?.toString()})</b> across the wire to Alice. His private key <b className="text-violet-400">d={cipherData.keys?.d?.toString()}</b> stays securely in his vault!
                    </span>
                  ) : (
                    <span>
                      <b className="text-rose-400">Scene 2:</b> Alice prepares the cryptographic key: <b className="text-cyan-300">{cipherData.keyDesc}</b>.
                    </span>
                  )}
                </span>
              )}
              {step === 2 && (
                <span className="text-slate-200">
                  <b className="text-rose-400">Scene 3:</b> Alice encrypts the message with the key. Plaintext becomes scrambled ciphertext: <b className="text-amber-400">"{cipherData.ciphertext}"</b>.
                </span>
              )}
              {step === 3 && (
                <span className="text-slate-200">
                  <b className="text-amber-400">Scene 4:</b> The packet is transmitted across the open wire. <b className="text-rose-400">Eve intercepts it</b>, but can only see the encrypted characters!
                </span>
              )}
              {step === 4 && (
                <span className="text-slate-200">
                  <b className="text-blue-400">Scene 5:</b> Bob receives the packet, uses his key to decrypt, and successfully reads: <b className="text-emerald-400">"{cipherData.decrypted}"</b>!
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actors Grid: Alice, Eve, Bob */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Alice */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all ${
              step >= 0
                ? 'bg-rose-950/40 border-rose-500 shadow-xl shadow-rose-500/20'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-3xl">👩</span>
            </div>
            <div className="text-sm font-bold text-white mt-2">Alice (Sender)</div>
            <div className="text-[11px] text-rose-300 font-mono">Origin Point</div>

            {/* Alice message bubble */}
            <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 w-full text-xs font-mono">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Message:</div>
              <div className="text-cyan-300 font-bold break-all">"{message}"</div>
              {step >= 2 && (
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Encrypted
                </div>
              )}
            </div>
          </div>

          {/* Eve (in the middle) */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all ${
              step === 3
                ? 'bg-amber-950/60 border-amber-400 ring-4 ring-amber-400/30 scale-105 shadow-xl shadow-amber-500/30'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-3xl">🕵️‍♀️</span>
            </div>
            <div className="text-sm font-bold text-amber-400 mt-2 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Eve (Eavesdropper)
            </div>
            <div className="text-[11px] text-amber-300/80 font-mono">Intercepting Channel</div>

            {/* What Eve sees */}
            <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 w-full text-xs font-mono">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">What Eve Intercepts:</div>
              {step >= 3 ? (
                <div className="text-rose-400 font-bold break-all">
                  "{cipherData.ciphertext}"
                </div>
              ) : (
                <div className="text-slate-400 italic">Listening...</div>
              )}
              {step >= 3 && (
                <div className="text-[10px] text-amber-400/80 mt-1">
                  {selectedCipher === 'rsa'
                    ? 'No private key d. Decryption intractable!'
                    : 'Ciphertext without key is scrambled.'}
                </div>
              )}
            </div>
          </div>

          {/* Bob */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all ${
              step === 4
                ? 'bg-emerald-950/60 border-emerald-400 ring-4 ring-emerald-400/30 shadow-xl shadow-emerald-500/30 scale-105'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-3xl">👨</span>
            </div>
            <div className="text-sm font-bold text-white mt-2">Bob (Receiver)</div>
            <div className="text-[11px] text-blue-300 font-mono">Destination</div>

            {/* Bob decrypted result */}
            <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 w-full text-xs font-mono">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Decrypted Result:</div>
              {step === 4 ? (
                <div className="text-emerald-400 font-bold break-all flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> "{cipherData.decrypted}"
                </div>
              ) : (
                <div className="text-slate-400 italic">Waiting for packet...</div>
              )}
              {selectedCipher === 'rsa' && (
                <div className="text-[10px] text-violet-400 mt-1">
                  Private Key (d={cipherData.keys?.d?.toString()}) safe!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Navigation buttons */}
        <div className="relative z-10 flex justify-between items-center mt-6 pt-3 border-t border-slate-800">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono disabled:opacity-40"
          >
            &larr; Previous Scene
          </button>
          <span className="text-xs font-mono text-slate-400">
            Scene {step + 1} of {maxSteps + 1}
          </span>
          <button
            onClick={() => setStep(Math.min(maxSteps, step + 1))}
            disabled={step === maxSteps}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono disabled:opacity-40"
          >
            Next Scene &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
