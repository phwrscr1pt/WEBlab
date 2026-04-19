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
# ถ้าตั้งค่า SSH config แล้ว (แนะนำ)
ssh thaimart-lab

# หรือใช้ full command
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87
```

### ตรวจสอบว่าระบบพร้อมใช้งาน
```bash
# ตรวจสอบ containers
ssh thaimart-lab "cd ~/ThaiMart-Labs && sudo docker-compose ps"

# ควรเห็น 2 containers: web (Up) และ db (Up healthy)
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
       Name                      Command                  State                      Ports
----------------------------------------------------------------------------------------------------------
thaimart-labs_db_1    docker-entrypoint.sh postgres    Up (healthy)   5432/tcp
thaimart-labs_web_1   docker-entrypoint.sh node  ...   Up             0.0.0.0:80->3000/tcp,:::80->3000/tcp
```

> **หมายเหตุ:** ชื่อ container อาจแตกต่างกันตาม docker-compose version

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
sudo docker exec -it thaimart-labs_db_1 psql -U thaimart -d thaimart
```

> **หมายเหตุ:** ชื่อ container อาจเป็น `thaimart-db` หรือ `thaimart-labs_db_1` ขึ้นกับ docker-compose version ใช้ `docker-compose ps` เพื่อดูชื่อจริง

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

### Output ที่จะเห็นใน Logs:
```
web_1  | POST /lab01/cart 201 33.496 ms - 329
web_1  | GET /lab01/cart 200 5.123 ms - 245
web_1  | GET /lab01 200 12.456 ms - 8234
```

> **รูปแบบ:** `METHOD /path STATUS_CODE response_time - content_length`

### อธิบาย:
> "เห็นไหมครับ! ทุกครั้งที่มี request เข้ามา server จะ log ออกมา
>
> - **POST /lab01/cart** - HTTP method และ path
> - **201** - Status code (201 = Created สำเร็จ)
> - **33.496 ms** - เวลาที่ server ใช้ประมวลผล
> - **329** - ขนาด response (bytes)
>
> นี่คือสิ่งที่ admin เห็นเวลามีคนเข้าใช้เว็บไซต์ รวมถึงเวลามีคนพยายามโจมตีด้วย!"

### ตัวอย่างการโจมตีที่จะเห็นใน Logs:
```bash
# SQL Injection attempt
web_1  | GET /lab05?search=' OR '1'='1 200 15.234 ms - 4521

# XSS attempt
web_1  | GET /lab07?q=<script>alert(1)</script> 200 8.123 ms - 2345
```

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
ssh thaimart-lab
# หรือ: ssh -J root-agent@100.107.182.15 asdf@10.10.61.87

# ดู containers ที่รันอยู่
sudo docker-compose ps

# ดู logs แบบ real-time (จะเห็นทุก HTTP request)
sudo docker-compose logs -f web

# ดู logs ย้อนหลัง 100 บรรทัด
sudo docker-compose logs --tail=100 web

# เข้า database
sudo docker exec -it thaimart-labs_db_1 psql -U thaimart -d thaimart

# Restart ทั้งระบบ
sudo docker-compose restart

# Reset database (ล้างข้อมูลทั้งหมด รวมถึง stored XSS)
sudo docker-compose down -v && sudo docker-compose up -d

# ดู source code
cat src/app.js
cat src/routes/lab01.js

# Pull latest code และ deploy
git pull && sudo docker-compose up -d --build
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

### ถ้า web container crash:
```bash
# ดู error
sudo docker-compose logs --tail=100 web

# Rebuild และ restart
sudo docker-compose up -d --build
```

### ถ้านักเรียนเข้าเว็บไม่ได้:
1. ตรวจสอบว่า containers รันอยู่: `sudo docker-compose ps`
2. ตรวจสอบ network ของนักเรียน (ต้องอยู่ใน LAN 10.10.61.x)
3. ลอง curl จาก Lab VM: `curl http://localhost/lab01`

### ถ้า Stored XSS (Lab 09) มี script เยอะเกินไป:
```bash
# Reset database จะล้าง reviews ทั้งหมด
sudo docker-compose down -v && sudo docker-compose up -d
```

### ถ้าต้องการดู container ที่รันอยู่:
```bash
# ดูชื่อ container จริง
sudo docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## Instructor Tips

### ก่อนเริ่มสอน
1. **ทดสอบ SSH ก่อน** - ตรวจสอบว่า `ssh thaimart-lab` ทำงานได้
2. **Reset database** - ล้างข้อมูลเก่าจาก session ก่อนหน้า
3. **เปิด 2 terminals** - อันนึงสำหรับ logs, อีกอันสำหรับ demo commands

### ระหว่างสอน
1. **เปิด logs ไว้ตลอด** - นักเรียนจะเห็นว่า request ของตัวเองไปถึง server
2. **ใช้ curl สาธิตก่อน** - แล้วค่อยให้นักเรียนลองเอง
3. **อธิบาย status codes** - 200 OK, 201 Created, 400 Bad Request, 500 Error

### Lab Credentials (เก็บไว้อ้างอิง)
| Lab | Username | Password |
|-----|----------|----------|
| 02 | user1 | password123 |
| 04 | seller1 | securepass99 |
| 08 | member1 | 1234 |

### CTF Flags (เก็บไว้ตรวจคำตอบ)
| Lab | Flag |
|-----|------|
| 10 | `SMC{1nt3rc3pt_m4st3r}` |
| 11 | `SMC{r3p34t3r_h34d3r_f0und}` |
| 12 | `SMC{brut3_f0rc3_w1ns}` |

### Lab 12 - Correct PIN
- **PIN:** `7392`

---

*สร้างเมื่อ: 2026-04-19*
*อัปเดตล่าสุด: 2026-04-19 - เพิ่ม morgan logging, SSH alias, instructor tips*
