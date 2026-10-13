import { h, setMain, ICON } from '../ui.js';
import { S, save } from '../store.js';
import { speak, koreanVoices, ttsAvailable } from '../tts.js';
import { canRecognize, browserHint } from '../speech.js';
import { go, applySettings } from '../main.js';
import { skipTo } from '../progress.js';
import { panelSVG } from '../art.js';
import * as D from '../data.js';

const PACE = [[15, 5, '15 minutes', 'About 5 new words a day'], [30, 10, '30 minutes', 'About 10 new words a day'], [60, 15, '60 minutes or more', 'About 15 new words a day']];

export default async function () {
  const st = S();
  let step = 0;
  const m = setMain();
  const draw = async () => {
    m.innerHTML = '';
    if (step === 0) {
      m.append(h('div', { class: 'panel', style: { marginBottom: '18px' }, html: panelSVG('house', [['grandma', 'L'], ['jamie', 'R']], 'grandma', 'happy') }),
        h('h1', { style: { fontFamily: 'var(--font-display)' } }, 'Welcome to Starlight House'),
        h('p', {}, 'Learn Korean the way people actually use it. You\'ll follow Jamie through a year in a Seoul boarding house, learn the 3,000 most useful words in real sentences, review them right before you\'d forget, and practice speaking out loud.'),
        h('p', { class: 'muted' }, 'It takes about a minute to set up. Everything is saved on this device.'),
        h('button', { class: 'btn btn-primary btn-big btn-block', onclick: () => { step = 1; draw(); } }, 'Get started'));
    } else if (step === 1) {
      const input = h('input', { type: 'text', id: 'nm', value: st.name || '', autocomplete: 'given-name', placeholder: 'Your first name' });
      m.append(h('h1', {}, 'What should we call you?'), h('div', { class: 'field' }, h('label', { for: 'nm' }, 'Your name'), input),
        h('p', { class: 'small muted' }, 'If several people share this device, each person can have their own progress. Add them later under "Me".'),
        h('button', { class: 'btn btn-primary btn-big btn-block', onclick: () => { st.name = input.value.trim(); save(); step = 2; draw(); } }, 'Next'));
      input.focus();
    } else if (step === 2) {
      m.append(h('h1', {}, 'How much time a day?'), h('p', { class: 'muted' }, 'This sets how many new words you learn each day. Reviews of old words take a few extra minutes. You can change it any time.'),
        h('div', { class: 'stack' }, PACE.map(([min, n, title, sub]) => h('button', { class: 'option-card', onclick: () => { st.settings.minutes = min; st.settings.newPerDay = n; save(); step = 3; draw(); } },
          h('div', {}, h('b', {}, title), h('span', {}, sub))))));
    } else if (step === 3) {
      m.append(h('h1', {}, 'Where do you want to start?'),
        h('div', { class: 'stack' },
          h('button', { class: 'option-card', onclick: () => { st.start = { mode: 'hangul' }; save(); step = 4; draw(); } }, h('div', {}, h('b', {}, 'I\'m brand new'), h('span', {}, 'Start by learning to read Korean letters (Hangul).'))),
          h('button', { class: 'option-card', onclick: () => { st.start = { mode: 'unit1' }; st.hangul.done = st.hangul.done || 1; save(); step = 4; draw(); } }, h('div', {}, h('b', {}, 'I can read Hangul'), h('span', {}, 'Start at Unit 1.'))),
          h('button', { class: 'option-card', onclick: () => { st.start = { mode: 'placement' }; save(); step = 4; draw(); } }, h('div', {}, h('b', {}, 'I already know some Korean'), h('span', {}, 'Take a 5-minute placement test and skip what you know.'))),
          h('button', { class: 'option-card', onclick: () => { step = 31; draw(); } }, h('div', {}, h('b', {}, 'Let me pick a unit'), h('span', {}, 'Jump straight to a unit. Earlier words are marked as known.')))));
    } else if (step === 31) {
      const idx = await D.index();
      m.append(h('h1', {}, 'Pick a starting unit'), h('p', { class: 'muted' }, 'Words from earlier units will still show up now and then in reviews, so you can check you really know them.'),
        h('div', { class: 'stack' }, idx.units.map(u => h('button', { class: 'option-card', onclick: async () => {
          st.start = { mode: 'unit', unit: u.n }; await skipTo(u.n); save(true); step = 4; draw();
        } }, h('span', { class: 'unit-num' }, u.n), h('div', {}, h('b', { lang: 'ko' }, u.ko), h('span', {}, `${u.en} — ${u.summary}`))))));
    } else if (step === 4) {
      const voices = koreanVoices();
      const fb = h('div');
      m.append(h('h1', {}, 'Sound check'),
        h('p', {}, 'Tap the button. You should hear Korean.'),
        h('button', { class: 'btn btn-primary btn-big btn-block', html: `${ICON.play}<span>Play "안녕하세요"</span>`, onclick: () => speak('안녕하세요. 만나서 반가워요.') }),
        h('div', { class: 'spacer' }),
        !ttsAvailable() || !voices.length ? h('div', { class: 'note' }, h('h3', {}, 'No Korean voice found yet'),
          h('p', {}, 'Some devices need a Korean voice installed. iPhone and iPad: Settings → Accessibility → Spoken Content → Voices → Korean. Android: Settings → Text-to-speech → Google → install Korean. Windows: Settings → Time & language → Speech → Add voices → Korean. Chrome on a computer usually works without anything extra.')) : null,
        h('p', { class: 'small muted', style: { marginTop: '14px' } }, canRecognize() ? 'Your browser can check your pronunciation with the microphone. It will ask for permission the first time you tap a microphone button.' : browserHint()),
        fb, h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { step = 3; draw(); } }, 'Back'),
          h('button', { class: 'btn btn-primary btn-big', onclick: finish }, 'I heard it — let\'s go')));
    }
  };
  async function finish() {
    st.onboarded = true; save(true); applySettings();
    if (st.start?.mode === 'placement') go('#/placement');
    else if (st.start?.mode === 'hangul') go('#/hangul');
    else go('#/today');
  }
  draw();
}
