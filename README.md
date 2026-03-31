# Smart Accounting Web App

เว็บระบบบัญชีร้านค้าแบบ Full Stack ใช้ Node.js + Express และเก็บข้อมูลทั้งหมดด้วยไฟล์ JSON

## Features
- สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ
- Session authentication
- บันทึกรายรับรายจ่าย
- แก้ไข / ลบรายการ
- คำนวณกำไรอัตโนมัติ
- สรุปรายรับ ค่าใช้จ่าย กำไร และจำนวนรายการ
- รายงานพร้อมกราฟแบบ canvas
- โปรไฟล์ร้าน: ชื่อร้าน โลโก้ สีธีม
- Responsive UI โทนน้ำเงินเข้มแบบ modern dashboard

## Tech Stack
- Node.js
- Express
- express-session
- bcryptjs
- multer
- fs-extra
- JSON files as database

## Project Structure

```
accounting-webapp/
  data/
    users.json
    stores.json
    transactions.json
  middleware/
    authMiddleware.js
  public/
    css/style.css
    js/common.js
    js/auth.js
    js/dashboard.js
    js/profile.js
    js/reports.js
    uploads/
    index.html
    login.html
    register.html
    dashboard.html
    profile.html
    reports.html
  routes/
    authRoutes.js
    reportRoutes.js
    storeRoutes.js
    transactionRoutes.js
  utils/
    db.js
    helpers.js
    seed.js
  package.json
  server.js
  README.md
```

## Installation

```bash
npm install
```

## Run

```bash
npm start
```

ระบบจะรันที่:

```bash
http://localhost:3000
```

## Seed Demo Data

ถ้าต้องการข้อมูลตัวอย่าง:

```bash
npm run seed
```

บัญชีตัวอย่าง:
- email: demo@example.com
- password: 123456

## JSON Database Schema

### users.json
```json
[
  {
    "id": "uuid",
    "username": "demo",
    "email": "demo@example.com",
    "passwordHash": "hashed_password",
    "storeId": "uuid",
    "createdAt": "2026-03-31T00:00:00.000Z"
  }
]
```

### stores.json
```json
[
  {
    "id": "uuid",
    "ownerUserId": "uuid",
    "storeName": "ร้านเดโม่",
    "logo": "",
    "themeColor": "#24c8f3",
    "createdAt": "2026-03-31T00:00:00.000Z"
  }
]
```

### transactions.json
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "storeId": "uuid",
    "date": "2026-03-31",
    "itemName": "เสื้อยืด",
    "quantity": 2,
    "price": 250,
    "expense": 80,
    "note": "ขายผ่านไลฟ์สด",
    "type": "income",
    "profit": 420,
    "createdAt": "2026-03-31T00:00:00.000Z"
  }
]
```

## Main API
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/transactions
- POST /api/transactions
- PUT /api/transactions/:id
- DELETE /api/transactions/:id
- GET /api/reports/summary
- GET /api/store
- PUT /api/store

## Notes
- หากไฟล์ JSON ไม่มี ระบบจะสร้างให้อัตโนมัติ
- ระบบนี้เหมาะกับงานเริ่มต้นหรือโปรเจกต์เดโม
- ถ้าต้องการ deploy จริง ควรเปลี่ยนจาก JSON เป็น database จริงในอนาคต
