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

