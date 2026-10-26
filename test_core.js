import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(__dirname + '/index.html', 'utf8');
const core = src.slice(src.indexOf('/* CORE:START */'), src.indexOf('/* CORE:END */'));
const m = new Function(core + '; return { buildSteps, caesarEncrypt, caesarDecrypt, vigenereEncrypt, vigenereDecrypt, mod26 };')();
let fails = 0;
const check = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra ?? ''); } else console.log('ok  ', name); };
const isAlpha = ch => ch.length === 1 && ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'));
check('caesar known', m.caesarEncrypt('ABC xyz', 3) === 'DEF abc', m.caesarEncrypt('ABC xyz', 3));
check('caesar wrap', m.caesarEncrypt('XYZ', 3) === 'ABC');
check('caesar negative shift', m.caesarEncrypt('ABC', -1) === 'ZAB');
check('caesar big shift', m.caesarEncrypt('A', 29) === 'D');
check('vigenere wiki LEMON', m.vigenereEncrypt('ATTACKATDAWN', 'LEMON') === 'LXFOPVEFRNHR', m.vigenereEncrypt('ATTACKATDAWN', 'LEMON'));
check('vigenere spaces skip key', m.vigenereEncrypt('ATTACK AT DAWN', 'LEMON') === 'LXFOPV EF RNHR', m.vigenereEncrypt('ATTACK AT DAWN', 'LEMON'));
const samples = ['Hello, World! 123', 'The quick brown fox... jumps?!', '  spaces   and\ttabs\n', 'MiXeD CaSe, ok.', '', 'Zebra-Zoo_Unicode 😀'];
for (const t of samples) {
  for (const s of [0, 1, 3, 13, 25, -7, 100]) {
    const e = m.caesarEncrypt(t, s);
    check(`caesar roundtrip ${JSON.stringify(t)} s=${s}`, m.caesarDecrypt(e, s) === t);
    const a = [...t], b = [...e];
    check(`caesar passthrough ${JSON.stringify(t)} s=${s}`, a.length === b.length && a.every((ch, i) => isAlpha(ch) || b[i] === ch));
  }
  for (const k of ['LEMON', 'a', 'Key word!', 'zzz']) {
    const e = m.vigenereEncrypt(t, k);
    check(`vig roundtrip ${JSON.stringify(t)} k=${k}`, m.vigenereDecrypt(e, k) === t, e);
  }
}
check('vig empty keyword errors', m.buildSteps('hi', 'vigenere', '123', false).error !== null);
check('caesar bad shift errors', m.buildSteps('hi', 'caesar', 'abc', false).error !== null);
console.log(JSON.stringify(m.buildSteps('Hi!', 'caesar', 3, false).steps[0]));
console.log(JSON.stringify(m.buildSteps('Ab c', 'vigenere', 'B', false).steps.map(s => s.output + ':' + s.detail)));
console.log(fails ? `${fails} FAILURES` : 'ALL PASSED');
