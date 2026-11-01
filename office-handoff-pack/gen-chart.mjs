// สร้าง chart/office.mmd จาก view.mjs (แหล่งความจริงเดียว) — ไม่ต้องติดตั้งอะไร: node gen-chart.mjs
import { states, steps } from './view.mjs';
import { writeFileSync } from 'node:fs';
const ids = Object.keys(states);
const out = ['---', 'title: "ออฟฟิศทีมช่วยงาน"', 'config:', '  state:', '    rankSpacing: 26', '    nodeSpacing: 60', '---', 'stateDiagram-v2'];
ids.forEach((s, i) => out.push(`  s${i}: ${states[s].label}`));
out.push('  [*] --> s0');
for (const t of Object.values(steps)) {
  const note = t.gate ? ' [ด่านที่ 1]' : t.loop ? ' [ไม่เกิน 2 ครั้ง]' : '';
  out.push(`  s${ids.indexOf(t.from)} --> s${ids.indexOf(t.to)}: ${t.label}${note}`);
}
writeFileSync(new URL('./chart/office.mmd', import.meta.url), out.join('\n') + '\n');
