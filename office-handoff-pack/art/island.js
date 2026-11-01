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

async function main() {
  const P = plate({ id: 'island', w: 216, h: 216, ppm: FAST ? 5 : 10, seed: 'office-island-1', paper: 'hotpress' });

  P.label('ออฟฟิศทีมช่วยงาน', 108, 20, { size: 9 });
  P.italic('เกาะลอยของ solo creator · เทรนด์ → โพสต์ มีสองด่านให้คุณกด', 108, 29, { face: 'serif-bold', size: 3.4, align: 'center' });

  // เมฆไกลๆ
  cloud(P, 26, 52, 0.9); cloud(P, 190, 60, 1.0); cloud(P, 34, 196, 1.1); cloud(P, 184, 190, 0.9);

  // ใต้เกาะ (หินสีเบจ) แล้วค่อยหน้าเกาะ (หญ้า)
  const under = [[22, 118], [194, 118], [176, 146], [150, 166], [118, 188], [100, 190], [76, 168], [46, 148]];
  P.shape([under], { fill: C.beige || '#dcc59c' });
  for (const [x, y, l] of [[60, 134, 10], [92, 146, 14], [130, 140, 12], [150, 128, 9]]) P.ink([[x, y], [x + 2, y + l]], { nib: 0.14 });
  P.shape([D.ell(108, 118, 88, 36)], { fill: C.sage });
  cloud(P, 50, 160, 0.9); cloud(P, 168, 164, 0.9);

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
