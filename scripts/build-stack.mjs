// Generates assets/stack.svg: the stack as mounted modules, one pane per
// directory. A module used by a project card is lit and lists the PIDs of the
// cards running it (PIDs match scripts/build-cards.mjs).
// Run: node scripts/build-stack.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Project PID -> the tags it uses (same as the portfolio's project data).
const RUNNING = {
   1664: ['Vite', 'React', 'TypeScript', 'IndexedDB', 'Tailwind', 'shadcn/ui', 'Astro', 'Vercel'],
   4471: ['React', 'TypeScript', 'Tauri', 'Rust', 'Vite', 'IndexedDB', 'Vercel'],
   8801: ['Tauri', 'Rust', 'React', 'TypeScript', 'Vite', 'SQLite'],
   12080: ['Vite', 'React', 'TypeScript', 'Vercel'],
};
const pidsFor = (tech) =>
   Object.entries(RUNNING)
      .filter(([, tags]) => tags.includes(tech))
      .map(([pid]) => pid);

const DIRS = [
   ['languages', ['TypeScript', 'JavaScript', 'Rust', 'SQL', 'WLanguage']],
   ['frontend', ['React', 'Next.js', 'Astro', 'Tailwind', 'shadcn/ui', 'Framer Motion', 'Three.js', 'Vite']],
   ['backend', ['Node.js', 'Express', 'REST APIs', '.NET']],
   ['desktop', ['Tauri', 'WINDEV']],
   ['storage', ['SQLite', 'MariaDB', 'MongoDB', 'HFSQL', 'IndexedDB']],
   ['tools', ['Git', 'Linux', 'Vercel', 'Postman']],
];

const W = 860;
const M = 20;
const GAP = 12;
const COLS = 3;
const PW = (W - 2 * M - GAP * (COLS - 1)) / COLS;
const ROW = 19;
const MAX_ROWS = Math.max(...DIRS.map(([, l]) => l.length));
const PH = 30 + MAX_ROWS * ROW + 12;
const TOP = 46;
const H = TOP + 2 * PH + GAP + 46;
const FONT = `'Cascadia Mono','JetBrains Mono','SF Mono',Consolas,'Courier New',monospace`;

const total = DIRS.reduce((n, [, l]) => n + l.length, 0);
const live = DIRS.reduce((n, [, l]) => n + l.filter((t) => pidsFor(t).length).length, 0);

let order = 0;
const panes = DIRS.map(([dir, techs], i) => {
   const x = M + (i % COLS) * (PW + GAP);
   const y = TOP + Math.floor(i / COLS) * (PH + GAP);
   const rows = techs
      .map((t, j) => {
         const ry = y + 46 + j * ROW;
         const pids = pidsFor(t);
         const on = pids.length > 0;
         const delay = (0.3 + order++ * 0.06).toFixed(2);
         return `<g class="in" style="animation-delay:${delay}s">
        ${on ? `<rect x="${x + 6}" y="${ry - 13}" width="${PW - 12}" height="${ROW - 2}" fill="#ff8c1a" opacity=".06"/>` : ''}
        <circle cx="${x + 16}" cy="${ry - 4}" r="3" fill="${on ? '#ff8c1a' : '#2e2e34'}"${on ? ' class="pulse"' : ''}/>
        <text x="${x + 28}" y="${ry}" class="t"${on ? '' : ' style="fill:#8a8880"'}>${esc(t)}</text>
        <text x="${x + PW - 12}" y="${ry}" class="pid" text-anchor="end"${on ? ' style="fill:#ff8c1a"' : ''}>${on ? pids.join(' ') : 'standby'}</text>
      </g>`;
      })
      .join('\n      ');
   return `<g>
      <rect x="${x}" y="${y}" width="${PW}" height="${PH}" fill="#0e0e10" stroke="#1e1e22"/>
      <line x1="${x}" y1="${y + 24}" x2="${x + PW}" y2="${y + 24}" stroke="#1e1e22"/>
      <text x="${x + 10}" y="${y + 16}" class="lbl">/usr/stack/<tspan style="fill:#c8c6bf">${dir}/</tspan></text>
      <text x="${x + PW - 10}" y="${y + 16}" class="lbl" text-anchor="end">${techs.length}</text>
      ${rows}
    </g>`;
}).join('\n    ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack. ${DIRS.map(([d, l]) => `${d}: ${l.join(', ')}`).join('. ')}.">
  <style>
    text { font-family: ${FONT}; }
    .t { font-size: 12px; fill: #e2e0d8; }
    .pid { font-size: 9.5px; letter-spacing: 1px; fill: #4a4844; }
    .lbl { font-size: 10px; letter-spacing: 1.5px; fill: #6a6862; }
    .in { opacity: 0; animation: in .25s ease-out forwards; }
    @keyframes in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
    .pulse { animation: pulse 2.4s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: .35; } }
    .sweep { animation: sweep 7s linear infinite; animation-delay: 3s; opacity: 0; }
    @keyframes sweep { 0% { opacity: 0; transform: translateY(0); } 2% { opacity: 1; } 40% { opacity: 1; transform: translateY(${H}px); } 41%, 100% { opacity: 0; transform: translateY(${H}px); } }
    .done { opacity: 0; animation: in .3s ease-out forwards; animation-delay: ${(0.5 + total * 0.06).toFixed(2)}s; }
  </style>
  <defs>
    <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" y="2" fill="#000" opacity=".22"/></pattern>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#34d0c4" stop-opacity="0"/>
      <stop offset="1" stop-color="#34d0c4" stop-opacity=".16"/>
    </linearGradient>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="10"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="#0a0a0b"/>
    <rect width="${W}" height="28" fill="#0e0e10"/>
    <line x1="0" y1="28" x2="${W}" y2="28" stroke="#1e1e22"/>
    <text x="20" y="18" class="lbl">MOUNTED MODULES · ${total}</text>
    <text x="${W - 20}" y="18" class="lbl" text-anchor="end"><tspan style="fill:#ff8c1a">● ${live} in use by a process above</tspan> · ○ standby</text>

    ${panes}

    <text x="20" y="${H - 18}" class="lbl done"><tspan style="fill:#5fd08a">■ scan complete.</tspan> ${total} modules verified. 0 hostile. (the hostile one is up there.)</text>
    <g class="sweep"><rect x="0" y="-40" width="${W}" height="40" fill="url(#beam)"/><rect x="0" y="-1" width="${W}" height="1" fill="#34d0c4" opacity=".5"/></g>
    <rect width="${W}" height="${H}" fill="url(#scan)"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="#2a2a30"/>
</svg>
`;

writeFileSync(join(root, 'assets', 'stack.svg'), svg);
console.log(`assets/stack.svg written (${total} modules, ${live} in use)`);
