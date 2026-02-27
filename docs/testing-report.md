# Testing Report — VeloRoute

Scope: User Management (auth, profile, permissions) and Complaint/Feedback Management. Other modules (bookings, routes, vehicles, schedules, departments) to be covered later.

## 1. Environment

- Node.js: 18+
- Test DB: in-memory MongoDB (mongodb-memory-server)
- Auth: JWT
- Mail: mocked (no real SMTP calls)
- Base URL (local): `http://localhost:5000/api`

## 2. Tools & Frameworks

- Unit tests: Jest
- Integration tests: Jest + supertest + mongodb-memory-server
- Manual/API checks: Postman/curl
- Coverage: not enforced in CI yet (can be added later)

## 3. Test Execution

### 3.1 Commands
```bash
# Unit tests
cd server
npm test

# Integration tests
npm run test:integration
```

### 3.2 Configuration Notes
- `NODE_ENV=test` prevents real DB connect; tests spin up in-memory Mongo.
- Mailer is mocked in integration tests; no SMTP credentials needed.
- JWT secret defaults to `testsecret` if not provided; set `JWT_SECRET` for consistency.
- Rate limiter applies to `/api`; in-memory tests are local and fast.

## 4. Coverage (Current Scope)

- Auth: register, login, forgot password (OTP), reset password with OTP.
- User: list (admin), get me, update me, delete me, get by id (admin), permissions endpoints (unit).
- Complaints/Feedback: create complaint (with location), create feedback, list (role-aware), get by id (owner/admin), update status (admin), add response (admin), delete (admin).

## 5. Test Suites

### 5.1 Unit
- `services/authService.test.js`: field validation, duplicate email, login failure/success, OTP request, reset flows.
- `services/userService.test.js`: role/permissions shaping, role updates, id validation.
- `services/complaintService.test.js`: location normalization, access checks, status/response validation.
- `middleware/auth.test.js`: protect/authorize behaviors.

### 5.2 Integration
- `integration/user.integration.test.js`:
  - Register → Login → token issuance
  - /users/me (get), /users/me (update), /users (admin list), /users/:id (admin get)
  - Forgot password triggers mailer mock
  - Reset password with preset OTP hash → login with new password
  - Delete current user
- `integration/complaint.integration.test.js`:
  - Create complaint with location
  - Create feedback
  - List as admin (all) and as user (own)
  - Get by id (owner) and 403 for non-owner non-admin
  - Admin status update, admin response add, admin delete

## 6. Manual Test Snippets (Postman)

### Login (get token)
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
{
  "email": "admin@test.com",
  "password": "secret123"
}
```

### Create Complaint
```
POST http://localhost:5000/api/complaints
Authorization: Bearer <token>
Content-Type: application/json
{
  "category": "road",
  "subject": "Pothole on main street",
  "message": "Large pothole causing delays.",
  "location": { "lat": 7.8731, "lng": 80.7718, "label": "Near bridge" }
}
```

### Create Feedback
```
POST http://localhost:5000/api/complaints/feedback
Authorization: Bearer <token>
Content-Type: application/json
{
  "category": "transport",
  "subject": "Thanks for the new route",
  "message": "Service is smoother now."
}
```

### Update Complaint Status (admin)
```
PUT http://localhost:5000/api/complaints/<id>/status
Authorization: Bearer <admin-token>
Content-Type: application/json
{ "status": "resolved" }
```

### Add Admin Response (admin)
```
PUT http://localhost:5000/api/complaints/<id>/response
Authorization: Bearer <admin-token>
Content-Type: application/json
{ "text": "We dispatched a crew to fix this." }
```

## 7. Known Issues / Notes

- SMTP errors occur if `MAIL_USER`/`MAIL_PASS` are missing; in tests mailer is mocked, but in manual runs ensure `.env` is set and server restarted.
- Rate limiter (100 requests/15min) applies; heavy scripted runs may need temporary adjustment.
- Mongoose `findOneAndUpdate` deprecation warning: use `{ returnDocument: "after" }` where applicable.

## 8. Next Steps

- Add integration coverage for bookings, routes, vehicles, schedules, departments.
- Add coverage reporting (e.g., `--coverage`) and CI gating.
- Add negative-path integration tests for auth (expired/invalid token) and complaints (invalid location payload).
- Add contract tests for mailer when using a test SMTP (Mailtrap) in non-mocked environments.