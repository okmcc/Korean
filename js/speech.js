// Speech recognition (Chrome, Safari, Samsung Internet) + recording fallback.
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const isEdge = /Edg\//.test(navigator.userAgent);
export function canRecognize() { return !!SR && !isEdge; }
export function browserHint() {
  if (isEdge) return 'Microsoft Edge can\'t check speech. Open this site in Chrome (or Safari on iPhone/Mac) to use the microphone check.';
  if (!SR) return 'This browser can\'t check speech. Chrome or Safari can. You can still type your answer or record yourself.';
  return '';
}

export function listen({ lang = 'ko-KR', timeout = 9000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!canRecognize()) return reject(new Error('unsupported'));
    const r = new SR();
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
    let done = false;
    const finish = (fn, v) => { if (done) return; done = true; clearTimeout(t); try { r.stop(); } catch (e) {} fn(v); };
    const t = setTimeout(() => finish(resolve, []), timeout);
    r.onresult = (e) => {
      const alts = [];
      for (const res of e.results) for (const a of res) alts.push(a.transcript);
      finish(resolve, alts);
    };
    r.onerror = (e) => finish(reject, new Error(e.error || 'error'));
    r.onend = () => finish(resolve, []);
    try { r.start(); } catch (e) { finish(reject, e); }
  });
}

// simple voice recorder
export function canRecord() { return !!(navigator.mediaDevices && window.MediaRecorder); }
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  rec.start();
  return {
    stop: () => new Promise(res => {
      rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); res(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }))); };
      rec.stop();
    })
  };
}
