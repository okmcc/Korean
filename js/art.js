// Webtoon panel renderer: flat vector backgrounds + characters with expressions.
const W = 400, H = 240;
const POS = { L: 92, C: 200, R: 308 };
const LINE = '#2b2f3c';

export const CHAR = {
  jamie:   { name: 'Jamie', ko: '제이미', skin: '#f1c9a5', hair: '#6b4226', style: 'tousled', top: '#3e7cb1', wear: 'hoodie' },
  grandma: { name: 'Grandma', ko: '할머니', skin: '#efc59d', hair: '#cfcfcf', style: 'perm', top: '#b5543c', wear: 'cardigan', acc: ['glasses'], old: 1 },
  minjun:  { name: 'Min-jun', ko: '민준', skin: '#eec39a', hair: '#1e1e1e', style: 'spiky', top: '#f2a541', wear: 'tshirt' },
  seoyeon: { name: 'Seo-yeon', ko: '서연', skin: '#f5d0b0', hair: '#151515', style: 'long', top: '#6c8f72', wear: 'shirt' },
  jiwoo:   { name: 'Ji-woo', ko: '지우', skin: '#f3cfa8', hair: '#2a1a12', style: 'bowl', top: '#e94f4f', wear: 'stripe', kid: 1 },
  park:    { name: 'Mr. Park', ko: '박 사장님', skin: '#e3b48a', hair: '#8a8a8a', style: 'short', top: '#3b3b3b', wear: 'apron', acc: ['mustache'], old: 1 },
  doyoon:  { name: 'Do-yoon', ko: '도윤', skin: '#efc6a0', hair: '#222222', style: 'sidepart', top: '#2f3e5c', wear: 'coat' },
  byeol:   { name: 'Byeol', ko: '한별', skin: '#f6d3b5', hair: '#3a2318', style: 'ponytail', top: '#8a6fbf', wear: 'sweater', acc: ['starclip'] },
  clerk:   { name: 'Clerk', ko: '직원', skin: '#efc39b', hair: '#262626', style: 'short', top: '#2f8f5b', wear: 'vest' },
  staff:   { name: 'Staff', ko: '직원', skin: '#f3cba6', hair: '#3b2a20', style: 'bob', top: '#d9534f', wear: 'apron' },
  man:     { name: 'Man', ko: '남자', skin: '#e9be96', hair: '#2c2c2c', style: 'short', top: '#6d7a8c', wear: 'jacket' },
  woman:   { name: 'Woman', ko: '여자', skin: '#f4cfae', hair: '#4a2c1d', style: 'bob', top: '#e48aa6', wear: 'shirt' },
  kid:     { name: 'Kid', ko: '아이', skin: '#f3cfa8', hair: '#1f1f1f', style: 'bowl', top: '#4bb3d9', wear: 'tshirt', kid: 1, acc: ['cap'] },
  doctor:  { name: 'Doctor', ko: '의사', skin: '#ecc29b', hair: '#2a2a2a', style: 'sidepart', top: '#ffffff', wear: 'labcoat', acc: ['glasses'] },
  teacher: { name: 'Teacher', ko: '선생님', skin: '#f2cba5', hair: '#3a2a22', style: 'bob', top: '#7b6aa6', wear: 'cardigan', acc: ['glasses'] },
  driver:  { name: 'Driver', ko: '기사님', skin: '#e2b48c', hair: '#3a3a3a', style: 'short', top: '#3d5a80', wear: 'jacket', acc: ['cap'], old: 1 },
  officer: { name: 'Officer', ko: '경찰관', skin: '#ecc19a', hair: '#1e1e1e', style: 'short', top: '#253b6e', wear: 'uniform', acc: ['policecap'] },
  oldman:  { name: 'Old man', ko: '할아버지', skin: '#e0b08a', hair: '#e2e2e2', style: 'bald', top: '#7a6a55', wear: 'cardigan', acc: ['beard'], old: 1 },
  oldwoman:{ name: 'Old woman', ko: '할머니', skin: '#eec49d', hair: '#bdbdbd', style: 'bun', top: '#5d8a6b', wear: 'cardigan', old: 1 },
};

// ---------------------------------------------------------------- backgrounds
const R = (x, y, w, h, f, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${extra}/>`;
const C = (x, y, r, f, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${extra}/>`;
const P = (d, f, extra = '') => `<path d="${d}" fill="${f}" ${extra}/>`;
const window_ = (x, y, w, h, sky = '#bfe3f7') => R(x, y, w, h, sky, `stroke="#ffffff" stroke-width="6"`) + R(x + w / 2 - 2, y, 4, h, '#ffffff') + R(x, y + h / 2 - 2, w, 4, '#ffffff');
const shelf = (x, y, w, colors) => R(x, y, w, 6, '#8a6a4a') + colors.map((c, i) => R(x + 4 + i * (w - 8) / colors.length, y - 22 + (i % 3) * 3, (w - 8) / colors.length - 4, 22 - (i % 3) * 3, c, 'rx="2"')).join('');
const tree = (x, y, s = 1, c = '#6fa86b') => R(x - 4 * s, y, 8 * s, 40 * s, '#8a6a4a') + C(x, y - 6 * s, 28 * s, c) + C(x - 18 * s, y + 8 * s, 18 * s, c) + C(x + 18 * s, y + 8 * s, 18 * s, c);

const BG = {
  alley: () => R(0, 0, W, H, '#cfe8f5') + P('M0 0h120l40 170H0z', '#d9c2a3') + P('M400 0H280l-40 170h160z', '#cdb08f') +
    [20, 50, 80, 110].map(y => R(0, y, 120 - y * 0.2, 2, '#bfa57f')).join('') + [20, 50, 80, 110].map(y => R(280 + y * 0.2, y, 120, 2, '#b89b74')).join('') +
    P('M160 170l-40 70h160l-40-70z', '#a9a9a9') + R(150, 40, 6, 140, '#7a6a5a') + P('M0 30 Q150 60 400 25', 'none', 'stroke="#333" stroke-width="2"') +
    R(18, 110, 50, 70, '#3f6e5a', 'rx="4"') + C(60, 146, 3, '#e8c44a') + R(330, 120, 40, 34, '#6aa36a', 'rx="6"'),
  house: () => R(0, 0, W, H, '#cfe8f5') + R(30, 30, 340, 210, '#efe3cf') + P('M10 40L200 2L390 40z', '#7a4b3a') + R(165, 110, 70, 130, '#8a5a3c', 'rx="4"') +
    C(222, 175, 4, '#e8c44a') + R(140, 72, 120, 26, '#1b2340', 'rx="6"') + `<text x="200" y="91" font-family="Noto Sans KR, sans-serif" font-size="16" font-weight="700" fill="#f5c842" text-anchor="middle">별빛 하숙집</text>` +
    window_(55, 80, 70, 60) + window_(275, 80, 70, 60) + R(60, 200, 40, 40, '#b5673f', 'rx="4"') + C(80, 196, 20, '#5d9b5d') + R(300, 200, 40, 40, '#b5673f', 'rx="4"') + C(320, 194, 22, '#6faa62'),
  room: () => R(0, 0, W, H, '#e6e1f2') + R(0, 190, W, 50, '#c9b391') + window_(250, 30, 110, 90, '#cbe7f7') + R(238, 26, 20, 110, '#f2b8c6') + R(352, 26, 20, 110, '#f2b8c6') +
    R(20, 150, 170, 60, '#f7f3ea', 'rx="8"') + R(20, 135, 170, 22, '#9fb9e0', 'rx="8"') + R(30, 120, 50, 22, '#ffffff', 'rx="10"') + R(300, 150, 80, 8, '#8a6a4a') + R(310, 158, 6, 40, '#8a6a4a') + R(364, 158, 6, 40, '#8a6a4a'),
  kitchen: () => R(0, 0, W, H, '#dff0e8') + R(0, 20, W, 50, '#f7f7f2') + [0, 80, 160, 240, 320].map(x => R(x + 4, 24, 72, 42, '#cfe3da', 'rx="4"')).join('') +
    R(0, 175, W, 65, '#d8c3a2') + R(60, 150, 280, 18, '#b07d4f', 'rx="4"') + R(80, 168, 10, 50, '#8a5a3c') + R(310, 168, 10, 50, '#8a5a3c') +
    R(140, 120, 40, 30, '#ffffff', 'rx="10"') + R(150, 112, 20, 10, '#cccccc', 'rx="4"') + C(240, 140, 14, '#f2f2f2') + C(275, 140, 14, '#f2f2f2'),
  livingroom: () => R(0, 0, W, H, '#f3e7d3') + R(0, 190, W, 50, '#b98f62') + R(130, 40, 140, 80, '#2b2f3c', 'rx="6"') + R(138, 48, 124, 64, '#5a7fb5') + R(40, 140, 320, 60, '#7a9e8a', 'rx="16"') + R(30, 130, 340, 30, '#8bb09b', 'rx="12"'),
  rooftop: () => `<defs><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b878"/><stop offset="1" stop-color="#fbe0b0"/></linearGradient></defs>` + R(0, 0, W, H, 'url(#sun)') +
    P('M0 150h30v-40h30v20h40v-55h30v75h40v-30h35v50h30v-70h40v45h30v-25h40v30h35v150H0z', '#8f7aa8', 'opacity=".55"') + R(0, 185, W, 55, '#7fa38a') + R(0, 180, W, 8, '#d0d0d0') +
    R(300, 110, 70, 70, '#3f8f6a', 'rx="30"') + P('M20 90 L380 70', 'none', 'stroke="#555" stroke-width="2"') + R(70, 90, 26, 34, '#ffffff') + R(130, 86, 26, 30, '#f2b8c6') + R(60, 200, 40, 6, '#e8e8e8') + R(64, 206, 4, 26, '#ccc') + R(92, 206, 4, 26, '#ccc'),
  cafe: () => R(0, 0, W, H, '#ead7c0') + R(0, 0, W, 16, '#5a3e2b') + R(0, 175, W, 65, '#7a5338') + R(20, 150, 360, 30, '#a8754d') + R(40, 30, 140, 80, '#2f3a33', 'rx="6"') +
    [45, 60, 75, 90].map(y => R(52, y, 90 - (y % 30), 4, '#e9e3d0')).join('') + R(250, 100, 60, 50, '#c0c0c0', 'rx="6"') + R(262, 112, 36, 14, '#444') +
    `<path d="M300 16v26M200 16v34M100 16v20" stroke="#5a3e2b" stroke-width="2"/>` + C(300, 46, 10, '#f5c842') + C(200, 54, 10, '#f5c842') + C(100, 40, 10, '#f5c842') + R(340, 120, 30, 30, '#4f8a5b', 'rx="8"'),
  store: () => R(0, 0, W, H, '#f4f6f7') + R(0, 0, W, 20, '#2f8f5b') + shelf(10, 70, 160, ['#e94f4f', '#f2a541', '#3e7cb1', '#6faa62', '#f2b8c6', '#ffd75e']) + shelf(10, 120, 160, ['#f2a541', '#e94f4f', '#9fb9e0', '#6faa62', '#ffffff', '#3e7cb1']) +
    R(250, 30, 140, 150, '#c9e6f2', 'rx="6" stroke="#9cb" stroke-width="4"') + [60, 100, 140].map(y => R(256, y, 128, 3, '#9cb')).join('') +
    [270, 300, 330, 360].map((x, i) => R(x, 40, 16, 18, ['#e94f4f', '#3e7cb1', '#f2a541', '#6faa62'][i], 'rx="4"') + R(x, 80, 16, 18, ['#6faa62', '#ffd75e', '#e94f4f', '#3e7cb1'][i], 'rx="4"')).join('') + R(0, 185, W, 55, '#dfe3e6'),
  subway: () => R(0, 0, W, H, '#e8ecef') + R(0, 30, W, 70, '#2b3550') + [20, 150, 280].map(x => R(x, 38, 100, 54, '#3f5375', 'rx="8"')).join('') + R(0, 100, W, 6, '#3fa34d') +
    R(0, 160, W, 40, '#6d8fbf', 'rx="6"') + R(0, 200, W, 40, '#b8bec6') + [60, 140, 220, 300, 380].map(x => `<path d="M${x} 0v18" stroke="#aaa" stroke-width="3"/>` + C(x, 24, 7, 'none', 'stroke="#f2a541" stroke-width="3"')).join(''),
  street: () => R(0, 0, W, H, '#cfe8f5') + R(10, 40, 90, 160, '#e2b07a') + R(110, 20, 80, 180, '#9fb9e0') + R(200, 55, 100, 145, '#f2d38a') + R(310, 30, 85, 170, '#c7a0d8') +
    [[20, 60], [120, 40], [215, 75], [320, 50]].map(([x, y]) => R(x, y, 60, 18, '#1b2340', 'rx="3"')).join('') + R(0, 200, W, 40, '#b5b5b5') + R(0, 196, W, 6, '#e0e0e0') +
    [30, 70, 130, 160, 220, 260, 330, 360].map(x => R(x, 100, 18, 22, '#ffffff', 'opacity=".7"')).join(''),
  market: () => R(0, 0, W, H, '#f6e3c8') + [0, 135, 270].map((x, i) => P(`M${x} 40h130l-10 30H${x + 10}z`, ['#e94f4f', '#3e7cb1', '#f2a541'][i]) +
    [0, 1, 2, 3, 4].map(k => R(x + 12 + k * 24, 40, 12, 30, '#ffffff', 'opacity=".55"')).join('') + R(x + 10, 120, 110, 50, '#a8754d') +
    [0, 1, 2, 3].map(k => C(x + 28 + k * 26, 118, 12, ['#e94f4f', '#f2a541', '#6faa62', '#ffd75e'][(k + i) % 4])).join('')).join('') + R(0, 190, W, 50, '#c9b391'),
  park: () => R(0, 0, W, H, '#bfe3f7') + R(0, 110, W, 50, '#5ba7d1') + P('M0 120 Q100 70 200 115 Q300 70 400 120', 'none', 'stroke="#7a8597" stroke-width="6"') +
    [40, 120, 200, 280, 360].map(x => R(x - 2, 80, 4, 40, '#7a8597')).join('') + R(0, 155, W, 85, '#8cc47a') + tree(40, 150, .9) + tree(360, 145, 1.1, '#5f9c5b') + C(320, 40, 22, '#fff4c4'),
  hospital: () => R(0, 0, W, H, '#e6f1f7') + R(0, 180, W, 60, '#cfdde6') + R(280, 20, 100, 160, '#bcd7e6', 'rx="4"') + R(30, 130, 200, 60, '#ffffff', 'rx="10"') + R(30, 120, 60, 20, '#ffffff', 'rx="8" stroke="#cfdde6" stroke-width="2"') +
    R(300, 40, 6, 120, '#9aa') + R(292, 40, 22, 30, '#d8eef7', 'rx="6"') + R(170, 30, 50, 50, '#ffffff', 'rx="6"') + R(190, 38, 10, 34, '#e94f4f') + R(178, 50, 34, 10, '#e94f4f'),
  pharmacy: () => R(0, 0, W, H, '#f1f7f2') + R(0, 0, W, 22, '#2f8f5b') + R(185, 3, 30, 16, '#ffffff', 'rx="3"') + R(196, 5, 8, 12, '#2f8f5b') + R(190, 8, 20, 6, '#2f8f5b') +
    shelf(20, 80, 160, ['#ffffff', '#9fb9e0', '#f2b8c6', '#ffd75e', '#6faa62']) + shelf(220, 80, 160, ['#f2a541', '#ffffff', '#9fb9e0', '#e94f4f', '#ffffff']) + R(0, 170, W, 70, '#d9e8dc') + R(40, 150, 320, 30, '#ffffff', 'rx="6"'),
  office: () => R(0, 0, W, H, '#eceff3') + [20, 140, 260].map(x => R(x, 20, 110, 80, '#bcd3e8') + [30, 45, 60, 75, 90].map(y => R(x, y, 110, 3, '#ffffff')).join('')).join('') +
    R(0, 170, W, 70, '#c2c8cf') + R(40, 140, 140, 12, '#8a6a4a') + R(70, 100, 70, 44, '#2b2f3c', 'rx="4"') + R(76, 106, 58, 32, '#6fa3d8') + R(240, 140, 140, 12, '#8a6a4a') + R(270, 104, 70, 40, '#2b2f3c', 'rx="4"') + R(276, 110, 58, 28, '#f2d38a'),
  school: () => R(0, 0, W, H, '#cfe8f5') + R(40, 50, 320, 150, '#e9d8b8') + R(170, 20, 60, 40, '#e9d8b8') + C(200, 40, 12, '#ffffff', 'stroke="#555" stroke-width="2"') +
    [60, 110, 160, 230, 280, 330].map(x => window_(x - 15, 80, 34, 40)).join('') + R(175, 140, 50, 60, '#8a5a3c') + R(0, 200, W, 40, '#c9a46b'),
  classroom: () => R(0, 0, W, H, '#f0ead8') + R(50, 20, 300, 110, '#2f5a44', 'rx="4" stroke="#8a6a4a" stroke-width="8"') + `<text x="200" y="85" font-family="Noto Sans KR, sans-serif" font-size="30" fill="#e9f1ea" text-anchor="middle">한국어</text>` +
    R(0, 175, W, 65, '#c9a46b') + R(30, 165, 120, 14, '#a8754d') + R(250, 165, 120, 14, '#a8754d'),
  bus: () => R(0, 0, W, H, '#e6e9ed') + R(0, 25, W, 75, '#9fd0ea') + [0, 135, 270].map(x => R(x + 6, 25, 4, 75, '#c9ced5')).join('') + R(0, 100, W, 8, '#3fa34d') +
    R(20, 150, 150, 60, '#4b6fae', 'rx="10"') + R(230, 150, 150, 60, '#4b6fae', 'rx="10"') + R(0, 210, W, 30, '#8f969e') + `<path d="M0 12h400" stroke="#888" stroke-width="4"/>`,
  station: () => R(0, 0, W, H, '#dfe6ee') + R(0, 0, W, 30, '#b9c4d1') + R(110, 36, 180, 40, '#1b2340', 'rx="6"') + `<text x="200" y="63" font-family="Noto Sans KR, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">서울역 Seoul Station</text>` +
    R(0, 110, W, 70, '#e8eef4') + R(0, 110, W, 70, 'none', 'stroke="#2a63c4" stroke-width="6"') + [30, 130, 230, 330].map(x => R(x, 122, 70, 34, '#9fd0ea', 'rx="6"')).join('') + R(0, 190, W, 50, '#c2c8cf') + R(0, 186, W, 6, '#f5c842'),
  restaurant: () => R(0, 0, W, H, '#f3dcc0') + R(20, 20, 360, 40, '#ffffff', 'rx="4"') + [40, 110, 180, 250, 320].map(x => R(x, 30, 50, 6, '#b5543c') + R(x, 42, 40, 4, '#999')).join('') +
    R(0, 175, W, 65, '#b07d4f') + R(60, 150, 280, 20, '#8a5a3c', 'rx="6"') + C(150, 145, 18, '#ffffff') + C(150, 145, 12, '#e94f4f') + C(230, 145, 18, '#ffffff') + C(230, 145, 12, '#f2a541') + C(110, 70, 0, '#fff'),
  pcbang: () => R(0, 0, W, H, '#1d2238') + [20, 150, 280].map(x => R(x, 60, 100, 64, '#0b0e1a', 'rx="4"') + R(x + 6, 66, 88, 52, ['#4bb3d9', '#e94f4f', '#6faa62'][x % 3 === 0 ? 0 : 1], 'opacity=".75"')).join('') +
    R(0, 160, W, 80, '#2a2f4a') + R(10, 140, 380, 14, '#3a3f5a') + [0, 1, 2, 3, 4, 5].map(i => C(30 + i * 70, 20, 3, '#f5c842')).join(''),
  beach: () => R(0, 0, W, H, '#bfe6fa') + C(330, 50, 26, '#fff1a8') + R(0, 110, W, 60, '#3f9ad1') + P('M0 120 Q50 112 100 120 T200 120 T300 120 T400 120V130H0z', '#76bde3') + R(0, 165, W, 75, '#f1dca7') +
    P('M60 40 q6 -6 12 0 q6 -6 12 0', 'none', 'stroke="#2b2f3c" stroke-width="2"') + P('M110 60 q5 -5 10 0 q5 -5 10 0', 'none', 'stroke="#2b2f3c" stroke-width="2"'),
  mountain: () => R(0, 0, W, H, '#cfe8f5') + P('M0 170L80 70L140 130L220 40L300 120L360 80L400 110V240H0z', '#7aa37a') + P('M220 40L240 62L205 62z', '#ffffff') + R(0, 190, W, 50, '#a98a5e') + tree(50, 160, .7, '#4f8a5b') + tree(350, 165, .8, '#4f8a5b'),
  train: () => R(0, 0, W, H, '#e9e4dc') + [20, 150, 280].map(x => R(x, 30, 100, 70, '#9fd0ea', 'rx="12"') + P(`M${x} 90 L${x + 40} 60 L${x + 70} 85 L${x + 100} 70 V100 H${x}z`, '#7aa37a')).join('') +
    R(10, 130, 120, 90, '#7a3b4a', 'rx="14"') + R(140, 130, 120, 90, '#7a3b4a', 'rx="14"') + R(270, 130, 120, 90, '#7a3b4a', 'rx="14"') + R(0, 220, W, 20, '#8f8a84'),
  night: () => R(0, 0, W, H, '#1b2340') + C(330, 50, 22, '#fff4c4') + C(320, 44, 22, '#1b2340') + [[40, 30], [90, 60], [150, 25], [210, 55], [260, 20], [370, 90], [20, 100]].map(([x, y]) => C(x, y, 2, '#f5c842')).join('') +
    R(0, 130, 120, 110, '#2e3858') + R(280, 110, 120, 130, '#2e3858') + [20, 60, 300, 340].map(x => R(x, 150, 18, 18, '#f5c842', 'opacity=".7"')).join('') + R(200, 70, 6, 150, '#555d73') + C(203, 70, 12, '#ffe08a', 'opacity=".9"') + R(0, 210, W, 30, '#3a4466'),
  palace: () => R(0, 0, W, H, '#cfe8f5') + P('M0 120L70 60L130 100L200 50L280 95L340 65L400 100V140H0z', '#9bbf9a') + P('M60 120 Q200 70 340 120z', '#3d3d3d') + R(90, 118, 220, 14, '#b5543c') +
    R(100, 132, 200, 60, '#c96b4f') + [120, 160, 200, 240, 280].map(x => R(x - 6, 132, 12, 60, '#8a3b2e')).join('') + P('M80 122 Q200 92 320 122', 'none', 'stroke="#2e7a6a" stroke-width="5"') + R(0, 192, W, 48, '#d9d2c3'),
  shop: () => R(0, 0, W, H, '#f5eef2') + `<path d="M20 50h360" stroke="#888" stroke-width="4"/>` + [40, 80, 120, 160, 240, 280, 320, 360].map((x, i) => P(`M${x} 52 l-14 10 v60 h28 v-60z`, ['#e48aa6', '#6c8f72', '#3e7cb1', '#f2a541', '#2b2f3c', '#c7a0d8', '#e94f4f', '#9fb9e0'][i])).join('') +
    R(0, 180, W, 60, '#e0d4da') + R(170, 100, 60, 90, '#ffffff', 'stroke="#ccc" stroke-width="3"'),
  bank: () => R(0, 0, W, H, '#eef1f6') + R(0, 0, W, 24, '#24407a') + [30, 150, 270].map((x, i) => R(x, 60, 100, 70, '#cfe0f5', 'rx="6"') + R(x + 35, 40, 30, 18, '#1b2340', 'rx="4"') + `<text x="${x + 50}" y="54" font-size="13" fill="#f5c842" text-anchor="middle" font-family="sans-serif">${i + 1}</text>`).join('') +
    R(0, 130, W, 30, '#b9c4d1') + R(0, 160, W, 80, '#d6dce6'),
  post: () => R(0, 0, W, H, '#f7efe6') + R(0, 0, W, 22, '#d9534f') + R(40, 90, 60, 110, '#d9534f', 'rx="20"') + R(52, 110, 36, 6, '#2b2f3c') + R(150, 120, 230, 40, '#c9a46b') + R(0, 200, W, 40, '#dccbb6') +
    R(170, 90, 40, 30, '#f2d38a') + R(230, 95, 50, 25, '#e9d8b8') + R(300, 92, 40, 28, '#f2d38a'),
  airport: () => R(0, 0, W, H, '#e8edf2') + R(0, 20, W, 110, '#bfe3f7') + [0, 100, 200, 300].map(x => R(x, 20, 6, 110, '#b9c4d1')).join('') +
    P('M230 70 l60 -6 l20 -16 h8 l-8 20 l30 -2 l6 -6 h6 l-4 10 4 10 h-6 l-6 -6 -30 -2 8 20 h-8 l-20 -16 -60 -6z', '#ffffff') + R(20, 140, 160, 40, '#1b2340', 'rx="4"') +
    [150, 160, 170].map(y => R(30, y, 140, 4, '#f5c842', 'opacity=".8"')).join('') + R(0, 190, W, 50, '#c9d1da'),
  library: () => R(0, 0, W, H, '#efe6d6') + [10, 140, 270].map(x => R(x, 20, 120, 160, '#8a5a3c') + [50, 90, 130, 170].map(y => shelf(x + 4, y, 112, ['#b5543c', '#3e7cb1', '#6faa62', '#f2a541', '#7b6aa6', '#e9d8b8'])).join('')).join('') + R(0, 190, W, 50, '#c9a46b'),
  phone: () => R(0, 0, W, H, '#b9d0e8'),
};

const MOD = {
  night: `<rect width="${W}" height="${H}" fill="#101838" opacity=".45"/>` + [[30, 20], [120, 35], [250, 15], [360, 30]].map(([x, y]) => C(x, y, 2, '#f5c842')).join(''),
  rain: Array.from({ length: 40 }, (_, i) => `<path d="M${(i * 37) % 400} ${(i * 53) % 220} l-6 14" stroke="#5c7fa8" stroke-width="2" opacity=".7"/>`).join('') + `<rect width="${W}" height="${H}" fill="#5c6f8a" opacity=".18"/>`,
  snow: Array.from({ length: 45 }, (_, i) => C((i * 47) % 400, (i * 29) % 230, 2 + (i % 3), '#ffffff', 'opacity=".9"')).join(''),
  sunset: `<rect width="${W}" height="${H}" fill="#f28c38" opacity=".18"/>`,
};

// ---------------------------------------------------------------- characters
function hairBack(c, x) {
  const k = c.hair;
  switch (c.style) {
    case 'long': return P(`M${x - 46} 112 Q${x - 50} 60 ${x} 58 Q${x + 50} 60 ${x + 46} 112 L${x + 50} 200 H${x - 50}z`, k);
    case 'ponytail': return P(`M${x + 30} 80 Q${x + 75} 90 ${x + 58} 150 Q${x + 50} 120 ${x + 36} 104z`, k);
    case 'perm': return [[-40, 92], [-30, 70], [-10, 60], [12, 60], [32, 70], [42, 92], [-44, 112], [44, 112]].map(([dx, y]) => C(x + dx, y, 16, k, `stroke="${LINE}" stroke-width="1.5"`)).join('');
    case 'bob': return P(`M${x - 46} 120 Q${x - 50} 60 ${x} 60 Q${x + 50} 60 ${x + 46} 120 Q${x + 30} 130 ${x + 20} 122 H${x - 20} Q${x - 30} 130 ${x - 46} 120z`, k);
    case 'bun': return C(x, 62, 16, k, `stroke="${LINE}" stroke-width="2"`);
    default: return '';
  }
}
function hairFront(c, x) {
  const k = c.hair, s = `stroke="${LINE}" stroke-width="2.5" stroke-linejoin="round"`;
  switch (c.style) {
    case 'tousled': return P(`M${x - 44} 104 Q${x - 48} 64 ${x - 8} 62 Q${x + 34} 56 ${x + 44} 96 L${x + 36} 86 L${x + 30} 98 L${x + 18} 84 L${x + 8} 96 L${x - 6} 82 L${x - 16} 96 L${x - 28} 84 L${x - 36} 104z`, k, s);
    case 'spiky': return P(`M${x - 44} 100 L${x - 40} 70 L${x - 30} 74 L${x - 26} 56 L${x - 12} 66 L${x - 4} 50 L${x + 8} 64 L${x + 20} 52 L${x + 26} 68 L${x + 40} 62 L${x + 44} 100 L${x + 30} 82 L${x - 30} 82z`, k, s);
    case 'long': return P(`M${x - 44} 108 Q${x - 44} 64 ${x} 62 Q${x + 44} 64 ${x + 44} 108 L${x + 34} 86 Q${x} 92 ${x - 34} 86z`, k, s);
    case 'bowl': return P(`M${x - 44} 100 Q${x - 46} 58 ${x} 58 Q${x + 46} 58 ${x + 44} 100 L${x + 44} 92 H${x - 44}z`, k, s);
    case 'short': return P(`M${x - 43} 96 Q${x - 44} 62 ${x} 60 Q${x + 44} 62 ${x + 43} 96 Q${x + 30} 76 ${x} 78 Q${x - 30} 76 ${x - 43} 96z`, k, s);
    case 'sidepart': return P(`M${x - 43} 100 Q${x - 46} 60 ${x - 4} 60 Q${x + 44} 60 ${x + 44} 98 Q${x + 34} 74 ${x + 10} 74 Q${x - 20} 76 ${x - 43} 100z`, k, s);
    case 'ponytail': return P(`M${x - 44} 104 Q${x - 44} 62 ${x} 62 Q${x + 44} 62 ${x + 44} 104 Q${x + 30} 78 ${x - 6} 80 Q${x - 30} 84 ${x - 44} 104z`, k, s);
    case 'bob': return P(`M${x - 44} 104 Q${x - 44} 64 ${x} 64 Q${x + 44} 64 ${x + 44} 104 L${x + 36} 84 H${x - 36}z`, k, s);
    case 'perm': return [[-26, 70], [-8, 64], [10, 64], [28, 70]].map(([dx, y]) => C(x + dx, y + 4, 13, k, `stroke="${LINE}" stroke-width="1.5"`)).join('');
    case 'bun': return P(`M${x - 43} 98 Q${x - 44} 64 ${x} 64 Q${x + 44} 64 ${x + 43} 98 Q${x + 26} 74 ${x} 76 Q${x - 26} 74 ${x - 43} 98z`, k, s);
    case 'bald': return P(`M${x - 44} 104 Q${x - 46} 90 ${x - 38} 84 L${x - 34} 100z M${x + 44} 104 Q${x + 46} 90 ${x + 38} 84 L${x + 34} 100z`, k, s);
    default: return '';
  }
}
function torso(c, x) {
  const s = `stroke="${LINE}" stroke-width="3" stroke-linejoin="round"`;
  const kid = c.kid ? 0.82 : 1;
  const w = 66 * kid, top = c.kid ? 170 : 160;
  let out = P(`M${x - w} 245 Q${x - w} ${top} ${x} ${top - 4} Q${x + w} ${top} ${x + w} 245z`, c.top, s);
  const neck = R(x - 10, 140, 20, 26, c.skin, `stroke="${LINE}" stroke-width="2.5"`);
  switch (c.wear) {
    case 'hoodie': out += P(`M${x - 24} ${top - 2} Q${x} ${top + 22} ${x + 24} ${top - 2}`, 'none', `stroke="${LINE}" stroke-width="2.5"`) + R(x - 2, top + 16, 2, 30, '#ffffff') + R(x + 8, top + 16, 2, 26, '#ffffff'); break;
    case 'cardigan': out += P(`M${x} ${top} V245`, 'none', `stroke="${LINE}" stroke-width="2.5"`) + [200, 220].map(y => C(x + 6, y, 3, '#f5c842')).join('') + P(`M${x - 18} ${top - 2} L${x} ${top + 16} L${x + 18} ${top - 2}`, '#ffffff', `stroke="${LINE}" stroke-width="2"`); break;
    case 'apron': out += P(`M${x - 30} ${top + 10} H${x + 30} V245 H${x - 30}z`, c.name === 'Mr. Park' ? '#6b4a33' : '#ffffff', `stroke="${LINE}" stroke-width="2.5"`) + P(`M${x - 14} ${top - 2} L${x} ${top + 10} L${x + 14} ${top - 2}`, '#ffffff', `stroke="${LINE}" stroke-width="2"`); break;
    case 'stripe': out += [190, 210, 230].map(y => R(x - w + 10, y, 2 * w - 20, 6, '#ffffff', 'opacity=".8"')).join(''); break;
    case 'coat': out += P(`M${x - 20} ${top} L${x - 6} 245 M${x + 20} ${top} L${x + 6} 245`, 'none', `stroke="${LINE}" stroke-width="2.5"`) + R(x - 14, top - 6, 28, 18, '#bfbfbf', `rx="6" stroke="${LINE}" stroke-width="2"`); break;
    case 'labcoat': out += P(`M${x} ${top + 4} V245`, 'none', `stroke="${LINE}" stroke-width="2.5"`) + P(`M${x - 22} ${top + 4} Q${x - 30} 210 ${x - 6} 214`, 'none', `stroke="#2b2f3c" stroke-width="3"`) + C(x - 6, 216, 5, '#9aa'); break;
    case 'vest': out += P(`M${x - 30} ${top + 4} H${x + 30} V245 H${x - 30}z`, '#2f8f5b', `stroke="${LINE}" stroke-width="2"`) + R(x - 22, 200, 20, 10, '#ffffff', 'rx="2"'); break;
    case 'uniform': out += P(`M${x - 14} ${top - 2} L${x} ${top + 14} L${x + 14} ${top - 2}`, '#cfd8e8', `stroke="${LINE}" stroke-width="2"`) + R(x + 20, 196, 18, 14, '#f5c842', 'rx="3"'); break;
    case 'sweater': out += P(`M${x - 22} ${top - 2} Q${x} ${top + 12} ${x + 22} ${top - 2}`, 'none', `stroke="${LINE}" stroke-width="2.5"`) + R(x - w + 6, 236, 2 * w - 12, 8, '#ffffff', 'opacity=".4"'); break;
    case 'jacket': out += P(`M${x - 18} ${top - 2} L${x - 4} 245 M${x + 18} ${top - 2} L${x + 4} 245`, 'none', `stroke="${LINE}" stroke-width="2.5"`); break;
    default: out += P(`M${x - 18} ${top - 2} Q${x} ${top + 12} ${x + 18} ${top - 2}`, 'none', `stroke="${LINE}" stroke-width="2.5"`);
  }
  return neck + out;
}
function face(c, x, ex) {
  const y = 106, s = `stroke="${LINE}" stroke-width="3" stroke-linecap="round" fill="none"`;
  const ink = LINE;
  let eyes = '', mouth = '', brows = '', extra = '';
  const eyeOpen = (dx, r = 5.5, ry = 7) => `<ellipse cx="${x + dx}" cy="${y}" rx="${r}" ry="${ry}" fill="${ink}"/>` + C(x + dx + 2, y - 3, 2, '#ffffff');
  const L = -17, Rr = 17;
  switch (ex) {
    case 'happy': case 'laugh':
      eyes = `<path d="M${x + L - 7} ${y + 2} Q${x + L} ${y - 8} ${x + L + 7} ${y + 2}" ${s}/><path d="M${x + Rr - 7} ${y + 2} Q${x + Rr} ${y - 8} ${x + Rr + 7} ${y + 2}" ${s}/>`; break;
    case 'surprised':
      eyes = C(x + L, y, 8, '#ffffff', `stroke="${ink}" stroke-width="2.5"`) + C(x + L, y, 4, ink) + C(x + Rr, y, 8, '#ffffff', `stroke="${ink}" stroke-width="2.5"`) + C(x + Rr, y, 4, ink); break;
    case 'sad': case 'cry':
      eyes = ex === 'cry' ? `<path d="M${x + L - 7} ${y} Q${x + L} ${y + 6} ${x + L + 7} ${y}" ${s}/><path d="M${x + Rr - 7} ${y} Q${x + Rr} ${y + 6} ${x + Rr + 7} ${y}" ${s}/>` : eyeOpen(L, 5, 6) + eyeOpen(Rr, 5, 6);
      brows = `<path d="M${x + L - 9} ${y - 12} L${x + L + 6} ${y - 18}" ${s}/><path d="M${x + Rr + 9} ${y - 12} L${x + Rr - 6} ${y - 18}" ${s}/>`; break;
    case 'angry':
      eyes = eyeOpen(L, 5, 6) + eyeOpen(Rr, 5, 6);
      brows = `<path d="M${x + L - 9} ${y - 18} L${x + L + 7} ${y - 11}" ${s}/><path d="M${x + Rr + 9} ${y - 18} L${x + Rr - 7} ${y - 11}" ${s}/>`; break;
    case 'sly': case 'tired':
      eyes = `<path d="M${x + L - 7} ${y} H${x + L + 7}" ${s}/><path d="M${x + Rr - 7} ${y} H${x + Rr + 7}" ${s}/>` + `<path d="M${x + L - 5} ${y + 1} Q${x + L} ${y + 6} ${x + L + 5} ${y + 1}" fill="${ink}"/><path d="M${x + Rr - 5} ${y + 1} Q${x + Rr} ${y + 6} ${x + Rr + 5} ${y + 1}" fill="${ink}"/>`; break;
    case 'worried':
      eyes = eyeOpen(L, 5, 6) + eyeOpen(Rr, 5, 6);
      brows = `<path d="M${x + L - 8} ${y - 13} Q${x + L} ${y - 19} ${x + L + 7} ${y - 16}" ${s}/><path d="M${x + Rr + 8} ${y - 13} Q${x + Rr} ${y - 19} ${x + Rr - 7} ${y - 16}" ${s}/>`; break;
    case 'thinking':
      eyes = `<ellipse cx="${x + L + 2}" cy="${y - 2}" rx="5" ry="6.5" fill="${ink}"/><ellipse cx="${x + Rr + 2}" cy="${y - 2}" rx="5" ry="6.5" fill="${ink}"/>`;
      brows = `<path d="M${x + L - 8} ${y - 14} H${x + L + 6}" ${s}/><path d="M${x + Rr - 6} ${y - 18} Q${x + Rr} ${y - 22} ${x + Rr + 8} ${y - 18}" ${s}/>`; break;
    default:
      eyes = eyeOpen(L) + eyeOpen(Rr);
  }
  const my = y + 22;
  switch (ex) {
    case 'smile': case 'shy': mouth = `<path d="M${x - 9} ${my - 2} Q${x} ${my + 7} ${x + 9} ${my - 2}" ${s}/>`; break;
    case 'happy': mouth = P(`M${x - 11} ${my - 3} Q${x} ${my + 14} ${x + 11} ${my - 3}z`, '#b8403a', `stroke="${LINE}" stroke-width="2.5"`); break;
    case 'laugh': mouth = P(`M${x - 14} ${my - 4} Q${x} ${my + 18} ${x + 14} ${my - 4}z`, '#b8403a', `stroke="${LINE}" stroke-width="2.5"`) + P(`M${x - 8} ${my + 6} Q${x} ${my + 2} ${x + 8} ${my + 6} Q${x} ${my + 12} ${x - 8} ${my + 6}`, '#f08a8a'); break;
    case 'sad': mouth = `<path d="M${x - 8} ${my + 4} Q${x} ${my - 4} ${x + 8} ${my + 4}" ${s}/>`; break;
    case 'cry': mouth = P(`M${x - 10} ${my + 6} Q${x} ${my - 8} ${x + 10} ${my + 6}z`, '#b8403a', `stroke="${LINE}" stroke-width="2.5"`); break;
    case 'angry': mouth = R(x - 10, my - 3, 20, 8, '#ffffff', `stroke="${LINE}" stroke-width="2.5" rx="2"`); break;
    case 'surprised': mouth = `<ellipse cx="${x}" cy="${my + 2}" rx="6" ry="8" fill="#b8403a" stroke="${LINE}" stroke-width="2.5"/>`; break;
    case 'worried': mouth = `<path d="M${x - 9} ${my + 1} q3 -4 6 0 q3 4 6 0 q3 -4 6 0" ${s}/>`; break;
    case 'sly': mouth = `<path d="M${x - 8} ${my} Q${x + 2} ${my + 5} ${x + 10} ${my - 4}" ${s}/>`; break;
    case 'thinking': mouth = `<path d="M${x - 2} ${my + 1} H${x + 8}" ${s}/>`; break;
    case 'tired': mouth = `<path d="M${x - 6} ${my + 1} H${x + 6}" ${s}/>`; break;
    default: mouth = `<path d="M${x - 7} ${my} Q${x} ${my + 3} ${x + 7} ${my}" ${s}/>`;
  }
  if (['shy', 'happy', 'laugh'].includes(ex)) extra += `<ellipse cx="${x - 28}" cy="${y + 12}" rx="8" ry="4.5" fill="#f08a8a" opacity=".6"/><ellipse cx="${x + 28}" cy="${y + 12}" rx="8" ry="4.5" fill="#f08a8a" opacity=".6"/>`;
  if (ex === 'worried' || ex === 'surprised') extra += P(`M${x + 46} ${y - 28} q-7 12 0 14 q7 -2 0 -14z`, '#9fd0ea', `stroke="${LINE}" stroke-width="1.5"`);
  if (ex === 'angry') extra += `<path d="M${x + 40} ${y - 44} l6 6 m0 -6 l-6 6 M${x + 52} ${y - 48} l6 6 m0 -6 l-6 6" stroke="#d9534f" stroke-width="3" stroke-linecap="round"/>`;
  if (ex === 'thinking') extra += `<text x="${x + 46}" y="${y - 34}" font-size="28" font-weight="700" fill="${LINE}" font-family="sans-serif">?</text>`;
  if (ex === 'surprised') extra += `<text x="${x - 62}" y="${y - 34}" font-size="28" font-weight="700" fill="#d9534f" font-family="sans-serif">!</text>`;
  if (ex === 'cry') extra += P(`M${x - 22} ${y + 6} q-4 14 2 18 q6 -4 -2 -18z M${x + 22} ${y + 6} q4 14 -2 18 q-6 -4 2 -18z`, '#7cc4ef');
  if (ex === 'happy' || ex === 'laugh') extra += `<path d="M${x - 58} ${y - 30} l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#f5c842"/>`;
  if (ex === 'tired') extra += `<text x="${x + 44}" y="${y - 30}" font-size="16" font-weight="700" fill="${LINE}" font-family="sans-serif">z z</text>`;
  return brows + eyes + mouth + extra;
}
function accessories(c, x) {
  let out = '';
  for (const a of c.acc || []) {
    if (a === 'glasses') out += `<g fill="none" stroke="${LINE}" stroke-width="2.5"><circle cx="${x - 17}" cy="106" r="11"/><circle cx="${x + 17}" cy="106" r="11"/><path d="M${x - 6} 106h12"/></g>`;
    if (a === 'mustache') out += P(`M${x - 16} 124 Q${x} 116 ${x + 16} 124 Q${x} 122 ${x - 16} 124z`, '#6f6f6f', `stroke="${LINE}" stroke-width="1.5"`);
    if (a === 'beard') out += P(`M${x - 30} 118 Q${x} 160 ${x + 30} 118 Q${x} 140 ${x - 30} 118z`, '#e2e2e2', `stroke="${LINE}" stroke-width="1.5"`);
    if (a === 'cap') out += P(`M${x - 44} 84 Q${x} 44 ${x + 44} 84z`, c.top === '#4bb3d9' ? '#f2a541' : '#2b4f7a', `stroke="${LINE}" stroke-width="2.5"`) + P(`M${x + 20} 82 h40 q4 6 -6 8 h-34z`, c.top === '#4bb3d9' ? '#f2a541' : '#2b4f7a', `stroke="${LINE}" stroke-width="2.5"`);
    if (a === 'policecap') out += P(`M${x - 46} 82 Q${x} 40 ${x + 46} 82z`, '#1b2a50', `stroke="${LINE}" stroke-width="2.5"`) + R(x - 46, 78, 92, 10, '#111', 'rx="4"') + C(x, 64, 6, '#f5c842');
    if (a === 'starclip') out += `<path d="M${x + 26} 70 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#f5c842" stroke="${LINE}" stroke-width="1.5"/>`;
  }
  return out;
}
export function figure(id, x, ex = 'neutral', { dim = false, flip = false } = {}) {
  const c = CHAR[id] || CHAR.man;
  const scale = c.kid ? 0.86 : 1;
  const ty = c.kid ? 28 : 0;
  const head = `<ellipse cx="${x}" cy="104" rx="44" ry="47" fill="${c.skin}" stroke="${LINE}" stroke-width="3"/>` +
    `<ellipse cx="${x - 45}" cy="110" rx="7" ry="10" fill="${c.skin}" stroke="${LINE}" stroke-width="2.5"/><ellipse cx="${x + 45}" cy="110" rx="7" ry="10" fill="${c.skin}" stroke="${LINE}" stroke-width="2.5"/>`;
  const wrinkles = c.old ? `<path d="M${x - 30} 96 q4 -3 8 0 M${x + 22} 96 q4 -3 8 0" stroke="${LINE}" stroke-width="1.5" fill="none" opacity=".6"/>` : '';
  const body = hairBack(c, x) + torso(c, x) + head + wrinkles + face(c, x, ex) + hairFront(c, x) + accessories(c, x);
  const t = `translate(${x * (1 - scale)} ${ty + 245 * (1 - scale)}) scale(${scale})`;
  const flipT = flip ? ` translate(${2 * x} 0) scale(-1 1)` : '';
  return `<g transform="${t}${flipT}" ${dim ? 'filter="url(#dim)" opacity=".9"' : ''}>${body}</g>`;
}

export function panelSVG(bg, cast = [], speaker = null, ex = 'neutral', exprs = {}) {
  const [base, ...mods] = String(bg || 'room').split('+');
  const draw = BG[base] || BG.room;
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${(CHAR[speaker]?.name || 'Scene')}">` +
    `<defs><filter id="dim"><feColorMatrix type="saturate" values=".35"/><feComponentTransfer><feFuncR type="linear" slope=".85" intercept=".1"/><feFuncG type="linear" slope=".85" intercept=".1"/><feFuncB type="linear" slope=".85" intercept=".12"/></feComponentTransfer></filter></defs>`;
  svg += draw();
  // non-speakers first, speaker last (on top)
  const ordered = [...cast].sort((a, b) => (a[0] === speaker) - (b[0] === speaker));
  for (const [id, pos] of ordered) {
    const x = POS[pos] ?? POS.C;
    const isSp = id === speaker;
    const e = isSp ? ex : (exprs[id] || 'neutral');
    svg += figure(id, x, e, { dim: speaker && !isSp, flip: pos === 'R' });
  }
  for (const m of mods) svg += MOD[m] || '';
  return svg + '</svg>';
}

export function avatarSVG(id, ex = 'smile') {
  return `<svg viewBox="${(POS.C - 70)} 40 140 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="0" y="0" width="400" height="300" fill="#e9edf6"/>${figure(id, POS.C, ex)}</svg>`;
}
export function charName(id) { return CHAR[id]?.name || ''; }
export function charKo(id) { return CHAR[id]?.ko || ''; }
