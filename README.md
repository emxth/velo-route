# VeloRoute — Smart Rural Transportation System

Full-stack MERN application (MongoDB, Express, React, Node.js) with authentication, role-based access, complaints/feedback (with geolocation), bookings, routes, vehicles, schedules, departments, and password reset via email OTP.

## Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Performance Tests](#performance-tests)
- [Documentation](#documentation)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)

## Project Structure
```
docs/
  API_DOCUMENTATION.md
server/
  src/
    config/           # db, logger
    controllers/      # auth, complaints, etc.
    middleware/       # auth, roles, requestLogger, errorHandler
    models/           # User, Complaint, etc.
    repositories/     # data access layer
    routes/           # auth, users, complaints, bookings, routes, vehicles, schedules, departments
    services/         # business logic
    utils/            # mailer, token, AppError
  tests/
    unit/
    integration/
    performance/
client/
  src/
    pages/            # Login, Register, Complaints, ComplaintDetail, etc.
    components/       # SideNav, etc.
    api/              # axios instance
    context/          # AuthContext
```

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git
- Postman or curl for API checks

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
Server base: `http://localhost:5000`

### 3) Client
```bash
cd client
npm install
npm run dev
```
Client base: `http://localhost:5173`

## Environment Variables
- Server expects the variables shown above (.env in `server/`).
- For tests, set `NODE_ENV=test`; integration tests use in-memory Mongo and mock mailer.

## Scripts
From `server/`:
- `npm run dev` — start backend (dev)
- `npm start` — start backend (prod)
- `npm test` — unit tests
- `npm run test:integration` — integration tests
- `npm run test:performance` — performance (Artillery) if added to package.json

From `client/`:
- `npm run dev` — start frontend
- `npm run build` — production build

## Testing
- **Unit:** `npm test`
- **Integration:** `npm run test:integration` (uses mongodb-memory-server, supertest; mailer mocked)
- Test details: `docs/testing-report.md`

## Performance Tests
Artillery example (complaints flow):
```bash
cd server
npx artillery run tests/performance/complaints.yml

artillery run tests/performance-tests/booking-flow.yml
```
Configure target/auth in the YAML before running.

## Documentation
- API reference: `docs/API_DOCUMENTATION.md`

## Security Notes
- JWT auth with role-based authorization
- Password hashing via User model pre-save
- Rate limiting on `/api` (100 req / 15 min)
- CORS restricted to configured origins
- Use a Gmail App Password (or Mailtrap) for MAIL_PASS; restart server after .env changes

## Troubleshooting
- 401/403: Ensure `Authorization: Bearer <token>` is present; re-login if expired.
- SMTP errors: Verify `MAIL_USER`/`MAIL_PASS` and restart server.
- Mongoose `findOneAndUpdate` deprecation: use `{ returnDocument: "after" }` where applicable.