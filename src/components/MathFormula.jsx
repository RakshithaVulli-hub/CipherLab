import React, { useMemo } from 'react';
import katex from 'katex';

export default function MathFormula({ tex, displayMode = false, className = '' }) {
  const html = useMemo(() => {
    if (!tex || typeof tex !== 'string') return '';
    try {
      return katex.renderToString(tex, {
        throwOnError: false,
        displayMode,
        output: 'html'
      });
    } catch (e) {
      return `<span class="text-rose-400 font-mono text-sm">${tex}</span>`;
    }
  }, [tex, displayMode]);

  if (!html) return null;

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
