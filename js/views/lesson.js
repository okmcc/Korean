import { h, setMain, progressBar, today } from '../ui.js';
import * as D from '../data.js';
import { lessonState, completeLesson } from '../progress.js';
import { renderScene } from '../learn/scene.js';
import { renderWords } from '../learn/words.js';
import { renderGrammar } from '../learn/grammarstep.js';
import { renderTalk } from '../learn/talk.js';
import { S, save } from '../store.js';
import { stopSpeaking } from '../tts.js';
import { go } from '../main.js';

const STEPS = [['story', 'Story'], ['words', 'New words'], ['grammar', 'Grammar'], ['talk', 'Talk'], ['wrap', 'Wrap-up']];

export async function playLesson(root, id, { newLimit = Infinity, onExit, fromSession = false } = {}) {
  const { unit, lesson } = await D.lesson(id);
  if (!lesson) { root.append(h('p', {}, 'Lesson not found.')); return; }
  const ls = lessonState(id);
  let step = ls.done ? 0 : ls.talk ? 4 : ls.grammar ? 3 : (ls.story && ls.learned.length >= lesson.words.length) ? 2 : ls.story ? 1 : 0;
  const head = h('div');
  const body = h('div');
  root.append(head, body);

  function header() {
    head.innerHTML = '';
    head.append(
      h('div', { class: 'small muted' }, `Unit ${unit.n} · ${unit.en} — Lesson ${lesson.id}`),
      h('h1', { lang: 'ko', class: 'ko', style: { fontFamily: 'var(--font-display)', marginTop: '4px' } }, lesson.ko),
      h('p', { class: 'muted' }, `${lesson.en}${/[.!?]$/.test(lesson.en) ? '' : '.'} ${lesson.goal || ''}`),
      h('div', { class: 'stepper' }, progressBar(step / (STEPS.length - 1)), h('span', { class: 'step-label' }, `${step + 1}/${STEPS.length} · ${STEPS[step][1]}`)),
      h('div', { class: 'row', style: { gap: '6px', marginBottom: '14px' } }, STEPS.map(([k, label], i) =>
        h('button', { class: 'pill', style: { border: 0, cursor: 'pointer', background: i === step ? 'var(--accent)' : null, color: i === step ? 'var(--on-accent)' : null },
          onclick: () => { stopSpeaking(); step = i; run(); } }, label))));
  }
  async function run() {
    header(); body.innerHTML = ''; window.scrollTo(0, 0);
    const k = STEPS[step][0];
    const advance = () => { step = Math.min(step + 1, STEPS.length - 1); run(); };
    if (k === 'story') renderScene(body, lesson, { onDone: () => { ls.story = 1; save(); advance(); } });
    else if (k === 'words') await renderWords(body, unit, lesson, { newLimit, onDone: (r) => { if (r?.paused) { save(true); return onExit ? onExit({ paused: true }) : go('#/today'); } advance(); } });
    else if (k === 'grammar') await renderGrammar(body, unit, lesson, { onDone: () => { ls.grammar = 1; save(); advance(); } });
    else if (k === 'talk') renderTalk(body, lesson, { onDone: () => { ls.talk = 1; save(); advance(); } });
    else wrap();
  }
  async function wrap() {
    completeLesson(id);
    const notes = [...(lesson.notes || [])];
    const all = await D.allLessons();
    const idx = all.findIndex(L => L.id === id);
    const nxt = all[idx + 1];
    body.append(
      h('div', { class: 'card center' }, h('h2', {}, 'Lesson complete!'),
        h('p', { class: 'muted' }, `${lesson.words.length} words from this lesson are now in your reviews. They'll come back just before you'd forget them.`)),
      notes.map(n => h('div', { class: 'note', style: { marginTop: '14px' } }, h('h3', {}, n.title), h('p', {}, n.text))),
      h('div', { class: 'spacer' }),
      h('div', { class: 'btn-row' },
        fromSession ? h('button', { class: 'btn btn-primary btn-big', onclick: () => onExit && onExit({ done: true }) }, 'Continue') :
          [h('a', { class: 'btn', href: '#/today' }, 'Back to Today'), nxt ? h('a', { class: 'btn btn-primary', href: `#/lesson/${nxt.id}` }, `Next: ${nxt.id} ${nxt.ko}`) : null]));
  }
  run();
}

export default async function (id) {
  const m = setMain();
  await playLesson(m, id);
}
