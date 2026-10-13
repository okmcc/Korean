// Talk-back conversation: the character speaks, you answer out loud.
import { h, ICON, playBtn, showBreakdown } from '../ui.js';
import { speak, speakAsync } from '../tts.js';
import { avatarSVG, charName, charKo } from '../art.js';
import { canRecognize, listen, browserHint, canRecord, startRecording } from '../speech.js';
import { bestMatch } from '../hangul.js';

export function renderTalk(container, lesson, { onDone, title } = {}) {
  const turns = lesson.talk || [];
  if (!turns.length) { onDone && onDone(); return; }
  const log = h('div', { class: 'talk' });
  const stage = h('div');
  const hint = browserHint();
  container.append(
    h('p', { class: 'muted' }, title || 'Have a short conversation. When it\'s your turn, tap the red microphone and say the answer in Korean.'),
    hint ? h('p', { class: 'small muted' }, hint) : null,
    log, h('div', { class: 'spacer' }), stage);
  let i = 0;

  const npcLine = (t) => {
    const en = h('span', { class: 'muted small', style: { display: 'block' } }, t.en);
    const bubble = h('button', { class: 'bubble', style: { '--tail': '12%' }, onclick: () => speak(t.ko) },
      h('span', { class: 'who' }, `${charKo(t.sp)} · ${charName(t.sp)}`), h('span', { class: 'ko', lang: 'ko' }, t.ko), en);
    log.append(h('div', { class: 'talk-npc' }, h('div', { class: 'avatar', html: avatarSVG(t.sp, t.ex) }), h('div', { class: 'grow' }, bubble,
      h('button', { class: 'btn btn-ghost small', style: { minHeight: '40px' }, onclick: () => showBreakdown(t.ko, t.en, t.b) }, 'Word by word'))));
    bubble.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return speakAsync(t.ko);
  };
  const youLine = (ko) => log.append(h('div', { class: 'talk-you' }, h('span', { class: 'ko', lang: 'ko' }, ko)));

  function answerUI(cue, answers, b, after) {
    stage.innerHTML = '';
    const fb = h('div');
    const heard = h('div', { class: 'heard' });
    const model = answers[0];
    const reveal = h('div', { hidden: true, class: 'card', style: { marginTop: '10px' } },
      h('div', { class: 'row' }, playBtn(model, { small: true }), playBtn(model, { small: true, slow: true }), h('span', { class: 'ko grow', lang: 'ko', style: { fontSize: '1.3rem' } }, model)),
      b ? h('button', { class: 'btn btn-ghost small', style: { minHeight: '40px' }, onclick: () => showBreakdown(model, cue, b) }, 'Word by word') : null);
    const accept = (text) => { youLine(text); stage.innerHTML = ''; after(); };
    const mic = h('button', { class: 'mic', 'aria-label': 'Speak your answer', html: ICON.mic });
    mic.onclick = async () => {
      if (!canRecognize()) return;
      mic.classList.add('listening'); fb.innerHTML = ''; heard.textContent = 'Listening…';
      try {
        const alts = await listen();
        mic.classList.remove('listening');
        if (!alts.length) { heard.textContent = ''; fb.append(h('div', { class: 'feedback close' }, 'I didn\'t catch that. Tap the mic and try again.')); return; }
        let best = { score: 0 }, said = alts[0];
        for (const a of alts) { const m = bestMatch(a, answers); if (m.score > best.score) { best = m; said = a; } }
        heard.textContent = `You said: ${said}`;
        if (best.score >= 0.78) {
          fb.append(h('div', { class: 'feedback ok' }, 'Great! That\'s right.'));
          speak(best.answer);
          setTimeout(() => accept(best.answer), 1300);
        } else if (best.score >= 0.55) {
          fb.append(h('div', { class: 'feedback close' }, 'Close! Listen to the answer and try once more, or continue.'));
          reveal.hidden = false; speak(model);
          fb.append(h('button', { class: 'btn', style: { marginTop: '8px' }, onclick: () => accept(model) }, 'Continue'));
        } else {
          fb.append(h('div', { class: 'feedback no' }, 'Not quite. Tap "Show answer" to hear it, then try again.'));
        }
      } catch (e) {
        mic.classList.remove('listening'); heard.textContent = '';
        fb.append(h('div', { class: 'feedback no' }, e.message === 'not-allowed' ? 'The microphone is blocked. Allow it in your browser settings, or use "Show answer".' : 'The microphone didn\'t work this time. Try again or use "Show answer".'));
      }
    };
    let rec = null;
    const recBtn = canRecord() ? h('button', { class: 'btn', html: `${ICON.rec}<span>Record myself</span>` }) : null;
    if (recBtn) recBtn.onclick = async () => {
      if (!rec) {
        try { rec = await startRecording(); recBtn.querySelector('span').textContent = 'Stop recording'; recBtn.innerHTML = `${ICON.stop}<span>Stop recording</span>`; }
        catch (e) { fb.innerHTML = ''; fb.append(h('div', { class: 'feedback no' }, 'Could not use the microphone.')); }
      } else {
        const url = await rec.stop(); rec = null;
        recBtn.innerHTML = `${ICON.rec}<span>Record again</span>`;
        reveal.hidden = false;
        fb.innerHTML = '';
        fb.append(h('div', { class: 'card' }, h('p', { class: 'small muted' }, 'Your recording, then the model answer:'), h('audio', { controls: true, src: url }),
          h('button', { class: 'btn btn-ghost', onclick: () => speak(model) }, 'Play model answer'),
          h('button', { class: 'btn', style: { marginTop: '8px' }, onclick: () => accept(model) }, 'Sounds right, continue')));
        const a = fb.querySelector('audio'); a.play().catch(() => {}); a.onended = () => speak(model);
      }
    };
    stage.append(h('div', { class: 'cue' },
      h('div', { class: 'small muted' }, 'Your turn'),
      h('div', { class: 'say' }, cue),
      canRecognize() ? mic : null, canRecognize() ? h('p', { class: 'center small muted' }, 'Tap and speak') : null,
      heard, fb, reveal,
      h('div', { class: 'btn-row', style: { marginTop: '10px' } },
        h('button', { class: 'btn', html: `${ICON.eye}<span>Show answer</span>`, onclick: () => { reveal.hidden = false; speak(model); } }),
        recBtn,
        h('button', { class: 'btn', onclick: () => accept(model) }, canRecognize() ? 'Skip' : 'I said it'))));
  }

  async function step() {
    if (i >= turns.length) {
      stage.innerHTML = '';
      stage.append(h('div', { class: 'feedback ok center' }, 'Conversation complete!'), h('div', { class: 'spacer' }),
        h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { log.innerHTML = ''; i = 0; step(); } }, 'Practice again'),
          onDone ? h('button', { class: 'btn btn-primary', onclick: () => onDone() }, 'Continue') : null));
      return;
    }
    const t = turns[i++];
    if (t.t === 'npc') { stage.innerHTML = ''; await npcLine(t); step(); }
    else if (t.t === 'you') answerUI(t.cue, t.ans, t.b, step);
    else if (t.t === 'choice') {
      stage.innerHTML = '';
      stage.append(h('div', { class: 'cue' }, h('div', { class: 'small muted' }, 'Choose what to say'),
        h('div', { class: 'choices' }, t.opts.map(o => h('button', { class: 'choice', onclick: () => {
          answerUI(o.cue, o.ans, o.b, async () => { if (o.reply) await npcLine(o.reply); step(); });
        } }, o.cue)))));
    }
  }
  step();
}
