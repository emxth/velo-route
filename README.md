# VeloRoute — Smart Rural Transportation System

Full-stack MERN application (MongoDB, Express, React, Node.js) with authentication, role-based access, complaints/feedback with location, bookings, routes, vehicles, schedules, departments, and password reset via email OTP.

---

## Repository Structure

```
docs/
  testing-report.md
server/
  src/
    config/           # db, logger
    controllers/      # auth, complaints, etc.
    middleware/       # auth, roles, requestLogger, errorHandler
    models/           # User, Complaint, etc.
    repositories/     # data access layer
    routes/           # auth, users, complaints, bookings, routes, vehicles, schedules, departments
    services/         # business logic (authService, complaintService, etc.)
    utils/            # mailer, token, AppError
  tests/
    unit/
    integration/
client/
  src/
    pages/            # Login, Register, Complaints, ComplaintDetail, etc.
    components/       # SideNav, etc.
    api/              # axios instance
    context/          # AuthContext
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git
- Postman for API testing

---

## Setup

### 1) Clone
```bash
git clone https://github.com/emxth/velo-route.git
cd velo-route
```

### 2) Server
```bash
cd server
npm install
```

Create `server/.env` (example):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/veloroute
JWT_SECRET=changeme
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password
MAIL_FROM="VeloRoute Support" <your_email@gmail.com>
```

Run server:
```bash
npm run dev   # or npm start
```
Server: `http://localhost:5000`

### 3) Client
```bash
cd client
npm install
npm run dev
```
Client: `http://localhost:5173`

---

## API Base URL
```
http://localhost:5000/api
```

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication APIs

### Register
```
POST /auth/register
```
```json
{ "name": "Alice Admin", "email": "admin@test.com", "password": "secret123", "role": "admin" }
```

### Login
```
POST /auth/login
```
```json
{ "email": "admin@test.com", "password": "secret123" }
```
Response includes `token` and `user`.

### Forgot Password (OTP email)
```
POST /auth/forgot
```
```json
{ "email": "admin@test.com" }
```

### Reset Password with OTP
```
POST /auth/reset
```
```json
{ "email": "admin@test.com", "otp": "123456", "newPassword": "newSecret123" }
```

### Current User
```
GET /auth/me   (Bearer token)
GET /auth/admin/ping   (Bearer admin)
```

---

## User Management APIs (Bearer required)

- `GET /users` (admin)
- `GET /users/me`
- `PUT /users/me` — update current user
- `DELETE /users/me`
- `GET /users/me/permissions`
- `GET /users/:id/permissions` (admin)
- `PUT /users/:id/permissions` (admin) — change role
- `GET /users/:id` (admin)

Sample update:
```
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json
{ "name": "Duleesha Sewmini" }
```

---

## Complaint & Feedback APIs (Bearer required)

### Create Complaint
```
POST /complaints
```
```json
{
  "category": "road",
  "subject": "Pothole on main street",
  "message": "Large pothole causing delays.",
  "location": { "lat": 7.8731, "lng": 80.7718, "label": "Near bridge" }
}
```

### Create Feedback
```
POST /complaints/feedback
```
```json
{
  "category": "transport",
  "subject": "Thanks for the new route",
  "message": "Service is smoother now."
}
```

### List Complaints
```
GET /complaints
```
- Admin: all
- User: own

### Get Complaint by ID
```
GET /complaints/:id
```

### Update Status (admin)
```
PUT /complaints/:id/status
{ "status": "resolved" }
```

### Add Admin Response (admin)
```
PUT /complaints/:id/response
{ "text": "We dispatched a crew to fix this." }
```

### Delete Complaint (admin)
```
DELETE /complaints/:id
```

---

## Bookings / Routes / Vehicles / Schedules / Departments

Modules are mounted under:
- `/bookings`
- `/routes`
- `/vehicles`
- `/schedules`
- `/departments`

(Protected by JWT; some may require admin depending on route-level guards.)

---

## Testing with Token (Postman)

1) Login to get token:
```
POST http://localhost:5000/api/auth/login
{ "email": "admin@test.com", "password": "secret123" }
```

2) Use token in subsequent requests:
Header: `Authorization: Bearer <token>`

---

## Testing

### Unit Tests (server)
```bash
cd server
npm test
```
Covers services (auth, complaints, users), middleware (auth/authorize), etc.

### Integration Tests (server)
```bash
cd server
npm run test:integration
```
Uses supertest + mongodb-memory-server for auth, users, complaints, bookings.

### Testing Environment
- Set `NODE_ENV=test`
- In-memory MongoDB (no external DB)
- Mailer is mocked in tests to avoid SMTP calls

---

## Security Practices

- JWT authentication
- Role-based authorization
- Password hashing (bcrypt via User model pre-save)
- Rate limiting on `/api`
- CORS restricted to configured origins
- Input validation in services and middleware

---

## Common Issues

- 401/403: Missing or invalid Bearer token; re-login and retry.
- SMTP errors: ensure `MAIL_USER`/`MAIL_PASS` are set (Gmail app password), restart server after updating `.env`.
- Mongoose deprecation warnings: ensure `returnDocument: "after"` in findByIdAndUpdate calls where needed.