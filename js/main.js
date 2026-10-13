import { loadProfiles, S, save, currentStreak, getProfiles, switchProfile } from './store.js';
import { h, ICON, setMain, today } from './ui.js';
import { setTTS } from './tts.js';

const routes = {
  today: () => import('./views/today.js'),
  session: () => import('./views/session.js'),
  path: () => import('./views/path.js'),
  lesson: () => import('./views/lesson.js'),
  review: () => import('./views/review.js'),
  hangul: () => import('./views/hangul.js'),
  watch: () => import('./views/watch.js'),
  me: () => import('./views/me.js'),
  welcome: () => import('./views/welcome.js'),
  placement: () => import('./views/placement.js'),
  grammar: () => import('./views/grammarref.js'),
  words: () => import('./views/words.js'),
  who: () => import('./views/who.js'),
};
const TAB_OF = { today: 'today', session: 'today', path: 'path', lesson: 'path', hangul: 'path', grammar: 'path', words: 'path', review: 'review', watch: 'watch', me: 'me', placement: 'path' };
const NO_TABS = new Set(['welcome', 'who', 'session', 'lesson', 'placement']);
let picked = false;

export function applySettings() {
  const st = S().settings;
  const root = document.documentElement;
  if (st.theme === 'light' || st.theme === 'dark') root.dataset.theme = st.theme; else delete root.dataset.theme;
  if (st.size && st.size !== 'normal') root.dataset.size = st.size; else delete root.dataset.size;
  setTTS({ voice: st.voice, rate: st.rate });
}

export function refreshChrome() {
  const right = document.getElementById('topRight');
  right.innerHTML = '';
  const n = currentStreak();
  right.append(h('span', { class: 'streak-pill', title: 'Day streak', html: `${ICON.flame}<span>${n}</span>` }));
  const due = Object.values(S().cards).filter(c => c.due != null && c.due <= today()).length;
  const b = document.getElementById('dueBadge');
  b.hidden = !due; b.textContent = due > 99 ? '99+' : due;
}

export function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

async function render() {
  const raw = location.hash.replace(/^#\/?/, '') || 'today';
  const [name, ...args] = raw.split('/');
  const st = S();
  if (!picked && getProfiles().list.length > 1 && name !== 'who') { location.hash = '#/who'; return; }
  if (!st.onboarded && !['welcome', 'placement', 'hangul', 'who'].includes(name)) { location.hash = '#/welcome'; return; }
  const loader = routes[name] || routes.today;
  document.body.classList.toggle('no-tabs', NO_TABS.has(name));
  document.getElementById('tabbar').hidden = NO_TABS.has(name);
  const tab = TAB_OF[name] || 'today';
  document.querySelectorAll('.tabbar a').forEach(a => { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const back = document.getElementById('backBtn');
  back.hidden = !NO_TABS.has(name) || name === 'welcome' || name === 'who';
  back.onclick = () => { if (history.length > 1) history.back(); else go('#/today'); };
  refreshChrome();
  try {
    const mod = await loader();
    await mod.default(...args.map(decodeURIComponent));
  } catch (e) {
    console.error(e);
    setMain(h('div', { class: 'card' }, h('h2', {}, 'Something went wrong'), h('p', { class: 'muted' }, String(e.message || e)),
      h('a', { class: 'btn btn-primary', href: '#/today' }, 'Back to Today')));
  }
  refreshChrome();
}

export function markPicked() { picked = true; }

function boot() {
  loadProfiles();
  applySettings();
  window.addEventListener('hashchange', render);
  document.getElementById('brand').addEventListener('click', () => go('#/today'));
  render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  window.addEventListener('beforeunload', () => save(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });
}
boot();
