// Hangul Lab: letters, syllables, sound rules, ear training and typing.
import { h, setMain, playBtn, shuffle, sample, progressBar, toast, today } from '../ui.js';
import * as D from '../data.js';
import { S, save, dayLog } from '../store.js';
import { speak } from '../tts.js';
import { Composer, KEY_ROWS, SHIFT, syllableParts, compose } from '../hangul.js';
import { go } from '../main.js';

const RR_CHO = { 'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt', 'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's', 'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h' };
const RR_JUNG = { 'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i' };
const RR_JONG = { '': '', 'ㄱ': 'k', 'ㄲ': 'k', 'ㄴ': 'n', 'ㄷ': 't', 'ㄹ': 'l', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅅ': 't', 'ㅆ': 't', 'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 't' };
export function roman(s) { return [...s].map(ch => { const p = syllableParts(ch); return p ? RR_CHO[p[0]] + RR_JUNG[p[1]] + (RR_JONG[p[2]] ?? '') : ch; }).join(''); }

function markStep(id) { S().hangul[id] = today(); dayLog(); save(); }

export async function hangulSessionStep(area, done) {
  const data = await D.hangulData();
  const st = S();
  const step = data.steps.find(s => !st.hangul[s.id]);
  if (!step) { st.hangul.done = st.hangul.done || today(); save(); return done(); }
  await runStep(area, step, data, () => { const left = data.steps.filter(s => !st.hangul[s.id]).length; if (!left) { st.hangul.done = today(); save(); } done(); });
}

export default async function (id) {
  const data = await D.hangulData();
  const st = S();
  if (id) { const step = data.steps.find(s => s.id === id); const m = setMain(); await runStep(m, step, data, () => go('#/hangul')); return; }
  const doneN = data.steps.filter(s => st.hangul[s.id]).length;
  const nextStep = data.steps.find(s => !st.hangul[s.id]);
  setMain(h('h1', {}, 'Hangul Lab'),
    h('p', {}, 'Hangul (한글) was designed in 1443 to be easy to learn. Its letters are built from simple shapes, and they stack into syllable blocks. Most people can read it after a few short sessions.'),
    h('div', { class: 'card' }, h('div', { class: 'row' }, h('b', { class: 'grow' }, `${doneN} of ${data.steps.length} steps done`)), progressBar(doneN / data.steps.length),
      nextStep ? h('a', { class: 'btn btn-primary btn-big btn-block', style: { marginTop: '14px' }, href: `#/hangul/${nextStep.id}` }, `Continue: ${nextStep.title}`) :
        h('div', { class: 'stack', style: { marginTop: '12px' } }, h('p', {}, 'You finished the Hangul Lab! Time for Unit 1.'), h('a', { class: 'btn btn-primary', href: '#/lesson/1.1' }, 'Start Unit 1'))),
    h('div', { class: 'section-title' }, 'All steps'),
    h('div', { class: 'stack' }, data.steps.map((s, i) => h('a', { class: 'option-card', href: `#/hangul/${s.id}`, style: { textDecoration: 'none', color: 'inherit' } },
      h('span', { class: 'unit-num', style: st.hangul[s.id] ? { background: 'var(--good)', color: '#fff' } : null }, i + 1),
      h('div', {}, h('b', {}, s.title), h('span', {}, s.sub || ''))))));
  if (!nextStep && !st.hangul.done) { st.hangul.done = today(); save(); }
}

async function runStep(root, step, data, onDone) {
  root.append(h('div', { class: 'small muted' }, 'Hangul Lab'), h('h1', {}, step.title), step.intro ? h('p', {}, step.intro) : null);
  const stage = h('div'); root.append(stage);
  const learnParts = [];
  if (step.letters) learnParts.push(() => letterCards(stage, step));
  if (step.rules) learnParts.push(() => rulesCards(stage, step));
  if (step.syllables) learnParts.push(() => syllableTable(stage, step));
  let p = 0;
  const nextLearn = () => {
    stage.innerHTML = '';
    if (p < learnParts.length) { learnParts[p++](); stage.append(h('div', { class: 'spacer' }), h('button', { class: 'btn btn-primary btn-big btn-block', onclick: nextLearn }, 'Practice')); return; }
    practice(stage, step, data, () => { markStep(step.id); finish(); });
  };
  const finish = () => {
    stage.innerHTML = '';
    const idx = data.steps.findIndex(s => s.id === step.id);
    const nxt = data.steps[idx + 1];
    stage.append(h('div', { class: 'card center' }, h('h2', {}, 'Step complete!'), h('p', { class: 'muted' }, step.outro || 'Nice work.'),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: onDone }, 'Done'), nxt ? h('a', { class: 'btn btn-primary', href: `#/hangul/${nxt.id}` }, `Next: ${nxt.title}`) : null)));
  };
  nextLearn();
}

function letterCards(stage, step) {
  if (step.letters.length) stage.append(h('p', { class: 'muted' }, 'Tap each letter to hear it.'), h('div', { class: 'letter-grid' }, step.letters.map(L => h('button', { class: 'letter', onclick: () => speak(L.say || L.j) },
    h('span', { class: 'j', lang: 'ko' }, L.j), h('b', {}, L.r), h('small', { style: { display: 'block' } }, L.hint || '')))));
  if (step.words?.length) stage.append(h('div', { class: 'section-title' }, 'Read these words'), h('div', { class: 'card' }, step.words.map(([w, r, en]) => h('div', { class: 'row', style: { padding: '6px 0' } },
    playBtn(w, { small: true }), h('b', { lang: 'ko', style: { fontSize: '1.4rem', minWidth: '4em' } }, w), h('span', { class: 'muted grow' }, `${r} · ${en}`)))));
  if (step.note) stage.append(h('div', { class: 'note', style: { marginTop: '14px' } }, h('p', {}, step.note)));
}
function rulesCards(stage, step) {
  for (const r of step.rules) stage.append(h('div', { class: 'card' }, h('h3', {}, r.name), h('p', {}, r.expl),
    h('ul', { class: 'ex-list' }, r.ex.map(([written, said, en]) => h('li', {}, playBtn(written, { small: true }),
      h('div', { class: 'grow' }, h('span', { class: 'ko', lang: 'ko' }, `${written} → [${said}]`), h('span', { class: 'muted small' }, en)))))));
}
function syllableTable(stage, step) {
  const { cons, vows } = step.syllables;
  const table = h('table', { style: { borderCollapse: 'collapse', fontFamily: 'var(--font-ko)', fontSize: '1.3rem' } },
    h('tr', {}, h('th', {}), vows.map(v => h('th', { style: { padding: '6px' } }, v))),
    cons.map(c => h('tr', {}, h('th', { style: { padding: '6px' } }, c), vows.map(v => { const s = compose(c, v); return h('td', {}, h('button', { class: 'btn', style: { minHeight: '48px', padding: '4px 10px', fontSize: '1.2rem' }, onclick: () => speak(s) }, s)); }))));
  stage.append(h('p', { class: 'muted' }, 'Consonant + vowel = one syllable block. Tap any block.'), h('div', { style: { overflowX: 'auto' } }, table));
}

function practice(stage, step, data, done) {
  const qs = buildQuestions(step, data);
  let i = 0, right = 0;
  const ask = () => {
    stage.innerHTML = '';
    if (i >= qs.length) { if (step.typing) return typing(stage, step, done); return done(); }
    const q = qs[i];
    const fb = h('div');
    const choose = (ok, el) => {
      el.classList.add(ok ? 'right' : 'wrong');
      if (ok) { right++; fb.innerHTML = ''; fb.append(h('div', { class: 'feedback ok' }, q.after || 'Right!')); stage.querySelectorAll('.choice').forEach(b => b.disabled = true); setTimeout(() => { i++; ask(); }, 900); }
      else { fb.innerHTML = ''; fb.append(h('div', { class: 'feedback no' }, 'Not quite — listen again and try another.')); speak(q.audio); }
    };
    const head = q.kind === 'hear'
      ? h('div', { class: 'center' }, h('p', { class: 'muted' }, q.prompt || 'Which one do you hear?'), h('div', { class: 'row', style: { justifyContent: 'center' } }, playBtn(q.audio), playBtn(q.audio, { slow: true })))
      : h('div', { class: 'center' }, h('p', { class: 'muted' }, q.prompt || 'How do you read this?'), h('div', { class: 'jamo-big', lang: 'ko' }, q.show));
    stage.append(h('div', { class: 'stepper' }, progressBar(i / qs.length), h('span', { class: 'step-label' }, `${i + 1} / ${qs.length}`)),
      h('div', { class: 'card' }, head, h('div', { class: 'choices two' }, q.opts.map(o => h('button', { class: `choice${q.kind === 'hear' ? ' ko' : ''}`, lang: q.kind === 'hear' ? 'ko' : null, onclick: (e) => choose(o === q.answer, e.currentTarget) }, o))), fb));
    if (q.kind === 'hear') setTimeout(() => speak(q.audio), 200);
  };
  ask();
}

function buildQuestions(step, data) {
  const qs = [];
  const idx = data.steps.findIndex(s => s.id === step.id);
  const prevLetters = data.steps.slice(0, idx + 1).flatMap(s => s.letters || []);
  if (step.minimal) {
    for (const set of step.minimal) for (const target of sample(set.words, Math.min(2, set.words.length))) qs.push({ kind: 'hear', audio: target, answer: target, opts: shuffle(set.words), prompt: set.prompt });
    return shuffle(qs);
  }
  if (step.rules) {
    for (const r of step.rules) for (const [w, said] of sample(r.ex, Math.min(2, r.ex.length))) {
      const others = step.rules.flatMap(x => x.ex).map(x => x[1]).filter(x => x !== said);
      qs.push({ kind: 'read', show: w, answer: `[${said}]`, opts: shuffle([`[${said}]`, ...sample([...new Set(others)], 2).map(x => `[${x}]`), `[${w}]`].filter((v, k, a) => a.indexOf(v) === k)).slice(0, 4), prompt: 'How is it pronounced?' });
    }
    return shuffle(qs);
  }
  const letters = step.letters || [];
  for (const L of letters) {
    const others = sample(prevLetters.filter(x => x.j !== L.j), 3);
    qs.push({ kind: 'read', show: L.j, answer: L.r, opts: shuffle([L.r, ...others.map(o => o.r)]), prompt: 'What sound does this letter make?' });
  }
  for (const [w, r] of sample(step.words || [], Math.min(6, (step.words || []).length))) {
    const pool = data.steps.slice(0, idx + 1).flatMap(s => s.words || []).filter(x => x[0] !== w);
    qs.push({ kind: 'hear', audio: w, answer: w, opts: shuffle([w, ...sample(pool, 3).map(x => x[0])]) });
    qs.push({ kind: 'read', show: w, answer: r, opts: shuffle([r, ...sample(pool, 3).map(x => x[1])]) });
  }
  return shuffle(qs).slice(0, 14);
}

function typing(stage, step, done) {
  const words = step.typing;
  let i = 0;
  const comp = new Composer();
  let shift = false;
  const out = h('div', { class: 'ime-out', lang: 'ko', 'aria-live': 'polite' });
  const target = h('div');
  const fb = h('div');
  const refresh = () => { out.textContent = comp.text || ' '; };
  const showWord = () => {
    if (i >= words.length) return done();
    const [w, en] = words[i];
    comp.clear(); refresh(); fb.innerHTML = '';
    target.innerHTML = '';
    target.append(h('p', { class: 'muted' }, `Type this word (${i + 1} of ${words.length}):`), h('div', { class: 'row' }, playBtn(w, { small: true }), h('b', { lang: 'ko', style: { fontSize: '1.6rem' } }, w), h('span', { class: 'muted' }, en)));
  };
  const keyBtn = (j) => h('button', { lang: 'ko', onclick: () => { comp.type(shift && SHIFT[j] ? SHIFT[j] : j); if (shift) { shift = false; drawKeys(); } refresh(); } }, shift && SHIFT[j] ? SHIFT[j] : j);
  const kbd = h('div', { class: 'kbd' });
  const drawKeys = () => {
    kbd.innerHTML = '';
    KEY_ROWS.forEach((row, r) => kbd.append(h('div', { class: 'kbd-row' },
      r === 2 ? h('button', { class: 'wide', 'aria-pressed': String(shift), onclick: () => { shift = !shift; drawKeys(); } }, 'Shift') : null,
      row.map(keyBtn),
      r === 2 ? h('button', { class: 'wide', onclick: () => { comp.back(); refresh(); } }, '⌫') : null)));
    kbd.append(h('div', { class: 'kbd-row' }, h('button', { class: 'wide', style: { maxWidth: '240px' }, onclick: () => { comp.space(); refresh(); } }, 'Space')));
  };
  drawKeys();
  const check = h('button', { class: 'btn btn-primary btn-big', onclick: () => {
    const [w] = words[i];
    fb.innerHTML = '';
    if (comp.text.replace(/\s/g, '') === w.replace(/\s/g, '')) { fb.append(h('div', { class: 'feedback ok' }, 'Perfect!')); speak(w); i++; setTimeout(showWord, 900); }
    else fb.append(h('div', { class: 'feedback no' }, 'Not quite. Tip: type the letters left to right, top to bottom, like you\'d write them.'));
  } }, 'Check');
  stage.innerHTML = '';
  stage.append(h('p', {}, 'Practice typing with this on-screen keyboard. (To type Korean anywhere on your device, add a Korean keyboard: on phones it\'s in Settings → Keyboard; on Windows, Settings → Time & language → Language → Add Korean.)'),
    target, h('div', { class: 'spacer' }), out, kbd, fb, h('div', { class: 'btn-row', style: { marginTop: '10px' } }, h('button', { class: 'btn', onclick: () => { i++; showWord(); } }, 'Skip'), check));
  showWord();
}
