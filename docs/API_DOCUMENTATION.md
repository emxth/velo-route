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

### Common Issues

- 401/403: Missing or invalid Bearer token; re-login and retry.
- SMTP errors: ensure `MAIL_USER`/`MAIL_PASS` are set (Gmail app password), restart server after updating `.env`.
- Mongoose deprecation warnings: ensure `returnDocument: "after"` in findByIdAndUpdate calls where needed.

---

## Booking & Payment Module API Documentation

### AUTHENTICATION

- Authentication Type:
  - Bearer JSON Web Token (JWT)

Required Header for Protected Endpoints:

- Authorization: Bearer <your_jwt_token>
- Content-Type: application/json

Roles Used:

- user → Manage own bookings
- admin → View all bookings

### BOOKING MODULE

---

### 1. Create Booking

Endpoint:
**POST** `/bookings`

Access:
User only (role: user)

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
  "seatNumbers": ["A1", "A2"],
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



### 2. Get My Bookings

Endpoint:
**GET** `/bookings/me`

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


### 3. Get All Bookings

Endpoint:
**GET** `/bookings`

Access:
Admin only (role: admin)

Description:
Returns all bookings including passenger name and email.

Error Codes:
401 → Unauthorized
403 → Forbidden (non-admin access)
500 → Internal server error


### 4. Update Booking

Endpoint:
**PATCH** `/bookings/:id`

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



### 5. Cancel Booking

Endpoint:
**PATCH** `/bookings/:id/cancel`

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


### 6. Delete Booking

Endpoint:
**DELETE** `/bookings/:id`

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



### 7. Clear Cancelled Booking History

Endpoint:
**DELETE** `/bookings`

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

### PAYMENT MODULE (STRIPE INTEGRATION)

---

### 8. Start Payment

Endpoint:
**POST** `/bookings/:id/pay`

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


### 9. Confirm Payment

Endpoint:
**PUT** `/bookings/:id/confirm`

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

### BOOKING STATUS LIFECYCLE

PENDING → CONFIRMED
PENDING → CANCELLED
CONFIRMED → CANCELLED (with refund)

### STANDARD HTTP ERROR CODES USED

200 → Success
201 → Resource created
400 → Bad request / Validation error
401 → Unauthorized
403 → Forbidden
404 → Not found
500 → Internal server error

---

## Routes Management

### Create New Transport Route

- **POST** `/api/routes/addRoute`

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

### Get all transport routes

- **GET** `/api/routes/`
- **Auth**: Bearer (admin)

### Get specific Route

- **GET** `/api/routes/route/:id`
- **Auth**: Bearer (admin)

### Update Existing Route

- **PUT** `/api/routes/updateRoute/:id`
- **Auth**: Bearer (admin)

### Delete Route

- **DELETE** `/api/routes/clearRoute/:id`
- **Auth**: Bearer (admin)

### Third Party API

- `http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}`


---

## Schedule Management

### Create New Transport Schedule

- **POST** `/api/schedules/addSchedule`

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

### Get all Schedules

- **GET** `/api/schedules/`
- **Auth**: Bearer (admin)

### Get specific Schedule

- **GET** `/api/schedules/:id`
- **Auth**: Bearer (admin)

### Update Existing Route

- **PUT** `/api/schedules/updateSchedule/:id`
- **Auth**: Bearer (admin)

### Delete Route

- **DELETE** `/api/schedules/:id`
- **Auth**: Bearer (admin)

---

## Department & Vehicle Modules API Documentation

### AUTHENTICATION

Authentication Type:

- Bearer JSON Web Token (JWT)
- Required Header for Protected Endpoints:

Authorization: Bearer <your_jwt_token>

Content-Type: application/json

Roles Used:

- admin → Full access to department and vehicle modules
- user → No access to these modules (admin-only)

### DEPARTMENT MODULE

---

### 1. Create Department

Endpoint:
**POST** `/departments`

Access:
Admin only

Request Body:

```json
{
  "name": "Transport Dept",
  "description": "Handles all public transport operations",
  "managerName": "Mr. John Doe",
  "contactNumber": "+94770000001",
  "email": "transport@veloroute.com",
  "address": "123 Main St, Colombo",
  "region": "Western Province"
}
```

Success Response (201):

```json
{
  "_id": "dep123",
  "name": "Transport Dept",
  "description": "Handles all public transport operations",
  "managerName": "Mr. John Doe",
  "contactNumber": "+94770000001",
  "email": "transport@veloroute.com",
  "address": "123 Main St, Colombo",
  "region": "Western Province",
  "createdAt": "2026-02-27T11:00:00.000Z",
  "updatedAt": "2026-02-27T11:00:00.000Z"
}
```

Business Rules:

- Contact number must be exactly 10 digits.
- Email must be valid and unique across departments.
- Region must be one of: Western, Southern, Central, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa.
- Department name must be at least 2 characters.

Error codes:
400 → Validation error / Missing required fields
401 → Unauthorized (missing or invalid token)
403 → Forbidden (non-admin access)
500 → Internal server error


### 2. Get All Departments

Endpoint:
**GET** /api/departments

Query Parameters:

- page (optional, default: 1) - Page number
- limit (optional, default: 10) - Items per page

Access:
Admin only (role: admin)

Success Response (200):

```json
{
  "success": true,
  "data": [
    {
      "_id": "67a16b2c1fad9f8c8dbc136b",
      "name": "Kandy Transport Hub",
      "managerName": "Kamal Perera",
      "contactNumber": "0771234567",
      "email": "kandy.transport@veloroute.com",
      "region": "Central",
      "status": "active",
      "createdBy": {
        "_id": "699fec7118ab45ce1698e416",
        "name": "Admin User",
        "email": "admin@veloroute.com",
        "role": "admin"
      },
      "createdAt": "2026-02-27T10:00:12.915Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

Error Codes:
401 → Unauthorized
403 → Forbidden (non-admin access)
500 → Internal server error


### 3. Get Department by ID

Endpoint:
**GET** /api/departments/:id

Access:
Admin only (role: admin)

Success Response (200):

```json
{
  "_id": "67a16b2c1fad9f8c8dbc136b",
  "name": "Kandy Transport Hub",
  "description": "Main transport department for Central region",
  "managerName": "Kamal Perera",
  "contactNumber": "0771234567",
  "email": "kandy.transport@veloroute.com",
  "address": "No 15, Colombo Road, Kandy",
  "region": "Central",
  "status": "active",
  "createdBy": {
    "_id": "699fec7118ab45ce1698e416",
    "name": "Admin User",
    "email": "admin@veloroute.com",
    "role": "admin"
  },
  "updatedBy": {
    "_id": "699fec7118ab45ce1698e416",
    "name": "Admin User",
    "email": "admin@veloroute.com",
    "role": "admin"
  },
  "createdAt": "2026-02-27T10:00:12.915Z",
  "updatedAt": "2026-02-27T14:30:22.915Z"
}
```

Error Codes:
400 → Invalid department ID format
401 → Unauthorized
403 → Forbidden (non-admin access)
404 → Department not found
500 → Internal server error


### 4. Update Department

Endpoint:
PUT /api/departments/:id

Access:
Admin only (role: admin)

Request Body (all fields optional for update):

```json
{
  "name": "Kandy Regional Transport Office",
  "managerName": "Nimal Silva",
  "contactNumber": "0777654321",
  "status": "inactive"
}
```

Success Response (200):

```json
{
  "_id": "67a16b2c1fad9f8c8dbc136b",
  "name": "Kandy Regional Transport Office",
  "description": "Main transport department for Central region",
  "managerName": "Nimal Silva",
  "contactNumber": "0777654321",
  "email": "kandy.transport@veloroute.com",
  "address": "No 15, Colombo Road, Kandy",
  "region": "Central",
  "status": "inactive",
  "createdBy": "699fec7118ab45ce1698e416",
  "updatedBy": "699fec7118ab45ce1698e416",
  "createdAt": "2026-02-27T10:00:12.915Z",
  "updatedAt": "2026-02-27T15:45:33.915Z",
  "__v": 0
}
```

Business Rules:

- If provided, fields must pass same validation as creation.
- Status must be either "active" or "inactive".

Error Codes:
400 → Validation error / Invalid field values
401 → Unauthorized
403 → Forbidden (non-admin access)
404 → Department not found
500 → Internal server error


### 5. Delete Department

Endpoint:
DELETE /api/departments/:id

Access:
Admin only (role: admin)

Success Response (200):

```json
{
  "message": "Department deleted successfully"
}
```

Error Codes:
400 → Invalid department ID format
401 → Unauthorized
403 → Forbidden (non-admin access)
404 → Department not found
500 → Internal server error

### Vehicle MODULE

---

### 1. Create Vehicle

Endpoint:
**POST** `/api/vehicles`

Access:
Admin only (role: admin)

Content-Type:
multipart/form-data

Request Body (form-data):
**Vehicle Information**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vehiclePhoto | File | Yes | Image file (JPG, PNG, max 2MB) |
| registrationNumber | String | Yes | Format: ABC-1234 (uppercase, alphanumeric, hyphens) |
| category | String | Yes | "Bus" or "Train" |
| type | String | Yes | "Passenger" or "Cargo" |
| brand | String | Yes | Vehicle brand name |
| model | String | Yes | Vehicle model |
| yearOfManufacture | Number | Yes | Between 2000 and current year |
| seatCapacity | Number | Conditional | Required if type = "Passenger", min 1 |
| cargoCapacityKg | Number | Conditional | Required if type = "Cargo", min 500 |
| department | String | Yes | Valid department ObjectId |

**Insurance Details**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| insurance[provider] | String | Yes | Insurance provider name |
| insurance[policyNumber] | String | Yes | Policy number |
| insurance[type] | String | No | "Comprehensive", "Third Party", or "Liability" (default: "Comprehensive") |
| insurance[startDate] | Date | Yes | Start date (ISO format) |
| insurance[expiryDate] | Date | Yes | Expiry date (ISO format) |

**Fitness Details**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fitness[certificateNumber] | String | Yes | Fitness certificate number |
| fitness[issueDate] | Date | Yes | Issue date (ISO format) |
| fitness[expiryDate] | Date | Yes | Expiry date (ISO format) |

**Status**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | String | No | "AVAILABLE", "UNDER MAINTENANCE", "UNAVAILABLE" (default: "AVAILABLE") |

Success Response (201):

```json
{
  "_id": "67b28c3d2fbe9a7e9dbc237c",
  "vehiclePhoto": "https://res.cloudinary.com/.../image/upload/v1234567890/veloroute/vehicles/abc123.jpg",
  "cloudinaryId": "veloroute/vehicles/abc123",
  "registrationNumber": "NW-1234",
  "category": "Bus",
  "type": "Passenger",
  "brand": "Tata",
  "model": "LP 709",
  "yearOfManufacture": 2022,
  "seatCapacity": 45,
  "department": "67a16b2c1fad9f8c8dbc136b",
  "insurance": {
    "provider": "Sri Lanka Insurance",
    "policyNumber": "SLI-BUS-2026-001",
    "type": "Comprehensive",
    "startDate": "2026-01-01T00:00:00.000Z",
    "expiryDate": "2027-01-01T00:00:00.000Z"
  },
  "fitness": {
    "certificateNumber": "FT-2026-0456",
    "issueDate": "2026-01-15T00:00:00.000Z",
    "expiryDate": "2027-01-15T00:00:00.000Z"
  },
  "status": "AVAILABLE",
  "createdBy": "699fec7118ab45ce1698e416",
  "createdAt": "2026-02-27T16:20:45.915Z",
  "updatedAt": "2026-02-27T16:20:45.915Z",
  "__v": 0
}
```

Business Rules:

- Registration number must be unique.
- For passenger vehicles, seat capacity is required.
- For cargo vehicles, cargo capacity is required (min 500kg).
- Insurance expiry date must be after start date.
- Fitness expiry date must be after issue date.

Error Codes:
400 → Validation error / Duplicate registration / Invalid department
401 → Unauthorized
403 → Forbidden (non-admin access)
404 → Department not found
413 → File too large (max 2MB)
500 → Internal server error


### 2. Get All Vehicles

Endpoint:
**GET** `/api/vehicles`

Query Parameters:

- page (optional, default: 1) - Page number
- limit (optional, default: 10) - Items per page

Access:
Admin only (role: admin)

Success Response (200):

```json
{
  "success": true,
  "data": [
    {
      "_id": "67b28c3d2fbe9a7e9dbc237c",
      "registrationNumber": "NW-1234",
      "category": "Bus",
      "type": "Passenger",
      "brand": "Tata",
      "model": "LP 709",
      "seatCapacity": 45,
      "status": "AVAILABLE",
      "departmentDetails": {
        "_id": "67a16b2c1fad9f8c8dbc136b",
        "name": "Kandy Transport Hub",
        "region": "Central",
        "managerName": "Kamal Perera",
        "contactNumber": "0771234567"
      },
      "createdAt": "2026-02-27T16:20:45.915Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

Error Codes:
401 → Unauthorized
403 → Forbidden (non-admin access)
500 → Internal server error


### 3. Get Vehicle by ID

Endpoint:
**GET** `/api/vehicles/:id`

Access:
Admin only (role: admin)

Success Response (200):

```json
{
  "_id": "67b28c3d2fbe9a7e9dbc237c",
  "vehiclePhoto": "https://res.cloudinary.com/.../image/upload/v1234567890/veloroute/vehicles/abc123.jpg",
  "registrationNumber": "NW-1234",
  "category": "Bus",
  "type": "Passenger",
  "brand": "Tata",
  "model": "LP 709",
  "yearOfManufacture": 2022,
  "seatCapacity": 45,
  "department": "67a16b2c1fad9f8c8dbc136b",
  "insurance": {
    "provider": "Sri Lanka Insurance",
    "policyNumber": "SLI-BUS-2026-001",
    "type": "Comprehensive",
    "startDate": "2026-01-01T00:00:00.000Z",
    "expiryDate": "2027-01-01T00:00:00.000Z"
  },
  "fitness": {
    "certificateNumber": "FT-2026-0456",
    "issueDate": "2026-01-15T00:00:00.000Z",
    "expiryDate": "2027-01-15T00:00:00.000Z"
  },
  "lastMaintenance": {
    "date": "2026-02-15T10:30:00.000Z",
    "maintenanceType": "Engine Service",
    "odometer": 15000
  },
  "nextMaintenanceDue": {
    "date": "2026-05-15T10:30:00.000Z",
    "odometer": 20000
  },
  "status": "AVAILABLE",
  "departmentDetails": {
    "_id": "67a16b2c1fad9f8c8dbc136b",
    "name": "Kandy Transport Hub",
    "region": "Central",
    "managerName": "Kamal Perera",
    "contactNumber": "0771234567"
  },
  "createdBy": {
    "_id": "699fec7118ab45ce1698e416",
    "name": "Admin User",
    "email": "admin@veloroute.com",
    "role": "admin"
  },
  "createdAt": "2026-02-27T16:20:45.915Z",
  "updatedAt": "2026-02-27T16:20:45.915Z"
}
```

Error Codes:
400 → Invalid vehicle ID format
401 → Unauthorized
403 → Forbidden (non-admin access)
404 → Vehicle not found
500 → Internal server error


### 4. Update Vehicle

Endpoint:
**PUT** `/api/vehicles/:id`

Access:
Admin only (role: admin)

Content-Type:
multipart/form-data

Description:

- Updates an existing vehicle's information.
- All fields are optional - only provided fields will be updated.
- The request should be sent as multipart/form-data to support file uploads.

Request Fields:

**Vehicle Information**

- `vehiclePhoto` - Image file (JPG, PNG, max 2MB)
- `registrationNumber` - Format: ABC-1234 (uppercase, alphanumeric, hyphens)
- `category` - "Bus" or "Train"
- `type` - "Passenger" or "Cargo"
- `brand` - Vehicle brand name
- `model` - Vehicle model
- `yearOfManufacture` - Between 2000 and current year
- `seatCapacity` - Required if type = "Passenger", min 1
- `cargoCapacityKg` - Required if type = "Cargo", min 500
- `department` - Valid department ObjectId

**Insurance Details**

- `insurance[provider]` - Insurance provider name
- `insurance[policyNumber]` - Policy number
- `insurance[type]` - "Comprehensive", "Third Party", or "Liability" (default: "Comprehensive")
- `insurance[startDate]` - Start date (ISO format)
- `insurance[expiryDate]` - Expiry date (ISO format)

**Fitness Details**

- `fitness[certificateNumber]` - Fitness certificate number
- `fitness[issueDate]` - Issue date (ISO format)
- `fitness[expiryDate]` - Expiry date (ISO format)

**Status**

- `status` - "AVAILABLE", "UNDER MAINTENANCE", "UNAVAILABLE" (default: "AVAILABLE")

Success Response(200):

```json
{
  "_id": "67b28c3d2fbe9a7e9dbc237c",
  "registrationNumber": "NW-5678",
  "status": "UNDER MAINTENANCE",
  "lastMaintenance": {
    "date": "2026-02-27T17:30:00.000Z",
    "maintenanceType": "Brake System",
    "odometer": 15250
  },
  "nextMaintenanceDue": {
    "date": "2026-03-27T17:30:00.000Z",
    "odometer": 18000
  },
  "updatedBy": "699fec7118ab45ce1698e416",
  "updatedAt": "2026-02-27T17:35:22.915Z"
}
```

Business Rules:

- If type is changed, appropriate capacity fields become required.
- Old image is automatically deleted from Cloudinary when new image is uploaded.

Error Codes:
400 → Validation error / Duplicate registration / Invalid department
401 → Unauthorized
403 → Forbidden (non-admin access)
404 → Vehicle / Department not found
413 → File too large (max 2MB)
500 → Internal server error


### 5. Delete Vehicle

Endpoint:
**DELETE** `/api/vehicles/:id`

Access:
Admin only (role: admin)

Success Response (200):

```json
{
  "message": "Vehicle deleted successfully"
}
```

Business Rules:

- Vehicle image is automatically deleted from Cloudinary.

Error Codes:
400 → Invalid vehicle ID format
401 → Unauthorized
403 → Forbidden (non-admin access)
404 → Vehicle not found
500 → Internal server error

### STANDARD HTTP ERROR CODES USED

200 → Success
201 → Resource created
400 → Bad request / Validation error
401 → Unauthorized
403 → Forbidden
404 → Not found
413 → Payload too large (file size)
500 → Internal server error
