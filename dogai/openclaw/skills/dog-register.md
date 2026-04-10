# Skill: dog-register

ใช้เมื่อ Admin ส่งรูปหมาเข้ามา (1 รูปหรือหลายรูป)

## Steps

1. **Upload photos to R2**
   สำหรับแต่ละ photo file_id ที่ได้รับ:
   ```
   tsx scripts/upload-photo.ts <<< '{"fileId": "<FILE_ID>"}'
   ```
   เก็บ URL ทุกตัวไว้

2. **Analyze photos with Vision**
   ดูรูปทุกรูปแล้ววิเคราะห์:
   - พันธุ์ (breed) — ถ้าไม่ชัดเจนให้ใช้ "พันธุ์ผสม"
   - อายุโดยประมาณ (estimatedAge) — เช่น "~6 เดือน", "1-2 ปี"
   - เพศ (gender) — MALE / FEMALE / UNKNOWN
   - ขนาด (size) — SMALL / MEDIUM / LARGE
   - สีขน (color)
   - น้ำหนักโดยประมาณ (weight) ถ้าเดาได้
   - บุคลิก (personality) — 2-3 ประโยค
   - สุขภาพเบื้องต้น (healthNotes) — สิ่งที่เห็นได้จากรูป

3. **Generate Thai name with dog-namer skill**
   ส่งผล vision ไปให้ dog-namer เพื่อสร้างชื่อไทย 3 ตัวเลือก

4. **Show preview to Admin**
   แสดงข้อมูลทั้งหมดในรูปแบบ:
   ```
   🐾 พบน้องหมาตัวใหม่!

   ชื่อ: [ชื่อที่แนะนำ] (ที่มา: [เหตุผล])
   พันธุ์: [breed]
   อายุ: [estimatedAge]
   เพศ: [gender]
   ขนาด: [size]
   สีขน: [color]

   [personality]

   [healthNotes ถ้ามี]
   ```
   พร้อม inline keyboard:
   - ✅ ยืนยัน
   - ✏️ เปลี่ยนชื่อ (แสดงตัวเลือกอื่น)
   - 📝 เพิ่มข้อมูล
   - ❌ ยกเลิก

5. **On confirm → Save to DB**
   ```
   tsx scripts/db-register-dog.ts <<< '<JSON>'
   ```
   แล้วตอบ: "บันทึกน้อง[ชื่อ]เรียบร้อยแล้วค่ะ 🎉 เว็บไซต์จะอัพเดทโดยอัตโนมัตินะคะ"
