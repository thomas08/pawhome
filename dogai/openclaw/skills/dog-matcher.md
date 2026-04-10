# Skill: dog-matcher

ค้นหาหมาที่เหมาะสมจาก natural language query ของ user

## Steps

1. วิเคราะห์ query ของ user เพื่อสกัด filters:
   - ขนาด (size): เล็ก → SMALL, กลาง → MEDIUM, ใหญ่ → LARGE
   - เพศ (gender): ผู้ → MALE, เมีย → FEMALE
   - สี (color): สี search keyword
   - บุคลิก/ลักษณะ: search keyword
   - พันธุ์ (breed): search keyword

2. รัน db-list-dogs.ts พร้อม filters ที่เหมาะสม:
   ```
   tsx scripts/db-list-dogs.ts <<< '{"size": "SMALL", "search": "เชื่อง", "limit": 5}'
   ```

3. ถ้าไม่เจอ → ลอง search ด้วย keyword อื่น หรือลด filter

4. แสดงผลลัพธ์ top 3 พร้อมรูปและ inline keyboard:
   - [ติดตาม 💕] → db-follow.ts
   - [รับเลี้ยง 🏠] → adoption-handler skill
   - [ดูเพิ่ม →] → ลิงก์เว็บ

## Response Format

```
🔍 เจอน้องหมาที่น่าจะเหมาะค่ะ!

1. **น้อง[ชื่อ]** — [พันธุ์], [ขนาด], [สั้นๆ 1 ประโยค]
   📸 [รูปภาพ]
   [ติดตาม 💕] [รับเลี้ยง 🏠]

2. **น้อง[ชื่อ]** ...
```
