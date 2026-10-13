// Placement test: meaning questions unit by unit until accuracy drops.
import { h, setMain, sample, shuffle, progressBar, playBtn } from '../ui.js';
import * as D from '../data.js';
import { S, save } from '../store.js';
import { skipTo } from '../progress.js';
import { go } from '../main.js';
import { speak } from '../tts.js';

export default async function () {
  const bank = await D.wordbank();
  const idx = await D.index();
  const units = idx.units.map(u => u.n);
  const all = Object.values(bank).flat();
  const m = setMain();
  m.append(h('h1', {}, 'Placement test'), h('p', { class: 'muted' }, 'Pick the meaning of each word. If you don\'t know, tap "I don\'t know" — guessing makes the result less useful. The test stops when the words get too hard.'));
  const stage = h('div'); m.append(stage);
  let ui = 0, results = {}, misses = 0, q = 0;
  const PER = 4;
  async function unitRound() {
    if (ui >= units.length) return finish(units.length + 1);
    const n = units[ui];
    const words = sample(bank[n] || [], PER);
    if (!words.length) { ui++; return unitRound(); }
    let right = 0, k = 0;
    const ask = () => {
      stage.innerHTML = '';
      if (k >= words.length) {
        results[n] = right / words.length;
        if (results[n] < 0.75) misses++; else misses = 0;
        if (misses >= 2) return finish(units[Math.max(0, ui - 1)]);
        ui++; return unitRound();
      }
      const [key, w, g] = words[k];
      const opts = shuffle([g, ...sample(all.filter(x => x[2] !== g).map(x => x[2]), 3)]);
      stage.append(h('div', { class: 'stepper' }, progressBar(ui / units.length), h('span', { class: 'step-label' }, `Unit ${n}`)),
        h('div', { class: 'card center' }, h('div', { class: 'row', style: { justifyContent: 'center' } }, playBtn(w), h('span', { class: 'jamo-big', lang: 'ko', style: { fontSize: '2.4rem' } }, w)),
          h('div', { class: 'choices' }, opts.map(o => h('button', { class: 'choice', onclick: () => { if (o === g) right++; k++; q++; ask(); } }, o)),
            h('button', { class: 'choice', style: { textAlign: 'center' }, onclick: () => { k++; q++; ask(); } }, 'I don\'t know'))));
    };
    ask();
  }
  async function finish(unitN) {
    const start = Math.max(1, unitN);
    stage.innerHTML = '';
    const u = idx.units.find(x => x.n === start);
    stage.append(h('div', { class: 'card center' }, h('h2', {}, start <= 1 ? 'Start at the beginning' : `Start at Unit ${start}`),
      h('p', {}, start <= 1 ? 'Unit 1 is the right place for you. You can still skip lessons you know.' : `You know most words before Unit ${start}${u ? ` (${u.en})` : ''}. Earlier words will come up now and then in reviews so you can confirm them.`),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => { S().start = { mode: 'unit1' }; S().hangul.done = S().hangul.done || 1; save(true); go('#/today'); } }, 'Start at Unit 1 instead'),
        start > 1 ? h('button', { class: 'btn btn-primary', onclick: async () => { S().start = { mode: 'unit', unit: start }; await skipTo(start); go('#/today'); } }, `Start at Unit ${start}`) : h('a', { class: 'btn btn-primary', href: '#/today' }, 'Let\'s go'))));
  }
  unitRound();
}
