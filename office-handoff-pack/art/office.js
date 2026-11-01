'use strict';
// ร่างข้อ 3 — plate "ออฟฟิศทีมช่วยงาน" แบบแบน ตามแบบ business/art/order.js
// !! ยังไม่ได้รัน ไม่เคยเห็นภาพที่ได้ ห้ามอ้างว่าใช้ได้จนกว่าจะรันและดูภาพจริง !!
// วิธีใช้: คัดลอกไปไว้ที่ statechart-art/business/art/office.js และ
//   mkdir -p business/office business/out && node ../office-handoff-pack/gen-chart.mjs แล้วคัดลอก chart/office.mmd -> business/office/layout.mmd
// ก่อนรันต้องฝังฟอนต์ไทย (Sarabun) ใน tools/lib/layout.js (Kevin Serif ไม่มีอักษรไทย) — ยังไม่ได้ทำ
const path = require('path');
const { plate } = require('../../tools/lib/storybook');
const { layOut, mapper, contentBox, saveShapes } = require('../../tools/lib/layout');
const TC = require('../../tools/lib/tagchart');
const { person } = require('../../tools/lib/people');
const { C } = require('./shop');

const FAST = process.argv.includes('--fast');
const HERE = path.join(__dirname, '..');

// สถานะ -> คนที่ยืนข้างกล่อง (ลำดับ s0..s7 ตรงกับ view.mjs/gen-chart.mjs)
const CAST = [
  { seed: 'owner',  hair: 'short', color: C.rose,  hat: null },   // s0 ว่าง — เจ้าของ
  { seed: 'trend',  hair: 'bob',   color: C.mint },               // s1 นักจับเทรนด์
  { seed: 'idea',   hair: 'bun',   color: C.lilac },              // s2 นักคิดคอนเทนต์
  { seed: 'script', hair: 'wavy',  color: C.sky },                // s3 นักเขียนสคริป
  { seed: 'box',    hair: 'short', color: C.ochre },              // s4 ตู้รออนุมัติ
  { seed: 'owner2', hair: 'short', color: C.rose },               // s5 เจ้าของอนุมัติ
  { seed: 'video',  hair: 'bob',   color: C.blush },              // s6 ช่างวิดีโอ AI
  { seed: 'edit',   hair: 'bun',   color: C.sage },               // s7 นักตัดต่อรีล
];

async function main() {
  const L = await layOut(path.join(HERE, 'office/layout.mmd'), { face: 'Sarabun', svgOut: path.join(HERE, 'out/office-layout.svg') });
  const P = plate({ id: 'office', w: 216, h: 216, ppm: FAST ? 5 : 10, seed: 'office-1', paper: 'hotpress' });
  const m = mapper(contentBox(L), { x: 8, y: 52, w: 200, h: 156 });
  saveShapes(path.join(HERE, 'out/office-pele.json'), L, m);

  P.text('ออฟฟิศทีมช่วยงาน', 11, 30, { size: 14 });
  P.italic('จากเทรนด์ถึงโพสต์ มีด่านอนุมัติหนึ่งด่าน', 12.5, 40, { face: 'serif-bold', size: 4.2 });

  L.nodes.forEach((n, i) => {
    const c = CAST[i % CAST.length], x = m.X(n.cx) + (m.k * n.w) / 2 + 7, y = m.Y(n.cy) + 10;
    person(P, x, y, 0.6, { seed: c.seed, pose: 'stand', hair: c.hair, shirt: { color: c.color }, look: -0.6 });
  });

  TC.draw(P, L, m, { style: 'ticket', labelsBeside: true, stopShort: 3.4, bounds: { x0: 4, x1: 212 }, lineColor: '#a8443b', startColor: '#a8443b', pinColor: (n) => ['#cf4e43', '#3f7fae', '#e0b04f'][Math.round(n.cy) % 3], numbers: () => '' });
  const out = await P.finish(path.join(HERE, 'out/office.png'), { sizes: [['-preview.png', 1080]] });
  console.log(out);
}
main().catch((e) => { console.error(e); process.exit(1); });
