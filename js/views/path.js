import { h, setMain } from '../ui.js';
import * as D from '../data.js';
import { S } from '../store.js';
import { isLessonDone, nextLesson } from '../progress.js';

export default async function () {
  const idx = await D.index();
  const st = S();
  const nxt = await nextLesson();
  const m = setMain(h('h1', {}, 'Lessons'),
    h('p', { class: 'muted' }, 'Every lesson is open. Go in order, or jump to where you are. Already know some Korean? Take the placement test and it will skip ahead for you.'),
    h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#/placement' }, 'Placement test'), h('a', { class: 'btn', href: '#/grammar' }, 'Grammar list'), h('a', { class: 'btn', href: '#/words' }, 'Word list')),
    h('a', { class: 'option-card', href: '#/hangul', style: { textDecoration: 'none', color: 'inherit', marginTop: '18px' } },
      h('span', { class: 'unit-num', style: st.hangul.done ? { background: 'var(--good)', color: '#fff' } : null }, '한'),
      h('div', { class: 'grow' }, h('b', {}, 'Hangul Lab'), h('span', {}, st.hangul.done ? 'Finished. Open it any time to practice.' : 'Learn to read and type Korean first.'))));
  for (const phase of [1, 2]) {
    const units = idx.units.filter(u => u.phase === phase);
    if (!units.length) continue;
    m.append(h('div', { class: 'phase-head' }, h('h2', {}, phase === 1 ? 'Phase 1 · Core 1,000' : 'Phase 2 · Conversation 3,000'),
      h('span', { class: 'muted small' }, phase === 1 ? 'Polite everyday Korean' : 'Casual speech, stories and opinions')));
    for (const u of units) {
      const done = u.lessons.every(L => isLessonDone(L.id));
      const current = nxt && nxt.unit === u.n;
      const ndone = u.lessons.filter(L => isLessonDone(L.id)).length;
      const list = h('ol', { class: 'lessons', hidden: !current }, u.lessons.map(L => h('li', {}, h('a', { href: `#/lesson/${L.id}` },
        h('span', { class: `lesson-dot${isLessonDone(L.id) ? ' done' : ''}` }, isLessonDone(L.id) ? '✓' : ''),
        h('span', { class: 'grow' }, h('b', { lang: 'ko' }, L.ko), h('span', { class: 'muted small', style: { display: 'block' } }, `${L.id} · ${L.en} · ${L.nwords} words`))))));
      const btn = h('button', { 'aria-expanded': String(!!current), onclick: () => { list.hidden = !list.hidden; btn.setAttribute('aria-expanded', String(!list.hidden)); } },
        h('span', { class: 'unit-num' }, u.n),
        h('span', { class: 'grow' }, h('span', { class: 'unit-title', lang: 'ko' }, u.ko), h('span', { class: 'unit-sub', style: { display: 'block' } }, `${u.en} · ${ndone}/${u.lessons.length} lessons`)));
      m.append(h('section', { class: `unit${done ? ' done' : ''}${current ? ' current' : ''}` }, btn, list));
    }
  }
  m.append(h('p', { class: 'small muted', style: { marginTop: '24px' } }, 'Word lists are based on the National Institute of Korean Language\'s "Korean Learning Vocabulary List" (국립국어원, 2003), used under the Korea Open Government License (KOGL Type 1).'));
}
