// AI OFFICE · coloured pencil, 9:16. A cutaway floor plan of a solo creator's team of helpers:
// 6 rooms (+ the owner's desk) in one content loop, drawn by code as a replayable pencil sheet.
// Built on the lainsen coloured-pencil kit (officeKit.ts = colouredPencilKit with a rectangular design sheet).
import { type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { Sheet, hatch, contour, dot, layLine, poly, minus, edgeDist, smoothstep, replay, type Cue } from "./officeKit";
import { THAI_FONTS, drawThai } from "./thai";

const W = 1080, H = 1920, FPS = 30, N = 420, ANG = -1.02, PAPER = "#f5f1e6";
const INK = "#1d1a1e", DARK = "#2a2627", GRAPH = "#8a847c";
const THREAD = "#ac4f40", PINS = ["#dfb456", "#4485b0", "#cc5548"], CHEEK = "#f2a9b6", SKIN = "#fbf1e4";

// ------------------------------------------------------------------ geometry helpers
const ell = (cx: number, cy: number, rx: number, ry: number, n = 20): P[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as P; });
const box = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 14): P[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as P; });
const tube = (a: P, b: P, w: number): P[] => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * (w / 2), ny = (dx / l) * (w / 2); return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]; };
const PI = Math.PI;
const visibleLen = (t: string) => Array.from(t).filter((c) => !/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(c)).length;

// ------------------------------------------------------------------ the item list (painter's order, back to front)
type It = { sharp?: boolean; pts: P[]; pass: string; col: string; col2?: string; sh?: boolean; ln?: boolean; ghost?: boolean; base?: number; soft?: boolean };
type Ln = (S: Sheet) => void;
type Tag = { text: string; x: number; y: number; px: number; family?: "Kanit" | "Itim" | "Sarabun"; weight?: number };

type Desk = { role: string; cx: number; top: number; s: number; skin: string; hair: string; style: "short" | "long" | "bun" | "curly" | "cap" | "bald"; shirt: string; glasses?: boolean; headset?: boolean; prop: string; screen: string; gate?: boolean };
type Room = { title: string; x0: number; y0: number; x1: number; y1: number; wall: [string, string]; desks: Desk[]; cabinet?: number; windows: number[]; posters: number[]; signW: number };

const FLOOR: [string, string] = ["#dcbf92", "#c9a070"];
const WOOD: [string, string] = ["#c79d6d", "#9c7148"];
const ROW = 240, GAP = 26, Y_A = 250;
const rowY = (i: number) => Y_A + i * (ROW + GAP);
const TOP = (y0: number) => y0 + 163;

const D = (role: string, cx: number, y0: number, o: Partial<Desk> & { skin: string; hair: string; style: Desk["style"]; shirt: string; prop: string }): Desk => ({ role, cx, top: TOP(y0), s: 1, screen: "#eaf2f4", ...o });

const ROOMS: Room[] = (() => {
  const A = rowY(0), B = rowY(1), C = rowY(2), Dd = rowY(3), E = rowY(4);
  const P_ = { mint: "#c0dfcf", pink: "#f1bdc5", sky: "#c4dae7", rose: "#d97581", sage: "#9dbb86", lilac: "#c6b6de", gold: "#ecd08a", beige: "#dcc59c", slate: "#93aabe" };
  const o = { skin: SKIN };
  return [
    { title: "1  หาและคิด", x0: 40, y0: A, x1: 470, y1: A + ROW, wall: ["#e8c160", "#e0b04f"], windows: [262], posters: [], signW: 200,
      desks: [D("นักจับเทรนด์", 150, A, { ...o, hair: DARK, style: "short", shirt: P_.sky, headset: true, prop: "globe" }),
              D("นักคิดคอนเทนต์", 365, A, { ...o, hair: DARK, style: "bun", shirt: P_.pink, prop: "bulb" })] },
    { title: "2  เขียนและอนุมัติ", x0: 510, y0: A, x1: 940, y1: A + ROW, wall: ["#9dbb86", "#6f9460"], windows: [742], posters: [], signW: 270, cabinet: 835,
      desks: [D("นักเขียนสคริป", 620, A, { ...o, hair: DARK, style: "long", shirt: P_.lilac, glasses: true, prop: "papers" })] },
    { title: "3  ผลิต", x0: 40, y0: B, x1: 940, y1: B + ROW, wall: ["#8fa9bf", "#c4dbe8"], windows: [220, 580], posters: [400, 760], signW: 130,
      desks: [D("ช่างวิดีโอ AI", 130, B, { ...o, hair: DARK, style: "cap", shirt: P_.rose, prop: "clapper" }),
              D("บรรณารักษ์ไฟล์", 310, B, { ...o, hair: DARK, style: "short", shirt: P_.mint, glasses: true, prop: "folders" }),
              D("นักเสียง", 490, B, { ...o, hair: "#d9ac7c", style: "long", shirt: P_.sky, headset: true, prop: "mic" }),
              D("นักทำปก", 670, B, { ...o, hair: DARK, style: "curly", shirt: P_.pink, prop: "palette" }),
              D("นักตัดต่อรีล", 850, B, { ...o, hair: DARK, style: "bun", shirt: P_.gold, prop: "reel", screen: "#c4dae7" })] },
    { title: "4  ปล่อยและเรียนรู้", x0: 40, y0: C, x1: 520, y1: C + ROW, wall: ["#f2b9c2", "#d9727a"], windows: [280], posters: [], signW: 280,
      desks: [D("ผู้ปล่อยงาน", 170, C, { ...o, hair: DARK, style: "short", shirt: P_.rose, prop: "megaphone", gate: true }),
              D("นักวัดผล", 390, C, { ...o, hair: DARK, style: "short", shirt: P_.mint, glasses: true, prop: "chart" })] },
    { title: "5  รายได้", x0: 540, y0: C, x1: 940, y1: C + ROW, wall: ["#e0b04f", "#e8c160"], windows: [610, 880], posters: [], signW: 160,
      desks: [D("โต๊ะขาย", 745, C, { ...o, hair: DARK, style: "long", shirt: P_.sage, headset: true, prop: "chat" })] },
    { title: "6  หลังบ้าน", x0: 40, y0: Dd, x1: 940, y1: Dd + ROW, wall: ["#c6b6de", "#a995c9"], windows: [252, 702], posters: [477], signW: 190,
      desks: [D("โปรดิวเซอร์", 140, Dd, { ...o, hair: DARK, style: "short", shirt: P_.sky, prop: "clip" }),
              D("ตรวจถูกต้อง", 365, Dd, { ...o, hair: DARK, style: "bun", shirt: P_.pink, glasses: true, prop: "stamp" }),
              D("คลังความรู้", 590, Dd, { ...o, hair: DARK, style: "curly", shirt: P_.beige, prop: "books" }),
              D("ผู้คุมงบ", 815, Dd, { ...o, hair: DARK, style: "short", shirt: P_.mint, prop: "calc" })] },
    { title: "โต๊ะเจ้าของ", x0: 290, y0: E, x1: 790, y1: E + ROW, wall: ["#bfe0cf", "#9dbb86"], windows: [390, 690], posters: [], signW: 210,
      desks: [D("คุณ · เจ้าของ", 540, E, { ...o, hair: DARK, style: "short", shirt: P_.slate, prop: "pad", screen: "#c4dae7" })] },
  ];
})();

// ------------------------------------------------------------------ builders
const hairItems = (d: Desk, pc: number, hy: number, rx: number, ry: number, s: number, back: It[], front: It[]) => {
  const cap = (): P[] => arc(pc, hy, rx + 2 * s, ry + 3 * s, PI * 1.08, PI * 1.92).concat(arc(pc, hy - 6 * s, rx * 0.92, ry * 0.62, PI * 1.92, PI * 1.08));
  const hc = d.hair;
  if (d.style === "curly") back.push({ pts: ell(pc, hy - 4 * s, rx + 9 * s, ry + 8 * s, 22), pass: "hair", col: hc, ln: true });
  if (d.style === "long") back.push({ pts: [[pc - rx - 4 * s, hy - 6 * s], [pc + rx + 4 * s, hy - 6 * s], [pc + rx + 9 * s, hy + 62 * s], [pc - rx - 9 * s, hy + 62 * s]], pass: "hair", col: hc, ln: true });
  if (d.style === "bald") return;
  if (d.style === "cap") {
    front.push({ pts: arc(pc, hy - 4 * s, rx + 3 * s, ry + 1 * s, PI, PI * 2).concat([[pc + rx + 3 * s, hy - 4 * s]]), pass: "hair", col: d.shirt, ln: true });
    front.push({ pts: [[pc + 2 * s, hy - 14 * s], [pc + rx + 22 * s, hy - 8 * s], [pc + rx + 22 * s, hy - 3 * s], [pc + 2 * s, hy - 6 * s]], pass: "hair", col: d.shirt, ln: true });
    return;
  }
  front.push({ pts: cap(), pass: "hair", col: hc, ln: true });
  if (d.style === "bun") front.push({ pts: ell(pc, hy - ry - 8 * s, 11 * s, 10 * s, 14), pass: "hair", col: hc, ln: true });
};

const propItems = (kind: string, px: number, py: number, s: number, it: It[], ln: Ln[]) => {
  const B = (x0: number, y0: number, x1: number, y1: number, col: string, o: Partial<It> = {}) => it.push({ pts: box(px + x0 * s, py + y0 * s, px + x1 * s, py + y1 * s), pass: "prop", col, ln: true, ...o });
  const E = (cx: number, cy: number, rx: number, ry: number, col: string, o: Partial<It> = {}) => it.push({ pts: ell(px + cx * s, py + cy * s, rx * s, ry * s, 14), pass: "prop", col, ln: true, ...o });
  switch (kind) {
    case "globe": B(-3, -2, 3, 8, "#8a8a8a"); E(0, -18, 16, 16, "#5aa7d9", { sh: true }); E(-4, -20, 8, 6, "#6fbf73", { ln: false }); ln.push((S) => S.line([[px - 15 * s, py - 18 * s], [px, py - 14 * s], [px + 15 * s, py - 18 * s]], 1.0, INK, 0.5)); break;
    case "bulb": E(0, -26, 13, 15, "#ffe27a", { sh: true }); B(-6, -12, 6, 0, "#a8a8a8"); B(20, -4, 34, 8, "#f6a6c1"); B(26, -12, 40, 0, "#a8e0b0"); ln.push((S) => { for (let k = 0; k < 5; k++) { const a = -2.6 + k * 0.55; S.line([[px + Math.cos(a) * 20 * s, py - 26 * s + Math.sin(a) * 22 * s], [px + Math.cos(a) * 29 * s, py - 26 * s + Math.sin(a) * 31 * s]], 1.4, "#e0a020", 0.8); } }); break;
    case "papers": B(-20, -6, 14, 8, "#fbf6e8"); B(-17, -10, 17, 4, "#f6efd8"); B(-14, -14, 20, 0, "#fffaf0"); ln.push((S) => { for (let k = 0; k < 3; k++) S.line([[px - 10 * s, py - 10 * s + k * 3 * s], [px + 14 * s, py - 11 * s + k * 3 * s]], 0.8, GRAPH, 0.6); }); break;
    case "clapper": B(-16, -16, 16, 6, "#2f2f33", { sh: true }); it.push({ pts: [[px - 17 * s, py - 16 * s], [px + 15 * s, py - 28 * s], [px + 18 * s, py - 22 * s], [px - 14 * s, py - 10 * s]], pass: "prop", col: "#f4f1ea", ln: true }); ln.push((S) => { for (let k = 0; k < 4; k++) S.line([[px - 12 * s + k * 8 * s, py - 14 * s - k * 2.5 * s], [px - 8 * s + k * 8 * s, py - 24 * s - k * 2.5 * s]], 1.6, "#2f2f33", 0.8); }); break;
    case "folders": it.push({ pts: [[px - 24 * s, py + 6 * s], [px - 22 * s, py - 18 * s], [px - 4 * s, py - 18 * s], [px - 2 * s, py + 6 * s]], pass: "prop", col: "#e9b949", ln: true }); it.push({ pts: [[px - 8 * s, py + 8 * s], [px - 6 * s, py - 22 * s], [px + 12 * s, py - 20 * s], [px + 12 * s, py + 8 * s]], pass: "prop", col: "#4a9a7a", ln: true }); it.push({ pts: [[px + 6 * s, py + 8 * s], [px + 8 * s, py - 16 * s], [px + 26 * s, py - 14 * s], [px + 26 * s, py + 8 * s]], pass: "prop", col: "#e0603f", ln: true }); break;
    case "mic": B(-2, -26, 2, 6, "#6e6e72"); E(0, -32, 8, 11, "#9a9aa0", { sh: true }); E(0, 6, 15, 4, "#555"); ln.push((S) => { S.line([[px - 5 * s, py - 32 * s], [px + 5 * s, py - 32 * s]], 0.8, DARK, 0.6); S.line([[px - 5 * s, py - 28 * s], [px + 5 * s, py - 28 * s]], 0.8, DARK, 0.6); }); break;
    case "palette": E(0, -4, 22, 12, "#ecd29c", { sh: true }); E(-10, -6, 3.4, 3, "#e0453a", { ln: false }); E(-2, -9, 3.4, 3, "#3f7fd9", { ln: false }); E(8, -7, 3.4, 3, "#f2c230", { ln: false }); E(12, 0, 3.4, 3, "#4aa86a", { ln: false }); break;
    case "reel": E(0, -16, 15, 15, "#3a3a40", { sh: true }); E(0, -16, 4.5, 4.5, "#f0e8d8"); E(-8, -22, 3.4, 3.4, "#f0e8d8", { ln: false }); E(8, -22, 3.4, 3.4, "#f0e8d8", { ln: false }); E(0, -6, 3.4, 3.4, "#f0e8d8", { ln: false }); break;
    case "megaphone": it.push({ pts: [[px - 14 * s, py - 12 * s], [px + 12 * s, py - 26 * s], [px + 14 * s, py - 2 * s], [px - 14 * s, py - 2 * s]], pass: "prop", col: "#d94f4f", ln: true, sh: true }); B(-20, -14, -12, -2, "#4a3b30"); ln.push((S) => { S.line([[px + 20 * s, py - 24 * s], [px + 30 * s, py - 30 * s]], 1.6, "#d94f4f", 0.9); S.line([[px + 20 * s, py - 14 * s], [px + 32 * s, py - 14 * s]], 1.6, "#d94f4f", 0.9); S.line([[px + 20 * s, py - 4 * s], [px + 30 * s, py + 2 * s]], 1.6, "#d94f4f", 0.9); }); break;
    case "chart": B(-20, -4, -10, 8, "#3e8e9e"); B(-6, -16, 4, 8, "#5aa7d9"); B(8, -26, 18, 8, "#e9b949", { sh: true }); ln.push((S) => S.line([[px - 24 * s, py + 8 * s], [px + 22 * s, py + 8 * s]], 1.2, INK, 0.7)); break;
    case "chat": it.push({ pts: [[px - 22 * s, py - 38 * s], [px + 22 * s, py - 38 * s], [px + 22 * s, py - 10 * s], [px - 4 * s, py - 10 * s], [px - 12 * s, py + 2 * s], [px - 12 * s, py - 10 * s], [px - 22 * s, py - 10 * s]], pass: "prop", col: "#6fd08c", ln: true, sh: true }); ln.push((S) => { for (let k = 0; k < 3; k++) dot(S, px - 10 * s + k * 10 * s, py - 24 * s, 2.2 * s, "#fff", 0.95, 1.4); }); break;
    case "clip": B(-15, -30, 15, 6, "#c79a6b", { sh: true }); B(-11, -25, 11, 2, "#fbf6e8"); B(-6, -33, 6, -28, "#8a8a8a"); ln.push((S) => { for (let k = 0; k < 4; k++) S.line([[px - 8 * s, py - 20 * s + k * 5 * s], [px + 8 * s, py - 20 * s + k * 5 * s]], 0.8, GRAPH, 0.6); }); break;
    case "stamp": B(-14, -4, 14, 8, "#d94f4f", { sh: true }); B(-5, -24, 5, -4, "#b9824e"); E(0, -26, 8, 4, "#8f5c37"); break;
    case "books": B(-20, -8, 20, 8, "#b5651d", { sh: true }); B(-17, -20, 17, -8, "#3e7fb5"); B(-14, -30, 14, -20, "#d9a441"); break;
    case "calc": B(-14, -22, 14, 6, "#4a4f66", { sh: true }); B(-10, -19, 10, -12, "#bfe3c0"); ln.push((S) => { for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) dot(S, px - 7 * s + c * 7 * s, py - 6 * s + r * 4 * s - 2 * s, 1.5 * s, "#f0e8d8", 0.9, 1.2); }); break;
    case "pad": B(-26, -6, 8, 8, "#d94f4f", { sh: true }); B(14, -26, 24, -4, "#b9824e"); E(19, -28, 9, 4, "#8f5c37"); E(30, 4, 8, 8, "#f7f3ea", { sh: true }); break;
  }
};

const screenArt = (kind: string, d: Desk, ln: Ln[]) => {
  const s = d.s, cx = d.cx, top = d.top, q = (u: number, v: number): P => [cx + (26 + 52 * u) * s, top + (-58 + 40 * v) * s - 4 * s * u];
  ln.push((S) => {
    if (kind === "reel") { const cols = ["#e9b949", "#e0603f", "#5aa7d9", "#4aa86a"]; for (let k = 0; k < 4; k++) { const v = 0.18 + k * 0.2; S.line([q(0.08 + (k % 2) * 0.1, v), q(0.6 + (k % 3) * 0.12, v)], 2.6, cols[k], 0.9); } return; }
    for (let k = 0; k < 4; k++) { const v = 0.2 + k * 0.2; S.line([q(0.1, v), q(0.45 + ((k * 37) % 5) * 0.09, v)], 1.5, "#6f8aa5", 0.8); }
  });
};

const buildDesk = (d: Desk, it: It[], ln: Ln[], tags: Tag[]) => {
  const { cx, top, s } = d, pc = cx - 14 * s, hy = top - 106 * s, rx = 23 * s, ry = 27 * s;
  const back: It[] = [], front: It[] = [];
  hairItems(d, pc, hy, rx, ry, s, back, front);
  back.forEach((b) => it.push(b));
  it.push({ pts: [[pc - 30 * s, top - 62 * s], [pc - 16 * s, top - 70 * s], [pc + 16 * s, top - 70 * s], [pc + 30 * s, top - 62 * s], [pc + 38 * s, top + 10 * s], [pc - 38 * s, top + 10 * s]], pass: "cloth", col: d.shirt, sh: true, ln: true });
  it.push({ pts: box(pc - 7 * s, top - 82 * s, pc + 7 * s, top - 66 * s), pass: "skin", col: d.skin, ln: true, sh: true });
  it.push({ pts: ell(pc, hy, rx, ry, 22), pass: "skin", col: d.skin, ln: true, soft: true });
  it.push({ pts: ell(pc - 14 * s, hy + 10 * s, 5.5 * s, 3.6 * s, 12), pass: "prop", col: CHEEK, base: 1, soft: true });
  it.push({ pts: ell(pc + 14 * s, hy + 10 * s, 5.5 * s, 3.6 * s, 12), pass: "prop", col: CHEEK, base: 0.95, soft: true });
  front.forEach((f) => it.push(f));
  if (d.headset) {
    it.push({ pts: ell(pc - rx - 1 * s, hy + 4 * s, 6 * s, 9 * s, 12), pass: "prop", col: "#3b3b44", ln: true });
    it.push({ pts: ell(pc + rx + 1 * s, hy + 4 * s, 6 * s, 9 * s, 12), pass: "prop", col: "#3b3b44", ln: true });
    ln.push((S) => { S.line(arc(pc, hy, rx + 4 * s, ry + 6 * s, PI * 1.05, PI * 1.95, 10), 2.0, "#3b3b44", 0.9); S.line([[pc - rx - 2 * s, hy + 12 * s], [pc - rx + 4 * s, hy + 26 * s], [pc - 2 * s, hy + 28 * s]], 1.4, "#3b3b44", 0.9); });
  }
  // desk
  it.push({ pts: box(cx - 80 * s, top + 14 * s, cx + 80 * s, top + 66 * s), pass: "furn", col: "#f7efdc", ln: true, base: 0.7, soft: true });
  ln.push((S) => { for (let k = -3; k <= 3; k++) S.line([[cx + k * 22 * s, top + 20 * s], [cx + k * 22 * s + 0.6, top + 64 * s]], 0.9, GRAPH, 0.55); });
  it.push({ pts: [[cx - 68 * s, top], [cx + 68 * s, top], [cx + 80 * s, top + 14 * s], [cx - 80 * s, top + 14 * s]], pass: "furn", col: WOOD[0], ln: true, base: 0.95 });
  // monitor
  it.push({ pts: box(cx + 50 * s, top - 14 * s, cx + 58 * s, top + 2 * s), pass: "furn", col: "#93aabe", ln: true });
  it.push({ pts: [[cx + 22 * s, top - 62 * s], [cx + 82 * s, top - 66 * s], [cx + 82 * s, top - 18 * s], [cx + 22 * s, top - 14 * s]], pass: "furn", col: "#93aabe", ln: true });
  it.push({ pts: [[cx + 26 * s, top - 58 * s], [cx + 78 * s, top - 62 * s], [cx + 78 * s, top - 22 * s], [cx + 26 * s, top - 18 * s]], pass: "screen", col: d.screen, ln: false, base: 0.55 });
  screenArt(d.prop === "reel" ? "reel" : "text", d, ln);
  propItems(d.prop, cx - 58 * s, top + 8 * s, s, it, ln);
  // arms in front of the desk
  const sl: P = [pc - 30 * s, top - 58 * s], sr: P = [pc + 30 * s, top - 58 * s];
  it.push({ pts: tube(sl, [pc - 42 * s, top - 6 * s], 17 * s), pass: "cloth", col: d.shirt, ln: true, sh: true });
  it.push({ pts: tube(sr, [pc + 42 * s, top - 6 * s], 17 * s), pass: "cloth", col: d.shirt, ln: true, sh: true });
  it.push({ pts: tube([pc - 42 * s, top - 6 * s], [pc - 14 * s, top + 4 * s], 14 * s), pass: "cloth", col: d.shirt, ln: true });
  it.push({ pts: tube([pc + 42 * s, top - 6 * s], [pc + 14 * s, top + 4 * s], 14 * s), pass: "cloth", col: d.shirt, ln: true });
  it.push({ pts: ell(pc - 12 * s, top + 5 * s, 7 * s, 5 * s, 10), pass: "skin", col: d.skin, ln: true });
  it.push({ pts: ell(pc + 12 * s, top + 5 * s, 7 * s, 5 * s, 10), pass: "skin", col: d.skin, ln: true });
  // face
  ln.push((S) => {
    dot(S, pc - 8 * s, hy + 2 * s, 2.1 * s, DARK, 1, 1.5); dot(S, pc + 8 * s, hy + 2 * s, 2.1 * s, DARK, 1, 1.5);
    S.line([[pc - 4 * s, hy + 13 * s], [pc, hy + 16 * s], [pc + 4 * s, hy + 13 * s]], 1.3, DARK, 0.9);
    if (d.glasses) { S.line(ell(pc - 9 * s, hy + 1 * s, 8.5 * s, 7.5 * s, 14).concat([[pc - 9 * s + 8.5 * s, hy + 1 * s]]), 1.3, DARK, 0.85); S.line(ell(pc + 9 * s, hy + 1 * s, 8.5 * s, 7.5 * s, 14).concat([[pc + 9 * s + 8.5 * s, hy + 1 * s]]), 1.3, DARK, 0.85); S.line([[pc - 1 * s, hy], [pc + 1 * s, hy]], 1.2, DARK, 0.85); }
  });
  // name tag
  const vis = visibleLen(d.role), tw = Math.min(156 * s, vis * 13.5 * s + 24);
  it.push({ pts: box(cx - tw / 2, top + 24 * s, cx + tw / 2, top + 58 * s), pass: "prop", col: "#fbf0c4", ln: true, base: 0.5, soft: true });
  tags.push({ text: d.role, x: cx, y: top + 28 * s, px: Math.min(25 * s, Math.max(20, 136 * s / (vis * 0.56))), weight: 500 });
  if (d.gate) ln.push((S) => { S.line([[cx - 4 * s, top - 40 * s], [cx + 2 * s, top - 32 * s], [cx + 18 * s, top - 52 * s]], 2.4, THREAD, 0.95); });
};

const buildCabinet = (cx: number, top: number, it: It[], ln: Ln[], tags: Tag[]) => {
  it.push({ pts: box(cx - 50, top - 98, cx + 50, top + 66), pass: "furn", col: "#8fa6bb", col2: "#5f7a94", sh: true, ln: true });
  it.push({ pts: box(cx - 42, top - 126, cx + 42, top - 100), pass: "furn", col: "#d7c7a0", ln: true });
  [-46, 4].forEach((o) => ln.push((S) => { S.line([[cx - 50, top + o], [cx + 50, top + o + 1]], 1.4, INK, 0.75); S.line([[cx - 12, top + o + 22], [cx + 12, top + o + 22]], 3, "#555", 0.8); }));
  [-120, -114].forEach((o, i) => it.push({ pts: box(cx - 34 + i * 4, top + o - 10, cx + 34 + i * 4, top + o), pass: "prop", col: i ? "#fffaf0" : "#f6efd8", ln: true, base: 0.4, soft: true }));
  it.push({ pts: box(cx - 56, top + 14, cx + 56, top + 56), pass: "prop", col: "#fbf0c4", ln: true, base: 0.5, soft: true });
  tags.push({ text: "ตู้รออนุมัติ", x: cx, y: top + 20, px: 25, weight: 500 });
  ln.push((S) => { S.line(ell(cx + 28, top - 70, 13, 13, 16).concat([[cx + 41, top - 70]]), 2.0, THREAD, 0.9); S.line([[cx + 22, top - 70], [cx + 27, top - 63], [cx + 36, top - 77]], 2.2, THREAD, 0.95); });
};

const buildRoom = (r: Room, it: It[], ln: Ln[], tags: Tag[]) => {
  const wallB = r.y0 + 150;
  it.push({ pts: box(r.x0 + 6, r.y0 + 2, r.x1 - 6, r.y0 + ROW - 6), pass: "wall", col: r.wall[0], base: 0.5, soft: true });
  r.windows.forEach((x) => { it.push({ pts: box(x - 32, r.y0 + 38, x + 32, r.y0 + 112), pass: "prop", col: "#dcebf1", ln: true, base: 0.6 }); ln.push((S) => { S.line([[x, r.y0 + 38], [x, r.y0 + 112]], 1.6, INK, 0.7); S.line([[x - 32, r.y0 + 75], [x + 32, r.y0 + 75]], 1.6, INK, 0.7); S.line([[x - 24, r.y0 + 50], [x - 14, r.y0 + 44]], 1.4, "#ffffff", 0.9); }); });
  r.posters.forEach((x, i) => { it.push({ pts: box(x - 26, r.y0 + 40, x + 26, r.y0 + 108), pass: "prop", col: i % 2 ? "#fbe6a8" : "#f7d0c0", ln: true, base: 0.5 }); ln.push((S) => { for (let k = 0; k < 4; k++) S.line([[x - 17, r.y0 + 54 + k * 12], [x + 17 - ((k * 7) % 9), r.y0 + 54 + k * 12]], 1.2, INK, 0.5); }); });
  if (r.cabinet) buildCabinet(r.cabinet, TOP(r.y0), it, ln, tags);
  r.desks.forEach((d) => buildDesk(d, it, ln, tags));
  // sign tab
  const tx0 = r.x0 + 16, tx1 = tx0 + r.signW, ty0 = r.y0 - 18, ty1 = r.y0 + 22, tooth: P[] = [];
  for (let x = tx1, k = 0; x > tx0; x -= 7, k++) tooth.push([x, ty1 + (k % 2 ? 5 : 0)]);
  it.push({ pts: [[tx0, ty0], [tx1, ty0], ...tooth, [tx0, ty1]], pass: "prop", col: "#fbf8f1", ln: true, sharp: true, base: 0.7, soft: true });
  it.push({ pts: ell(tx0 + r.signW / 2, ty0 - 1, 6.5, 6.5, 12), pass: "prop", col: PINS[ROOMS.indexOf(r) % 3], ln: true, base: 1 });
  ln.push((S) => S.line([[tx0 + 8, ty0 + 8], [tx1 - 8, ty0 + 8]], 0.9, "#d08c80", 0.8));
  tags.push({ text: r.title, x: tx0 + r.signW / 2, y: ty0 + 8, px: 30, family: "Itim", weight: 400 });
};

// ------------------------------------------------------------------ the sheet
const PASSES: [string, 0 | 1 | 2][] = [["lay", 0], ["wall", 1], ["floor", 0], ["furn", 2], ["prop", 2], ["cloth", 2], ["skin", 2], ["hair", 2], ["screen", 1], ["layer", 1], ["darks", 1], ["line", 2]];

const buildAll = () => {
  const rooms: { r: Room; it: It[] }[] = [], ln: Ln[] = [], tags: Tag[] = [];
  ROOMS.forEach((r) => { const it: It[] = []; buildRoom(r, it, ln, tags); rooms.push({ r, it }); });
  return { rooms, ln, tags };
};
const BUILT = buildAll();

const emit = (S: Sheet, items: It[], seed0: number) => {
  items.forEach((it, i) => {
    const front = items.slice(i + 1).filter((j) => !j.ghost).map((j) => poly(j.pts));
    const own = poly(it.pts), reg = front.length ? minus(own, ...front) : own, b = own.box, diag = Math.hypot(b.x1 - b.x0, b.y1 - b.y0);
    const gap0 = diag < 45 ? 2.0 : diag < 110 ? 2.7 : diag < 300 ? 3.4 : 4.0, gap = it.soft && it.pass === "wall" ? gap0 : gap0 * 0.72, len = Math.max(8, Math.min(28, diag * 0.55)), seed = seed0 + i * 5 + 1;
    const ed = edgeDist(it.pts), base = it.base ?? 0.92, edgeW = Math.min(16, diag * 0.25);
    const dens = it.soft ? (x: number, y: number) => base * (0.85 + 0.3 * Math.sin(x * 0.011 + y * 0.017)) : (x: number, y: number) => base + (1 - base) * 0.75 * (1 - smoothstep(0, edgeW, ed(x, y)));
    S.into(it.pass); hatch(S, reg, { ang: ANG, gap, len, w: diag < 60 ? 1.2 : 1.55, col: it.col, a: it.pass === "wall" ? 0.8 : 0.95, seed, dens, strip: 170 });
    if (it.col2) { S.into("layer"); hatch(S, reg, { ang: ANG + 0.32, gap: gap * 1.6, len: len * 0.9, w: 1.3, col: it.col2, a: 0.5, seed: seed + 2, dens: (x, y) => 0.55 * dens(x, y) }); }
    if (false && it.sh && diag > 28) {
      S.into("darks");
      const bw = Math.max(1, b.x1 - b.x0), bh = Math.max(1, b.y1 - b.y0);
      hatch(S, reg, { ang: ANG + 1.3, gap: gap * 1.4, len: len * 0.8, w: 1.2, col: "#3a3050", a: 0.42, seed: seed + 3, dens: (x, y) => 0.8 * smoothstep(0.55, 1.15, ((x - b.x0) / bw + (y - b.y0) / bh) / 2) });
    }
    if (it.ln) {
      S.into("line");
      const keep = (x: number, y: number) => !front.some((f) => f.has(x, y));
      contour(S, it.pts, { w: diag < 60 ? 1.05 : 1.5, col: INK, a: 0.92, seed: seed + 4, seg: 70, keep, closed: true, smooth: it.pts.length > 6 && !it.sharp });
    }
  });
};

const buildSheet = (): Sheet => {
  const S = new Sheet(); PASSES.forEach(([id, t]) => S.pass(id, t));
  S.into("lay");
  BUILT.rooms.forEach(({ r }, k) => layLine(S, [r.x0, r.y0 + 233], [r.x1, r.y0 + 233], GRAPH, 950 + k, 0.9, 0.3));
  BUILT.rooms.forEach(({ it }, k) => emit(S, it, 1000 + k * 997));
  S.into("line");
  BUILT.rooms.forEach(({ r }, k) => { contour(S, [[r.x0 + 4, r.y0 + 233], [r.x1 - 4, r.y0 + 233]], { w: 1.3, col: INK, a: 0.85, seed: 177 + k, seg: 120, smooth: false }); });
  BUILT.ln.forEach((f) => f(S));
  // paper trail: the loop between the rooms, the learning loop and the owner's gate
  const arrow = (pts: P[], col: string, w = 2.0) => { const e = pts[pts.length - 1], p = pts[pts.length - 2], a = Math.atan2(e[1] - p[1], e[0] - p[0]); for (let i = 1; i < pts.length; i++) S.line([pts[i - 1], [(pts[i - 1][0] + pts[i][0]) / 2 + ((i * 7) % 3 - 1) * 1.2, (pts[i - 1][1] + pts[i][1]) / 2 + ((i * 5) % 3 - 1) * 1.2], pts[i]], w, col, 0.9); [-0.5, 0.5].forEach((o) => S.line([[e[0], e[1]], [e[0] - 11 * Math.cos(a + o), e[1] - 11 * Math.sin(a + o)]], w, col, 0.9)); };
  const A = rowY(0), B = rowY(1), C = rowY(2), Dd = rowY(3), E = rowY(4);
  arrow([[472, A + 150], [508, A + 150]], THREAD);
  arrow([[730, A + ROW + 1], [730, B - 1]], THREAD);
  arrow([[270, B + ROW + 1], [270, C - 1]], THREAD);
  arrow([[522, C + 150], [538, C + 150]], THREAD);
  arrow([[740, C + ROW + 1], [740, Dd - 1]], THREAD);
  arrow([[38, C + 160], [14, C + 130], [12, A + 190], [38, A + 160]], "#4485b0");
  arrow([[942, A + 150], [985, A + 150], [985, E + 160], [792, E + 160]], THREAD, 2.4);
  return S;
};

const CUES: Cue[] = [
  { pass: "lay", start: 5, end: 30 }, { pass: "wall", start: 35, end: 80 }, { pass: "floor", start: 85, end: 110 },
  { pass: "furn", start: 115, end: 140 }, { pass: "prop", start: 145, end: 170 }, { pass: "cloth", start: 175, end: 205 },
  { pass: "skin", start: 210, end: 230 }, { pass: "hair", start: 235, end: 255 }, { pass: "screen", start: 260, end: 270 },
  { pass: "layer", start: 275, end: 305 }, { pass: "darks", start: 310, end: 340 }, { pass: "line", start: 345, end: 385 },
];
const R = replay({ D: W, Dh: H, ang: ANG, paper: PAPER, sheet: buildSheet, cues: CUES, key: "aiOffice-v1" });

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const INKT = "#1d1a1e";

export const office: Film = {
  meta: { title: "ออฟฟิศทีมช่วยงาน · coloured pencil", W, H, fps: FPS, bpm: 120, durationFrames: N, raster: "cpu", kind: "drawing", poster: N - 1, holds: [[N - 35, N]],
    captions: [{ from: 0, to: N, text: "ออฟฟิศทีมช่วยงานของ solo creator" }] },
  assets: { images: {}, fonts: THAI_FONTS },
  shots: [{ id: "drawing", start: 0, end: N, draw: (ctx: Ctx, f: number, env: Env) => {
    R.draw(ctx, f, env);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    drawThai(ctx, env, "ออฟฟิศทีมช่วยงาน", 60, 74, { px: 92, family: "Itim", weight: 400, align: "left", color: INKT, reveal: ease(f / 40), wobble: 3, seed: 3, maxW: 900, label: "title" });
    drawThai(ctx, env, "ลูปคอนเทนต์ของ solo creator · 16 บทบาท", 62, 28, { px: 32, family: "Sarabun", weight: 400, align: "left", color: "#3a3436", reveal: ease((f - 10) / 40), maxW: 900, label: "subtitle" });
    const k = ease((f - 340) / 30);
    if (k > 0) {
      ctx.save(); ctx.globalAlpha = k;
      BUILT.tags.forEach((t, i) => drawThai(ctx, env, t.text, t.x, t.y, { px: t.px, family: t.family ?? "Kanit", weight: t.weight ?? 500, align: "center", color: INKT, maxW: 420, label: `tag${i}` }));
      ctx.restore();
    }
  } }],
};
