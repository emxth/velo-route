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

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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

---

## API Overview (Base: `http://localhost:5000/api`)

### Auth
- `POST /auth/register` — `{ name, email, password, role? }`
- `POST /auth/login` — `{ email, password }` → `{ token, user }`
- `POST /auth/forgot` — `{ email }` (sends OTP email)
- `POST /auth/reset` — `{ email, otp, newPassword }`
- `GET /auth/me` — Bearer token required
- `GET /auth/admin/ping` — Bearer + `admin`

### Users
- `GET /users` — admin only
- `GET /users/me` — current user
- `PUT /users/me` — update current
- `DELETE /users/me`
- `GET /users/me/permissions`
- `GET /users/:id/permissions` — admin
- `PUT /users/:id/permissions` — admin (role change)
- `GET /users/:id` — admin

### Complaints & Feedback
- `POST /complaints` — create complaint
- `POST /complaints/feedback` — create feedback
- `GET /complaints` — admin: all; user: own
- `GET /complaints/:id` — admin or owner
- `PUT /complaints/:id/status` — admin (pending|resolved)
- `PUT /complaints/:id/response` — admin (text)
- `DELETE /complaints/:id` — admin

### Other modules (present but not detailed here)
- Bookings: `/bookings`
- Routes: `/routes`
- Vehicles: `/vehicles`
- Schedules: `/schedules`
- Departments: `/departments`

---

## Routes Management
Handles transport routes,stops,distance calculation and estimated travel duration.

--- Features ---
- create transport routes with multiple stops
- Automatically calculate route distance and duration using OSRM API
- Update route stops and recalculate travel data
- Retrieve route details
- Delete routes

---API Endpoints---
- `POST /api/routes/addRoute` -Create New Transport Route
- `GET /api/routes/` - Get all transport routes
- `GET /api/routes/route/:id` - Get specific Route
- `PUT /api/routes/updateRoute/:id` - Update Existing Route
- `DELETE /api/routes/clearRoute/:id` - Delete Route

--- Third Party API ---
OSRM (Open Source Routing Machine) - Used for calculate route distance and duration


## Schedule Management

Manage vehicle trip schedules for routes and ensure vehicles are not double-scheduled until finished trip

--Features--
 1. Assign Vehicle to routes
 2. Automatically calculate arrival time based on route duration
 3. Detect schedule conflict
 4. Prevent Vehicle assignment when previous trip is not completed
 5. Retrieve and manage schedules

--- API Endpoints ---
- `/api/schedules/addSchedule` - Add New Schedul
- `/api/schedules/` - Get all schedules
- `/api/schedules/:id` - Get specific schedule by using schedule id
- `/api/schedules/updateSchedule/:id` - Update Existing  schedule
- `/api/schedules/:id` - Delete specific schedule

--- Conflict Detection Logic ---

The system prevent scheduling conflicts by checking:

  - Vehicle already assigned to another trip
  - Trip overlapping with existing schedules
  - Vehicle still running previous trip



## Authentication

All protected routes require `Authorization: Bearer <JWT>` from `POST /auth/login`.

### Quick Auth Flow (Postman):
1. Register (or use existing user)
2. Login → copy `token`
3. Set Postman “Authorization” type Bearer Token with that `token`
4. Call protected endpoints

---

## Client (SPA)

Key pages:
- `Login` (`/login`), `Register` (`/register`)
- `ForgotPassword` (`/forgot-password`): requests OTP
- `ResetPassword` (`/reset-password`): uses OTP + new password, then redirects to login
- `ComplaintsPage` (`/complaints`): submit complaint/feedback with location search (Nominatim) or “Use my location”, list own/all
- `ComplaintDetailPage` (`/complaints/:id`): view; admin can update status/response/delete
- `SideNav`: includes Complaints link (public for authenticated users)

---

## Location Usability (Client)
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
