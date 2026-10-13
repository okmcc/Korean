// Hangul utilities: decomposition, similarity, and a 2-set on-screen keyboard composer.
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const BASE = 0xac00;

export function decompose(str) {
  let out = '';
  for (const ch of str) {
    const c = ch.charCodeAt(0) - BASE;
    if (c >= 0 && c < 11172) {
      out += CHO[Math.floor(c / 588)] + JUNG[Math.floor((c % 588) / 28)] + JONG[c % 28];
    } else out += ch;
  }
  return out;
}
export function compose(cho, jung, jong = '') {
  const a = CHO.indexOf(cho), b = JUNG.indexOf(jung), c = JONG.indexOf(jong);
  if (a < 0 || b < 0 || c < 0) return null;
  return String.fromCharCode(BASE + a * 588 + b * 28 + c);
}
export function isHangulSyllable(ch) { const c = ch.charCodeAt(0); return c >= BASE && c < BASE + 11172; }
export function syllableParts(ch) {
  const c = ch.charCodeAt(0) - BASE;
  if (c < 0 || c >= 11172) return null;
  return [CHO[Math.floor(c / 588)], JUNG[Math.floor((c % 588) / 28)], JONG[c % 28]];
}

const DIGITS = { '0': '영', '1': '일', '2': '이', '3': '삼', '4': '사', '5': '오', '6': '육', '7': '칠', '8': '팔', '9': '구' };
export function normalize(s) {
  return (s || '').toLowerCase().replace(/[0-9]/g, d => DIGITS[d]).replace(/[^가-힣a-z]/g, '');
}
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
export function similarity(said, target) {
  const a = decompose(normalize(said)), b = decompose(normalize(target));
  if (!a.length || !b.length) return 0;
  return 1 - lev(a, b) / Math.max(a.length, b.length);
}
export function bestMatch(said, answers) {
  let best = { score: 0, answer: answers[0] };
  for (const ans of answers) { const s = similarity(said, ans); if (s > best.score) best = { score: s, answer: ans }; }
  return best;
}

// ---- on-screen 2-set keyboard composer
const KEY_ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
];
const SHIFT = { 'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ', 'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ' };
const VOWEL_COMBO = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
const JONG_COMBO = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
const isVowel = (j) => JUNG.includes(j);

export class Composer {
  constructor() { this.done = ''; this.cur = null; }
  get text() { return this.done + this.render(); }
  render() {
    const c = this.cur; if (!c) return '';
    if (c.cho && c.jung) return compose(c.cho, c.jung, c.jong || '') || '';
    return c.cho || c.jung || '';
  }
  commit() { this.done += this.render(); this.cur = null; }
  type(j) {
    const c = this.cur;
    if (isVowel(j)) {
      if (!c) { this.cur = { jung: j }; return; }
      if (c.cho && !c.jung) { c.jung = j; return; }
      if (c.jung && !c.jong && !c.cho && VOWEL_COMBO[c.jung + j]) { c.jung = VOWEL_COMBO[c.jung + j]; return; }
      if (c.cho && c.jung && !c.jong && VOWEL_COMBO[c.jung + j]) { c.jung = VOWEL_COMBO[c.jung + j]; return; }
      if (c.jong) {
        // move final consonant (or its second half) to the next syllable
        let move = c.jong, keep = '';
        for (const [k, v] of Object.entries(JONG_COMBO)) if (v === c.jong) { keep = k[0]; move = k[1]; }
        c.jong = keep; this.commit(); this.cur = { cho: move, jung: j }; return;
      }
      this.commit(); this.cur = { jung: j }; return;
    }
    // consonant
    if (!c) { this.cur = { cho: j }; return; }
    if (c.cho && c.jung && !c.jong && JONG.includes(j)) { c.jong = j; return; }
    if (c.jong && JONG_COMBO[c.jong + j]) { c.jong = JONG_COMBO[c.jong + j]; return; }
    this.commit(); this.cur = { cho: j };
  }
  back() {
    const c = this.cur;
    if (!c) { this.done = this.done.slice(0, -1); return; }
    if (c.jong) { const combo = Object.entries(JONG_COMBO).find(([, v]) => v === c.jong); c.jong = combo ? combo[0][0] : ''; return; }
    if (c.jung) { const combo = Object.entries(VOWEL_COMBO).find(([, v]) => v === c.jung); if (combo) { c.jung = combo[0][0]; return; } c.jung = ''; if (!c.cho) this.cur = null; return; }
    this.cur = null;
  }
  space() { this.commit(); this.done += ' '; }
  clear() { this.done = ''; this.cur = null; }
}
export { KEY_ROWS, SHIFT };
