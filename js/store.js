// Profiles and progress, saved in this browser (localStorage).
import { today } from './ui.js';

const PKEY = 'sh.profiles';
const COLORS = ['#24407a', '#2f7f6f', '#b8403a', '#a76300', '#6b3fa0', '#1f7a99'];
let profiles = null;
let state = null;
let saveT = null;

function readJSON(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

export function defaultState(name = '') {
  return {
    v: 1, name, created: today(), onboarded: false,
    settings: { minutes: 30, newPerDay: 10, size: 'normal', theme: 'auto', voice: '', rate: 0.9, showEn: true },
    cards: {}, lessons: {}, hangul: {}, days: {}, streak: { n: 0, best: 0, last: null },
    mylines: [], flags: [], clips: {}, start: null,
  };
}

export function loadProfiles() {
  profiles = readJSON(PKEY, null);
  if (!profiles) {
    const id = 'p' + Date.now().toString(36);
    profiles = { list: [{ id, name: '', color: COLORS[0] }], cur: id };
    writeJSON(PKEY, profiles);
    writeJSON('sh.p.' + id, defaultState(''));
  }
  state = readJSON('sh.p.' + profiles.cur, null) || defaultState('');
  migrate(state);
  return profiles;
}
function migrate(s) {
  const d = defaultState(s.name);
  for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k];
  for (const k of Object.keys(d.settings)) if (s.settings[k] === undefined) s.settings[k] = d.settings[k];
}
export function S() { return state; }
export function getProfiles() { return profiles; }
export function save(now = false) {
  clearTimeout(saveT);
  const go = () => {
    if (!writeJSON('sh.p.' + profiles.cur, state)) console.warn('Could not save progress (storage full or blocked).');
    const p = profiles.list.find(p => p.id === profiles.cur); if (p) p.name = state.name;
    writeJSON(PKEY, profiles);
  };
  if (now) go(); else saveT = setTimeout(go, 250);
}
export function switchProfile(id) { save(true); profiles.cur = id; writeJSON(PKEY, profiles); state = readJSON('sh.p.' + id, null) || defaultState(''); migrate(state); }
export function addProfile(name) {
  save(true);
  const id = 'p' + Date.now().toString(36);
  profiles.list.push({ id, name, color: COLORS[profiles.list.length % COLORS.length] });
  profiles.cur = id; state = defaultState(name);
  writeJSON('sh.p.' + id, state); writeJSON(PKEY, profiles);
  return id;
}
export function deleteProfile(id) {
  profiles.list = profiles.list.filter(p => p.id !== id);
  try { localStorage.removeItem('sh.p.' + id); } catch (e) {}
  if (!profiles.list.length) { loadProfilesFresh(); return; }
  if (profiles.cur === id) switchProfile(profiles.list[0].id);
  writeJSON(PKEY, profiles);
}
function loadProfilesFresh() { try { localStorage.removeItem(PKEY); } catch (e) {} loadProfiles(); }

// ---- day log & streak
export function dayLog(d = today()) { return state.days[d] || (state.days[d] = { r: 0, n: 0, g: 0 }); }
export function markGoalIfMet(dueLeft, allLessonsDone) {
  const d = today(), log = dayLog(d);
  const newOk = log.n >= state.settings.newPerDay || allLessonsDone;
  if (!log.g && dueLeft === 0 && newOk) {
    log.g = 1;
    const st = state.streak;
    if (st.last === d - 1) st.n += 1; else if (st.last !== d) st.n = 1;
    st.last = d; st.best = Math.max(st.best || 0, st.n);
    save();
    return true;
  }
  return false;
}
export function currentStreak() {
  const st = state.streak, d = today();
  if (st.last === d || st.last === d - 1) return st.n;
  return 0;
}

// ---- backup
export function exportBackup() {
  save(true);
  return JSON.stringify({ app: 'starlight-house', v: 1, at: new Date().toISOString(), state });
}
export function importBackup(text) {
  const obj = JSON.parse(text.trim());
  if (obj.app !== 'starlight-house' || !obj.state) throw new Error('This is not a Starlight House backup.');
  state = obj.state; migrate(state);
  const p = profiles.list.find(p => p.id === profiles.cur); if (p) p.name = state.name;
  save(true);
}
export function toCode(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}
export function fromCode(code) {
  const bin = atob(code.replace(/\s+/g, ''));
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
