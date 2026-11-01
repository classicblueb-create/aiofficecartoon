'use strict';
// ออฟฟิศบนเกาะลอย — เกาะใหญ่เกาะเดียว 6 โซน + โต๊ะเจ้าของกลางเกาะ (ลายเส้นดินสอแบบ statechart-art)
// !! ร่างที่ยังไม่ได้รัน ไม่เคยเห็นภาพ ตำแหน่ง/สัดส่วนต้องปรับหลังดูภาพจริง !!
// รัน: cd ~/statechart-art && node business/art/island.js --fast   (ติดตั้งด้วย install.mjs ก่อน)
const path = require('path');
const { plate } = require('../../tools/lib/storybook');
const D = require('../../tools/lib/draw');
const { person } = require('../../tools/lib/people');
const { C } = require('./shop');

const FAST = process.argv.includes('--fast');
const OUT = path.join(__dirname, '..', 'out');
const RED = '#ac4f40';

// 6 โซนวางเป็นวงรอบเกาะ (หลัง→หน้า) เจ้าของอยู่กลาง ลำดับ 1→5 คือเส้นทางด้ายแดง 6 หลังบ้านไม่อยู่ในเส้นทาง
const ZONES = [
  { n: 1, name: 'หาและคิด',          roof: C.mint,  x: 52,  y: 104, roles: ['นักจับเทรนด์', 'นักคิดคอนเทนต์'], shirts: [C.mint, C.lilac] },
  { n: 2, name: 'เขียนและอนุมัติ',    roof: C.sky,   x: 108, y: 92,  roles: ['นักเขียนสคริป', 'ตู้รออนุมัติ (ด่านที่ 1)'], shirts: [C.sky] },
  { n: 3, name: 'ผลิต',              roof: C.rose,  x: 164, y: 104, roles: ['ช่างวิดีโอ AI', 'บรรณารักษ์ไฟล์', 'นักเสียง', 'นักทำปก', 'นักตัดต่อรีล'], shirts: [C.blush, C.sage, C.ochre] },
  { n: 4, name: 'ปล่อยและเรียนรู้',   roof: C.ochre, x: 168, y: 138, roles: ['ผู้ปล่อยงาน (ด่านที่ 2)', 'นักวัดผล'], shirts: [C.ochre, C.sky] },
  { n: 5, name: 'รายได้',            roof: C.sage,  x: 108, y: 150, roles: ['โต๊ะขาย'], shirts: [C.sage] },
  { n: 6, name: 'หลังบ้าน',          roof: C.lilac, x: 48,  y: 138, roles: ['โปรดิวเซอร์', 'ตรวจถูกต้อง/สิทธิ์', 'คลังความรู้', 'ผู้คุมงบ'], shirts: [C.lilac, C.mint] },
];
const OWNER = { x: 108, y: 120 };

function house(P, x, by, w, h, roof) {
  P.shape([[[x - w / 2, by], [x + w / 2, by], [x + w / 2, by - h], [x - w / 2, by - h]]], { fill: C.cream });
  P.shape([[[x - w / 2 - 2, by - h], [x + w / 2 + 2, by - h], [x, by - h - h * 0.62]]], { fill: roof });
  P.shape([D.rrect(x - 2.2, by - h * 0.6, x + 2.2, by, 0.8)], { fill: C.wood, w: 0.8 });
  P.shape([D.rrect(x + w / 2 - 6, by - h * 0.75, x + w / 2 - 2.4, by - h * 0.4, 0.6)], { fill: C.sky, w: 0.7 });
}
function pin(P, x, y, color) { P.shape([D.ell(x, y, 1.1, 1.1)], { fill: color, w: 0.6 }); }
function cloud(P, cx, cy, s) {
  for (const [dx, dy, rx, ry] of [[-6, 1, 6, 4], [0, -2, 7, 5], [6, 1, 6, 4], [0, 2, 10, 3.4]]) P.shape([D.ell(cx + dx * s, cy + dy * s, rx * s, ry * s)], { fill: 'paper', w: 0.8 });
}


// ---------- ของประดับ (ยังไม่ได้รัน) ----------
const rnd = (() => { let a = 7; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })(); // ตำแหน่งสุ่มแบบคงที่
function tree(P, x, by, s = 1, c = C.sageDeep) {
  P.shape([D.rrect(x - 0.9 * s, by - 6 * s, x + 0.9 * s, by, 0.4)], { fill: C.woodDeep, w: 0.7 });
  P.shape([D.ell(x, by - 9 * s, 4.6 * s, 5.4 * s)], { fill: c, w: 0.9 });
  P.shape([D.ell(x - 1.6 * s, by - 11 * s, 2.2 * s, 2.4 * s)], { fill: C.sage, w: 0.5 });
}
function pine(P, x, by, s = 1) {
  P.shape([[[x - 4 * s, by - 3 * s], [x + 4 * s, by - 3 * s], [x, by - 11 * s]]], { fill: C.sageDeep, w: 0.8 });
  P.shape([[[x - 3 * s, by - 8 * s], [x + 3 * s, by - 8 * s], [x, by - 15 * s]]], { fill: C.sage, w: 0.8 });
  P.ink([[x, by - 3 * s], [x, by]], { nib: 0.3 });
}
function bush(P, x, by, s = 1) { P.shape([D.ell(x, by - 1.6 * s, 3.2 * s, 2.2 * s)], { fill: C.sage, w: 0.8 }); }
function flower(P, x, by, c) { P.ink([[x, by], [x, by - 2.6]], { nib: 0.14 }); P.shape([D.ell(x, by - 3.2, 1, 1)], { fill: c, w: 0.5 }); }
function rock(P, x, by, s = 1) { P.shape([D.ell(x, by - 1.2 * s, 2.6 * s, 1.5 * s)], { fill: C.steel, w: 0.7 }); }
function lamp(P, x, by) { P.ink([[x, by], [x, by - 8]], { nib: 0.22 }); P.shape([D.ell(x, by - 9, 1.5, 1.7)], { fill: C.gold, w: 0.6 }); }
function fence(P, x0, x1, by) { P.ink([[x0, by - 2.4], [x1, by - 2.4]], { nib: 0.16 }); for (let x = x0; x <= x1; x += 2.6) P.ink([[x, by], [x, by - 3.6]], { nib: 0.16 }); }
function balloon(P, x, y, c1, c2, s = 1) {
  P.shape([D.ell(x, y, 6 * s, 7.4 * s)], { fill: c1, w: 0.9 });
  P.shape([[[x - 1.6 * s, y - 7 * s], [x + 1.6 * s, y - 7 * s], [x + 1.2 * s, y + 7 * s], [x - 1.2 * s, y + 7 * s]]], { fill: c2, w: 0.5 });
  P.ink([[x - 3 * s, y + 7 * s], [x - 1.6 * s, y + 11 * s]], { nib: 0.12 }); P.ink([[x + 3 * s, y + 7 * s], [x + 1.6 * s, y + 11 * s]], { nib: 0.12 });
  P.shape([D.rrect(x - 2 * s, y + 11 * s, x + 2 * s, y + 14 * s, 0.4)], { fill: C.wood, w: 0.6 });
}
function windmill(P, x, by, s = 1) {
  P.shape([[[x - 4 * s, by], [x + 4 * s, by], [x + 2.6 * s, by - 14 * s], [x - 2.6 * s, by - 14 * s]]], { fill: C.cream });
  P.shape([[[x - 3.6 * s, by - 14 * s], [x + 3.6 * s, by - 14 * s], [x, by - 19 * s]]], { fill: C.rose });
  for (const a of [0.5, 2.07, 3.64, 5.21]) P.shape([[[x, by - 14 * s], [x + Math.cos(a) * 9 * s - Math.sin(a) * 1.4 * s, by - 14 * s + Math.sin(a) * 9 * s + Math.cos(a) * 1.4 * s], [x + Math.cos(a) * 9 * s + Math.sin(a) * 1.4 * s, by - 14 * s + Math.sin(a) * 9 * s - Math.cos(a) * 1.4 * s]]], { fill: C.wood, w: 0.5 });
}
function waterfall(P, x, y0, y1) {
  P.shape([[[x - 4, y0], [x + 4, y0], [x + 3, y1], [x - 3, y1]]], { fill: C.sky, w: 0.8 });
  for (const dx of [-2, 0, 2]) P.ink([[x + dx, y0 + 2], [x + dx * 0.8, y1 - 2]], { nib: 0.1, color: '#6d95ad' });
  for (const [dx, r] of [[-4, 2.4], [0, 3], [4, 2.4]]) P.shape([D.ell(x + dx, y1 + 1, r, r * 0.8)], { fill: 'paper', w: 0.6 });
}
function bird(P, x, y) { P.ink([[x - 3, y + 1], [x - 1.4, y - 0.6], [x, y + 0.6], [x + 1.4, y - 0.6], [x + 3, y + 1]], { nib: 0.14 }); }
function sparkle(P, x, y, r = 1.4) { P.ink([[x - r, y], [x + r, y]], { nib: 0.14 }); P.ink([[x, y - r], [x, y + r]], { nib: 0.14 }); }

async function main() {
  const P = plate({ id: 'island', w: 216, h: 216, ppm: FAST ? 5 : 10, seed: 'office-island-1', paper: 'hotpress' });

  P.label('ออฟฟิศทีมช่วยงาน', 108, 20, { size: 9 });
  P.italic('เกาะลอยของ solo creator · เทรนด์ → โพสต์ มีสองด่านให้คุณกด', 108, 29, { face: 'serif-bold', size: 3.4, align: 'center' });

  // เมฆไกลๆ
  cloud(P, 26, 52, 0.9); cloud(P, 190, 60, 1.0); cloud(P, 34, 196, 1.1); cloud(P, 184, 190, 0.9); cloud(P, 108, 206, 1.0); cloud(P, 14, 118, 0.8); cloud(P, 204, 126, 0.8);
  balloon(P, 30, 78, C.rose, C.paper, 1.0); balloon(P, 188, 84, C.sky, C.ochre, 0.9); balloon(P, 150, 48, C.mint, C.blush, 0.7);
  for (const [x, y] of [[70, 44], [92, 50], [128, 40], [60, 62]]) bird(P, x, y);
  for (const [x, y] of [[16, 36], [200, 40], [78, 36], [140, 58], [18, 150], [200, 156], [120, 36]]) sparkle(P, x, y, 1.2 + rnd());

  // ใต้เกาะ (หินสีเบจ) แล้วค่อยหน้าเกาะ (หญ้า)
  const under = [[22, 118], [194, 118], [176, 146], [150, 166], [118, 188], [100, 190], [76, 168], [46, 148]];
  P.shape([under], { fill: C.beige || '#dcc59c' });
  for (const [x, y, l] of [[60, 134, 10], [92, 146, 14], [130, 140, 12], [150, 128, 9]]) P.ink([[x, y], [x + 2, y + l]], { nib: 0.14 });
  P.shape([D.ell(108, 118, 88, 36)], { fill: C.sage });
  cloud(P, 50, 160, 0.9); cloud(P, 168, 164, 0.9);

  // ของประดับบนเกาะ (หลัง→หน้า): ต้นไม้ พุ่ม ดอกไม้ ก้อนหิน รั้ว โคมไฟ
  windmill(P, 84, 86, 0.9);
  for (const [x, y, s2, c] of [[30, 112, 1.0, C.sageDeep], [188, 110, 1.0, C.sage], [76, 96, 0.8, C.sage], [140, 94, 0.8, C.sageDeep], [24, 126, 0.9, C.sage], [196, 128, 0.9, C.sageDeep]]) tree(P, x, y, s2, c);
  pine(P, 36, 108, 0.9); pine(P, 182, 104, 0.9); pine(P, 70, 122, 0.7);
  for (const [x, y] of [[70, 112], [150, 114], [84, 148], [134, 146], [26, 140], [190, 144], [92, 128], [126, 128]]) bush(P, x, y, 0.9);
  for (let i = 0; i < 26; i++) { const x = 30 + rnd() * 156, y = 96 + rnd() * 60; if (Math.hypot((x - 108) / 84, (y - 122) / 32) < 1) flower(P, x, y, [C.rose, C.ochre, C.lilac, C.blush][i % 4]); }
  for (const [x, y] of [[96, 108], [122, 106], [78, 134], [146, 136], [58, 120], [158, 120]]) rock(P, x, y, 0.8);
  fence(P, 128, 148, 156); lamp(P, 88, 112); lamp(P, 130, 112); lamp(P, 78, 152);
  // ทางหิน วงรอบโต๊ะเจ้าของ
  for (let a = 0; a < 6.28; a += 0.8) P.shape([D.ell(OWNER.x + Math.cos(a) * 14, OWNER.y + 7 + Math.sin(a) * 5, 1.6, 0.9)], { fill: C.beige || '#dcc59c', w: 0.5 });
  waterfall(P, 108, 153, 184);

  // ด้ายแดง: 1→2→3→4→5 ผ่านจุดหน้าบ้านของแต่ละโซน แล้ว 4→1 (เรียนรู้) วนอ้อมด้านหลัง
  const A = (z) => [z.x, z.y + 3];
  const route = ZONES.slice(0, 5).map(A);
  P.ink(route, { nib: 0.22, color: RED });
  const z4 = A(ZONES[3]), z1 = A(ZONES[0]);
  P.ink([z4, [196, 120], [170, 66], [108, 56], [54, 66], [30, 96], z1], { nib: 0.2, color: RED });
  // ด่านอนุมัติ: ตู้รออนุมัติ(โซน 2) → โต๊ะเจ้าของ
  P.ink([A(ZONES[1]), [OWNER.x, OWNER.y - 2]], { nib: 0.22, color: RED });

  // วาดหลัง→หน้า
  const order = [...ZONES].sort((a, b) => a.y - b.y);
  let ownerDone = false;
  const drawOwner = () => {
    P.shape([[[OWNER.x - 9, OWNER.y], [OWNER.x + 9, OWNER.y], [OWNER.x + 9, OWNER.y + 4], [OWNER.x - 9, OWNER.y + 4]]], { fill: C.wood });
    person(P, OWNER.x, OWNER.y, 0.6, { seed: 'owner', pose: 'stand', hair: 'short', shirt: { color: C.rose }, look: 0 });
    P.label('เจ้าของ', OWNER.x, OWNER.y + 10, { size: 2.6 });
  };
  for (const z of order) {
    if (!ownerDone && z.y > OWNER.y) { drawOwner(); ownerDone = true; }
    house(P, z.x, z.y, 18, 11, z.roof);
    z.shirts.forEach((c, i) => person(P, z.x - 9 + i * 9, z.y + 9, 0.5, { seed: `z${z.n}-${i}`, pose: 'stand', hair: ['short', 'bob', 'bun'][i % 3], shirt: { color: c }, look: 0.2 }));
    P.label(`${z.n} ${z.name}`, z.x, z.y + 15, { size: 2.9 });
    P.label(z.roles.join(' · '), z.x, z.y + 19, { size: 1.9, face: 'sans' });
    pin(P, z.x, z.y + 3, ['#dfb456', '#4485b0', '#cc5548'][z.n % 3]);
  }
  if (!ownerDone) drawOwner();

  const out = await P.finish(path.join(OUT, 'island.png'), { sizes: [['-preview.png', 1080]] });
  console.log(out);
}
main().catch((e) => { console.error(e); process.exit(1); });
