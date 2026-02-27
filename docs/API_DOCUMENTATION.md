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



### Routes Management

## Create New Transport Route
- **POST** `/api/routes/addRoute`
-**Body**
```json 
{
  "name": "Colombo - Kandy Main Road",
  "routeNumber": "A2",
  "transportType": "Train",
  "busNumber": "222"
  "startLocation": {
    "name": "Colombo",
    "district": "Colombo",
    "lat": 6.9271,
    "lng": 79.8612
  },
  "endLocation": {
    "name": "Kandy",
    "district": "Kandy",
    "lat": 7.2906,
    "lng": 80.6337
  },
  "stops": [
    {
      "name": "Colombo",
      "lat": 6.9271,
      "lng": 79.8612,
      "fareFromPrevious": 0
    },
    {
      "name": "Kegalle",
      "lat": 7.2513,
      "lng": 80.3464,
      "fareFromPrevious": 150
    },
    {
      "name": "Kandy",
      "lat": 7.2906,
      "lng": 80.6337,
      "fareFromPrevious": 250
    }
  ]}
```
- **Auth**: Bearer (admin)

## Get all transport routes
- **GET** `/api/routes/`
- **Auth**: Bearer (admin)

## Get specific Route
- **GET** `/api/routes/route/:id`
- **Auth**: Bearer (admin)

## Update Existing Route
- **PUT** `/api/routes/updateRoute/:id`
- **Auth**: Bearer (admin)

## Delete Route
- **DELETE** `/api/routes/clearRoute/:id`
- **Auth**: Bearer (admin)

## Third Party API 

- `http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}`



### Schedule Management

## Create New Transport Schedule
- **POST** `/api/schedules/addSchedule`
-**Body**
```json 
  {
    "routeId": "6996b2833151811d941307c5",
    "vehicleID": "699d748f93bff79aa081c346",
    "depatureTime": "2026-03-01T08:10:00Z",
    "frequency": "DAILY",
    "status": "SCHEDULED",
    "active": true
}
```
- **Auth**: Bearer (admin)

## Get all Schedules
- **GET** `/api/schedules/`
- **Auth**: Bearer (admin)

## Get specific Schedule
- **GET** `/api/schedules/:id`
- **Auth**: Bearer (admin)

## Update Existing Route
- **PUT** `/api/schedules/updateSchedule/:id`
- **Auth**: Bearer (admin)

## Delete Route
- **DELETE** `/api/schedules/:id`
- **Auth**: Bearer (admin)


