import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, RotateCcw, HelpCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import MathFormula from './MathFormula.jsx';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'In modular arithmetic mod 26, what is the value of (22 + 9) mod 26?',
    options: [
      '5',
      '31',
      '4',
      '22'
    ],
    correctIndex: 0,
    explanation: '22 + 9 = 31. Dividing 31 by 26 gives a quotient of 1 with remainder 5: (31 mod 26) = 5.'
  },
  {
    id: 2,
    question: 'In the Affine Cipher E(x) = (a·x + b) mod 26, why must key "a" be coprime to 26 (gcd(a, 26) = 1)?',
    options: [
      'To make the letters rotate faster',
      'If gcd(a, 26) ≠ 1, multiple plaintext letters map to the same ciphertext letter, making unique decryption mathematically impossible',
      'Because 26 is a prime number',
      'To prevent the key from exceeding 26'
    ],
    correctIndex: 1,
    explanation: 'By Bézout identity, a modular inverse a⁻¹ exists mod 26 if and only if gcd(a, 26) = 1. Without it, the mapping is non-injective (collides).'
  },
  {
    id: 3,
    question: 'In RSA key generation, given primes p = 61 and q = 53, what is Euler’s totient φ(n)?',
    options: [
      '3233',
      '3120',
      '114',
      '60'
    ],
    correctIndex: 1,
    explanation: 'φ(n) = (p - 1)(q - 1) = (61 - 1) × (53 - 1) = 60 × 52 = 3120.'
  },
  {
    id: 4,
    question: 'Which mathematical algorithm is used in RSA to calculate the private decryption key d = e⁻¹ mod φ(n)?',
    options: [
      'Sieve of Eratosthenes',
      'Extended Euclidean Algorithm',
      'Newton-Raphson Method',
      'Kasiski Examination'
    ],
    correctIndex: 1,
    explanation: 'The Extended Euclidean Algorithm calculates the integer coefficients x and y for e·x + φ(n)·y = gcd(e, φ(n)) = 1, yielding d ≡ x (mod φ(n)).'
  },
  {
    id: 5,
    question: 'Why does the Vigenère cipher defeat naive single-letter frequency analysis?',
    options: [
      'It deletes all vowel letters',
      'It is polyalphabetic: the same plaintext letter is shifted by different key letters at different positions',
      'It encrypts using binary XOR',
      'It requires prime numbers'
    ],
    correctIndex: 1,
    explanation: 'Because each keyword letter shifts the message with a distinct alphabet, an "E" in one position can turn into "K", while in another position it turns into "R", flattening the characteristic frequency spike of English.'
  },
  {
    id: 6,
    question: 'What is the one-way trapdoor problem that underpins Diffie-Hellman Key Exchange?',
    options: [
      'The Discrete Logarithm Problem in a cyclic group mod p',
      'Matrix inversion',
      'The Travelling Salesperson Problem',
      'Sorting algorithms'
    ],
    correctIndex: 0,
    explanation: 'Computing gᵃ mod p is fast (via binary exponentiation), but finding secret a given g, p, and gᵃ mod p is the Discrete Logarithm Problem, which is computationally infeasible for large prime fields.'
  }
];

export default function QuizMode() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const curQ = QUIZ_QUESTIONS[currentIdx];
  const total = QUIZ_QUESTIONS.length;
  const answered = selectedAnswers[currentIdx] !== undefined;

  const handleSelectOption = (optIdx) => {
    if (answered) return;

    const isCorrect = optIdx === curQ.correctIndex;
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optIdx });

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (currentIdx === total - 1) {
      setIsFinished(true);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Cryptography & Mathematics Mastery Quiz
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Test your conceptual understanding of modular arithmetic, number theory, and cryptanalysis.
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-3 py-1 rounded-full font-bold">
          Score: {score} / {total}
        </span>
      </div>

      {isFinished ? (
        <div className="glass-panel rounded-2xl p-8 border border-slate-700/60 shadow-2xl text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mb-4">
            🏆
          </div>
          <h4 className="text-2xl font-bold text-white">Quiz Completed!</h4>
          <p className="text-sm text-slate-300 mt-1">
            You scored <b className="text-cyan-400">{score}</b> out of <b className="text-white">{total}</b> ({Math.round((score / total) * 100)}%).
          </p>
          <div className="mt-4 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-4 py-2 rounded-xl">
            {score >= 5 ? '🌟 Cryptographic Prodigy! You understand the mathematics and the attacks.' : '👍 Good effort! Review the Lab modules and try again.'}
          </div>
          <button
            onClick={handleRestart}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition hover:bg-cyan-400"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col gap-5">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Question {currentIdx + 1} of {total}</span>
            <span>Progress: {Math.round(((currentIdx + 1) / total) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
            />
          </div>

          {/* Question text */}
          <div className="text-base font-bold text-white leading-relaxed">
            {curQ.question}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {curQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIdx] === optIdx;
              const isCorrectOpt = optIdx === curQ.correctIndex;

              let style = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

              if (answered) {
                if (isCorrectOpt) {
                  style = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold';
                } else if (isSelected && !isCorrectOpt) {
                  style = 'bg-rose-950/60 border-rose-500 text-rose-300';
                } else {
                  style = 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  disabled={answered}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs font-mono flex items-start gap-3 transition-all ${style}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1 mt-0.5">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation if answered */}
          {answered && (
            <div className={`p-4 rounded-xl text-xs font-mono border ${
              selectedAnswers[currentIdx] === curQ.correctIndex
                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800/80 text-rose-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {selectedAnswers[currentIdx] === curQ.correctIndex ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Correct!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" /> Incorrect
                  </>
                )}
              </div>
              <div className="text-slate-300 leading-relaxed mt-1">
                {curQ.explanation}
              </div>
            </div>
          )}

          {/* Next button */}
          {answered && currentIdx < total - 1 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition"
              >
                Next Question &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
