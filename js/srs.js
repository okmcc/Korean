// FSRS-style spaced repetition (FSRS-4.5 default weights), day-granularity.
const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5, FACTOR = 19 / 81, RETENTION = 0.9, MAX_IVL = 3650;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export function retrievability(card, now) {
  if (!card.s) return 0;
  const t = Math.max(0, now - (card.last ?? now));
  return Math.pow(1 + FACTOR * t / card.s, DECAY);
}
function interval(s) {
  const ivl = s / FACTOR * (Math.pow(RETENTION, 1 / DECAY) - 1);
  return clamp(Math.round(ivl), 1, MAX_IVL);
}
const d0 = (g) => clamp(W[4] - (g - 3) * W[5], 1, 10);

// grade: 1 forgot, 2 hard, 3 good, 4 easy
export function grade(card, g, now) {
  card.reps = (card.reps || 0) + 1;
  if (!card.s) {
    card.s = W[g - 1];
    card.d = d0(g);
    // first real review after learning: keep early intervals short
    card.due = now + (g === 1 ? 0 : g === 2 ? 1 : g === 3 ? 1 : 3);
    card.last = now; card.st = g === 1 ? 'learn' : 'review';
    return card;
  }
  const r = retrievability(card, now);
  card.d = clamp(W[7] * d0(4) + (1 - W[7]) * (card.d - W[6] * (g - 3)), 1, 10);
  if (g === 1) {
    card.lapses = (card.lapses || 0) + 1;
    card.s = Math.max(0.1, W[11] * Math.pow(card.d, -W[12]) * (Math.pow(card.s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]));
    card.due = now + 1; card.st = 'learn';
  } else {
    const hard = g === 2 ? W[15] : 1, easy = g === 4 ? W[16] : 1;
    card.s = card.s * (1 + Math.exp(W[8]) * (11 - card.d) * Math.pow(card.s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * hard * easy);
    let ivl = interval(card.s);
    if (g === 2) ivl = Math.max(1, Math.min(ivl, Math.round((now - (card.last ?? now)) * 1.2) || 1));
    card.due = now + ivl; card.st = 'review';
  }
  card.last = now;
  return card;
}

// mark a word as already known (placement): spread first checks over the next weeks
export function seedKnown(card, now, spread = 30) {
  card.s = 20 + Math.random() * 20; card.d = 4; card.reps = 1; card.last = now;
  card.due = now + 3 + Math.floor(Math.random() * spread); card.st = 'review'; card.known = 1;
  return card;
}

export function nextIntervals(card, now) {
  // preview label for the four buttons
  const out = [];
  for (const g of [1, 2, 3, 4]) { const c = JSON.parse(JSON.stringify(card)); grade(c, g, now); out.push(Math.max(0, c.due - now)); }
  return out;
}
export function fmtIvl(d) {
  if (d <= 0) return 'again soon';
  if (d === 1) return '1 day';
  if (d < 30) return `${d} days`;
  if (d < 365) return `${Math.round(d / 30)} mo`;
  return `${(d / 365).toFixed(1)} yr`;
}
