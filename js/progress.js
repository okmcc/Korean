// Progress helpers shared by views.
import { S, save, dayLog } from './store.js';
import { today } from './ui.js';
import { grade, seedKnown } from './srs.js';
import * as D from './data.js';

export function lessonState(id) { return S().lessons[id] || (S().lessons[id] = { learned: [] }); }
export function isLessonDone(id) { return !!S().lessons[id]?.done; }

export async function nextLesson() {
  const all = await D.allLessons();
  return all.find(L => !isLessonDone(L.id)) || null;
}
export async function allDone() { return !(await nextLesson()); }

export function dueCards(now = today()) {
  return Object.entries(S().cards).filter(([, c]) => c.due != null && c.due <= now).map(([id, c]) => ({ id, ...c }))
    .sort((a, b) => a.due - b.due || (a.reps || 0) - (b.reps || 0));
}
export function dueCount() { const t = today(); return Object.values(S().cards).filter(c => c.due != null && c.due <= t).length; }

export function learnWord(w, lessonId, unitN, g = 3) {
  const cards = S().cards;
  if (cards[w.key]?.reps) return cards[w.key];
  const c = cards[w.key] = { k: w.key, u: unitN, l: lessonId };
  grade(c, g, today());
  dayLog().n += 1;
  const ls = lessonState(lessonId);
  if (!ls.learned.includes(w.key)) ls.learned.push(w.key);
  save();
  return c;
}
export function markKnownWord(w, lessonId, unitN) {
  const cards = S().cards;
  if (cards[w.key]?.reps) return;
  cards[w.key] = seedKnown({ k: w.key, u: unitN, l: lessonId }, today());
  const ls = lessonState(lessonId);
  if (!ls.learned.includes(w.key)) ls.learned.push(w.key);
  save();
}
export function addGrammarCard(gid, lessonId, unitN) {
  const id = 'G:' + gid, cards = S().cards;
  if (cards[id]) return;
  cards[id] = { k: id, u: unitN, l: lessonId };
  grade(cards[id], 3, today());
  save();
}
export function completeLesson(id) {
  const ls = lessonState(id);
  if (!ls.done) ls.done = today();
  save();
}
export function wordsLearnedCount(phase) {
  let n = 0;
  for (const [k, c] of Object.entries(S().cards)) if (!k.includes(':') && c.reps && (!phase || (phase === 1 ? c.u <= 14 : c.u > 14))) n++;
  return n;
}
// skip ahead: mark everything before unit n as known (placement / pick a unit)
export async function skipTo(unitN, { seed = true } = {}) {
  const idx = await D.index();
  const t = today();
  for (const u of idx.units) {
    if (u.n >= unitN) break;
    const data = await D.unit(u.n);
    for (const L of data.lessons) {
      const ls = lessonState(L.id);
      ls.done = ls.done || t; ls.skipped = 1; ls.story = 1; ls.grammar = 1; ls.talk = 1;
      for (const w of L.words) {
        if (S().cards[w.key]?.reps) continue;
        if (seed) S().cards[w.key] = seedKnown({ k: w.key, u: u.n, l: L.id }, t, 45);
        ls.learned.push(w.key);
      }
    }
  }
  S().hangul.done = S().hangul.done || t;
  save(true);
}
