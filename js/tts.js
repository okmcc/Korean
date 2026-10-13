// Text-to-speech using the device's Korean voice.
let voices = [];
let settings = { voice: '', rate: 0.9 };
const PREFERRED = [/natural/i, /google/i, /yuna/i, /sunhi/i, /injoon/i, /heami/i, /online/i];

function load() {
  if (!('speechSynthesis' in window)) return;
  voices = speechSynthesis.getVoices().filter(v => /^ko(-|_|$)/i.test(v.lang));
}
if ('speechSynthesis' in window) {
  load();
  speechSynthesis.addEventListener?.('voiceschanged', load);
}

export function ttsAvailable() { return 'speechSynthesis' in window; }
export function koreanVoices() { load(); return voices; }
export function setTTS(s) { Object.assign(settings, s || {}); }

function pick() {
  load();
  if (!voices.length) return null;
  if (settings.voice) { const v = voices.find(v => v.name === settings.voice); if (v) return v; }
  for (const re of PREFERRED) { const v = voices.find(v => re.test(v.name)); if (v) return v; }
  return voices[0];
}

let current = null;
export function speak(text, { slow = false, rate, onend } = {}) {
  if (!('speechSynthesis' in window) || !text) { onend && onend(); return; }
  const clean = text.replace(/[~…]/g, ' ').replace(/\s+/g, ' ').trim();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'ko-KR';
  const v = pick(); if (v) u.voice = v;
  u.rate = rate || (slow ? Math.max(0.5, settings.rate * 0.65) : settings.rate);
  u.onend = () => { current = null; onend && onend(); };
  u.onerror = () => { current = null; onend && onend(); };
  current = u;
  // Chrome sometimes needs a tick after cancel()
  setTimeout(() => speechSynthesis.speak(u), 30);
}
export function stopSpeaking() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
export function speakAsync(text, opts = {}) { return new Promise(res => speak(text, { ...opts, onend: res })); }
