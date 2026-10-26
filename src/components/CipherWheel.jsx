/**
 * CipherWheel.jsx — Cipher-aware rotating wheel visualizer.
 *
 * Supports three cipher types:
 *   caesar  – inner ring is A-Z rotated by shift steps (spring animation)
 *   affine  – inner ring shows the permuted alphabet E(i)=(a·i+b) mod 26 (no rotation)
 *   atbash  – inner ring is the reversed alphabet Z,Y,X,…,A (no rotation)
 *
 * Per-step highlighting:
 *   - Outer ring letter (plaintext) highlighted cyan
 *   - Inner ring letter (ciphertext) highlighted emerald
 *   - A dynamic dashed connecting line drawn between the two in global SVG coords
 *
 * Decrypt mode: LabView swaps the (plain,cipher) pair before passing in, so
 * the wheel always sees (plaintext, ciphertext) and renders the encode direction.
 *
 * Reduced motion: uses framer-motion useReducedMotion(). With reduced motion on,
 * transitions use duration:0 (instant snap). All state (highlights, ring labels,
 * connector) still updates normally.
 *
 * Error state: when cipherType='affine' and a is not coprime with 26, renders a
 * clear error panel instead of a nonsense ring.
 */
import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gcd } from '../crypto/affine.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const SIZE = 320;
const CENTER = SIZE / 2;  // 160
const OUTER_R = 130;
const INNER_R = 90;
const ANGLE_STEP = 360 / 26; // ≈ 13.846°

// ── Geometry helpers ───────────────────────────────────────────────────────────

/** Angular position of slot i (degrees, 0° = right, −90° = top/12 o'clock). */
function slotAngleDeg(i) {
  return i * ANGLE_STEP - 90;
}

/** Polar → SVG Cartesian. */
function toXY(r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CipherWheel({
  cipherType = 'caesar',
  /** Caesar: shift amount (any integer, will be normalised 0-25). */
  shift = 3,
  /** Affine multiplier a. */
  affineA = 5,
  /** Affine additive shift b. */
  affineB = 8,
  /** Active plaintext letter (outer ring, e.g. 'H'). */
  activeChar = '',
  /** Active ciphertext letter (inner ring, e.g. 'K'). */
  activeOutput = '',
  /** True when the cipher is running in decrypt direction (only affects legend label). */
  decrypt = false,
}) {
  const prefersReducedMotion = useReducedMotion();

  // ── Affine validity ───────────────────────────────────────────────────────
  const affineGcd = cipherType === 'affine' ? gcd(Math.abs(Number(affineA) || 0), 26) : 1;
  const affineValid = affineGcd === 1;

  // ── Inner ring label array ────────────────────────────────────────────────
  // Each slot i shows the letter that plaintext-letter i maps to.
  const innerLabels = useMemo(() => {
    if (cipherType === 'affine') {
      if (!affineValid) return ALPHA; // placeholder (error state shown instead)
      const a = ((Number(affineA) % 26) + 26) % 26;
      const b = ((Number(affineB) % 26) + 26) % 26;
      return ALPHA.map((_, i) => {
        const c = (a * i + b) % 26;
        return String.fromCharCode(65 + c);
      });
    }
    if (cipherType === 'atbash') {
      // Slot 0 → Z, slot 1 → Y, …, slot 25 → A
      return ALPHA.map((_, i) => String.fromCharCode(65 + (25 - i)));
    }
    // Caesar (and any unknown): standard A-Z; the group rotation provides the mapping.
    return ALPHA;
  }, [cipherType, affineA, affineB, affineValid]);

  // ── Caesar group rotation ─────────────────────────────────────────────────
  // Normalise shift to 0-25.  Only Caesar rotates the group; others fix at 0.
  const safeShift =
    cipherType === 'caesar' && Number.isFinite(Number(shift))
      ? ((Number(shift) % 26) + 26) % 26
      : 0;
  // Positive value = how many degrees the inner group rotates CCW (framer gets -rotationAngle).
  const rotationAngle = cipherType === 'caesar' ? safeShift * ANGLE_STEP : 0;

  // ── Active letter positions ───────────────────────────────────────────────
  const activePlain  = String(activeChar  || '').toUpperCase();
  const activeCipher = String(activeOutput || '').toUpperCase();
  const isValidPair  = ALPHA.includes(activePlain) && ALPHA.includes(activeCipher);

  const outerActiveIdx = ALPHA.indexOf(activePlain);
  // Find which inner slot carries the activeCipher label.
  const innerActiveIdx = innerLabels.indexOf(activeCipher);

  // ── Connecting line endpoints (global SVG coords) ─────────────────────────
  // Outer point: fixed position of the active outer letter.
  const outerPt = outerActiveIdx >= 0 ? toXY(OUTER_R, slotAngleDeg(outerActiveIdx)) : null;

  // Inner point: visual world-space position of the active inner slot,
  // accounting for the group rotation of −rotationAngle degrees.
  //
  // Proof: motion.g animates to rotate(−rotationAngle) around CENTER.
  // In CSS, rotate(−R deg) moves a point at polar angle θ to angle (θ − R).
  // So slot i (group-space angle = i·STEP − 90) appears at world angle
  //   (i·STEP − 90) − rotationAngle
  // after the group has fully rotated to its target.
  //
  // For Caesar shift=3, 'K' is at slot 10:
  //   (10·STEP − 90) − 3·STEP = 7·STEP − 90
  // 'H' outer is at slot 7:
  //   7·STEP − 90
  // ⇒ they share the same angle, i.e. the line is radial. ✓
  const innerVisualAngleDeg =
    innerActiveIdx >= 0 ? slotAngleDeg(innerActiveIdx) - rotationAngle : null;
  const innerPt = innerVisualAngleDeg !== null ? toXY(INNER_R, innerVisualAngleDeg) : null;

  const showLine = isValidPair && outerPt !== null && innerPt !== null;

  // ── Framer transition ─────────────────────────────────────────────────────
  // With reduced motion: instant snap (duration 0). Ring state still updates.
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 200, damping: 24 };

  // ── Per-cipher caption ────────────────────────────────────────────────────
  const caption = (() => {
    if (cipherType === 'affine') {
      return affineValid
        ? `Inner ring: E(x) = (${affineA}·x + ${affineB}) mod 26 — a permutation, not a rotation.`
        : `Invalid key: a = ${affineA}, gcd(${affineA}, 26) = ${affineGcd} ≠ 1.`;
    }
    if (cipherType === 'atbash') return 'Inner ring reversed: A↔Z, B↔Y, C↔X …';
    return `Inner ring rotated ${safeShift} step${safeShift !== 1 ? 's' : ''}. Letter at ↑ = ciphertext for 'A'.`;
  })();

  // ── Error state ───────────────────────────────────────────────────────────
  if (cipherType === 'affine' && !affineValid) {
    return (
      <div className="flex flex-col items-center gap-3" data-testid="cipher-wheel-error">
        <div
          className="flex items-center justify-center rounded-full border-2 border-rose-500/40 bg-rose-950/20"
          style={{ width: SIZE, height: SIZE }}
        >
          <div className="text-center px-8">
            <div className="text-rose-400 text-4xl mb-3">⚠</div>
            <div className="text-rose-300 text-sm font-mono font-bold mb-1">
              Invalid key: a = {affineA}
            </div>
            <div className="text-rose-400/80 text-xs font-mono">
              gcd({affineA}, 26) = {affineGcd} ≠ 1
            </div>
            <div className="text-slate-400 text-xs mt-3 leading-snug">
              Multiplier <em>a</em> must be coprime to 26.<br />
              Valid values: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25
            </div>
          </div>
        </div>
        <p className="text-[11px] text-rose-400/70 font-mono text-center max-w-[280px]">{caption}</p>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-2" data-testid="cipher-wheel">
      <svg
        width={SIZE}
        height={SIZE}
        className="select-none overflow-visible"
        aria-label={`Cipher wheel — ${cipherType}`}
        data-cipher={cipherType}
        data-shift={safeShift}
        data-rotate={-rotationAngle}
      >
        <defs>
          <radialGradient id="cwCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1e1b4b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#090d16" stopOpacity="0.9" />
          </radialGradient>
          <filter id="cwGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Outer ring background ── */}
        <circle cx={CENTER} cy={CENTER} r={OUTER_R + 18} fill="#0d1424" stroke="#1f2b45" strokeWidth="2" />
        <circle cx={CENTER} cy={CENTER} r={OUTER_R - 12} fill="none" stroke="#2a3a5e" strokeWidth="1" strokeDasharray="3 3" />

        {/* ── Outer ring: Plaintext A-Z (always fixed) ── */}
        {ALPHA.map((letter, i) => {
          const pt = toXY(OUTER_R, slotAngleDeg(i));
          const isActive = letter === activePlain;
          return (
            <text
              key={`outer-${letter}`}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12.5"
              fontWeight={isActive ? 'bold' : 'normal'}
              fill={isActive ? '#22d3ee' : '#94a3b8'}
              filter={isActive ? 'url(#cwGlow)' : undefined}
              className="font-mono"
            >
              {letter}
            </text>
          );
        })}

        {/* ── Rotating inner ring group ── */}
        {/*
          For Caesar: group rotates to rotate(−rotationAngle), spring-animated.
          For Affine/Atbash: rotationAngle=0, group stays fixed; permuted labels
          carry the cipher mapping.
          data-rotate-target lets tests verify the target angle without depending
          on framer-motion's RAF scheduler.
        */}
        <motion.g
          animate={{ rotate: -rotationAngle }}
          transition={transition}
          style={{ originX: `${CENTER}px`, originY: `${CENTER}px` }}
          data-testid="inner-ring-group"
          data-rotate-target={-rotationAngle}
        >
          {/* Inner ring body */}
          <circle cx={CENTER} cy={CENTER} r={INNER_R + 10} fill="url(#cwCenter)" stroke="#3b4261" strokeWidth="1.5" />
          <circle cx={CENTER} cy={CENTER} r={INNER_R - 14} fill="#090d16" stroke="#1f2b45" strokeWidth="1" />

          {/* Inner ring letters */}
          {innerLabels.map((label, i) => {
            const pt = toXY(INNER_R, slotAngleDeg(i));
            const isActiveSlot = i === innerActiveIdx;
            return (
              <text
                key={`inner-${i}`}
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight={isActiveSlot ? 'bold' : '600'}
                fill={isActiveSlot ? '#10b981' : '#a855f7'}
                filter={isActiveSlot ? 'url(#cwGlow)' : undefined}
                className="font-mono"
                /* Keep the glyph upright as the group rotates */
                transform={`rotate(${slotAngleDeg(i) + 90}, ${pt.x}, ${pt.y})`}
              >
                {label}
              </text>
            );
          })}
        </motion.g>

        {/* ── Dynamic connecting line ──
          Drawn in global SVG coordinates, outside the rotating group, so the
          endpoints can be computed from world-space angles.
          Visible only when both activeChar and activeOutput are valid letters.
        */}
        {showLine && outerPt && innerPt && (
          <line
            x1={outerPt.x}
            y1={outerPt.y}
            x2={innerPt.x}
            y2={innerPt.y}
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
            opacity="0.9"
            data-testid="cipher-connector"
          />
        )}

        {/* ── Static alignment indicator at 12 o'clock ── */}
        <line
          x1={CENTER}
          y1={CENTER - OUTER_R - 16}
          x2={CENTER}
          y2={CENTER - INNER_R + 15}
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="3 2"
          opacity="0.3"
        />
        <polygon
          points={`${CENTER - 5},${CENTER - OUTER_R - 16} ${CENTER + 5},${CENTER - OUTER_R - 16} ${CENTER},${CENTER - OUTER_R - 8}`}
          fill="#10b981"
          opacity="0.3"
        />
      </svg>

      {/* ── Legend ── */}
      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
          {decrypt ? 'Outer = Ciphertext (input)' : 'Outer = Plaintext (input)'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
          {decrypt ? 'Inner = Plaintext (output)' : 'Inner = Ciphertext (output)'}
        </span>
      </div>

      {/* ── Per-cipher caption ── */}
      <p className="text-[11px] text-slate-400/80 font-mono text-center max-w-[300px] leading-snug px-2 mt-1">
        {caption}
      </p>
    </div>
  );
}
