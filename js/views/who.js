import { h, setMain } from '../ui.js';
import { getProfiles, switchProfile, addProfile, S } from '../store.js';
import { go, markPicked, applySettings } from '../main.js';

export default async function () {
  const p = getProfiles();
  setMain(h('h1', { style: { fontFamily: 'var(--font-display)' } }, 'Who\'s learning today?'),
    h('div', { class: 'stack' }, p.list.map(x => h('button', { class: 'option-card', onclick: () => { switchProfile(x.id); markPicked(); applySettings(); go('#/today'); } },
      h('span', { class: 'unit-num', style: { background: x.color, color: '#fff' } }, (x.name || '?').slice(0, 1).toUpperCase()),
      h('div', {}, h('b', {}, x.name || 'Unnamed learner'), h('span', {}, x.id === p.cur ? 'Last used' : ''))))),
    h('div', { class: 'spacer' }),
    h('button', { class: 'btn btn-block', onclick: () => { addProfile(''); markPicked(); applySettings(); go('#/welcome'); } }, 'Add a new learner'));
}
