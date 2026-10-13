import { h, setMain, today } from '../ui.js';
import { S, markGoalIfMet } from '../store.js';
import { runReviews } from '../learn/reviewer.js';
import { dueCount, nextLesson } from '../progress.js';
import { refreshChrome } from '../main.js';

export default async function (mode) {
  const m = setMain(h('h1', {}, 'Review'));
  const st = S();
  const due = dueCount();
  if (!due && mode !== 'extra') {
    const total = Object.keys(st.cards).length;
    m.append(h('div', { class: 'card center' }, h('h2', {}, 'All caught up!'),
      h('p', { class: 'muted' }, total ? 'Nothing is due right now. Words come back on the day you\'re likely to forget them.' : 'Words you learn in lessons will show up here.'),
      total ? h('a', { class: 'btn', href: '#/review/extra' }, 'Practice 20 recent words anyway') : h('a', { class: 'btn btn-primary', href: '#/today' }, 'Go to Today')));
    return;
  }
  let cards = null;
  if (mode === 'extra') {
    cards = Object.entries(st.cards).filter(([id]) => !id.startsWith('G:')).map(([id, c]) => ({ id, ...c })).sort((a, b) => (b.last || 0) - (a.last || 0)).slice(0, 20);
  }
  await runReviews(m, { cards, onDone: async ({ count }) => {
    if (mode !== 'extra') markGoalIfMet(dueCount(), !(await nextLesson()));
    refreshChrome();
    m.innerHTML = '';
    m.append(h('h1', {}, 'Review'), h('div', { class: 'card center' }, h('h2', {}, 'Done!'), h('p', { class: 'muted' }, `You reviewed ${count} card${count === 1 ? '' : 's'}.`),
      h('a', { class: 'btn btn-primary', href: '#/today' }, 'Back to Today')));
  } });
}
