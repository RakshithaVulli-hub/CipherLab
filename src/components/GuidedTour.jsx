import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, X, Check, Compass } from 'lucide-react';

const TOUR_STEPS = [
  {
    targetId: 'advanced-toggle',
    tab: null, // stays on current or navbar
    title: '1. Beginner vs. Advanced Mode',
    description: 'Toggle between plain-language narrative intuition and rigorous mathematical formulas rendered dynamically with KaTeX. Tailored for both newcomers and college-level mathematics.',
    position: 'bottom'
  },
  {
    targetId: 'breakit-tab',
    tab: null,
    title: '2. Break-It: The Attacker View',
    description: 'Step into the shoes of a cryptanalyst! Exhaustively brute-force all 25 Caesar shifts simultaneously, run frequency analysis, inspect the Index of Coincidence, and crack mystery challenges.',
    position: 'bottom'
  },
  {
    targetId: 'modular-clock',
    tab: 'lab',
    title: '3. Visual Math Lens: Modular Clock',
    description: 'Watch arithmetic mod 26 come to life! A circular clock hand moves from plaintext to ciphertext and visibly wraps around (e.g. (23 + 5) mod 26 = 2), making circular groups intuitive.',
    position: 'left'
  },
  {
    targetId: 'step-player',
    tab: 'lab',
    title: '4. Video Step Player & Scrub Timeline',
    description: 'Step through every single letter transformation at your own pace! Scrub the video timeline, control speed, use keyboard shortcuts (Space, ←, →), or click any letter tile to jump directly to its calculation.',
    position: 'top'
  }
];

export default function GuidedTour({
  activeTab,
  onSelectTab,
  isOpen,
  onClose
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const tooltipRef = useRef(null);

  const stepData = TOUR_STEPS[currentStep];

  // Update target bounding box and handle view switching
  useEffect(() => {
    if (!isOpen) return;

    if (stepData.tab && activeTab !== stepData.tab) {
      onSelectTab(stepData.tab);
    }

    const updatePosition = () => {
      const candidates = Array.from(document.querySelectorAll(`[data-tour="${stepData.targetId}"]`));
      const el = candidates.find((elem) => {
        const r = elem.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    updatePosition();
    const t1 = setTimeout(updatePosition, 100);
    const t2 = setTimeout(updatePosition, 300);
    const t3 = setTimeout(updatePosition, 600);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, currentStep, activeTab, stepData, onSelectTab]);

  // Keyboard navigation for tour
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const hasValidTarget = Boolean(targetRect && targetRect.width > 0 && targetRect.height > 0);

  // Calculate Tooltip position based on target rect
  let tooltipStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 60
  };

  if (hasValidTarget) {
    const spacing = 16;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const cardWidth = Math.min(340, windowWidth - 32);

    let top = targetRect.bottom + spacing;
    let left = targetRect.left + (targetRect.width / 2) - (cardWidth / 2);

    if (stepData.position === 'top' || top + 240 > windowHeight) {
      top = Math.max(16, targetRect.top - 240);
    }
    if (stepData.position === 'left' && targetRect.left > cardWidth + 30) {
      left = targetRect.left - cardWidth - spacing;
      top = targetRect.top;
    }

    // Keep strictly within screen bounds
    left = Math.max(16, Math.min(windowWidth - cardWidth - 16, left));
    top = Math.max(16, Math.min(windowHeight - 260, top));

    tooltipStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 60
    };
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Dimmed backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      {/* Target Highlight Ring */}
      {hasValidTarget && (
        <motion.div
          layoutId="tour-highlight"
          className="fixed pointer-events-none rounded-2xl ring-4 ring-cyan-400 ring-offset-4 ring-offset-[#090d16] shadow-[0_0_35px_rgba(6,182,212,0.6)] z-55"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        />
      )}

      {/* Tour Tooltip Card */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={tooltipStyle}
        ref={tooltipRef}
        className="w-[340px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] overflow-y-auto bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-3 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">
              {currentStep + 1}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Tour • Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div>
          <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            {stepData.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {stepData.description}
          </p>

          {!hasValidTarget && (
            <div className="mt-2 text-[11px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-800/70 px-2.5 py-1.5 rounded-xl">
              💡 On smaller mobile screens, access this control via the navigation menu (☰).
            </div>
          )}
        </div>

        {/* Progress dots & actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === idx
                    ? 'w-5 bg-cyan-400'
                    : idx < currentStep
                    ? 'bg-cyan-800'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                data-testid="tour-prev-btn"
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white transition"
              >
                Back
              </button>
            )}

            <button
              data-testid="tour-next-btn"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Finish
                </>
              ) : (
                <>
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
