// New words step: meet each word in a sentence, then a quick check.
import { h, ICON, playBtn, koText, showBreakdown, shuffle, sample, progressBar } from '../ui.js';
import { speak } from '../tts.js';
import { learnWord, markKnownWord, lessonState } from '../progress.js';
import { S, dayLog } from '../store.js';
import * as D from '../data.js';

export async function renderWords(container, unit, lesson, { onDone, newLimit = Infinity }) {
  const ls = lessonState(lesson.id);
  const todo = lesson.words.filter(w => !ls.learned.includes(w.key) && !S().cards[w.key]?.reps);
  if (!todo.length) { onDone(); return; }
  const bank = await D.wordbank();
  const pool = Object.values(bank).flat();
  let batch = [], i = 0, learnedNow = 0;

  const stage = h('div');
  container.append(stage);

  function show() {
    stage.innerHTML = '';
    if (i >= todo.length || learnedNow >= newLimit) { if (batch.length) return quiz(batch, () => { batch = []; show(); }); return finish(); }
    const w = todo[i];
    const top = h('div', { class: 'stepper' }, progressBar(i / todo.length), h('span', { class: 'step-label' }, `Word ${i + 1} of ${todo.length}`));
    const card = h('div', { class: 'card word-hero' },
      h('div', { class: 'row', style: { justifyContent: 'center' } }, playBtn(w.w), h('span', { class: 'w', lang: 'ko' }, w.w)),
      h('div', { class: 'gloss' }, w.g),
      w.bonus ? h('span', { class: 'pill' }, 'extra word') : null,
      h('div', { class: 'example' },
        h('div', { class: 'row' }, playBtn(w.ko, { small: true }), playBtn(w.ko, { small: true, slow: true }), h('div', { class: 'grow' }, koText(w.ko, w.span))),
        h('div', { class: 'muted', style: { marginTop: '6px' } }, w.en),
        h('button', { class: 'btn btn-ghost', style: { marginTop: '6px', minHeight: '44px' }, onclick: () => showBreakdown(w.ko, w.en, w.b) }, 'Word by word')));
    const next = h('button', { class: 'btn btn-primary btn-big', onclick: () => { batch.push(w); i++; learnedNow++; if (batch.length >= 5) quiz(batch, () => { batch = []; show(); }); else show(); } }, 'Next');
    const known = h('button', { class: 'btn', onclick: () => { markKnownWord(w, lesson.id, unit.n); i++; show(); } }, 'I already know this');
    stage.append(top, card, h('div', { class: 'spacer' }), h('div', { class: 'btn-row' }, known, next));
    speak(w.w, { onend: () => setTimeout(() => speak(w.ko), 250) });
    next.focus();
  }

  function quiz(words, done) {
    // each word: meaning check (Korean -> English), then a listening check for half
    const qs = [];
    for (const w of words) qs.push({ w, type: 'meaning' });
    for (const w of sample(words, Math.ceil(words.length / 2))) qs.push({ w, type: 'listen' });
    const order = shuffle(qs);
    const firstTry = new Map();
    let k = 0;
    const ask = () => {
      stage.innerHTML = '';
      if (k >= order.length) {
        for (const w of words) learnWord(w, lesson.id, unit.n, firstTry.get(w.key) === false ? 1 : 3);
        return done();
      }
      const { w, type } = order[k];
      const others = sample(lesson.words.filter(x => x.key !== w.key).concat(pool.map(([key, ww, g]) => ({ key, w: ww, g })).filter(x => x.key !== w.key)).slice(0, 60), 3);
      const opts = shuffle([w, ...others]);
      const fb = h('div');
      const head = type === 'meaning'
        ? h('div', { class: 'center' }, h('p', { class: 'muted' }, 'What does this mean?'), h('div', { class: 'row', style: { justifyContent: 'center' } }, playBtn(w.w), h('span', { class: 'jamo-big', lang: 'ko', style: { fontSize: '2.4rem' } }, w.w)))
        : h('div', { class: 'center' }, h('p', { class: 'muted' }, 'Listen. Which word do you hear?'), h('div', { class: 'row', style: { justifyContent: 'center' } }, playBtn(w.w), playBtn(w.w, { slow: true })));
      const choices = h('div', { class: 'choices' }, opts.map(o => h('button', { class: `choice${type === 'listen' ? ' ko' : ''}`, lang: type === 'listen' ? 'ko' : null,
        onclick: (e) => {
          const right = o.key === w.key;
          if (!firstTry.has(w.key) || firstTry.get(w.key)) firstTry.set(w.key, right && firstTry.get(w.key) !== false);
          e.currentTarget.classList.add(right ? 'right' : 'wrong');
          if (right) {
            fb.innerHTML = ''; fb.append(h('div', { class: 'feedback ok' }, `Right! ${w.w} = ${w.g}`));
            choices.querySelectorAll('button').forEach(b => b.disabled = true);
            speak(w.w);
            setTimeout(() => { k++; ask(); }, 1100);
          } else {
            firstTry.set(w.key, false);
            e.currentTarget.disabled = true;
            fb.innerHTML = ''; fb.append(h('div', { class: 'feedback no' }, 'Not quite. Try again.'));
          }
        } }, type === 'listen' ? o.w : o.g)));
      stage.append(h('div', { class: 'stepper' }, progressBar(k / order.length), h('span', { class: 'step-label' }, 'Quick check')),
        h('div', { class: 'card' }, head, choices, fb));
      if (type === 'listen') speak(w.w);
    };
    ask();
  }

  function finish() {
    stage.innerHTML = '';
    const left = lesson.words.filter(w => !lessonState(lesson.id).learned.includes(w.key) && !S().cards[w.key]?.reps).length;
    if (left && learnedNow >= newLimit) {
      stage.append(h('div', { class: 'card center' }, h('h2', {}, 'Daily new-word goal reached'),
        h('p', { class: 'muted' }, `You learned ${dayLog().n} new words today. ${left} words in this lesson are still waiting.`),
        h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => onDone({ paused: true }) }, 'Stop for today'),
          h('button', { class: 'btn btn-primary', onclick: () => { newLimit = Infinity; i = 0; todo.splice(0, todo.length, ...lesson.words.filter(w => !lessonState(lesson.id).learned.includes(w.key) && !S().cards[w.key]?.reps)); show(); } }, 'Keep going'))));
      return;
    }
    onDone();
  }
  show();
}
