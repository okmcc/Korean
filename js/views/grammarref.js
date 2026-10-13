import { h, setMain } from '../ui.js';
import * as D from '../data.js';
import { grammarCard } from '../learn/grammarstep.js';

export default async function (id) {
  const all = await D.grammar();
  const idx = await D.index();
  const where = {};
  for (const u of idx.units) for (const L of u.lessons) for (const g of L.grammar || []) where[g] = where[g] || L.id;
  if (id && all[id]) {
    setMain(h('a', { href: '#/grammar', class: 'btn btn-ghost' }, '← All grammar'), h('div', { class: 'spacer' }), grammarCard({ ...all[id], id }),
      where[id] ? h('p', { class: 'muted', style: { marginTop: '12px' } }, 'Taught in lesson ', h('a', { href: `#/lesson/${where[id]}` }, where[id])) : null);
    return;
  }
  setMain(h('h1', {}, 'Grammar patterns'), h('p', { class: 'muted' }, 'Every pattern in the course, in teaching order. Tap one to see examples.'),
    h('div', { class: 'stack' }, Object.entries(all).map(([gid, g]) => h('a', { class: 'option-card', href: `#/grammar/${gid}`, style: { textDecoration: 'none', color: 'inherit' } },
      h('span', { class: 'pill' }, where[gid] || gid), h('div', {}, h('b', { lang: 'ko' }, g.pattern), h('span', {}, g.title))))));
}
