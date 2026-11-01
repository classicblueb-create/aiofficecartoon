// ติดตั้งงานออฟฟิศเข้า statechart-art:  node install.mjs ~/statechart-art
// - คัดลอกฟอนต์ Sarabun + OFL, office.js, layout.mmd
// - แพตช์ tools/lib/letter.js และ tools/lib/layout.js ให้อักษรไทย fallback ไป Sarabun (ละติน/ตัวเลขยังใช้ Kevin)
// รันซ้ำได้ (idempotent)
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = process.argv[2];
if (!root || !existsSync(join(root, 'tools/lib/letter.js'))) { console.error('ใช้: node install.mjs <path ของ statechart-art>'); process.exit(1); }

const cp = (from, to) => { mkdirSync(dirname(to), { recursive: true }); copyFileSync(join(here, from), to); };
for (const f of ['Sarabun-Regular.ttf', 'Sarabun-Bold.ttf', 'OFL.txt']) cp(`fonts/${f}`, join(root, 'tools/fonts', f));
cp('art/office.js', join(root, 'business/art/office.js'));
cp('chart/office.mmd', join(root, 'business/office/layout.mmd'));
mkdirSync(join(root, 'business/out'), { recursive: true });

function patch(file, pairs) {
  const p = join(root, file); let s = readFileSync(p, 'utf8');
  if (s.includes('Sarabun')) { console.log('ข้าม (แพตช์แล้ว):', file); return; }
  for (const [a, b] of pairs) { if (!s.includes(a)) throw new Error(`ไม่พบข้อความที่จะแพตช์ใน ${file}: ${a}`); s = s.replace(a, b); }
  writeFileSync(p, s); console.log('แพตช์แล้ว:', file);
}
const REG = `GlobalFonts.registerFromPath(path.join(FONTS, 'Sarabun-Regular.ttf'), 'Sarabun');\nGlobalFonts.registerFromPath(path.join(FONTS, 'Sarabun-Bold.ttf'), 'Sarabun Bold');\n`;
patch('tools/lib/letter.js', [
  ["GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSans-Bold.ttf'), FACES['sans-bold']);\n", "GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSans-Bold.ttf'), FACES['sans-bold']);\n" + REG],
  ['const fontOf = (face, px) => `${px}px "${FACES[face] || face}"`;', 'const fontOf = (face, px) => { const f = FACES[face] || face; return `${px}px "${f}", "${/Bold/.test(f) ? \'Sarabun Bold\' : \'Sarabun\'}"`; };'],
]);
patch('tools/lib/layout.js', [
  ["GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSerif-Bold.ttf'), 'Kevin Serif Bold');\n", "GlobalFonts.registerFromPath(path.join(FONTS, 'KevinSerif-Bold.ttf'), 'Kevin Serif Bold');\n" + REG],
  ['g.font = `${size}px "${o.face || (o.bold || style & 1 ? \'Kevin Sans Bold\' : \'Kevin Sans\')}"`;', 'const fam = o.face || (o.bold || style & 1 ? \'Kevin Sans Bold\' : \'Kevin Sans\'); g.font = `${size}px "${fam}", "${/Bold/.test(fam) ? \'Sarabun Bold\' : \'Sarabun\'}"`;'],
]);
console.log('เสร็จ. รัน: cd', root, '&& node business/art/office.js --fast');
