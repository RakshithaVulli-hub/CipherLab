import React, { useState } from 'react';
import {
  Lock,
  Compass,
  Cpu,
  KeyRound,
  Skull,
  Wifi,
  Scale,
  Award,
  BookOpen,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  activeTab,
  onTabChange,
  isAdvanced,
  onToggleAdvanced,
  onOpenGlossary,
  onStartTour
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'lab', label: 'Lab & Clock', icon: Cpu },
    { id: 'rsa', label: 'RSA Showpiece', icon: Lock, badge: 'Main' },
    { id: 'dh', label: 'Diffie-Hellman', icon: KeyRound },
    { id: 'breakit', label: 'Break-It', icon: Skull },
    { id: 'story', label: 'Story Mode', icon: Wifi },
    { id: 'compare', label: 'Compare', icon: Scale },
    { id: 'quiz', label: 'Quiz', icon: Award }
  ];

  const handleBrandKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onTabChange('home')}
            onKeyDown={handleBrandKeyDown}
            aria-label="CipherLab home page"
            className="flex items-center gap-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Lock className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Cipher<span className="text-cyan-400">Lab</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                v2.0 Visual Math
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  data-tour={item.id === 'breakit' ? 'breakit-tab' : undefined}
                  onClick={() => onTabChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-violet-950 text-violet-300 border border-violet-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right utility items */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Beginner vs Advanced Mode Toggle */}
            <div
              data-tour="advanced-toggle"
              role="group"
              aria-label="Mathematical formula detail level"
              className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-xs"
            >
              <button
                onClick={() => onToggleAdvanced(false)}
                aria-pressed={!isAdvanced}
                aria-label="Beginner mode: plain language narrative explanations"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  !isAdvanced ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => onToggleAdvanced(true)}
                aria-pressed={isAdvanced}
                aria-label="Advanced KaTeX mode: rigorous mathematical formulas"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  isAdvanced ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Advanced KaTeX
              </button>
            </div>

            {/* Guided Tour Button */}
            <button
              onClick={onStartTour}
              aria-label="Start first-run guided tour"
              title="First-run Guided Tour"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tour</span>
            </button>

            {/* Glossary Button */}
            <button
              onClick={onOpenGlossary}
              aria-label="Open mathematical glossary"
              title="Mathematical Glossary"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-mono transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Glossary</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenGlossary}
              aria-label="Open mathematical glossary"
              className="p-2 rounded-lg text-slate-300 hover:text-white"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                data-tour={item.id === 'breakit' ? 'breakit-tab' : undefined}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
            <span>Formula Detail:</span>
            <div data-tour="advanced-toggle" className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => onToggleAdvanced(false)}
                className={`px-2 py-0.5 rounded text-[11px] ${!isAdvanced ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300'}`}
              >
                Beginner
              </button>
              <button
                onClick={() => onToggleAdvanced(true)}
                className={`px-2 py-0.5 rounded text-[11px] ${isAdvanced ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300'}`}
              >
                KaTeX
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
