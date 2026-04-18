# ThaiMart Labs

Vulnerable web application labs for cybersecurity education. Designed for Summer Camp students (ages 11-18).

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd ThaiMart-Labs

# Start the application
docker-compose up -d

# Access the labs
open http://localhost
```

## Requirements

- Docker & Docker Compose
- Port 80 available

## Lab Overview

| Lab | Topic | Vulnerability |
|-----|-------|---------------|
| 01 | Web Essentials | HTTP Methods (GET, POST, PUT, DELETE) |
| 02 | Web Essentials | Stateless / Session Demo |
| 03 | SQL Injection | SQL Playground (Educational, NOT vulnerable) |
| 04 | SQL Injection | Auth Bypass (`' OR '1'='1`) |
| 05 | SQL Injection | Union-Based Injection |
| 06 | SQL Injection | SQLmap Target (Numeric Injection) |
| 07 | XSS | Reflected XSS |
| 08 | XSS | Reflected XSS + Cookie Stealing |
| 09 | XSS | Stored XSS (Reviews) |

## Credentials

### Lab 02 - Member Login
- Username: `user1`
- Password: `password123`

### Lab 04 - Seller Portal
- Username: `seller1`
- Password: `securepass99`

### Lab 08 - Member Search
- Username: `member1`
- Password: `1234`

## Cookie Logger

Access `/logger` to view captured cookies from XSS attacks.

Endpoint: `GET /logger/catch?c=COOKIE_VALUE`

## Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

## Tech Stack

- Node.js 20
- Express 4
- PostgreSQL 16
- EJS Templates
- Docker

## Security Notice

**This application is INTENTIONALLY VULNERABLE.**

- DO NOT deploy on public internet
- Use only in isolated lab environments
- For educational purposes only
