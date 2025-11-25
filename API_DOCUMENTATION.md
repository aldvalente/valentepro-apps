# 📚 BoatBnB API Documentation

Complete API reference for the BoatBnB platform.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All authenticated endpoints require a valid session cookie obtained through NextAuth.js.

### Sign Up

Create a new user account.

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx123456",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Account created successfully"
  }
}
```

---

## Boats

### Search Boats

Search and filter available boats.

```http
GET /api/boats?boatType=SAILBOAT&minCapacity=4&startDate=2024-07-01&endDate=2024-07-07
```

**Query Parameters:**
- `boatType` (optional): SAILBOAT, MOTORBOAT, CATAMARAN, YACHT, RIB, SPEEDBOAT, FISHING
- `minPrice` (optional): Minimum daily price
- `maxPrice` (optional): Maximum daily price
- `minCapacity` (optional): Minimum passenger capacity
- `location` (optional): Search by port or address
- `startDate` (optional): Check availability from date (ISO 8601)
- `endDate` (optional): Check availability to date (ISO 8601)
- `withSkipper` (optional): Filter boats with skipper available
- `requiredLicense` (optional): Filter by license requirement
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "boat123",
        "name": "Sea Breeze",
        "boatType": "SAILBOAT",
        "length": 12.5,
        "capacity": 6,
        "dailyPrice": 250.00,
        "weeklyPrice": 1500.00,
        "homePort": "Marina di Portofino",
        "skipperAvailable": true,
        "skipperDailyRate": 150.00,
        "features": ["GPS", "Autopilot", "WiFi"],
        "images": ["https://..."],
        "avgRating": 4.8,
        "reviewCount": 24,
        "owner": {
          "id": "owner123",
          "name": "Maria Rossi",
          "email": "maria@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Create Boat

Create a new boat listing (Owner/Admin only).

```http
POST /api/boats
Authorization: Required
Content-Type: application/json

{
  "name": "Ocean Explorer",
  "description": "Beautiful 40ft sailing yacht...",
  "boatType": "SAILBOAT",
  "length": 12.2,
  "capacity": 8,
  "cabins": 3,
  "bathrooms": 2,
  "enginePower": 75,
  "yearBuilt": 2020,
  "brand": "Beneteau",
  "model": "Oceanis 40.1",
  "homePort": "Porto Cervo",
  "locationAddress": "Marina Porto Cervo, Sardinia",
  "latitude": 41.1375,
  "longitude": 9.5362,
  "dailyPrice": 350.00,
  "weeklyPrice": 2100.00,
  "requiredLicense": "COASTAL",
  "skipperRequired": false,
  "skipperAvailable": true,
  "skipperDailyRate": 180.00,
  "features": ["GPS", "Radar", "Autopilot", "WiFi", "Air Conditioning"],
  "images": ["https://example.com/image1.jpg"]
}
```

### Get Boat Details

```http
GET /api/boats/:id
```

**Response includes:**
- Complete boat information
- Owner details
- Active extras
- Upcoming availability periods
- Recent reviews with authors
- Average rating and review count

### Update Boat

```http
PATCH /api/boats/:id
Authorization: Required (Owner/Admin)
Content-Type: application/json

{
  "dailyPrice": 400.00,
  "isActive": true
}
```

### Delete Boat

Soft delete (deactivate) a boat.

```http
DELETE /api/boats/:id
Authorization: Required (Owner/Admin)
```

---

## Bookings

### Calculate Quote

Get a price quote before booking.

```http
POST /api/bookings/quote
Content-Type: application/json

{
  "boatId": "boat123",
  "startDate": "2024-07-01T00:00:00Z",
  "endDate": "2024-07-07T00:00:00Z",
  "withSkipper": true,
  "extras": [
    {
      "extraId": "extra123",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "boatPrice": 1500.00,
    "skipperPrice": 900.00,
    "extrasPrice": 150.00,
    "totalPrice": 2550.00,
    "days": 6,
    "breakdown": {
      "boat": {
        "dailyRate": 250.00,
        "days": 6,
        "total": 1500.00
      },
      "skipper": {
        "dailyRate": 150.00,
        "days": 6,
        "total": 900.00
      },
      "extras": [
        {
          "name": "Snorkeling Equipment",
          "price": 25.00,
          "quantity": 1,
          "total": 150.00
        }
      ]
    }
  }
}
```

### Create Booking

```http
POST /api/bookings
Authorization: Required
Content-Type: application/json

{
  "boatId": "boat123",
  "startDate": "2024-07-01T00:00:00Z",
  "endDate": "2024-07-07T00:00:00Z",
  "withSkipper": true,
  "skipperId": "skipper456",
  "extras": [
    {
      "extraId": "extra123",
      "quantity": 1
    }
  ],
  "renterNotes": "Planning to visit the Amalfi Coast"
}
```

**Validations:**
- Boat availability check
- License validation (if bareboat)
- Skipper availability (if selected)
- No self-rental

### List Bookings

```http
GET /api/bookings?status=CONFIRMED&asOwner=true
Authorization: Required
```

**Query Parameters:**
- `status`: QUOTE, PENDING, CONFIRMED, CANCELLED, COMPLETED, REJECTED
- `asOwner`: Get bookings for your boats
- `asSkipper`: Get your skipper assignments
- `page`, `limit`: Pagination

### Get Booking Details

```http
GET /api/bookings/:id
Authorization: Required
```

### Update Booking Status

Owner or admin can update booking status.

```http
PATCH /api/bookings/:id
Authorization: Required (Owner/Admin)
Content-Type: application/json

{
  "status": "CONFIRMED",
  "ownerNotes": "Looking forward to hosting you!"
}
```

### Cancel Booking

Renter can cancel their booking.

```http
DELETE /api/bookings/:id
Authorization: Required (Renter)
```

---

## Skippers

### Search Skippers

```http
GET /api/skippers?minRating=4.5&startDate=2024-07-01&endDate=2024-07-07
```

**Query Parameters:**
- `minRating`: Minimum average rating
- `minExperience`: Minimum years of experience
- `startDate`, `endDate`: Check availability
- `location`: Search by location
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "skipper123",
        "name": "Captain Marco",
        "skipperBio": "Professional skipper with 15 years experience...",
        "skipperExperience": 15,
        "skipperRating": 4.9,
        "skipperCertifications": [
          "RYA Yachtmaster Ocean",
          "STCW Certificate"
        ],
        "hourlyRate": 150.00
      }
    ],
    "pagination": {...}
  }
}
```

### Create Skipper Profile

Convert your user account to a skipper.

```http
POST /api/skippers
Authorization: Required
Content-Type: application/json

{
  "bio": "Experienced sailing instructor and yacht captain...",
  "experience": 10,
  "certifications": ["RYA Day Skipper", "VHF Radio License"],
  "hourlyRate": 120.00
}
```

### Get Skipper Details

```http
GET /api/skippers/:id
```

### Update Skipper Profile

```http
PATCH /api/skippers/:id
Authorization: Required (Self)
Content-Type: application/json

{
  "bio": "Updated bio...",
  "hourlyRate": 130.00
}
```

---

## Payments

### Process Payment

Process payment for a booking (mock implementation).

```http
POST /api/payments
Authorization: Required
Content-Type: application/json

{
  "bookingId": "booking123",
  "paymentMethod": "credit_card",
  "amount": 2550.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment123",
    "bookingId": "booking123",
    "amount": 2550.00,
    "currency": "EUR",
    "status": "COMPLETED",
    "paymentMethod": "credit_card",
    "transactionId": "mock_txn_1234567890",
    "paidAt": "2024-06-01T10:30:00Z"
  }
}
```

**Payment Status:**
- `PENDING`: Payment initiated
- `PROCESSING`: Payment being processed
- `COMPLETED`: Payment successful (booking confirmed)
- `FAILED`: Payment failed (can retry)
- `REFUNDED`: Payment refunded

### List Payments

```http
GET /api/payments?status=COMPLETED
Authorization: Required
```

### Get Payment Details

```http
GET /api/payments/:id
Authorization: Required
```

---

## Reviews

### List Reviews

Get reviews for a boat, skipper, or renter.

```http
GET /api/reviews?targetId=boat123&targetType=boat&minRating=4
```

**Query Parameters:**
- `targetId`: ID of boat/user being reviewed
- `targetType`: "boat", "skipper", or "renter"
- `minRating`: Filter by minimum rating
- `page`, `limit`: Pagination

### Create Review

Create a review after completing a booking.

```http
POST /api/reviews
Authorization: Required
Content-Type: application/json

{
  "bookingId": "booking123",
  "targetId": "boat123",
  "targetType": "boat",
  "rating": 5,
  "comment": "Excellent boat, well maintained and perfect for our trip!"
}
```

**Validations:**
- Booking must be COMPLETED
- User must have participated in booking
- No self-reviews
- One review per target per booking

**Target Types:**
- `boat`: Renter reviews the boat
- `skipper`: Renter or owner reviews the skipper
- `renter`: Owner or skipper reviews the renter

### Update Review

```http
PATCH /api/reviews/:id
Authorization: Required (Author)
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review..."
}
```

### Delete Review

```http
DELETE /api/reviews/:id
Authorization: Required (Author)
```

---

## Users

### Get Current User

```http
GET /api/users/me
Authorization: Required
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "licenseType": "COASTAL",
    "licenseNumber": "ABC123456",
    "licenseExpiry": "2025-12-31T00:00:00Z",
    "licenseCountry": "Italy",
    "stats": {
      "totalBoats": 0,
      "activeBoats": 0,
      "totalBookingsAsRenter": 5,
      "completedBookingsAsRenter": 3,
      "totalBookingsAsOwner": 0,
      "totalBookingsAsSkipper": 0,
      "receivedReviews": 2,
      "avgRating": 4.5
    }
  }
}
```

### Update Profile

```http
PATCH /api/users/me
Authorization: Required
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+39 123 456 7890",
  "licenseType": "OFFSHORE",
  "licenseNumber": "XYZ789012",
  "licenseExpiry": "2026-12-31T00:00:00Z",
  "licenseCountry": "Italy"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict (e.g., duplicate, booking conflict)
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

Not yet implemented. Consider implementing rate limiting for production.

---

## Pagination

All list endpoints support pagination:

**Request:**
```
GET /api/boats?page=2&limit=10
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## Filtering & Sorting

Most endpoints support filtering via query parameters. Check individual endpoint documentation for available filters.

---

## WebSocket Support

Not yet implemented. Consider adding WebSocket support for real-time updates (booking confirmations, messages, etc.).

---

## API Versioning

Current version: v1 (implicit)
Future versions will use URL versioning: `/api/v2/...`

---

## SDK & Client Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- Mobile SDK (React Native)

---

For more information, visit the [GitHub repository](https://github.com/aldvalente/valentepro-apps).
