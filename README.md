# CipherLab — Interactive Cryptography & Mathematics Lab

> **Hackathon Theme:** Mathematics and its Applications  
> **Problem Statement:** Cryptography Learning Tool. Students lack interactive tools to understand encryption/decryption mathematics. Create a web-based tool where students can input text and see how different encryption/decryption algorithms (Caesar cipher, RSA, etc.) work step by step.

---

## 🌟 Overview & Differentiators

CipherLab upgrades traditional cryptography demos from simple "text-in, ciphertext-out" calculators into a **visual mathematical laboratory**. It makes the **number theory, modular arithmetic, and cryptanalytic attacks visible and tangible**:

1. **Video-Style Step Player:** Play, pause, scrub timeline, adjust speed (150ms–1000ms), and navigate with keyboard shortcuts (`Space`, `←`, `→`). Clicking any letter tile immediately jumps to its mathematical transformation.
2. **Visual Math Lens (Modular Clock & Cipher Wheel):** Animated SVG dial showing arithmetic $\pmod{26}$. A vector moves from the plaintext coordinate by the shift amount and visibly wraps around (e.g. $(23 + 5) \equiv 2 \pmod{26}$). Includes an animated dual-ring cipher wheel.
3. **RSA Showpiece (Asymmetric Cryptosystem):**
   - **Key Generation:** Choose $p$ and $q$, compute $n = p \times q$, $\phi(n) = (p-1)(q-1)$, and choose $e$ with $\gcd(e, \phi(n)) = 1$.
   - **Extended Euclidean Algorithm Table:** Displays Bézout identity step coefficients finding $d = e^{-1} \pmod{\phi(n)}$.
   - **Square-and-Multiply Exponentiation:** Step-by-step binary modular exponentiation ($c = m^e \bmod n$, $m = c^d \bmod n$) tracking every bit square and multiplication.
   - **Classroom vs. Real-World Mode:** Toggle hand-checkable primes ($p=61, q=53, e=17$) vs. arbitrary-precision BigInt keys (128-bit & 256-bit with Miller-Rabin primality testing) with an educational table comparing classical vs. quantum (Shor's algorithm) factoring times.
4. **Comprehensive Cipher Suite:**
   - **Caesar Cipher:** Shift arithmetic $\pmod{26}$.
   - **Vigenère Cipher:** Polyalphabetic keyword alignment where punctuation passes through without advancing key letters.
   - **Affine Cipher:** Linear transformation $E(x) = (ax + b) \pmod{26}$ with validation that $\gcd(a, 26) = 1$ and modular inverse $a^{-1} \pmod{26}$.
   - **Atbash Cipher:** Hebrew involution $E(x) = (25 - x) \pmod{26}$.
   - **Rail Fence Cipher:** 2D zig-zag transposition wave matrix across $k$ rails.
   - **Diffie-Hellman Key Exchange:** Interactive paint-mixing color analogy alongside live modular arithmetic ($g^a \bmod p$ and $g^b \bmod p$).
5. **Break-It Mode (Attacker / Cryptanalyst View):**
   - **Caesar Exhaustive Brute-Force:** Evaluates all 25 shifts simultaneously, automatically scored by chi-squared ($\chi^2$) statistic and English dictionary matches.
   - **Letter Frequency Distribution Chart:** Interactive comparison of observed ciphertext frequencies against standard English, featuring an automatic guess-the-shift assistant.
   - **Vigenère Cryptanalysis:** Computes Index of Coincidence (IoC) and runs Kasiski examination to detect repeated n-grams and estimate keyword length.
   - **Mystery Crack Challenges:** Interactive level-based code cracking challenge with hints and XP tracking.
6. **Alice, Bob and Eve Story Mode:** An animated scene showing Alice transmitting a message, Eve intercepting ciphertext on the open wire, and Bob decrypting it. For RSA, Bob sends his public key $(e, n)$ across the wire to Alice while his private key $d$ remains locked in his vault.
7. **Pedagogical Aids & Utilities:**
   - **First-Run Guided Tour:** 4 interactive tooltips highlighting the Beginner/Advanced toggle, Break-It tab, Modular Clock, and Video Step Player (re-launchable at any time via the "Tour" button in the navigation bar).
   - **Beginner / Advanced Toggle:** Beginner gives plain-language narrative explanations; Advanced renders formulas in KaTeX.
   - **Mathematical Glossary Modal:** Terms including Totient $\phi$, Coprimality, Bézout's identity, Trapdoor functions, and Modular Inverses.
   - **Side-by-Side Compare View:** Compare identical plaintext passed through two different algorithms at once.
   - **Round-Trip Badge:** Tests involution / inverse decryption to verify identity conservation.
   - **Export & Share:** Copy result, download as `.txt`, and shareable URL query encoding.

---

## 🛠️ Tech Stack & Architecture

- **Build & Framework:** Vite + React 19
- **Styling & Aesthetics:** Tailwind CSS + custom glassmorphism, responsive from mobile to 4K projector
- **Animation:** Framer Motion + custom vector SVG
- **Mathematical Rendering:** KaTeX
- **Arbitrary Precision:** Native JavaScript `BigInt` (Zero external heavy math libraries)
- **Zero Backend:** Runs 100% in the client browser, instant static deployment on Vercel or any static host.
- **Pure Crypto Modules (`/src/crypto/*.js`):**
  - `caesar.js` — Caesar shift logic and step generator
  - `vigenere.js` — Vigenère polyalphabetic cipher
  - `affine.js` — Affine cipher, coprime validator, and modular inverse
  - `atbash.js` — Atbash involution
  - `railfence.js` — Rail Fence transposition and zig-zag matrix
  - `rsa.js` — BigInt RSA, Extended Euclidean Algorithm table, Square-and-Multiply, Miller-Rabin test, factoring benchmark data
  - `diffieHellman.js` — Key agreement computation and color analogy data
  - `cryptanalysis.js` — Chi-squared scoring, frequency analysis, IoC, Kasiski examination, mystery challenges

---

## 🚀 Running & Testing Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Unit Tests (Vitest)
```bash
npm test
```
Runs 18 unit tests covering all pure cryptography algorithms, edge cases, negative shifts, coprimality checks, BigInt exponentiation, and cryptanalysis.

### 4. Run Legacy Core Compatibility Tests
```bash
node test_core.js
```
Runs the original test vectors ensuring 100% backward compatibility. Expected last line: `ALL PASSED`.

### 5. Build for Production
```bash
npm run build
```
Generates a static, minified bundle in `dist/` ready to drag-and-drop into Vercel or Netlify.

---

## ☁️ Deployment on Vercel

CipherLab is a purely static front-end application with zero backend or database requirements:

1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this repository.
3. Vercel automatically detects Vite:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. Your lab will be live worldwide in seconds with instant CDN caching.

---

## 🎙️ 3-Minute Hackathon Demo Script (Judges Walkthrough)

| Timestamp | Screen / Action | Spoken Narrative for Judges |
| :--- | :--- | :--- |
| **0:00 – 0:30** | **Home & Lab (Caesar)** | *"Welcome to CipherLab. Existing cryptography tutorials show output boxes without explaining the mathematics. In our Lab, watch the letter 'H' with shift 3. As we play, the animated Modular Clock shows $(7 + 3) \equiv 10 \pmod{26}$. Look at 'W' + 3: $(22 + 3) = 25$, and 'X' + 3 wraps cyclically to 0. The math is rendered live in KaTeX with synchronized video scrubbing."* |
| **0:30 – 1:15** | **RSA Showpiece** | *"Now let's open the RSA Showpiece—our college-level flagship module. We choose primes $p=61$ and $q=53$, yielding modulus $n=3233$ and totient $\phi(n)=3120$. How is the private key calculated? We generate an interactive Extended Euclidean Algorithm table showing Bézout identity coefficients finding $d = 2753$. When encrypting, we open the Square-and-Multiply trace: students see the binary exponent bits, squaring, and conditional multiplication. Then we toggle to Real-World Mode with arbitrary-precision BigInts and explain the Integer Factorization complexity curve."* |
| **1:15 – 1:55** | **Break-It Mode** | *"Next, we shift to the attacker's view in Break-It mode. An intercepted Caesar message is instantly decrypted across all 25 shifts simultaneously, automatically scored by chi-squared ($\chi^2$) analysis and dictionary matches. For Vigenère, we display the Index of Coincidence and run Kasiski examination to expose keyword length."* |
| **1:55 – 2:30** | **Alice, Bob & Eve Story** | *"To bring it all together for students, Story Mode animates the transmission: Bob generates his keypair, Alice encrypts with Bob's public key, the packet travels across the wire where Eve intercepts only ciphertext, and Bob decrypts with his private key."* |
| **2:30 – 3:00** | **Compare, Quiz & Wrap-up** | *"Finally, our side-by-side Compare view contrasts transposition with substitution, and our interactive Quiz provides instant feedback. CipherLab runs 100% in the browser with zero backend, completely open-source and ready to empower students worldwide."* |

---

## ⚠️ Educational Disclaimer

> **Educational only.** Do not use these implementations to protect real-world sensitive data or production communications. Modern secure systems require authenticated encryption (e.g. AES-GCM, ChaCha20-Poly1305, RSA-OAEP with 2048+ bit moduli, or Ed25519).
