// Small DOM helpers and shared components.
import { speak } from './tts.js';

// .append()/.prepend() everywhere accept nested arrays and skip null/false, just like h().
for (const proto of [Element.prototype, DocumentFragment.prototype]) {
  for (const m of ['append', 'prepend']) {
    const orig = proto[m];
    proto[m] = function (...kids) { return orig.apply(this, kids.flat(Infinity).filter(k => k != null && k !== false)); };
  }
}

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export const ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  slow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15c0-4 3.5-7 8-7 3.6 0 6 2 6 5h2a2 2 0 0 1 0 4H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="10.5" cy="12.5" r="2" fill="currentColor"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill="currentColor"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.6 6.6L21 9.3l-5 4.4 1.6 6.8L12 17l-5.6 3.5L8 13.7 3 9.3l6.4-.7z" fill="currentColor"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
  rec: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="currentColor"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 21V5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

export function iconEl(name, cls = '') { const s = h('span', { class: cls, html: ICON[name] }); return s.firstChild; }

export function toast(msg, ms = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
}

export function openSheet(content) {
  const s = document.getElementById('sheet');
  s.innerHTML = '';
  const body = h('div', { class: 'sheet-body', role: 'dialog', 'aria-modal': 'true' }, content,
    h('div', { class: 'spacer' }), h('button', { class: 'btn btn-block', onclick: closeSheet }, 'Close'));
  s.append(body); s.hidden = false;
  s.onclick = (e) => { if (e.target === s) closeSheet(); };
  body.querySelector('button')?.focus();
}
export function closeSheet() { const s = document.getElementById('sheet'); s.hidden = true; s.innerHTML = ''; }

export function playBtn(text, { small = false, slow = false, label } = {}) {
  return h('button', { class: `play${small ? ' small' : ''}${slow ? ' slow' : ''}`, 'aria-label': label || (slow ? 'Play slowly' : 'Play audio'),
    html: slow ? '<span style="font-weight:700;font-size:.85rem">Slow</span>' : ICON.play, onclick: (e) => { e.stopPropagation(); speak(text, { slow }); } });
}

// Korean text with optional [start,end] highlight or blank
export function koText(text, span, mode = 'mark') {
  const el = h('span', { class: 'ko', lang: 'ko' });
  if (!span) { el.textContent = text; return el; }
  const [a, b] = span;
  el.append(text.slice(0, a));
  if (mode === 'blank') el.append(h('span', { class: 'blank', 'aria-label': 'blank' }, ' '));
  else el.append(h('mark', {}, text.slice(a, b)));
  el.append(text.slice(b));
  return el;
}

// word-by-word breakdown: b = [[eojeol, [[form, gloss, kind]...]]...]
export function breakdownEl(b) {
  const wrap = h('div', { class: 'bd' });
  for (const [eo, parts] of b || []) {
    if (!parts.length) continue;
    wrap.append(h('div', { class: 'bd-word' },
      h('div', { class: 'w', lang: 'ko' }, eo),
      h('div', { class: 'bd-parts' }, parts.map(([f, g, k]) =>
        h('span', { class: k === 'n' ? 'n' : (k === 'g' ? 'g' : '') }, h('span', { lang: 'ko' }, f), ' ', g)))));
  }
  return wrap;
}

export function showBreakdown(ko, en, b) {
  openSheet(h('div', {}, h('div', { class: 'row' }, playBtn(ko), playBtn(ko, { slow: true }), h('div', { class: 'grow ko-big', lang: 'ko' }, ko)),
    h('p', { class: 'muted', style: { marginTop: '8px' } }, en),
    h('div', { class: 'section-title' }, 'Word by word'),
    breakdownEl(b),
    h('p', { class: 'small muted', style: { marginTop: '12px' } }, 'Red words are new: you will meet them properly in a later lesson.')));
}

export function progressBar(frac) {
  return h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(frac * 100) },
    h('i', { style: { width: `${Math.max(0, Math.min(1, frac)) * 100}%` } }));
}

export function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function sample(a, n) { return shuffle(a).slice(0, n); }
export function todayStr(d = new Date()) { const z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; }
export function dayNum(s) { const [y, m, d] = s.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); }
export function today() { return dayNum(todayStr()); }
export function stripNum(k) { return k.replace(/\d+$/, ''); }
export function setMain(...kids) { const m = document.getElementById('main'); m.innerHTML = ''; m.append(...kids); m.focus({ preventScroll: true }); window.scrollTo(0, 0); return m; }
