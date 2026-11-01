# ออฟฟิศทีมช่วยงาน (solo creator) — handoff pack

สรุปงานจากแชตกับ Claude แล้วแพ็กให้ต่อใน Claude Code ได้เลย
เป้าหมาย: วาดออฟฟิศ AI ของ modty.ai (16 บทบาท ครบลูปคอนเทนต์) เป็นภาพสไตล์ pen & coloured pencil
แบบเดียวกับ "Field Notes" ของ April Zhu / "statechart-art" ของ Kevin T. Ngo โดยทุกฉากเป็นโมเดลที่ TLC ตรวจแล้ว

## ในโฟลเดอร์นี้
| path | คืออะไร |
|---|---|
| `BRIEF.md` | บรีฟออฟฟิศ: 16 บทบาท, 6 ห้อง, ด่านอนุมัติ, จานสีของต้นฉบับ |
| `CLAUDE.md` | คำสั่งให้ Claude Code อ่านตอนเริ่มโปรเจกต์ |
| `models/` | โมเดล TLA+ 7 ตัว + ไฟล์ตั้งค่า TLC (ดู `models/README.md`) |
| `art/office.ts`, `art/officeKit.ts` | โค้ดวาดออฟฟิศเวอร์ชันเอนจิน lainsen (ต้องมีเอนจินนั้นก่อน ดูหมายเหตุ) |
| `previews/` | ภาพที่ได้จากแชต (v1 ดินสอสี, v2 โทนต้นฉบับ) |
| `web/` | หน้าเว็บ 3 หน้าที่สร้างในแชต (เปิดในเบราว์เซอร์ได้เลย) |

หน้าที่ publish ไว้แล้ว:
- Field notes แบบไอโซเมตริก 5 โลก: https://claude.ai/artifact/PvCzoKcKodtM8rH6dDu3pP
- ห้าโลกเล็กๆ (statechart ลายเส้น): https://claude.ai/artifact/2sCAMNwUZkMJbCrZxvWUh1
- pipeline รีล + บั๊กที่ TLC เจอ: https://claude.ai/artifact/7TRkAgtccrenkNNqVa7nEg

## ลิงก์สำคัญ
- ต้นแบบหน้าเว็บ: https://april-zhu.com/fieldnotes
- ชุดวาดต้นฉบับ (MIT): https://github.com/kevintngo/statechart-art  (เดโม https://kevintngo.github.io/statechart-art/)
- pstack (ตัวสร้าง chart `/statechart`): https://github.com/cursor/plugins/tree/main/pstack
- พอร์ต Claude Code ของ pstack (บุคคลที่สาม ยังไม่ได้ทดสอบ): https://github.com/michael-denyer/pstack-claude
- TLC / TLA+: https://github.com/tlaplus/tlaplus

## เริ่มทำ (ลำดับที่แนะนำ)
### 1) ทดสอบชุดวาดต้นฉบับ (ผมรันผ่านแล้วบน Node 22)
```bash
git clone https://github.com/kevintngo/statechart-art.git
cd statechart-art/tools && npm install
cd .. && mkdir -p business/out          # สคริปต์ต้องมีโฟลเดอร์นี้ก่อน
node business/art/order.js --fast       # ได้ business/out/order-preview.png
```
README ของ repo ระบุว่าทำมากับ Node 24 ถ้าเจอปัญหาให้ลอง 24

### 2) ตรวจโมเดลด้วย TLC (ต้องมี Java)
```bash
curl -L -o tla2tools.jar https://github.com/tlaplus/tlaplus/releases/latest/download/tla2tools.jar
cd models
for w in W1 W2 W3 W4 W5 W6; do echo == $w; java -cp ../tla2tools.jar tlc2.TLC -config $w.cfg $w.tla -nowarning | grep -E "Error|violated|states generated|No error"; done
```
ผลที่ได้ในแชต: ดูตารางใน `models/README.md`

### 3) (ทางเลือก) ติดตั้ง pstack ใน Claude Code
```
/plugin marketplace add michael-denyer/pstack-claude
/plugin install pstack@pstack-claude
```
แล้วใช้ `/statechart` กับ `/create-formal-verification-skill` ตรวจ README ของพอร์ตก่อนติดตั้ง
ถ้าใช้ Cursor ให้ติดตั้ง pstack ตัวทางการจากลิงก์ด้านบนแทน (อย่าเปิดสองตัวพร้อมกัน)

### 4) วาดออฟฟิศด้วย kit ของต้นฉบับ
ให้ Claude Code อ่าน `CLAUDE.md` กับ `BRIEF.md` แล้วสร้าง `business/art/office.js` โดยดูแบบจาก `order.js`
(chart → pele จัดวาง → วาดตั๋ว ด้ายแดง ตัวคน)

## หมายเหตุสำคัญ (ตรงไปตรงมา)
- `art/office.ts` เขียนบนเอนจิน lainsen (`~/.lainsen/engine`, ติดตั้งด้วยสคริปต์ setup ของสกิล lainsen)
  ไม่ใช่ kit ของ Kevin ถ้าไปทางข้อ 4 ไฟล์นี้ใช้เป็นแค่แบบเลย์เอาต์/ข้อมูล (ตำแหน่งห้อง โต๊ะ สีเสื้อ ชื่อบทบาท)
- `officeKit.ts` คือ colouredPencilKit ของ lainsen ที่ผมแก้ให้รองรับแผ่นสี่เหลี่ยมผืนผ้า 9:16
- repo ของ April Zhu (ฉากไอโซเมตริก) ผมหาไม่เจอ ฉากไอโซเมตริกใน `web/field-notes-office.html` ผมเขียนเอง
  เป็นกล่องและทรงเรขาคณิตง่ายๆ ยังไม่ละเอียดเท่าต้นฉบับ
- หัวข้อ "ล็อตปาล์ม" เป็นตัวอย่างจำลอง ไม่ใช่กระบวนการจริงของ Adesa
- ฟอนต์ต้นฉบับ (Kevin Serif) ไม่มีภาษาไทย ในเว็บใช้ Courier Prime + Sarabun แทน
- เครดิต: ลายเส้นและสไตล์ดัดแปลงจาก statechart-art (Kevin T. Ngo, MIT) และ Field Notes (April Zhu); `/statechart` โดย poteto (Lauren Tan)
