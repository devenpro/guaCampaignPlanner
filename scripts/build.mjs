// Build script: concatenates src/ files into dist/app.js and dist/app.css.
// Run with `node scripts/build.mjs` (or `npm run build` if execution policy allows).
//
// Walk order is alphabetical, depth-first. Numeric prefixes on filenames and
// folders (10-part1/, 20-part2a/, 30-part2b/, styles/10-part1/, styles/20-part2/)
// control concatenation order. To reorder, rename — no manifest needed.

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const targets = [
  { src: 'src',        out: 'dist/app.js',  ext: '.js',  skipDir: 'styles' },
  { src: 'src/styles', out: 'dist/app.css', ext: '.css' },
];

function walk(dir, ext, skipDir) {
  return readdirSync(dir).sort().flatMap(name => {
    if (name === skipDir) return [];
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p, ext, skipDir);
    return p.endsWith(ext) ? [p] : [];
  });
}

mkdirSync('dist', { recursive: true });

for (const { src, out, ext, skipDir } of targets) {
  const files = walk(src, ext, skipDir);
  const banner = `/* Campaign Planner — built from ${files.length} source files (see src/) */\n`;
  const body = files.map(f =>
    `\n/* ===== ${relative('.', f).replace(/\\/g, '/')} ===== */\n` + readFileSync(f, 'utf8')
  ).join('');
  writeFileSync(out, banner + body);
  console.log(`✓ ${out}  ←  ${files.length} files  (${(banner + body).length} bytes)`);
}
