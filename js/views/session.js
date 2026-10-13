// Today's guided session: reviews -> next lesson (or Hangul step) -> done.
import { h, setMain, ICON, today } from '../ui.js';
import { S, dayLog, markGoalIfMet, currentStreak } from '../store.js';
import { dueCards, nextLesson, dueCount } from '../progress.js';
import { runReviews } from '../learn/reviewer.js';
import { playLesson } from './lesson.js';
import { refreshChrome } from '../main.js';
import * as D from '../data.js';

export default async function () {
  const m = setMain();
  const st = S();
  const stepsEl = h('div');
  const area = h('div');
  m.append(h('h1', {}, 'Today\'s session'), stepsEl, area);
  const plan = [];
  if (dueCount()) plan.push('reviews');
  const needHangul = st.start?.mode === 'hangul' && !st.hangul.done;
  plan.push(needHangul ? 'hangul' : 'lesson');
  plan.push('done');
  let i = 0;
  const label = { reviews: 'Reviews', lesson: 'New lesson', hangul: 'Hangul Lab', done: 'Finish' };
  const drawSteps = () => { stepsEl.innerHTML = ''; stepsEl.append(h('div', { class: 'row', style: { marginBottom: '16px' } }, plan.map((p, j) => h('span', { class: `pill${j < i ? ' good' : ''}`, style: j === i ? { background: 'var(--accent)', color: 'var(--on-accent)' } : null }, `${j + 1}. ${label[p]}`)))); };
  async function run() {
    drawSteps(); area.innerHTML = ''; window.scrollTo(0, 0);
    const p = plan[i];
    if (p === 'reviews') {
      area.append(h('p', { class: 'muted' }, 'First, a quick review of words that are due today.'));
      await runReviews(area, { onDone: () => { i++; run(); } });
    } else if (p === 'lesson') {
      const left = Math.max(0, st.settings.newPerDay - dayLog().n);
      const L = await nextLesson();
      if (!L) { area.append(h('div', { class: 'card' }, h('h2', {}, 'You finished every lesson!'), h('p', {}, 'Keep your reviews going and spend time in Watch.'))); i++; return setTimeout(run, 1200); }
      if (left === 0) {
        area.append(h('div', { class: 'card center' }, h('h2', {}, 'New words: done for today'), h('p', { class: 'muted' }, `You've already learned ${dayLog().n} new words today.`),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { i++; run(); } }, 'Finish'), h('button', { class: 'btn btn-primary', onclick: () => go(Infinity) }, `Do lesson ${L.id} anyway`))));
        return;
      }
      go(left);
      async function go(limit) { area.innerHTML = ''; await playLesson(area, L.id, { newLimit: limit, fromSession: true, onExit: () => { i++; run(); } }); }
    } else if (p === 'hangul') {
      const mod = await import('./hangul.js');
      await mod.hangulSessionStep(area, () => { i++; run(); });
    } else {
      const met = markGoalIfMet(dueCount(), !(await nextLesson()));
      refreshChrome();
      const log = dayLog();
      const clips = await D.clips().catch(() => []);
      const L = await nextLesson();
      const lvl = L ? L.unit : 40;
      const clip = clips.filter(c => c.level <= lvl).sort((a, b) => b.level - a.level).find(c => !st.clips[c.id]) || null;
      area.append(h('div', { class: 'hero center' },
        h('div', { html: ICON.star, style: { width: '56px', margin: '0 auto', color: '#f5c842' } }),
        h('h1', {}, met || log.g ? 'Daily goal complete!' : 'Nice work!'),
        h('p', { class: 'muted' }, `Reviews today: ${log.r} · New words today: ${log.n}`),
        h('p', {}, `Streak: ${currentStreak()} day${currentStreak() === 1 ? '' : 's'}`)),
        clip ? h('div', { class: 'card', style: { marginTop: '14px' } }, h('h3', {}, 'Bonus: watch some real Korean'), h('p', { class: 'muted' }, `${clip.show}: ${clip.title}`),
          h('a', { class: 'btn btn-primary', href: `#/watch/${clip.id}` }, 'Watch this clip')) : null,
        h('div', { class: 'spacer' }), h('a', { class: 'btn btn-block', href: '#/today' }, 'Back to Today'));
    }
  }
  run();
}
