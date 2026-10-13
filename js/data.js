// Course data loading with an in-memory cache.
const cache = new Map();
async function getJSON(path) {
  if (!cache.has(path)) cache.set(path, fetch(path).then(r => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); }));
  try { return await cache.get(path); } catch (e) { cache.delete(path); throw e; }
}
export const index = () => getJSON('data/index.json');
export const grammar = () => getJSON('data/grammar.json');
export const wordbank = () => getJSON('data/wordbank.json');
export const hangulData = () => getJSON('data/hangul.json');
export const clips = () => getJSON('data/clips.json');
export async function unit(n) { const idx = await index(); const u = idx.units.find(u => u.n === n); return getJSON(`data/${u.file}`); }
export async function lesson(id) {
  const n = Number(String(id).split('.')[0]);
  const u = await unit(n);
  return { unit: u, lesson: u.lessons.find(L => L.id === id) };
}
export async function allLessons() {
  const idx = await index();
  return idx.units.flatMap(u => u.lessons.map(L => ({ ...L, unit: u.n, unitKo: u.ko, unitEn: u.en, phase: u.phase })));
}
// word entry lookup for a card
export async function wordEntry(card) {
  const { lesson: L } = await lesson(card.l);
  return L?.words.find(w => w.key === card.k);
}
