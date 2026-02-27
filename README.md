# VeloRoute — Server + Client

End-to-end app with authentication, role-based access, complaints/feedback with location, booking/routes/vehicles/departments, and password reset via email OTP.

---

## Project Structure

```
server/
  src/
    config/           # db, logger
    controllers/      # auth
    middleware/       # auth, roles, requestLogger, errorHandler
    models/           # User, Complaint, etc.
    repositories/     # data access layer
    routes/           # auth, users, complaints, bookings, routes, vehicles, schedules, departments
    services/         # business logic (authService, complaintService, etc.)
    utils/            # mailer, token, AppError
  tests/
    unit/             # Jest unit tests
client/
  src/
    pages/            # Login, Register, ForgotPassword, ResetPassword, Complaints, ComplaintDetail, etc.
    components/       # SideNav, etc.
    api/              # axios instance
    context/          # AuthContext
```

---

## Prerequisites

- Node.js 18+
- MongoDB running (local or cloud)
- SMTP credentials (Gmail app password or Mailtrap)

---

## Environment Variables

Create `.env` in `server/` based on `.env.example`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/veloroute
JWT_SECRET=changeme
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Mail (Gmail SMTP)
MAIL_HOST=...gmail.com
MAIL_PORT=587
MAIL_USER=youraddress@gmail.com
MAIL_PASS=your_app_password   # 16-char app password
MAIL_FROM="VeloRoute Support" <youraddress@gmail.com>
```

> Ensure the server is restarted after editing `.env`.

---

## Install & Run

```bash
# Server
cd server
npm install
npm run dev    # or npm start

# Client
cd client
npm install
npm run dev    # default Vite port 5173
```

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

- Free search via OpenStreetMap Nominatim (no key); debounced queries
- “Use my location” via browser geolocation
- Manual lat/lng still possible
- Stored as GeoJSON Point ([lng, lat]) server-side, returned as { lat, lng, label }

---

## Testing

### Unit Tests (server)
```bash
cd server
npm test
```
Covers auth service (register/login/reset), complaints, middleware, etc.

### Common Auth Testing Issues
- 401/403: Ensure Bearer token is set from `/auth/login`
- 500 on `/auth/forgot`: Ensure MAIL_USER/MAIL_PASS loaded; restart server after `.env` changes

---

## Troubleshooting Mail
- Use a real Gmail App Password (not your login)
- Check logs (`logs/error.log`) and console for `Missing credentials for "PLAIN"` (means env not loaded or blanks)
- For testing without real email, use Mailtrap credentials.

---

## Security & Rate Limits
- Rate limit: `/api` max 100 requests / 15 minutes per IP
- JWT required for protected routes; role guard for admin endpoints
- CORS restricted to configured origins

---

## Run Order (local quick start)
1. Start MongoDB
2. Create `.env` with valid `MAIL_USER/MAIL_PASS`
3. `cd server && npm install && npm run dev`
4. `cd client && npm install && npm run dev`
5. Register → Login → use Bearer token in Postman for protected APIs