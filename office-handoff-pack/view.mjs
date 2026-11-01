// view.mjs — คำภาษาไทยของโมเดล models/W6.tla (ออฟฟิศ AI ของ modty.ai)
// แต่ละสถานะ s ผูกกับห้อง/บทบาทใน BRIEF.md; แต่ละก้าวคือ action ใน W6.tla
// หัวข้อ "ล็อตปาล์ม" ในชุดนี้เป็นตัวอย่างจำลอง ไม่ใช่กระบวนการจริงของ Adesa

// ค่าของตัวแปร s ใน W6.tla (idle→trend→idea→script→waiting→approved→video→edit→idle)
export const states = {
  idle:     { room: 'โต๊ะเจ้าของ',        who: 'เจ้าของ',            label: 'ว่าง รอรอบใหม่' },
  trend:    { room: 'ห้อง 1 หาและคิด',     who: 'นักจับเทรนด์',        label: 'ค้นเทรนด์' },
  idea:     { room: 'ห้อง 1 หาและคิด',     who: 'นักคิดคอนเทนต์',      label: 'คิดคอนเทนต์' },
  script:   { room: 'ห้อง 2 เขียนและอนุมัติ', who: 'นักเขียนสคริป',      label: 'เขียนสคริป' },
  waiting:  { room: 'ห้อง 2 เขียนและอนุมัติ', who: 'ตู้รออนุมัติ',        label: 'รอคุณอนุมัติ' },
  approved: { room: 'โต๊ะเจ้าของ',        who: 'เจ้าของ',            label: 'อนุมัติแล้ว' },
  video:    { room: 'ห้อง 3 ผลิต',         who: 'ช่างวิดีโอ AI',       label: 'ทำวิดีโอด้วย AI' },
  edit:     { room: 'ห้อง 3 ผลิต',         who: 'นักตัดต่อรีล',        label: 'ตัดต่อรีล' },
};

// ก้าว = action ใน W6.tla (from → to)
export const steps = {
  Trend:   { from: 'idle',     to: 'trend',    label: 'เริ่มรอบ ค้นเทรนด์' },
  Idea:    { from: 'trend',    to: 'idea',     label: 'ส่งเทรนด์ให้นักคิด' },
  Script:  { from: 'idea',     to: 'script',   label: 'ส่งไอเดียให้นักเขียน' },
  Submit:  { from: 'script',   to: 'waiting',  label: 'ยื่นสคริปต์เข้าตู้รออนุมัติ' },
  Approve: { from: 'waiting',  to: 'approved', label: 'เจ้าของเปิดตู้ อนุมัติ (ด่านที่ 1)', gate: true },
  Video:   { from: 'approved', to: 'video',    label: 'สั่งทำวิดีโอ' },
  Edit:    { from: 'video',    to: 'edit',     label: 'ดึงไฟล์มาตัดต่อรีล' },
  Post:    { from: 'edit',     to: 'idle',     label: 'ปล่อยงาน วัดผล วนกลับไปหาเทรนด์', loop: true, max: 2 },
};

// กฎที่ TLC ตรวจใน W6.cfg (ผลที่บันทึกไว้ใน models/README.md: ผ่าน 24 สถานะ — ยังไม่ได้รัน TLC ซ้ำในเซสชันนี้)
export const rules = {
  NoVideoBeforeApproval: 'ไม่มีวิดีโอก่อนคุณอนุมัติสคริปต์',
  PostedNeedsEdit: 'โพสต์ได้ไม่เกิน 2 ครั้งในโมเดล (ขอบเขตของการตรวจ)',
};

// ข้อความบรรทัดสถานะตัวเอียงใต้ภาพ (ตามแบบหน้าของ April Zhu)
export const status = (s, posted) =>
  `${states[s].label} · โพสต์แล้ว ${posted} ชิ้น แตะที่ห้องเพื่อดูว่าใครทำอะไร`;

// ฟอนต์: Kevin Serif ไม่มีอักษรไทย ต้องฝังฟอนต์ไทยเอง (เช่น Sarabun) และทดสอบวรรณยุกต์/สระ/ตัดคำก่อนใช้
export const font = { thai: 'Sarabun', mono: 'Courier Prime', todo: 'ทดสอบวรรณยุกต์ สระ และการตัดคำ' };
