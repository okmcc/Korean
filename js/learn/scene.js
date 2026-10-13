// Story step: the lesson as a webtoon, one panel at a time (big, simple controls).
import { h, ICON, openSheet, playBtn, showBreakdown, progressBar } from '../ui.js';
import { panelSVG, charName, charKo } from '../art.js';
import { speak, stopSpeaking } from '../tts.js';
import { S } from '../store.js';

export function buildFrames(lesson) {
  const frames = [];
  let ctx = { bg: 'room', cast: [] };
  const exprs = {};
  let chatGroup = null;
  for (const item of lesson.scene) {
    if (item.bg) { ctx = { bg: item.bg, cast: item.cast }; chatGroup = null; for (const k in exprs) delete exprs[k]; continue; }
    if (item.sp) exprs[item.sp] = item.ex;
    const isChat = ctx.bg.startsWith('phone');
    if (isChat) { if (!chatGroup) chatGroup = []; chatGroup.push(item); }
    frames.push({ item, bg: ctx.bg, cast: ctx.cast, exprs: { ...exprs }, chat: isChat ? chatGroup.slice() : null });
  }
  return frames;
}

export function renderScene(container, lesson, { onDone } = {}) {
  const frames = buildFrames(lesson);
  let i = 0, auto = false, showEn = S().settings.showEn;
  const art = h('div');
  const bubbleBox = h('div');
  const counter = h('div', { class: 'stepper' });
  const nextBtn = h('button', { class: 'btn btn-primary btn-big', html: `<span>Next</span>${ICON.next}` });
  const backBtn = h('button', { class: 'btn', 'aria-label': 'Previous line' }, '◀ Back');
  const autoBtn = h('button', { class: 'btn', 'aria-pressed': 'false' }, 'Play all');
  const enBtn = h('button', { class: 'btn', 'aria-pressed': String(showEn) }, 'English');

  function draw(play = true) {
    const f = frames[i];
    const it = f.item;
    art.innerHTML = '';
    if (f.chat) {
      art.append(h('div', { class: 'chatlog', style: { minHeight: '220px' } }, f.chat.map((c, k) => h('div', { class: `chat${c.sp === 'jamie' ? ' me' : ''}`, style: k === f.chat.length - 1 ? null : { opacity: .75 } },
        h('span', { class: 'who' }, c.sp ? charName(c.sp) : ''), h('span', { class: 'ko', lang: 'ko' }, c.ko)))));
    } else if (it.sp || f.cast.length) {
      art.append(h('div', { class: 'panel', html: panelSVG(f.bg, f.cast, it.sp, it.ex, f.exprs) }));
    }
    const pos = f.cast.find(c => c[0] === it.sp)?.[1] || 'C';
    const en = h('span', { class: 'en', hidden: !showEn }, it.en);
    const bubble = h('button', { class: `bubble${it.sp ? '' : ' narr'}`, style: { '--tail': { L: '23%', C: '50%', R: '77%' }[pos], marginTop: '14px' }, onclick: () => say() },
      it.sp ? h('span', { class: 'who' }, `${charKo(it.sp)} · ${charName(it.sp)}`) : null,
      h('span', { class: 'ko', lang: 'ko' }, it.ko), en);
    if (f.chat) bubble.style.display = 'none';
    bubbleBox.innerHTML = '';
    bubbleBox.append(...[f.chat ? h('div', { class: 'small muted', style: { marginTop: '8px' } }, it.en && showEn ? it.en : '') : null, bubble].filter(Boolean),
      h('div', { class: 'row', style: { marginTop: '10px' } },
        h('button', { class: 'btn', html: `${ICON.play}<span>Again</span>`, onclick: () => say() }),
        h('button', { class: 'btn', onclick: () => say(true) }, 'Slow'),
        h('button', { class: 'btn', onclick: () => showBreakdown(it.ko, it.en, it.b) }, 'Word by word')));
    counter.innerHTML = '';
    counter.append(progressBar((i + 1) / frames.length), h('span', { class: 'step-label' }, `Line ${i + 1} of ${frames.length}`));
    backBtn.disabled = i === 0;
    const last = i === frames.length - 1;
    nextBtn.innerHTML = last ? `<span>${onDone ? 'Continue to new words' : 'Done'}</span>${ICON.next}` : `<span>Next</span>${ICON.next}`;
    function say(slow = false) {
      bubble.classList.add('playing');
      speak(it.ko, { slow, onend: () => { bubble.classList.remove('playing'); if (auto && !slow) setTimeout(() => { if (auto) { if (i < frames.length - 1) { i++; draw(); } else { auto = false; autoBtn.setAttribute('aria-pressed', 'false'); autoBtn.textContent = 'Play all'; } } }, 700); } });
    }
    if (play) say();
  }
  nextBtn.onclick = () => { if (i < frames.length - 1) { i++; draw(); } else { auto = false; stopSpeaking(); onDone && onDone(); } };
  backBtn.onclick = () => { if (i > 0) { i--; draw(); } };
  autoBtn.onclick = () => { auto = !auto; autoBtn.setAttribute('aria-pressed', String(auto)); autoBtn.textContent = auto ? 'Stop' : 'Play all'; if (auto) draw(); else stopSpeaking(); };
  enBtn.onclick = () => { showEn = !showEn; enBtn.setAttribute('aria-pressed', String(showEn)); draw(false); };
  const scriptBtn = h('button', { class: 'btn', onclick: () => openSheet(h('div', {}, h('h2', {}, 'Full script'), h('div', { class: 'stack' }, frames.map(f => h('div', { class: 'row', style: { alignItems: 'flex-start' } },
    playBtn(f.item.ko, { small: true }), h('div', { class: 'grow' }, h('div', { class: 'small muted' }, f.item.sp ? charName(f.item.sp) : 'Narrator'), h('div', { class: 'ko', lang: 'ko', style: { fontSize: '1.15rem' } }, f.item.ko), h('div', { class: 'muted small' }, f.item.en))))))) }, 'Full script');
  container.append(counter, art, bubbleBox, h('div', { class: 'spacer' }),
    h('div', { class: 'btn-row' }, backBtn, nextBtn),
    h('div', { class: 'row', style: { marginTop: '12px' } }, autoBtn, enBtn, scriptBtn),
    h('p', { class: 'small muted', style: { marginTop: '10px' } }, 'Tap the speech bubble to hear it again. "Word by word" explains every part of the sentence.'));
  const keys = (e) => {
    if (!nextBtn.isConnected) return document.removeEventListener('keydown', keys);
    if (e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') || document.getElementById('sheet')?.hidden === false) return;
    if (e.key === 'ArrowRight') nextBtn.click(); if (e.key === 'ArrowLeft') backBtn.click();
  };
  document.addEventListener('keydown', keys);
  draw();
}
