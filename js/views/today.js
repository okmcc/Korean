import { h, setMain, ICON, today, progressBar } from '../ui.js';
import { S, dayLog, currentStreak } from '../store.js';
import { dueCount, nextLesson, wordsLearnedCount, lessonState } from '../progress.js';
import * as D from '../data.js';
import { avatarSVG } from '../art.js';

export default async function () {
  const st = S();
  const due = dueCount();
  const log = dayLog();
  const L = await nextLesson();
  const target = st.settings.newPerDay;
  const reviewsDone = due === 0;
  const newDone = log.n >= target || !L;
  const name = st.name ? `, ${st.name}` : '';
  const needHangul = st.start?.mode === 'hangul' && !st.hangul.done;
  const learned = wordsLearnedCount();
  const m = setMain(
    h('section', { class: 'hero' },
      h('div', { class: 'row' }, h('div', { class: 'avatar', style: { background: '#e9edf6' }, html: avatarSVG('grandma', 'smile') }),
        h('div', { class: 'grow' }, h('h1', { style: { margin: 0 } }, h('span', { lang: 'ko' }, '안녕하세요'), name, '!'),
          h('div', { class: 'muted' }, 'Grandma has the kettle on. Ready for today?'))),
      h('ul', { class: 'goal-list' },
        h('li', {}, h('span', { class: `check${reviewsDone ? ' done' : ''}`, html: reviewsDone ? ICON.check : '' }), reviewsDone ? 'No reviews left today' : `${due} review${due === 1 ? '' : 's'} due`),
        h('li', {}, h('span', { class: `check${newDone ? ' done' : ''}`, html: newDone ? ICON.check : '' }), `New words: ${Math.min(log.n, target)} of ${target}`)),
      h('a', { class: 'btn btn-accent btn-big btn-block', href: '#/session' }, (reviewsDone && newDone) ? 'Practice more' : 'Start today\'s session')),
  );
  if (needHangul) {
    m.append(h('div', { class: 'section-title' }, 'Start here'),
      h('a', { class: 'option-card', href: '#/hangul', style: { textDecoration: 'none', color: 'inherit' } }, h('span', { class: 'jamo-big', style: { fontSize: '2.2rem' } }, '한'),
        h('div', {}, h('b', {}, 'Hangul Lab: learn to read Korean'), h('span', {}, 'The alphabet, the sounds, and typing. About a week of short sessions.'))));
  }
  if (L) {
    const ls = lessonState(L.id);
    m.append(h('div', { class: 'section-title' }, ls.story ? 'Continue' : 'Next lesson'),
      h('a', { class: 'option-card', href: `#/lesson/${L.id}`, style: { textDecoration: 'none', color: 'inherit' } },
        h('span', { class: 'unit-num' }, L.id),
        h('div', { class: 'grow' }, h('b', { lang: 'ko' }, L.ko), h('span', {}, `${L.en} · Unit ${L.unit}: ${L.unitEn}`))));
  }
  m.append(h('div', { class: 'section-title' }, 'Your progress'),
    h('div', { class: 'stat-row' },
      h('div', { class: 'stat' }, h('b', {}, currentStreak()), h('span', {}, 'day streak')),
      h('div', { class: 'stat' }, h('b', {}, learned), h('span', {}, 'words learned')),
      h('div', { class: 'stat' }, h('b', {}, Object.values(st.lessons).filter(x => x.done && !x.skipped).length), h('span', {}, 'lessons done'))),
    h('div', { class: 'card', style: { marginTop: '12px' } },
      h('div', { class: 'row' }, h('b', { class: 'grow' }, 'Core 1,000 (Phase 1)'), h('span', { class: 'muted' }, `${wordsLearnedCount(1)} / 925`)), progressBar(wordsLearnedCount(1) / 925),
      h('div', { class: 'row', style: { marginTop: '12px' } }, h('b', { class: 'grow' }, 'Conversation 3,000 (Phase 2)'), h('span', { class: 'muted' }, `${wordsLearnedCount(2)} / 2,079`)), progressBar(wordsLearnedCount(2) / 2079)),
    h('div', { class: 'section-title' }, 'Practice'),
    h('div', { class: 'btn-row' },
      h('a', { class: 'btn', href: '#/review' }, 'Review now'),
      h('a', { class: 'btn', href: '#/watch' }, 'Watch Korean clips'),
      h('a', { class: 'btn', href: '#/hangul' }, 'Hangul Lab'),
      h('a', { class: 'btn', href: '#/words' }, 'Word list')));
}
