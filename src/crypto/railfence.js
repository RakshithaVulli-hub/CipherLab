/**
 * Rail Fence Cipher Module
 * Transposition cipher that writes characters in a zig-zag pattern across k rails.
 */

export function parseRails(raw) {
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || n < 2) {
    return { error: 'Number of rails must be at least 2.' };
  }
  return { value: n };
}

/**
 * Builds step-by-step transposition for Rail Fence cipher.
 * Returns grid matrix for visual representation and steps.
 */
export function buildRailFenceSteps(text, rawRails = 3, decrypt = false) {
  const parsed = parseRails(rawRails);
  if (parsed.error) {
    return { steps: [], output: '', grid: [], error: parsed.error, rails: 3 };
  }

  const numRails = parsed.value;
  const n = text.length;

  if (n === 0) {
    return { steps: [], output: '', grid: [], error: null, rails: numRails };
  }

  // Pre-calculate the zig-zag path: rail for each column i
  const cycle = 2 * (numRails - 1);
  const railPattern = [];
  let curRail = 0;
  let goingDown = false;

  for (let i = 0; i < n; i++) {
    railPattern.push(curRail);
    if (curRail === 0 || curRail === numRails - 1) {
      goingDown = !goingDown;
    }
    curRail += goingDown ? 1 : -1;
  }

  // Build grid matrix: rails rows by n columns
  const grid = Array.from({ length: numRails }, () => Array(n).fill(null));

  if (!decrypt) {
    // Encryption: Place letters on zig-zag, then read row-by-row
    for (let col = 0; col < n; col++) {
      grid[railPattern[col]][col] = text[col];
    }

    const steps = [];
    let out = '';

    // First phase: placement along zig-zag
    for (let col = 0; col < n; col++) {
      const r = railPattern[col];
      steps.push({
        index: col,
        phase: 'place',
        input: text[col],
        rail: r,
        col,
        detail: `Place '${text[col]}' at Rail ${r + 1}, column ${col + 1}`
      });
    }

    // Read row-by-row
    for (let r = 0; r < numRails; r++) {
      for (let col = 0; col < n; col++) {
        if (grid[r][col] !== null) {
          out += grid[r][col];
        }
      }
    }

    return { steps, output: out, grid, error: null, rails: numRails, railPattern };
  } else {
    // Decryption: Fill the grid positions according to row counts, then read in zig-zag order
    // Count how many chars belong to each rail
    const railCounts = Array(numRails).fill(0);
    for (let col = 0; col < n; col++) {
      railCounts[railPattern[col]]++;
    }

    let textIdx = 0;
    for (let r = 0; r < numRails; r++) {
      for (let col = 0; col < n; col++) {
        if (railPattern[col] === r && textIdx < n) {
          grid[r][col] = text[textIdx++];
        }
      }
    }

    // Read along zig-zag
    let out = '';
    const steps = [];
    for (let col = 0; col < n; col++) {
      const r = railPattern[col];
      const ch = grid[r][col];
      out += ch;
      steps.push({
        index: col,
        phase: 'read',
        output: ch,
        rail: r,
        col,
        detail: `Read '${ch}' from Rail ${r + 1}, column ${col + 1}`
      });
    }

    return { steps, output: out, grid, error: null, rails: numRails, railPattern };
  }
}

export function railFenceEncrypt(text, rails = 3) {
  return buildRailFenceSteps(text, rails, false).output;
}

export function railFenceDecrypt(text, rails = 3) {
  return buildRailFenceSteps(text, rails, true).output;
}
