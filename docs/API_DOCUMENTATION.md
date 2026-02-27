# API Documentation — VeloRoute

Base URL: `http://localhost:5000/api`  
Authentication: Bearer JWT on protected endpoints  
Header (when required): `Authorization: Bearer <token>` and `Content-Type: application/json`

---

## User Management

### Register
- **POST** `/auth/register`
- **Body**
```json
{
  "name": "Alice Admin",
  "email": "admin@test.com",
  "password": "secret123",
  "role": "admin"
}
```
- **Auth**: Not required

### Login
- **POST** `/auth/login`
- **Body**
```json
{
  "email": "admin@test.com",
  "password": "secret123"
}
```
- **Auth**: Not required
- **Response**: `{ token, user }`

### Forgot Password (OTP email)
- **POST** `/auth/forgot`
- **Body**
```json
{ "email": "admin@test.com" }
```
- **Auth**: Not required

### Reset Password with OTP
- **POST** `/auth/reset`
- **Body**
```json
{
  "email": "admin@test.com",
  "otp": "123456",
  "newPassword": "newSecret123"
}
```
- **Auth**: Not required

### List Users (admin)
- **GET** `/users`
- **Auth**: Bearer (admin)

### Current User Details
- **GET** `/users/me`
- **Auth**: Bearer

### Update Current User
- **PUT** `/users/me`
- **Body**
```json
{ "name": "Duleesha Sewmini" }
```
- **Auth**: Bearer

### Get Full User Details by ID (admin)
- **GET** `/users/:id`
- **Auth**: Bearer (admin)

### Delete Current User
- **DELETE** `/users/me`
- **Auth**: Bearer

---

## Complaint and Feedback Management

### Create Complaint (with location)
- **POST** `/complaints`
- **Body**
```json
{
  "category": "road",
  "subject": "Pothole on main street",
  "message": "Large pothole causing delays.",
  "location": { "lat": 7.8731, "lng": 80.7718, "label": "Near bridge" }
}
```
- **Auth**: Bearer

### Create Feedback
- **POST** `/complaints/feedback`
- **Body**
```json
{
  "category": "transport",
  "subject": "Thanks for the new route",
  "message": "Service is smoother now."
}
```
- **Auth**: Bearer

### List Complaints
- **GET** `/complaints`
- **Auth**: Bearer  
  - Admin: all complaints  
  - User: own complaints

### Get Complaint by ID
- **GET** `/complaints/:id`
- **Auth**: Bearer (owner or admin)

### Update Complaint Status (admin)
- **PUT** `/complaints/:id/status`
- **Body**
```json
{ "status": "resolved" }
```
- **Auth**: Bearer (admin)

### Add Admin Response (admin)
- **PUT** `/complaints/:id/response`
- **Body**
```json
{ "text": "We dispatched a crew to fix this." }
```
- **Auth**: Bearer (admin)

### Delete Complaint (admin)
- **DELETE** `/complaints/:id`
- **Auth**: Bearer (admin)
---------------------------------------------------------------------------------------------

## Booking & Payment Module API Documentation

**AUTHENTICATION**
==================================================

- Authentication Type:
    - Bearer JSON Web Token (JWT)

Required Header for Protected Endpoints:
- Authorization: Bearer <your_jwt_token>
- Content-Type: application/json

Roles Used:
- user  → Manage own bookings
- admin → View all bookings

==================================================
**BOOKING MODULE**
==================================================

**1. Create Booking**
--------------------------------------------------

Endpoint:
POST `/bookings`

Access:
User only (role: user)

Request Body:
```json
{
  "transportType": "BUS",
  "tripId": "BUS101",
  "seatNumbers": ["A1", "A2"],
  "phoneNumber": "+94771234567",
  "fromLocation": "Nuwara Eliya",
  "toLocation": "Kandy",
  "departureTime": "2026-03-01T08:00:00Z"
}
```

If transportType = TRAIN, include:
```json
{
  "coachNumber": "C1"
}
```
Success Response (201):
```json
{
    "passenger": "699fec7118ab45ce1698e416",
    "phoneNumber": "+94771234567",
    "transportType": "BUS",
    "tripId": "BUS101",
    "seatNumbers": [
        "A1",
        "A2"
    ],
    "seatCount": 2,
    "fromLocation": "Nuwara Eliya",
    "toLocation": "Kandy",
    "departureTime": "2026-03-01T08:00:00.000Z",
    "amount": 1000,
    "bookingStatus": "PENDING",
    "paymentStatus": "UNPAID",
    "_id": "69a16b2c1fad9f8c8dbc136a",
    "createdAt": "2026-02-27T10:00:12.915Z",
    "updatedAt": "2026-02-27T10:00:12.915Z",
    "__v": 0
}

```
Business Rules:
- Phone number must match format +94XXXXXXXXX
- At least one seat must be selected
- Seats cannot already be booked for the same trip
- Train bookings require coachNumber
- Bus bookings must not include coachNumber

Error Codes:
400 → Validation error / Seat conflict / Invalid phone
401 → Unauthorized (missing or invalid token)
403 → Forbidden (role restriction)
500 → Internal server error

--------------------------------------------------
**2. Get My Bookings**
--------------------------------------------------

Endpoint:
GET `/bookings/me`

Access:
Authenticated user

Success Response (200):
```json
[
  {
    "_id": "bookingId",
    "tripId": "BUS101",
    "bookingStatus": "CONFIRMED",
    "paymentStatus": "PAID",
    "amount": 1000
  }
]
```

Error Codes:
401 → Unauthorized
500 → Internal server error


--------------------------------------------------
**3. Get All Bookings**
--------------------------------------------------

Endpoint:
GET ``/bookings``

Access:
Admin only (role: admin)

Description:
Returns all bookings including passenger name and email.

Error Codes:
401 → Unauthorized
403 → Forbidden (non-admin access)
500 → Internal server error


--------------------------------------------------
**4. Update Booking**
--------------------------------------------------

Endpoint:
PATCH  `/bookings/:id`

Access:
Owner only

Request Body (optional fields):
```json
{
  "seatNumbers": ["A3", "A4"],
  "phoneNumber": "+94770000000",
  "departureTime": "2026-03-02T09:00:00Z"
}
```
Rules:
- Only PENDING bookings can be updated
- Seat conflicts are validated again
- Amount recalculates automatically

Error Codes:
400 → Only pending bookings can be updated / Seat conflict
401 → Unauthorized
403 → Forbidden (not booking owner)
404 → Booking not found
500 → Internal server error


--------------------------------------------------
**5. Cancel Booking**
--------------------------------------------------

Endpoint:
PATCH `/bookings/:id/cancel`

Access:
Owner only

Behavior:
- If paymentStatus = PAID → automatic refund triggered
- bookingStatus → CANCELLED
- paymentStatus → REFUNDED

Success Response (200):
```json
{
  "bookingStatus": "CANCELLED",
  "paymentStatus": "REFUNDED"
}
```
Error Codes:
401 → Unauthorized
403 → Forbidden
404 → Booking not found
500 → Internal server error


--------------------------------------------------
**6. Delete Booking**
--------------------------------------------------

Endpoint:
DELETE `/bookings/:id`

Access:
Owner only

Rule:
Only CANCELLED bookings can be deleted.

Success Response:
```json
{
  "message": "Booking deleted successfully"
}
```
Error Codes:
400 → Cannot delete non-cancelled booking
401 → Unauthorized
403 → Forbidden
404 → Booking not found
500 → Internal server error

--------------------------------------------------
**7. Clear Cancelled Booking History**
--------------------------------------------------

Endpoint:
DELETE `/bookings`

Access:
Authenticated user

Description:
Deletes all cancelled bookings belonging to the logged-in user.
```json
Success Response:
{
  "message": "Cancelled booking history cleared"
}
```
Error Codes:
401 → Unauthorized
500 → Internal server error

==================================================
**PAYMENT MODULE (STRIPE INTEGRATION)**
==================================================

--------------------------------------------------
**8. Start Payment**
--------------------------------------------------

Endpoint:
POST `/bookings/:id/pay`

Access:
Authenticated user

Rule:
Only PENDING bookings can be paid.

Success Response:
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_xxxxx"
}
```
Client Action:
Redirect user to checkoutUrl to complete payment.

Error Codes:
400 → Only pending bookings can be paid
401 → Unauthorized
404 → Booking not found
500 → Stripe or server error


--------------------------------------------------
**9. Confirm Payment**
--------------------------------------------------

Endpoint:
PUT `/bookings/:id/confirm`

Access:
Owner only

Request Body:
```json
{
  "sessionId": "cs_test_xxxxx"
}
```
Process:
1. Retrieve Stripe session
2. Verify payment status = succeeded
3. Save paymentIntentId
4. Update bookingStatus → CONFIRMED
5. Update paymentStatus → PAID
6. Send SMS confirmation

Success Response:
```json
{
  "_id": "bookingId",
  "bookingStatus": "CONFIRMED",
  "paymentStatus": "PAID",
  "paymentIntentId": "pi_xxxxx"
}
```
Error Codes:
400 → Session ID required / Payment not completed
401 → Unauthorized
403 → Forbidden
404 → Booking not found
500 → Stripe or server error


==================================================
**BOOKING STATUS LIFECYCLE**
==================================================

PENDING  → CONFIRMED
PENDING  → CANCELLED
CONFIRMED → CANCELLED (with refund)


==================================================
**STANDARD HTTP ERROR CODES USED**
==================================================

200 → Success
201 → Resource created
400 → Bad request / Validation error
401 → Unauthorized
403 → Forbidden
404 → Not found
500 → Internal server error


