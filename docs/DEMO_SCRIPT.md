# ThaiMart Labs - Instructor Demo Script

## Web Essentials: ทำความเข้าใจ Web Server Architecture

**เวลาทั้งหมด:** ประมาณ 15-20 นาที

**เป้าหมาย:** ให้นักเรียนเห็นภาพจริงว่า Web Server, Application Server และ Database ทำงานอย่างไร

---

## ก่อนเริ่ม Demo

### สิ่งที่ต้องเตรียม
- Terminal ที่สามารถ SSH เข้า Lab VM ได้
- Browser เปิด http://10.10.61.87 ไว้
- (ถ้ามี) Projector/Screen แชร์หน้าจอให้นักเรียนเห็น

### SSH เข้า Lab VM
```bash
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87
```

---

## Part 1: Overview - Docker Containers (3 นาที)

### พูดกับนักเรียน:
> "ก่อนอื่นเรามาดูกันว่า ThaiMart รันอยู่บนอะไรบ้าง ระบบของเราใช้ Docker ในการรันบริการต่างๆ"

### รันคำสั่ง:
```bash
cd ~/ThaiMart-Labs
sudo docker-compose ps
```

### Output ที่คาดหวัง:
```
NAME                IMAGE                 STATUS          PORTS
thaimart-web        thaimart-labs-web     Up 2 hours      0.0.0.0:80->3000/tcp
thaimart-db         postgres:16-alpine    Up 2 hours      5432/tcp
```

### อธิบาย:
> "เห็นไหมครับ เรามี 2 containers:
> 1. **thaimart-web** - นี่คือ Web + Application Server ของเรา รันบน port 80
> 2. **thaimart-db** - นี่คือ Database Server (PostgreSQL)
>
> ทั้งสองอันทำงานแยกกัน แต่คุยกันได้ผ่าน Docker network"

---

## Part 2: Web/Application Server - Express.js (5 นาที)

### พูดกับนักเรียน:
> "มาดูกันว่า Web Server ของเราเขียนด้วยอะไร"

### รันคำสั่ง:
```bash
# ดูโครงสร้างโปรเจค
ls -la

# ดูไฟล์หลักของ Application
head -40 src/app.js
```

### อธิบาย:
> "นี่คือไฟล์ `app.js` - หัวใจของ Application Server
>
> - บรรทัด 1-5: เราใช้ **Express.js** เป็น framework
> - บรรทัด 11-17: ตั้งค่าการเชื่อมต่อ **PostgreSQL** database
> - บรรทัด 27-39: ตั้งค่า middleware (cookie, session, JSON parser)
> - บรรทัด 42-52: กำหนด routes สำหรับแต่ละ lab
>
> เวลามี request เข้ามา Express จะรับ → ประมวลผล → ส่ง response กลับ"

### ดูตัวอย่าง Route:
```bash
# ดู Lab 01 route
head -50 src/routes/lab01.js
```

### อธิบาย:
> "นี่คือ route สำหรับ Lab 01 - Shopping Cart
>
> - `router.get('/')` - รับ GET request แล้ว render หน้าเว็บ
> - `router.post('/cart')` - รับ POST request เพิ่มสินค้าลงตะกร้า
> - `router.put('/cart/:id')` - รับ PUT request แก้ไขจำนวน
> - `router.delete('/cart/:id')` - รับ DELETE request ลบสินค้า
>
> ทุก HTTP method ที่เราเรียนใน class มันทำงานจริงตรงนี้!"

---

## Part 3: Database Server - PostgreSQL (5 นาที)

### พูดกับนักเรียน:
> "ตอนนี้เรามาดู Database กันบ้าง"

### รันคำสั่ง:
```bash
# เข้าไปใน Database container
sudo docker exec -it thaimart-db psql -U thaimart -d thaimart
```

### ใน PostgreSQL:
```sql
-- ดู tables ทั้งหมด
\dt

-- ดูข้อมูลสินค้าใน Lab 07
SELECT * FROM search_products;

-- ดูข้อมูล staff ใน Lab 05
SELECT * FROM staff LIMIT 5;

-- ออกจาก psql
\q
```

### อธิบาย:
> "นี่คือ PostgreSQL database ที่เก็บข้อมูลทั้งหมดของ ThaiMart
>
> - `search_products` - สินค้าสำหรับค้นหา
> - `staff` - ข้อมูลพนักงาน
> - `reviews` - รีวิวสินค้า
>
> เวลานักเรียน SQL Injection สำเร็จ จะเห็นข้อมูลเหล่านี้แหละครับ"

---

## Part 4: Live Logs - ดู Request จริง (5 นาที)

### พูดกับนักเรียน:
> "ส่วนที่น่าสนใจที่สุด - มาดู logs แบบ real-time กัน"

### รันคำสั่ง (Terminal 1 - Logs):
```bash
# ดู logs แบบ real-time
sudo docker-compose logs -f web
```

### ให้นักเรียนทำ (Browser หรือ Terminal อื่น):
> "ตอนนี้ให้น้องๆ เปิด browser ไปที่ http://10.10.61.87/lab01 แล้วลองกดเพิ่มสินค้าลงตะกร้าดู"

หรือให้ลอง curl:
```bash
# ในอีก terminal
curl -X POST http://10.10.61.87/lab01/cart \
     -H "Content-Type: application/json" \
     -d '{"product_id": 1, "quantity": 1}'
```

### อธิบาย:
> "เห็นไหมครับ! ทุกครั้งที่มี request เข้ามา server จะ log ออกมา
>
> - IP address ของผู้ส่ง request
> - HTTP method (GET, POST, PUT, DELETE)
> - Path ที่เรียก
> - Status code ที่ส่งกลับ
>
> นี่คือสิ่งที่ admin เห็นเวลามีคนเข้าใช้เว็บไซต์"

### หยุด logs:
กด `Ctrl+C`

---

## Part 5: Architecture Diagram Recap (2 นาที)

### วาดหรือแสดงแผนภาพ:
```
┌──────────────────────────────────────────────────────────────┐
│                        Browser                                │
│                    (นักเรียน/ผู้ใช้)                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     Docker Container: web                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Express.js (Node.js)                       │  │
│  │                                                         │  │
│  │  • รับ HTTP Request                                     │  │
│  │  • ประมวลผล Business Logic                             │  │
│  │  • Render HTML หรือส่ง JSON                            │  │
│  │  • เชื่อมต่อ Database                                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Query
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     Docker Container: db                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  PostgreSQL 16                          │  │
│  │                                                         │  │
│  │  • เก็บข้อมูลสินค้า, ผู้ใช้, รีวิว                      │  │
│  │  • รัน SQL queries                                      │  │
│  │  • ส่งผลลัพธ์กลับ Application                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### สรุป:
> "สรุปแล้ว:
> 1. **Browser** ส่ง HTTP Request
> 2. **Express.js** รับ request, ประมวลผล
> 3. **PostgreSQL** เก็บ/ดึงข้อมูล
> 4. **Express.js** ส่ง response กลับ browser
>
> ทุก lab ที่เราจะทำ จะโจมตีจุดไหนสักจุดในสายนี้ครับ!"

---

## Quick Commands Reference

```bash
# SSH เข้า Lab VM
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87

# ดู containers ที่รันอยู่
sudo docker-compose ps

# ดู logs แบบ real-time
sudo docker-compose logs -f web

# เข้า database
sudo docker exec -it thaimart-db psql -U thaimart -d thaimart

# Restart ทั้งระบบ
sudo docker-compose restart

# Reset database (ล้างข้อมูลทั้งหมด)
sudo docker-compose down -v && sudo docker-compose up -d

# ดู source code
cat src/app.js
cat src/routes/lab01.js
```

---

## Troubleshooting

### ถ้า containers ไม่รัน:
```bash
sudo docker-compose up -d
```

### ถ้า database ค้าง:
```bash
sudo docker-compose restart db
```

### ถ้าอยากดู error logs:
```bash
sudo docker-compose logs --tail=50 web
```

---

*สร้างเมื่อ: 2026-04-19*
