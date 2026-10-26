import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Key,
  Cpu,
  Skull,
  Wifi,
  Scale,
  Award,
  Shield,
  Layers,
  ChevronRight,
  Clock
} from 'lucide-react';
import MathFormula from '../components/MathFormula.jsx';

export default function HomeView({ onSelectTab, onSelectCipher }) {
  const cipherCards = [
    {
      id: 'caesar',
      name: 'Caesar Cipher',
      badge: 'Beginner',
      badgeColor: 'emerald',
      math: 'c = (p + s) \\bmod 26',
      description: 'Single shift key across the alphabet. Visualize on the animated modular clock and dual cipher wheel.',
      actionTab: 'lab'
    },
    {
      id: 'vigenere',
      name: 'Vigenère Cipher',
      badge: 'Intermediate',
      badgeColor: 'cyan',
      math: 'c_i = (p_i + k_i) \\bmod 26',
      description: 'Polyalphabetic substitution using a keyword. Flattens single-letter frequency spikes.',
      actionTab: 'lab'
    },
    {
      id: 'affine',
      name: 'Affine Cipher',
      badge: 'Algebraic',
      badgeColor: 'violet',
      math: 'E(x) = (ax + b) \\bmod 26',
      description: 'Linear modular transform with multiplier a and shift b. Explores coprimality and modular multiplicative inverses.',
      actionTab: 'lab'
    },
    {
      id: 'atbash',
      name: 'Atbash Cipher',
      badge: 'Involution',
      badgeColor: 'teal',
      math: 'E(x) = (25 - x) \\bmod 26',
      description: 'Biblical Hebrew alphabet reflection where A ↔ Z and B ↔ Y. Symmetric involution where encrypt equals decrypt.',
      actionTab: 'lab'
    },
    {
      id: 'rsa',
      name: 'RSA Asymmetric Showpiece',
      badge: 'Advanced / College',
      badgeColor: 'amber',
      math: 'c = m^e \\bmod n, \\; m = c^d \\bmod n',
      description: 'Public-key cryptosystem. Step-by-step Extended Euclidean Algorithm table and Square-and-Multiply binary exponentiation.',
      actionTab: 'rsa'
    },
    {
      id: 'dh',
      name: 'Diffie-Hellman Key Exchange',
      badge: 'Foundational',
      badgeColor: 'rose',
      math: 'g^{ab} \\bmod p = (g^a)^b \\bmod p',
      description: 'Public channel key agreement. Interactive paint-mixing physical analogy side-by-side with discrete log mathematics.',
      actionTab: 'dh'
    },
    {
      id: 'railfence',
      name: 'Rail Fence Transposition',
      badge: 'Visual Grid',
      badgeColor: 'cyan',
      math: '\\text{Permutation matrix across } k \\text{ rails}',
      description: 'Geometric zig-zag cipher that rearranges letter order without altering their identities.',
      actionTab: 'lab'
    }
  ];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass-panel border border-slate-700/60 shadow-2xl mt-2">
        {/* Ambient neon backdrop glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Hackathon Edition: Mathematics & Cryptography Lab
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            See the <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">Mathematics</span> behind Cryptography.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            An interactive visual laboratory where students and judges don't just see the ciphertext output—they explore the modular arithmetic, Extended Euclidean steps, Square-and-Multiply binary traces, and cryptanalytic attacks.
          </p>

          {/* Quick CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                onSelectCipher('caesar');
                onSelectTab('lab');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25"
            >
              <Cpu className="w-4 h-4" />
              Launch Interactive Lab (Caesar Shift 3)
            </button>

            <button
              onClick={() => onSelectTab('rsa')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-violet-500 text-slate-200 text-sm font-semibold transition"
            >
              <Key className="w-4 h-4 text-violet-400" />
              Explore RSA Showpiece
            </button>

            <button
              onClick={() => onSelectTab('breakit')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/80 text-slate-300 text-sm font-semibold transition"
            >
              <Skull className="w-4 h-4 text-rose-400" />
              Break-It Mode
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 100% In-Browser BigInt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> KaTeX Formula Synchronization
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400"></span> No Backend / Zero Latency
            </span>
          </div>
        </div>
      </section>

      {/* Cipher Selection Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Cryptographic Algorithms Explorer
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Select an algorithm to step through the mathematical transformations one letter at a time.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            7 Algorithms Implemented
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cipherCards.map((card) => (
            <div
              key={card.id}
              onClick={() => {
                if (card.actionTab === 'lab') {
                  onSelectCipher(card.id);
                  onSelectTab('lab');
                } else {
                  onSelectTab(card.actionTab);
                }
              }}
              className="glass-panel-subtle hover:glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group hover:-translate-y-1 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                    card.badgeColor === 'emerald'
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                      : card.badgeColor === 'cyan'
                      ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                      : card.badgeColor === 'violet'
                      ? 'bg-violet-950/60 border-violet-800 text-violet-300'
                      : card.badgeColor === 'amber'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                      : card.badgeColor === 'teal'
                      ? 'bg-teal-950/60 border-teal-800 text-teal-300'
                      : 'bg-rose-950/60 border-rose-800 text-rose-300'
                  }`}>
                    {card.badge}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                  {card.name}
                </h3>

                <div className="text-xs font-mono text-cyan-300 my-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 overflow-x-auto">
                  <MathFormula tex={card.math} />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  {card.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-400 font-semibold">
                <span>Explore Step-by-Step</span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <Clock className="w-5 h-5 text-cyan-400 mb-2" />
          <h4 className="font-bold text-white text-sm">Modular Clock Lens</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            SVG circular dial visualizing addition and wrap-around mod 26 and mod n.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <Key className="w-5 h-5 text-violet-400 mb-2" />
          <h4 className="font-bold text-white text-sm">RSA Showpiece</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Extended Euclidean Algorithm table + Square-and-Multiply binary exponentiation.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <Skull className="w-5 h-5 text-rose-400 mb-2" />
          <h4 className="font-bold text-white text-sm">Break-It Mode</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Brute force all 25 shifts, Index of Coincidence, and Kasiski key estimation.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <Wifi className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="font-bold text-white text-sm">Alice & Bob Story</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Animated packet transmission over an insecure wire eavesdropped by Eve.
          </p>
        </div>
      </section>
    </div>
  );
}
