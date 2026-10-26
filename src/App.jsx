import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HomeView from './views/HomeView.jsx';
import LabView from './views/LabView.jsx';
import RsaVisualizer from './components/RsaVisualizer.jsx';
import DiffieHellmanVisualizer from './components/DiffieHellmanVisualizer.jsx';
import BreakItMode from './components/BreakItMode.jsx';
import StoryMode from './components/StoryMode.jsx';
import CompareView from './components/CompareView.jsx';
import QuizMode from './components/QuizMode.jsx';
import GlossaryModal from './components/GlossaryModal.jsx';
import GuidedTour from './components/GuidedTour.jsx';
import { ShieldAlert, Sparkles } from 'lucide-react';
import { MotionConfig } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCipher, setActiveCipher] = useState('caesar');
  const [isAdvanced, setIsAdvanced] = useState(true);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  // Check first-run status on mount to launch guided tour
  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem('cipherlab_tour_seen');
      if (!tourSeen) {
        const timer = setTimeout(() => {
          setTourOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const handleCloseTour = () => {
    setTourOpen(false);
    try {
      localStorage.setItem('cipherlab_tour_seen', 'true');
    } catch (e) {}
  };

  // Parse URL query string on mount for shareable URLs
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const cipherParam = params.get('cipher');

      if (tabParam && ['home', 'lab', 'rsa', 'dh', 'breakit', 'story', 'compare', 'quiz'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else if (cipherParam) {
        setActiveTab('lab');
        setActiveCipher(cipherParam);
      }
    } catch (e) {}
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#090d16] text-[#e6ebf5] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdvanced={isAdvanced}
        onToggleAdvanced={setIsAdvanced}
        onOpenGlossary={() => setGlossaryOpen(true)}
        onStartTour={() => setTourOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomeView
            onSelectTab={setActiveTab}
            onSelectCipher={(c) => {
              setActiveCipher(c);
              setActiveTab('lab');
            }}
          />
        )}

        {activeTab === 'lab' && (
          <LabView
            initialCipher={activeCipher}
            isAdvanced={isAdvanced}
          />
        )}

        {activeTab === 'rsa' && (
          <RsaVisualizer isAdvanced={isAdvanced} />
        )}

        {activeTab === 'dh' && (
          <DiffieHellmanVisualizer />
        )}

        {activeTab === 'breakit' && (
          <BreakItMode />
        )}

        {activeTab === 'story' && (
          <StoryMode />
        )}

        {activeTab === 'compare' && (
          <CompareView />
        )}

        {activeTab === 'quiz' && (
          <QuizMode />
        )}
      </main>

      {/* Mandatory Educational Disclaimer & Footer */}
      <footer className="border-t border-slate-800 bg-[#070a12]/80 backdrop-blur py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 text-amber-400/90 bg-amber-950/40 border border-amber-900/60 px-3 py-1.5 rounded-xl">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Educational only. Do not use these implementations to protect real-world sensitive data.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Theme: Mathematics & Applications</span>
            <span>•</span>
            <span>Vite + React + Tailwind + BigInt</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">CipherLab v2.0</span>
          </div>
        </div>
      </footer>

      {/* Glossary Modal */}
      <GlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />

      {/* Guided Tour Modal */}
      <GuidedTour
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={tourOpen}
        onClose={handleCloseTour}
      />
    </div>
  </MotionConfig>
  );
}
