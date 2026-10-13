import { h, setMain, toast, today, progressBar, openSheet, closeSheet } from '../ui.js';
import { S, save, getProfiles, switchProfile, addProfile, deleteProfile, exportBackup, importBackup, toCode, fromCode, currentStreak } from '../store.js';
import { koreanVoices, speak } from '../tts.js';
import { applySettings, go, markPicked } from '../main.js';
import { wordsLearnedCount } from '../progress.js';
import { canRecognize, browserHint } from '../speech.js';

function seg(options, current, onPick) {
  return h('div', { class: 'seg' }, options.map(([val, label]) => h('button', { 'aria-pressed': String(current === val), onclick: (e) => {
    e.currentTarget.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    e.currentTarget.setAttribute('aria-pressed', 'true'); onPick(val);
  } }, label)));
}

export default async function () {
  const st = S(), set = st.settings;
  const t = today();
  // 12-week heatmap
  const start = t - (t % 7) - 7 * 11 - 3;
  const heat = h('div', { class: 'heat', 'aria-label': 'Study days in the last 12 weeks' });
  for (let w = 0; w < 12; w++) {
    const col = h('div', { class: 'wk' });
    for (let d = 0; d < 7; d++) {
      const day = start + w * 7 + d, log = st.days[day];
      const lvl = !log ? '' : log.g ? 'l2' : (log.r || log.n) ? 'l1' : '';
      col.append(h('i', { class: lvl, title: day <= t ? '' : '' }));
    }
    heat.append(col);
  }
  const voices = koreanVoices();
  const voiceSel = h('select', { id: 'voice', onchange: (e) => { set.voice = e.target.value; save(); applySettings(); speak('안녕하세요'); } },
    h('option', { value: '' }, 'Automatic (best available)'), voices.map(v => h('option', { value: v.name, selected: v.name === set.voice }, v.name)));
  const p = getProfiles();
  const m = setMain(
    h('h1', {}, st.name ? `${st.name}'s progress` : 'Your progress'),
    h('div', { class: 'stat-row' },
      h('div', { class: 'stat' }, h('b', {}, currentStreak()), h('span', {}, 'day streak')),
      h('div', { class: 'stat' }, h('b', {}, st.streak.best || 0), h('span', {}, 'best streak')),
      h('div', { class: 'stat' }, h('b', {}, wordsLearnedCount()), h('span', {}, 'words learned'))),
    h('div', { class: 'card', style: { marginTop: '12px' } },
      h('div', { class: 'row' }, h('b', { class: 'grow' }, 'Phase 1 · Core 1,000'), h('span', { class: 'muted' }, `${wordsLearnedCount(1)} / 925`)), progressBar(wordsLearnedCount(1) / 925),
      h('div', { class: 'row', style: { marginTop: '12px' } }, h('b', { class: 'grow' }, 'Phase 2 · Conversation 3,000'), h('span', { class: 'muted' }, `${wordsLearnedCount(2)} / 2,079`)), progressBar(wordsLearnedCount(2) / 2079),
      h('div', { class: 'section-title' }, 'Last 12 weeks'), heat,
      h('p', { class: 'small muted', style: { marginTop: '8px' } }, 'Light green: studied. Dark green: daily goal met.')),

    h('div', { class: 'section-title' }, 'Daily goal'),
    h('div', { class: 'card' }, seg([[5, '15 min · 5 words'], [10, '30 min · 10 words'], [15, '60 min · 15 words']], set.newPerDay, (v) => { set.newPerDay = v; set.minutes = { 5: 15, 10: 30, 15: 60 }[v]; save(); toast('Daily goal updated'); })),

    h('div', { class: 'section-title' }, 'Display'),
    h('div', { class: 'card' },
      h('div', { class: 'field' }, h('label', {}, 'Text size'), seg([['normal', 'Normal'], ['large', 'Large'], ['xl', 'Extra large']], set.size, (v) => { set.size = v; save(); applySettings(); })),
      h('div', { class: 'field' }, h('label', {}, 'Theme'), seg([['auto', 'Match device'], ['light', 'Light'], ['dark', 'Dark']], set.theme, (v) => { set.theme = v; save(); applySettings(); })),
      h('div', { class: 'field' }, h('label', {}, 'English under Korean in stories'), seg([[true, 'Show'], [false, 'Hide until tapped']], set.showEn, (v) => { set.showEn = v; save(); }))),

    h('div', { class: 'section-title' }, 'Voice'),
    h('div', { class: 'card' },
      h('div', { class: 'field' }, h('label', { for: 'voice' }, 'Korean voice'), voiceSel,
        !voices.length ? h('p', { class: 'small muted' }, 'No Korean voice found on this device. iPhone/iPad: Settings → Accessibility → Spoken Content → Voices → Korean. Android: Settings → Text-to-speech → install Korean. Windows: Settings → Time & language → Speech → Add voices.') : null),
      h('div', { class: 'field' }, h('label', {}, 'Speaking speed'), seg([[0.75, 'Slower'], [0.9, 'Normal'], [1, 'Natural']], set.rate, (v) => { set.rate = v; save(); applySettings(); speak('천천히 말해 주세요'); })),
      h('p', { class: 'small muted' }, canRecognize() ? 'Microphone checks work in this browser.' : browserHint())),

    h('div', { class: 'section-title' }, 'Learners on this device'),
    h('div', { class: 'card' },
      h('div', { class: 'stack' }, p.list.map(x => h('div', { class: 'row' },
        h('span', { class: 'unit-num', style: { background: x.color, color: '#fff', width: '40px', height: '40px' } }, (x.name || '?').slice(0, 1).toUpperCase()),
        h('span', { class: 'grow' }, x.name || 'Unnamed', x.id === p.cur ? h('span', { class: 'pill', style: { marginLeft: '8px' } }, 'you') : null),
        x.id !== p.cur ? h('button', { class: 'btn', onclick: () => { switchProfile(x.id); markPicked(); applySettings(); go('#/today'); } }, 'Switch') : null))),
      h('div', { class: 'btn-row', style: { marginTop: '12px' } },
        h('button', { class: 'btn', onclick: () => { addProfile(''); markPicked(); applySettings(); go('#/welcome'); } }, 'Add a learner'),
        h('button', { class: 'btn', onclick: () => {
          const input = h('input', { type: 'text', value: st.name, id: 'rn' });
          openSheet(h('div', {}, h('h2', {}, 'Change name'), h('div', { class: 'field' }, h('label', { for: 'rn' }, 'Name'), input),
            h('button', { class: 'btn btn-primary btn-block', onclick: () => { st.name = input.value.trim(); save(true); closeSheet(); go('#/me'); } }, 'Save')));
        } }, 'Change my name'))),

    h('div', { class: 'section-title' }, 'Backup & move to another device'),
    h('div', { class: 'card' },
      h('p', { class: 'muted' }, 'Your progress lives in this browser. Save a backup file (or copy the backup code) and restore it on another phone, tablet or computer.'),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => {
          const blob = new Blob([exportBackup()], { type: 'application/json' });
          const a = h('a', { href: URL.createObjectURL(blob), download: `starlight-house-${(st.name || 'backup').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json` });
          document.body.append(a); a.click(); a.remove(); toast('Backup file saved');
        } }, 'Save backup file'),
        h('button', { class: 'btn', onclick: async () => {
          const code = toCode(exportBackup());
          try { await navigator.clipboard.writeText(code); toast('Backup code copied'); }
          catch (e) { openSheet(h('div', {}, h('h2', {}, 'Backup code'), h('p', { class: 'muted' }, 'Select all and copy it:'), h('textarea', { readonly: true }, code))); }
        } }, 'Copy backup code'),
        h('button', { class: 'btn', onclick: () => {
          const ta = h('textarea', { id: 'rc', placeholder: 'Paste a backup code here' });
          const file = h('input', { type: 'file', accept: '.json,application/json' });
          const doRestore = (text) => { try { importBackup(text); applySettings(); closeSheet(); toast('Progress restored'); go('#/today'); } catch (e) { toast(e.message || 'That backup could not be read'); } };
          file.onchange = async () => { const f = file.files[0]; if (f) doRestore(await f.text()); };
          openSheet(h('div', {}, h('h2', {}, 'Restore progress'), h('p', { class: 'muted' }, 'This replaces the progress for the current learner.'),
            h('div', { class: 'field' }, h('label', {}, 'Choose a backup file'), file),
            h('div', { class: 'field' }, h('label', { for: 'rc' }, 'Or paste a backup code'), ta),
            h('button', { class: 'btn btn-primary btn-block', onclick: () => { const v = ta.value.trim(); if (!v) return; doRestore(v.startsWith('{') ? v : fromCode(v)); } }, 'Restore')));
        } }, 'Restore'))),

    h('div', { class: 'section-title' }, 'More'),
    h('div', { class: 'btn-row' },
      h('a', { class: 'btn', href: '#/placement' }, 'Retake placement test'),
      h('a', { class: 'btn', href: '#/words' }, 'All my words'),
      h('button', { class: 'btn', onclick: () => {
        const ta = h('textarea', { id: 'fb', placeholder: 'Which sentence or screen, and what looks wrong?' });
        openSheet(h('div', {}, h('h2', {}, 'Report a problem'), h('p', { class: 'muted' }, 'Notes are saved here. Use "Copy all reports" and send them to whoever set up this site so they can fix them.'), ta,
          h('div', { class: 'btn-row', style: { marginTop: '10px' } },
            h('button', { class: 'btn btn-primary', onclick: () => { if (ta.value.trim()) { st.flags.push({ at: new Date().toISOString(), text: ta.value.trim(), where: location.hash }); save(true); toast('Saved'); closeSheet(); } } }, 'Save report'),
            h('button', { class: 'btn', onclick: async () => { const txt = st.flags.map(f => `${f.at} ${f.where}: ${f.text}`).join('\n') || '(no reports)'; try { await navigator.clipboard.writeText(txt); toast('Copied'); } catch (e) { ta.value = txt; } } }, `Copy all reports (${st.flags.length})`))));
      } }, 'Report a problem')),
    h('div', { class: 'section-title' }, 'About'),
    h('div', { class: 'card small' },
      h('p', {}, 'Starlight House (별빛 하숙집) teaches the National Institute of Korean Language\'s learner vocabulary: about 925 basic words in Phase 1 and 2,079 intermediate words in Phase 2, always inside sentences.'),
      h('p', { class: 'muted' }, 'Word list source: 국립국어원 「한국어 학습용 어휘 목록」 (2003), Korea Open Government License Type 1. Story, sentences and art are original to this course. Video clips are played from YouTube and belong to their owners. Fonts: Atkinson Hyperlegible, Noto Sans KR, Gowun Batang (SIL Open Font License).')));
}
