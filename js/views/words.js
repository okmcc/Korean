import { h, setMain, playBtn } from '../ui.js';
import * as D from '../data.js';
import { S } from '../store.js';

export default async function () {
  const bank = await D.wordbank();
  const idx = await D.index();
  const st = S();
  const input = h('input', { type: 'text', id: 'q', placeholder: 'Search Korean or English' });
  const filterSel = h('select', { id: 'f' }, h('option', { value: 'all' }, 'All words'), h('option', { value: 'mine' }, 'Words I\'ve learned'), h('option', { value: 'new' }, 'Not learned yet'));
  const list = h('div', { class: 'stack' });
  const render = () => {
    const q = input.value.trim().toLowerCase();
    const f = filterSel.value;
    list.innerHTML = '';
    let shown = 0;
    for (const u of idx.units) {
      const rows = (bank[u.n] || []).filter(([k, w, g]) => {
        const learned = !!st.cards[k]?.reps;
        if (f === 'mine' && !learned) return false;
        if (f === 'new' && learned) return false;
        return !q || w.includes(q) || g.toLowerCase().includes(q);
      });
      if (!rows.length) continue;
      shown += rows.length;
      if (shown > 600 && !q) { list.append(h('p', { class: 'muted' }, 'Showing the first 600 words. Search to find others.')); break; }
      list.append(h('div', { class: 'section-title' }, `Unit ${u.n} · ${u.en}`));
      list.append(h('div', { class: 'card', style: { padding: '8px 14px' } }, rows.map(([k, w, g]) => h('div', { class: 'row', style: { padding: '6px 0', borderBottom: '1px solid var(--line)' } },
        playBtn(w, { small: true }), h('b', { lang: 'ko', style: { minWidth: '5em' } }, w), h('span', { class: 'grow muted' }, g),
        st.cards[k]?.reps ? h('span', { class: 'pill good' }, 'learned') : null))));
    }
    if (!shown) list.append(h('p', { class: 'muted' }, 'No words match.'));
  };
  input.oninput = render; filterSel.onchange = render;
  setMain(h('h1', {}, 'Word list'), h('div', { class: 'row' }, h('div', { class: 'grow' }, input), filterSel), h('div', { class: 'spacer' }), list);
  render();
}
