// Grammar step: pattern explanation, examples, one fill-in check.
import { h, playBtn, showBreakdown, shuffle, sample } from '../ui.js';
import { speak } from '../tts.js';
import * as D from '../data.js';
import { addGrammarCard } from '../progress.js';

export function grammarCard(g, { compact = false } = {}) {
  return h('div', { class: 'card grammar-card' },
    h('div', { class: 'pattern', lang: 'ko' }, g.pattern),
    h('div', { class: 'gloss', style: { fontWeight: 700, marginTop: '4px' } }, g.title),
    h('p', { style: { marginTop: '10px' } }, g.expl),
    h('ul', { class: 'ex-list' }, g.ex.map(([ko, en, b]) => h('li', {}, playBtn(ko, { small: true }),
      h('button', { class: 'grow', style: { background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', padding: 0 }, onclick: () => showBreakdown(ko, en, b) },
        h('span', { class: 'ko', lang: 'ko' }, ko), h('span', { class: 'muted small' }, en))))));
}

export async function clozeQuiz(g, all, onAnswer) {
  const c = g.cloze; if (!c || !c.blank) return null;
  const [a, b] = c.blank;
  const answer = c.ko.slice(a, b);
  const others = Object.values(all).filter(x => x.id !== g.id && x.cloze?.blank).map(x => x.cloze.ko.slice(...x.cloze.blank)).filter(x => x !== answer);
  const opts = shuffle([answer, ...sample([...new Set(others)], 3)]);
  const fb = h('div');
  const sentence = h('div', { class: 'ko', lang: 'ko', style: { fontSize: '1.4rem' } }, c.ko.slice(0, a), h('span', { class: 'blank' }, ' '), c.ko.slice(b));
  const box = h('div', { class: 'card' }, h('p', { class: 'muted' }, 'Fill in the blank'), sentence, h('p', { class: 'muted' }, c.en),
    h('div', { class: 'choices two' }, opts.map(o => h('button', { class: 'choice ko', lang: 'ko', onclick: (e) => {
      const ok = o === answer;
      e.currentTarget.classList.add(ok ? 'right' : 'wrong');
      fb.innerHTML = '';
      fb.append(h('div', { class: `feedback ${ok ? 'ok' : 'no'}` }, ok ? 'Right!' : 'Not quite, try again.'));
      if (ok) { box.querySelectorAll('.choice').forEach(b => b.disabled = true); speak(c.ko); onAnswer && onAnswer(true); }
      else { e.currentTarget.disabled = true; onAnswer && onAnswer(false); }
    } }, o))), fb);
  return box;
}

export async function renderGrammar(container, unit, lesson, { onDone }) {
  const all = await D.grammar();
  const ids = lesson.grammar.filter(id => all[id]);
  if (!ids.length) { onDone(); return; }
  let i = 0;
  const stage = h('div'); container.append(stage);
  const show = async () => {
    stage.innerHTML = '';
    if (i >= ids.length) return onDone();
    const g = { ...all[ids[i]], id: ids[i] };
    addGrammarCard(ids[i], lesson.id, unit.n);
    const next = h('button', { class: 'btn btn-primary btn-big btn-block', onclick: () => { i++; show(); } }, i + 1 < ids.length ? 'Next pattern' : 'Continue');
    stage.append(h('p', { class: 'muted' }, `Pattern ${i + 1} of ${ids.length}`), grammarCard(g));
    const q = await clozeQuiz(g, all);
    if (q) stage.append(h('div', { class: 'spacer' }), q);
    stage.append(h('div', { class: 'spacer' }), next);
  };
  show();
}
