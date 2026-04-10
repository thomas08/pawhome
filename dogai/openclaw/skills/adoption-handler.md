# Skill: adoption-handler

จัดการ adoption flow แบบ conversational

## Trigger
- User พิมพ์ `/adopt <ชื่อหมา>`
- User พิมพ์ "อยากรับเลี้ยง / รับเลี้ยง [ชื่อหมา]"
- User กด inline button รับเลี้ยงจาก dog-matcher

## Flow

### Step 1: Verify dog & user
```
tsx scripts/db-get-dog.ts <<< '{"name": "<DOG_NAME>"}'
tsx scripts/db-get-user.ts <<< '{"telegramId": "<TELEGRAM_ID>"}'
```
- ถ้าหมาไม่ available → แจ้ง user อย่างสุภาพ
- ถ้ามี pending adoption อยู่แล้ว → แจ้งสถานะ

### Step 2: Conversation (ask one at a time)
ถามทีละข้อ ไม่ถามพร้อมกัน:
1. "คุณเคยเลี้ยงสุนัขมาก่อนไหมคะ?"
2. "ที่บ้านของคุณเหมาะกับน้องหมาไหมคะ? (บ้าน/คอนโด/มีสนาม)"
3. "เหตุผลที่อยากรับเลี้ยงน้อง[ชื่อ]คะ?"

### Step 3: Summary & Confirm
สรุปข้อมูลทั้งหมดแล้วถามยืนยัน:
```
📋 สรุปคำขอรับเลี้ยง

น้องหมา: [ชื่อ]
ประสบการณ์: [คำตอบ]
ที่อยู่อาศัย: [คำตอบ]
เหตุผล: [คำตอบ]

[✅ ยืนยัน] [❌ ยกเลิก]
```

### Step 4: Save
```
tsx scripts/db-create-adoption.ts <<< '{"telegramId": "...", "dogName": "...", "reason": "..."}'
```

### Step 5: Confirm to user & notify admin
ตอบ: "รับเรื่องเรียบร้อยแล้วค่ะ! ทีม admin จะตรวจสอบและติดต่อกลับภายใน 1-3 วันทำการนะคะ 🐾"

Admin notification: ส่ง broadcast ไปยัง admin ด้วย `/broadcast` หรือ notify-followers.ts
