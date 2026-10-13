// Review runner: due cards in three modes (read, listen, say).
import { h, ICON, playBtn, koText, showBreakdown, progressBar, today, shuffle } from '../ui.js';
import { speak } from '../tts.js';
import { S, save, dayLog } from '../store.js';
import { grade, nextIntervals, fmtIvl } from '../srs.js';
import { dueCards } from '../progress.js';
import * as D from '../data.js';
import { canRecognize, listen } from '../speech.js';
import { bestMatch } from '../hangul.js';

async function cardContent(c) {
  if (c.k.startsWith('G:')) {
    const all = await D.grammar(); const g = all[c.k.slice(2)];
    return g && g.cloze ? { type: 'grammar', g } : null;
  }
  if (c.k.startsWith('M:')) {
    const m = S().mylines.find(x => 'M:' + x.id === c.k);
    return m ? { type: 'mine', m } : null;
  }
  const w = await D.wordEntry(c).catch(() => null);
  return w ? { type: 'word', w } : null;
}

export async function runReviews(container, { cards, onDone, max = 400 } = {}) {
  let queue = (cards || dueCards()).slice(0, max);
  const total = queue.length;
  if (!total) { onDone && onDone({ count: 0 }); return; }
  let done = 0, again = 0;
  const stage = h('div'); container.append(stage);
  const keyHandler = (e) => stage._key && stage._key(e);
  document.addEventListener('keydown', keyHandler);

  async function next() {
    stage.innerHTML = '';
    if (!queue.length) {
      document.removeEventListener('keydown', keyHandler);
      save(true);
      return onDone && onDone({ count: done, again });
    }
    const item = queue[0];
    const card = S().cards[item.id];
    const content = card ? await cardContent(card) : null;
    if (!content) { queue.shift(); return next(); }
    const mode = content.type === 'word' ? (['read', 'listen', 'say'][(card.reps || 0) % 3]) : content.type;
    const front = h('div', { class: 'review-card card' });
    const back = h('div', { hidden: true });
    let answerText = '', enText = '', bd = null;
    if (content.type === 'word') {
      const w = content.w; answerText = w.ko; enText = w.en; bd = w.b;
      if (mode === 'read') {
        front.append(h('span', { class: 'mode-tag' }, 'Read'), h('div', { class: 'spacer' }), koText(w.ko, w.span), h('p', { class: 'muted', style: { marginTop: '10px' } }, 'What does it mean?'));
      } else if (mode === 'listen') {
        front.append(h('span', { class: 'mode-tag' }, 'Listen'), h('div', { class: 'spacer' }), h('div', { class: 'row', style: { justifyContent: 'center' } }, playBtn(w.ko), playBtn(w.ko, { slow: true })), h('p', { class: 'muted', style: { marginTop: '10px' } }, 'What did you hear? What does it mean?'));
        setTimeout(() => speak(w.ko), 200);
      } else {
        front.append(h('span', { class: 'mode-tag' }, 'Say it'), h('div', { class: 'spacer' }), h('div', { class: 'en', style: { fontWeight: 700 } }, w.en),
          h('div', { style: { marginTop: '10px' } }, koText(w.ko, w.span, 'blank')), h('p', { class: 'muted', style: { marginTop: '10px' } }, `Hint: ${w.g}. Say the whole sentence out loud.`));
        if (canRecognize()) {
          const fb = h('div');
          const mic = h('button', { class: 'mic', 'aria-label': 'Speak', html: ICON.mic, onclick: async () => {
            mic.classList.add('listening'); fb.innerHTML = '';
            try {
              const alts = await listen(); mic.classList.remove('listening');
              let best = { score: 0 }; for (const a of alts) { const m = bestMatch(a, [w.ko]); if (m.score > best.score) best = { ...m, said: a }; }
              fb.append(h('div', { class: `feedback ${best.score >= .78 ? 'ok' : best.score >= .55 ? 'close' : 'no'}` }, alts.length ? `Heard: ${best.said || alts[0]}` : 'Didn\'t catch that.'));
            } catch (e) { mic.classList.remove('listening'); fb.append(h('div', { class: 'feedback no' }, 'Microphone not available.')); }
          } });
          front.append(mic, fb);
        }
      }
      back.append(h('div', { class: 'card center' },
        h('div', { class: 'row', style: { justifyContent: 'center' } }, playBtn(w.ko, { small: true }), playBtn(w.ko, { small: true, slow: true })),
        h('div', { style: { marginTop: '8px', fontSize: '1.3rem' } }, koText(w.ko, w.span)),
        h('p', { class: 'en', style: { marginTop: '8px' } }, w.en),
        h('p', {}, h('b', { lang: 'ko' }, w.w), ' = ', w.g),
        h('button', { class: 'btn btn-ghost', style: { minHeight: '44px' }, onclick: () => showBreakdown(w.ko, w.en, w.b) }, 'Word by word')));
    } else if (content.type === 'grammar') {
      const g = content.g, c = g.cloze, [a, b] = c.blank;
      answerText = c.ko;
      front.append(h('span', { class: 'mode-tag' }, 'Grammar'), h('div', { class: 'spacer' }), h('div', { class: 'ko', lang: 'ko' }, c.ko.slice(0, a), h('span', { class: 'blank' }, ' '), c.ko.slice(b)),
        h('p', { class: 'muted', style: { marginTop: '10px' } }, c.en), h('p', { class: 'small muted' }, `Pattern: ${g.title}`));
      back.append(h('div', { class: 'card center' }, h('div', { class: 'row', style: { justifyContent: 'center' } }, playBtn(c.ko, { small: true })),
        h('div', { class: 'ko', lang: 'ko', style: { fontSize: '1.4rem', marginTop: '8px' } }, koText(c.ko, [a, b])),
        h('p', {}, h('b', { lang: 'ko' }, g.pattern), ' — ', g.title)));
    } else {
      const m = content.m; answerText = m.ko;
      front.append(h('span', { class: 'mode-tag' }, 'My line'), h('div', { class: 'spacer' }), h('div', { class: 'ko', lang: 'ko' }, m.ko), h('p', { class: 'muted' }, 'What does it mean?'));
      back.append(h('div', { class: 'card center' }, playBtn(m.ko, { small: true }), h('p', { class: 'en' }, m.en || '(no note)')));
    }

    const t = today();
    const ivls = nextIntervals(card, t);
    const rate = h('div', { class: 'rate' }, [['Forgot', 1], ['Hard', 2], ['Good', 3], ['Easy', 4]].map(([label, g], j) =>
      h('button', { class: `r${g}`, onclick: () => answer(g) }, label, h('small', {}, fmtIvl(ivls[j])))));
    const showBtn = h('button', { class: 'btn btn-primary btn-big btn-block', onclick: reveal }, 'Show answer');
    function reveal() { back.hidden = false; showBtn.hidden = true; rate.hidden = false; if (mode !== 'listen' && answerText) speak(answerText); rate.querySelector('.r3').focus(); }
    function answer(g) {
      grade(card, g, t);
      dayLog().r += 1; done++;
      queue.shift();
      if (g === 1) { again++; card.due = t + 1; const pos = Math.min(queue.length, 4); queue.splice(pos, 0, item); }
      save();
      next();
    }
    rate.hidden = true;
    stage._key = (e) => {
      if (e.target.closest('input,textarea')) return;
      if (e.key === ' ' && !showBtn.hidden) { e.preventDefault(); reveal(); }
      else if (showBtn.hidden && ['1', '2', '3', '4'].includes(e.key)) answer(Number(e.key));
    };
    stage.append(h('div', { class: 'stepper' }, progressBar(done / (done + queue.length)), h('span', { class: 'step-label' }, `${queue.length} left`)),
      front, h('div', { class: 'spacer' }), showBtn, back, rate,
      h('p', { class: 'small muted center', style: { marginTop: '12px' } }, 'Be honest: "Forgot" brings it back soon, "Easy" pushes it far away.'));
  }
  next();
}
