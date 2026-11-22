// Generates one animated "process card" SVG per project into assets/cards/.
// Logos are inlined as data URIs: an SVG served through an <img> tag cannot
// load anything external. Run: node scripts/build-cards.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets', 'cards');
mkdirSync(outDir, { recursive: true });

const logo = (file) => {
   const buf = readFileSync(join(root, 'assets', 'logos', file));
   const mime = file.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
   return `data:${mime};base64,${buf.toString('base64')}`;
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Greedy wrap on a monospace character budget.
const wrap = (text, max) => {
   const lines = [];
   let line = '';
   for (const word of text.split(' ')) {
      if ((line + ' ' + word).trim().length > max) {
         lines.push(line);
         line = word;
      } else line = (line + ' ' + word).trim();
   }
   if (line) lines.push(line);
   return lines;
};

const W = 860;
const H = 190;
const FONT = `'Cascadia Mono','JetBrains Mono','SF Mono',Consolas,'Courier New',monospace`;

// ---- live feed scenes (drawn inside a 280x130 pane at the card's right) ----
const PX = 556;
const PY = 44;
const PW = 284;
const PH = 128;

const scenes = {
   // Equalizer + now playing. `glitch` breaks it for the impostor card.
   equalizer: (color, glitch = false) => {
      const bars = [];
      const n = 22;
      const bw = 8;
      const gap = (PW - 32 - n * bw) / (n - 1);
      for (let i = 0; i < n; i++) {
         const x = PX + 16 + i * (bw + gap);
         const dur = (1.1 + ((i * 37) % 9) / 10).toFixed(2);
         const delay = (-((i * 53) % 17) / 10).toFixed(2);
         // Glitched: every other bar is red, a third are frozen mid-height.
         const bad = glitch && i % 2 === 1;
         const frozen = glitch && i % 3 === 0;
         const anim = frozen
            ? `transform-box:fill-box;transform-origin:bottom;transform:scaleY(${(0.2 + ((i * 29) % 7) / 10).toFixed(2)})`
            : `animation-duration:${bad ? '0.29' : dur}s;animation-delay:${delay}s`;
         bars.push(
            `<rect x="${x.toFixed(1)}" y="${PY + 30}" width="${bw}" height="58" rx="1" fill="${bad ? '#ff4d3d' : color}" opacity="${frozen ? 0.4 : 0.85}"${frozen ? '' : ' class="eq"'} style="${anim}"/>`,
         );
      }
      return `
    <g>${bars.join('')}</g>
    <line x1="${PX + 16}" y1="${PY + 89}" x2="${PX + PW - 16}" y2="${PY + 89}" stroke="#1e1e22"/>
    <text x="${PX + 16}" y="${PY + 108}" class="mono s10" fill="#c8c6bf">▶ ${glitch ? 'now pIaying' : 'now playing'} · track 07</text>
    <text x="${PX + PW - 16}" y="${PY + 108}" class="mono s10 dim" text-anchor="end">03:42</text>
    <rect x="${PX + 16}" y="${PY + 115}" width="${PW - 32}" height="2" fill="#1e1e22"/>
    <rect x="${PX + 16}" y="${PY + 115}" width="${PW - 32}" height="2" fill="${color}" class="progress"/>`;
   },

   // A page writing itself line by line, then exporting to a single .html.
   document: (color) => {
      const lines = [
         [0, 150], [0, 196], [0, 120], [14, 170], [14, 140], [0, 182],
      ];
      const page = lines
         .map(([indent, w], i) =>
            `<rect x="${PX + 34 + indent}" y="${PY + 38 + i * 12}" width="${w - 60}" height="4" rx="2" fill="${i === 0 ? color : '#3a3a40'}" class="ln" style="animation-delay:${(i * 0.45).toFixed(2)}s"/>`,
         )
         .join('');
      return `
    <rect x="${PX + 22}" y="${PY + 26}" width="168" height="90" rx="3" fill="#121214" stroke="#2a2a30"/>
    ${page}
    <g class="export">
      <text x="${PX + 204}" y="${PY + 64}" class="mono s10 dim">export</text>
      <text x="${PX + 204}" y="${PY + 80}" class="mono s12" fill="${color}">→ .html</text>
      <text x="${PX + 204}" y="${PY + 98}" class="mono s10" fill="#5fd08a">✓ 1 file</text>
    </g>`;
   },

   // A character sheet sketch with fog drifting over it.
   fog: (color) => `
    <g opacity=".55">
      <rect x="${PX + 24}" y="${PY + 30}" width="110" height="84" rx="3" fill="none" stroke="#3a3a40"/>
      <rect x="${PX + 34}" y="${PY + 42}" width="60" height="5" rx="2" fill="${color}"/>
      <rect x="${PX + 34}" y="${PY + 56}" width="88" height="3" rx="1.5" fill="#3a3a40"/>
      <rect x="${PX + 34}" y="${PY + 66}" width="74" height="3" rx="1.5" fill="#3a3a40"/>
      <rect x="${PX + 34}" y="${PY + 76}" width="82" height="3" rx="1.5" fill="#3a3a40"/>
      <rect x="${PX + 34}" y="${PY + 92}" width="18" height="12" rx="2" fill="none" stroke="#3a3a40"/>
      <rect x="${PX + 58}" y="${PY + 92}" width="18" height="12" rx="2" fill="none" stroke="#3a3a40"/>
      <rect x="${PX + 150}" y="${PY + 30}" width="110" height="84" rx="3" fill="none" stroke="#3a3a40"/>
      <rect x="${PX + 160}" y="${PY + 42}" width="70" height="5" rx="2" fill="${color}"/>
      <rect x="${PX + 160}" y="${PY + 56}" width="80" height="3" rx="1.5" fill="#3a3a40"/>
      <rect x="${PX + 160}" y="${PY + 66}" width="90" height="3" rx="1.5" fill="#3a3a40"/>
      <rect x="${PX + 160}" y="${PY + 76}" width="60" height="3" rx="1.5" fill="#3a3a40"/>
    </g>
    <g filter="url(#blur)" fill="${color}">
      <ellipse cx="${PX + 60}" cy="${PY + 90}" rx="90" ry="16" opacity=".16" class="drift a"/>
      <ellipse cx="${PX + 200}" cy="${PY + 60}" rx="110" ry="14" opacity=".13" class="drift b"/>
      <ellipse cx="${PX + 130}" cy="${PY + 112}" rx="120" ry="12" opacity=".18" class="drift c"/>
    </g>`,

   // A miniature of the game: trace meter breathing, one hostile row blinking.
   trace: (color) => {
      const rows = ['auditd', 'corridor-relay', 'systemd-joumald', 'postgres'];
      return `
    <text x="${PX + 16}" y="${PY + 34}" class="mono s9 dim" letter-spacing="2">TRACE</text>
    <rect x="${PX + 62}" y="${PY + 26}" width="${PW - 78}" height="10" fill="none" stroke="#1e1e22"/>
    <rect x="${PX + 64}" y="${PY + 28}" width="${PW - 82}" height="6" fill="${color}" class="tracebar"/>
    ${rows
       .map((r, i) => {
          const y = PY + 58 + i * 16;
          const bad = r === 'systemd-joumald';
          return `<g${bad ? ' class="hostile"' : ''}>${bad ? `<rect x="${PX + 10}" y="${y - 11}" width="${PW - 20}" height="15" fill="#ff4d3d" opacity=".12"/>` : ''}<text x="${PX + 16}" y="${y}" class="mono s10 dim">${[1664, 8861, 20117, 9128][i]}</text><text x="${PX + 70}" y="${y}" class="mono s10" fill="${bad ? '#ff4d3d' : '#c8c6bf'}">${r}</text></g>`;
       })
       .join('')}
    <text x="${PX + 16}" y="${PY + 122}" class="mono s10" fill="#5fd08a">forensic@mail02:~$ <tspan fill="#c8c6bf">kill 20117</tspan></text>`;
   },
};

const card = (p) => {
   const h = !!p.hostile;
   const desc = wrap(p.desc, 52);
   // Three lines is all the room above the tag row.
   if (desc.length > 3) throw new Error(`${p.file}: description wraps to ${desc.length} lines, max 3`);
   const tags = [];
   let tx = 128;
   for (const t of p.tags) {
      const w = t.length * 6.6 + 14;
      if (tx + w > 540) break;
      tags.push(
         `<rect x="${tx}" y="155" width="${w.toFixed(1)}" height="17" rx="3" fill="none" stroke="#2a2a30"/><text x="${(tx + 7).toFixed(1)}" y="167" class="mono s10 dim">${esc(t)}</text>`,
      );
      tx += w + 6;
   }
   const name = esc(p.name);
   const accent = h ? '#ff4d3d' : p.color;
   const line = h ? '#3a1714' : '#1e1e22';

   // The impostor gets: an RGB-split title, a status flipping to HOSTILE, a
   // failed integrity check instead of tags, a red-shifted logo, and tear bands
   // (copies of the card body clipped to strips) shearing sideways.
   const title = h
      ? `<g class="rgb"><text x="125" y="70" class="mono name" fill="#ff4d3d" opacity=".75">${name}</text><text x="131" y="71" class="mono name" fill="#34d0c4" opacity=".6">${name}</text></g>
    <text x="128" y="70" class="mono name" fill="${p.color}">${name}</text>`
      : `<text x="128" y="70" class="mono name" fill="${p.color}">${name}</text>`;
   const status = h
      ? `<circle cx="${W - 92}" cy="14" r="3.5" fill="#ff4d3d" class="dot"/>
    <text x="${W - 20}" y="18" class="mono lbl flipA" text-anchor="end" style="fill:#5fd08a">RUNNING</text>
    <text x="${W - 20}" y="18" class="mono lbl flipB" text-anchor="end" style="fill:#ff4d3d">HOSTILE</text>`
      : `<circle cx="${W - 92}" cy="14" r="3.5" fill="${p.statColor ?? '#5fd08a'}" class="dot"/>
    <text x="${W - 20}" y="18" class="mono lbl" text-anchor="end" style="fill:${p.statColor ?? '#5fd08a'}">${p.stat}</text>`;
   const footer = h
      ? `<text x="128" y="167" class="mono s10 warn" style="fill:#ff4d3d">⚠ INTEGRITY CHECK FAILED · signature mismatch · expected: plisto</text>`
      : tags.join('');
   const logoImg = h
      ? `<image href="${logo(p.logo)}" x="29" y="58" width="68" height="68" filter="url(#red)" opacity=".8"/>
    <image href="${logo(p.logo)}" x="35" y="59" width="68" height="68" filter="url(#cyan)" opacity=".55"/>`
      : `<image href="${logo(p.logo)}" x="32" y="58" width="68" height="68" preserveAspectRatio="xMidYMid meet"/>`;
   const bands = [[36, 14], [88, 9], [140, 18]];
   const tearDefs = h ? bands.map(([y, bh], i) => `<clipPath id="band${i}"><rect x="0" y="${y}" width="${W}" height="${bh}"/></clipPath>`).join('') : '';
   const tears = h
      ? `${bands.map((_, i) => `<use href="#body" clip-path="url(#band${i})" class="t${i}"/>`).join('')}
    <rect x="0" y="0" width="${W}" height="2" fill="#ff4d3d" opacity=".35" class="sweep"/>`
      : '';

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(p.label)}: ${esc(p.desc)}">
  <style>
    .mono { font-family: ${FONT}; }
    .s9 { font-size: 9px; } .s10 { font-size: 10px; } .s12 { font-size: 12px; }
    .dim { fill: #6a6862; }
    .lbl { font-size: 10px; letter-spacing: 2px; fill: #6a6862; }
    .name { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
    .desc { font-size: 12.5px; fill: #a8a69f; }
    .dot { animation: dot 2.4s ease-in-out infinite; }
    @keyframes dot { 50% { opacity: .25; } }
    .eq { transform-box: fill-box; transform-origin: bottom; animation: eq 1.4s ease-in-out infinite alternate; }
    @keyframes eq { 0% { transform: scaleY(.15); } 35% { transform: scaleY(.7); } 70% { transform: scaleY(.35); } 100% { transform: scaleY(.95); } }
    .progress { transform-box: fill-box; transform-origin: left; animation: prog 24s linear infinite; }
    @keyframes prog { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    .ln { transform-box: fill-box; transform-origin: left; transform: scaleX(0); animation: ln 6s ease-out infinite; }
    @keyframes ln { 0% { transform: scaleX(0); } 12%, 85% { transform: scaleX(1); } 95%, 100% { transform: scaleX(0); } }
    .export { opacity: 0; animation: exp 6s linear infinite; }
    @keyframes exp { 0%, 52% { opacity: 0; } 58%, 85% { opacity: 1; } 95%, 100% { opacity: 0; } }
    .drift { animation: drift 14s ease-in-out infinite alternate; }
    .drift.b { animation-duration: 19s; animation-direction: alternate-reverse; }
    .drift.c { animation-duration: 11s; }
    @keyframes drift { from { transform: translateX(-40px); } to { transform: translateX(60px); } }
    .tracebar { transform-box: fill-box; transform-origin: left; animation: tr 5s ease-in-out infinite; }
    @keyframes tr { 0% { transform: scaleX(.08); } 70% { transform: scaleX(.86); fill: #ff4d3d; } 76% { transform: scaleX(.3); } 100% { transform: scaleX(.08); } }
    .hostile, .warn { animation: dot 1.2s steps(2) infinite; }
    .rgb { animation: rgb 2.6s steps(1) infinite; }
    @keyframes rgb { 0%, 100% { transform: none; } 30% { transform: translateX(-3px); } 34% { transform: translateX(2px); } 70% { transform: translate(4px, -1px); } 73% { transform: none; } }
    .flipA { animation: flipA 3.2s steps(1) infinite; }
    .flipB { opacity: 0; animation: flipB 3.2s steps(1) infinite; }
    @keyframes flipA { 0%, 55% { opacity: 1; } 56%, 72% { opacity: 0; } 73%, 100% { opacity: 1; } }
    @keyframes flipB { 0%, 55% { opacity: 0; } 56%, 72% { opacity: 1; } 73%, 100% { opacity: 0; } }
    .t0 { animation: t0 2.3s steps(1) infinite; }
    .t1 { animation: t1 3.7s steps(1) infinite; }
    .t2 { animation: t2 2.9s steps(1) infinite; }
    @keyframes t0 { 0%, 100% { transform: translateX(0); } 12% { transform: translateX(-14px); } 16% { transform: translateX(9px); } 20% { transform: translateX(0); } 64% { transform: translateX(22px); } 67% { transform: translateX(0); } }
    @keyframes t1 { 0%, 100% { transform: translateX(0); } 40% { transform: translateX(30px); } 43% { transform: translateX(-8px); } 46% { transform: translateX(0); } }
    @keyframes t2 { 0%, 100% { transform: translateX(0); } 22% { transform: translateX(-24px); } 25% { transform: translateX(0); } 80% { transform: translateX(12px); } 82% { transform: translateX(-5px); } 85% { transform: translateX(0); } }
    .sweep { animation: sweep 4.5s linear infinite; }
    @keyframes sweep { from { transform: translateY(-4px); } to { transform: translateY(${H + 4}px); } }
  </style>
  <defs>
    <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" y="2" fill="#000" opacity=".22"/></pattern>
    <filter id="blur" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="red"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 .3  0 0 0 0 .24  0 0 0 1 0"/></filter>
    <filter id="cyan"><feColorMatrix type="matrix" values="0 0 0 0 .2  0 0 0 0 .82  0 0 0 0 .77  0 0 0 1 0"/></filter>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="10"/></clipPath>
    <clipPath id="pane"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath>
    ${tearDefs}
  </defs>
  <g clip-path="url(#frame)">
   <g id="body">
    <rect width="${W}" height="${H}" fill="${h ? '#0d0808' : '#0a0a0b'}"/>
    <rect width="3" height="${H}" fill="${accent}"/>

    <rect width="${W}" height="28" fill="${h ? '#130909' : '#0e0e10'}"/>
    <line x1="0" y1="28" x2="${W}" y2="28" stroke="${line}"/>
    <text x="20" y="18" class="mono lbl">PID ${p.pid} · USER ${esc(p.user ?? 'altervayne')} · ${esc(p.kind)}</text>
    ${status}

    <rect x="22" y="48" width="88" height="88" rx="10" fill="${accent}" opacity=".08" filter="url(#glow)"/>
    <rect x="20" y="46" width="92" height="92" rx="10" fill="#0e0e10" stroke="${line}"/>
    ${logoImg}

    ${title}
    ${desc.map((l, i) => `<text x="128" y="${96 + i * 17}" class="mono desc">${esc(l)}</text>`).join('\n    ')}
    ${footer}

    <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="#0e0e10" stroke="${line}"/>
    <text x="${PX + 10}" y="${PY + 14}" class="mono lbl" style="font-size:9px${h ? ';fill:#ff4d3d' : ''}">LIVE FEED · ${esc(p.feed)}</text>
    <g clip-path="url(#pane)">${p.scene}</g>
   </g>
    ${tears}
    <rect width="${W}" height="${H}" fill="url(#scan)"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${h ? '#5a1f1a' : '#2a2a30'}"/>
</svg>
`;
};

const projects = [
   {
      file: 'campaigns-of-the-mist',
      pid: 1664,
      name: 'campaigns-of-the-mist',
      label: 'Campaigns of the Mist',
      kind: 'WEB APP · PWA',
      stat: 'RUNNING',
      color: '#fae8c3',
      logo: 'mist.png',
      desc: 'A campaign workspace for tabletop RPGs like Legend in the Mist. Started as one character sheet, grew into a home for a whole campaign.',
      tags: ['React', 'TypeScript', 'IndexedDB', 'PWA', 'Astro', 'Tailwind'],
      feed: 'fog density 73%',
      scene: scenes.fog('#fae8c3'),
   },
   {
      file: 'documinter',
      pid: 4471,
      name: 'documinter',
      label: 'Documinter',
      kind: 'WEB + WINDOWS',
      stat: 'RUNNING',
      color: '#b5ead7',
      logo: 'documinter.svg',
      desc: 'A WYSIWYG documentation editor, on the web and as a native Windows app. Exports a whole document as one self-contained HTML file. No server, no account.',
      tags: ['React', 'TypeScript', 'Tauri', 'Rust', 'IndexedDB', 'PWA'],
      feed: 'drafting',
      scene: scenes.document('#b5ead7'),
   },
   {
      file: 'plisto',
      pid: 8801,
      name: 'plisto',
      label: 'Plisto',
      kind: 'WINDOWS',
      stat: 'RUNNING',
      color: '#4fb8d4',
      logo: 'plisto.svg',
      desc: 'A calm, native desktop app for organizing and playing a local music library, from loose files to albums. Fully offline.',
      tags: ['Tauri', 'Rust', 'React', 'TypeScript', 'SQLite'],
      feed: 'audio out',
      scene: scenes.equalizer('#4fb8d4'),
   },
   {
      file: 'into-the-corridor',
      pid: 12080,
      name: 'into-the-corridor',
      label: 'Into the Corridor',
      kind: 'GAME · BROWSER',
      stat: 'TRACING',
      statColor: '#ff8c1a',
      color: '#ff8c1a',
      logo: 'intothecorridor.svg',
      desc: "A terminal game. You are a data forensic agent pulling a mainframe's secrets while the system traces you. The game this page is cosplaying.",
      tags: ['React', 'TypeScript', 'Vite', 'Web Audio'],
      feed: 'mail02',
      scene: scenes.trace('#ff8c1a'),
   },
   {
      file: 'hostile',
      pid: 20117,
      name: 'pIisto',
      label: 'pIisto',
      user: 'r00t',
      kind: 'W1ND0WS',
      stat: 'RUNNING',
      color: '#4fb8d4',
      logo: 'plisto.svg',
      desc: 'A c█lm, n4tive desktop app for organ!zing and pl█ying a local music library. Def1nitely. N0thing to s█e here. Keep scr0lling.',
      tags: [],
      feed: 'SIGNAL CORRUPT',
      hostile: true,
      scene: scenes.equalizer('#4fb8d4', true),
   },
];

for (const p of projects) {
   writeFileSync(join(outDir, `${p.file}.svg`), card(p));
   console.log('wrote assets/cards/' + p.file + '.svg');
}
