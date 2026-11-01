# โมเดล TLA+ (TLC ตรวจแล้วในแชต)

รันทั้งหมด: `for w in W1 W2 W3 W4 W5 W6; do java -cp ../tla2tools.jar tlc2.TLC -config $w.cfg $w.tla -nowarning; done`
(ชื่อ MODULE ต้องตรงชื่อไฟล์ จึงไม่เปลี่ยนชื่อไฟล์)

| ไฟล์ | เรื่อง | ผล TLC |
|---|---|---|
| `W1` | ล็อตปาล์มออยล์ (จำลอง) | **เจอบั๊ก** `LoadedNeedsLC`: ขอด่วน → เซ็นสัญญา → ขนก่อน L/C (3 ก้าว) · ทั้งหมด 15 สถานะ (`W1full.cfg` ไม่ใส่กฎ ใช้นับสถานะ) |
| `W2` | หนึ่งคลิปรีล (script → MP4) | ผ่าน · 8 สถานะ |
| `W3` | บอทตอบ LINE (สองฝั่งพร้อมกัน) | ผ่าน · 3 สถานะ |
| `W4` | เวิร์กช็อป 1:1 | ผ่าน · 11 สถานะ |
| `W5` | เสาร์ช้าๆ (กาแฟ/โปรเจกต์/งีบ) | ผ่าน · 11 สถานะ |
| `W6` | **ออฟฟิศ AI** (เทรนด์ → ... → โพสต์ มีด่านอนุมัติ) | ผ่าน · 24 สถานะ · กฎ `NoVideoBeforeApproval` |
| `Reel.tla` | pipeline ของ reel-director ตามตัวอักษรของ SKILL.md | `R_FALSE.cfg` (ไม่มีด่านตรวจซับ) **เจอบั๊ก** `ThaiProofreadBeforeBuild` 5 ก้าว · `R_TRUE.cfg` (มีด่าน) ผ่าน 5/5 กฎ 69 สถานะ |

หมายเหตุ: `Reel.tla` เป็นช่องว่างในข้อความของสกิลตามที่ผมโมเดล ไม่ได้แปลว่าตอนรันจริงพลาดเสมอ
รัน: `java -cp ../tla2tools.jar tlc2.TLC -config R_FALSE.cfg Reel.tla` (ไฟล์ cfg ตั้งชื่อ constant `GateProofread`)
