# ⛵ BoatBnB - Professional Boat Rental Platform

A modern, production-ready boat rental marketplace built with Next.js 14, TypeScript, Prisma, and PostgreSQL. Features comprehensive booking management, skipper services, license validation, and multi-role authorization.

## 🚀 Key Features

### For Renters
- 🔍 **Advanced Boat Search**: Filter by type, price, capacity, location, and availability
- 📅 **Flexible Booking**: Book boats with or without professional skippers
- 💰 **Instant Quotes**: Get detailed price breakdowns including extras
- 🎫 **License Validation**: Automatic validation for bareboat rentals
- ⭐ **Reviews & Ratings**: Read and write reviews for boats, skippers, and experiences
- 📱 **Responsive Design**: Full mobile support

### For Boat Owners
- 🛥️ **Fleet Management**: Add and manage multiple boats
- 💵 **Dynamic Pricing**: Set daily/weekly rates and extras
- 📊 **Booking Dashboard**: Track all bookings and their status
- 🔒 **Availability Control**: Manage boat availability and maintenance periods
- 📝 **Owner Reviews**: Build reputation through renter feedback

### For Skippers
- 👨‍✈️ **Professional Profile**: Showcase experience and certifications
- 💼 **Job Management**: View and manage skipper assignments
- ⭐ **Rating System**: Build professional reputation
- 📅 **Availability Calendar**: Manage your schedule

### For Administrators
- 🔐 **Full Access Control**: Manage users, boats, and bookings
- 📊 **System Overview**: Monitor platform activity
- ⚙️ **Configuration Management**: Control system settings

## 🏗️ Architecture

### Modular Structure

```
src/modules/
├── boats/          # Boat management (fleet, pricing, availability)
├── bookings/       # Reservation workflow and calendar
├── skippers/       # Skipper profiles and assignments
├── users/          # User management and authentication
├── payments/       # Payment processing (mock + real integration ready)
└── reviews/        # Review system with validation
```

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with modular services
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access control
- **Validation**: Zod schemas for all inputs
- **Maps**: Leaflet with OpenStreetMap
- **Internationalization**: next-intl (IT/EN)

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aldvalente/valentepro-apps.git
cd valentepro-apps
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/boatbnb"

# App URLs
APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 4. Set Up the Database

Run migrations to create the schema:

```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Models

#### User Roles
- **USER**: Regular customers who rent boats
- **OWNER**: Boat owners who list their fleet
- **SKIPPER**: Professional skippers available for hire
- **ADMIN**: System administrators

#### Boat Types
- Sailboat, Motorboat, Catamaran, Yacht, RIB, Speedboat, Fishing

#### License Types
- NONE, BASIC, COASTAL, OFFSHORE, PROFESSIONAL

#### Booking Status Flow
```
QUOTE → PENDING → CONFIRMED → COMPLETED
                ↓
            CANCELLED / REJECTED
```

### Key Features

- **License Validation**: Automatic checking for bareboat rentals
- **Skipper Assignment**: Optional professional skipper booking
- **Dynamic Pricing**: Base price + extras + skipper rates
- **Review System**: Multi-target reviews (boat/skipper/renter)
- **Availability Management**: Calendar-based booking conflicts
- **Payment Integration**: Ready for real payment processor

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/signup              # Register new user
POST /api/auth/signin              # Sign in
GET  /api/auth/signout             # Sign out
```

### Users
```
GET   /api/users/me                # Get current user profile
PATCH /api/users/me                # Update user profile
```

### Boats
```
GET    /api/boats                  # Search boats (filters: type, price, location, dates)
POST   /api/boats                  # Create boat (owner/admin)
GET    /api/boats/[id]             # Get boat details
PATCH  /api/boats/[id]             # Update boat (owner)
DELETE /api/boats/[id]             # Delete/deactivate boat (owner)
```

### Bookings
```
GET    /api/bookings               # List user bookings (filters: status, asOwner, asSkipper)
POST   /api/bookings               # Create booking
GET    /api/bookings/[id]          # Get booking details
PATCH  /api/bookings/[id]          # Update booking status (owner/admin)
DELETE /api/bookings/[id]          # Cancel booking (renter)
POST   /api/bookings/quote         # Calculate price quote
```

### Skippers
```
GET   /api/skippers                # Search skippers (filters: rating, experience, dates)
POST  /api/skippers                # Create skipper profile
GET   /api/skippers/[id]           # Get skipper details
PATCH /api/skippers/[id]           # Update skipper profile
```

### Payments
```
GET   /api/payments                # List user payments
POST  /api/payments                # Process payment (mock)
GET   /api/payments/[id]           # Get payment details
```

### Reviews
```
GET    /api/reviews                # List reviews (filter by target)
POST   /api/reviews                # Create review
GET    /api/reviews/[id]           # Get review details
PATCH  /api/reviews/[id]           # Update review (author)
DELETE /api/reviews/[id]           # Delete review (author)
```

## 🔐 Authorization Matrix

| Endpoint | USER | OWNER | SKIPPER | ADMIN |
|----------|------|-------|---------|-------|
| Create Boat | ❌ | ✅ | ❌ | ✅ |
| Update Own Boat | ❌ | ✅ | ❌ | ✅ |
| Create Booking | ✅ | ✅ | ✅ | ✅ |
| Update Booking Status | ❌ | ✅ (own boats) | ❌ | ✅ |
| Create Skipper Profile | ❌ | ❌ | ✅ | ✅ |
| Create Review | ✅ (after booking) | ✅ | ✅ | ✅ |

## 💼 Business Logic

### Booking Workflow

1. **Quote Calculation**
   - Calculate days from date range
   - Apply weekly discount if applicable
   - Add skipper rate (if selected)
   - Add extras with quantity and pricing type
   - Return detailed breakdown

2. **Validation**
   - Check boat availability (no conflicts)
   - Verify license for bareboat rentals
   - Validate skipper availability (if selected)
   - Prevent self-rental (owner cannot rent own boat)

3. **Booking Creation**
   - Status starts as PENDING
   - Lock prices at booking time
   - Create booking extras records
   - Await payment/owner confirmation

4. **Payment Processing**
   - Mock payment with 90% success rate
   - On success: status → CONFIRMED
   - Creates payment record
   - Ready for real payment gateway integration

### License Validation

```typescript
Hierarchy: NONE < BASIC < COASTAL < OFFSHORE < PROFESSIONAL

Bareboat Rental:
- Boat requires COASTAL license
- Renter has BASIC license
- Result: ❌ Validation fails

With Skipper:
- No license validation required
- Skipper manages navigation
```

### Review System

- **Anti-Self-Review**: Users cannot review themselves
- **Booking Verification**: Reviews only for completed bookings
- **Multi-Target**: Rate boats, skippers, and renters separately
- **One Review Per Target**: Prevents duplicate reviews
- **Rating Aggregation**: Automatic average calculation

## 🌍 Internationalization

Supported languages:
- 🇬🇧 English (en)
- 🇮🇹 Italian (it)

Translation files in `messages/` directory.

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database (destructive)
npm run db:studio    # Open Prisma Studio
```

### Database Commands

```bash
# Create a new migration
npx prisma migrate dev --name description

# Apply migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Open database GUI
npx prisma studio
```

## 🔒 Security Features

- ✅ Role-based access control (RBAC)
- ✅ JWT session management
- ✅ Password hashing (bcrypt)
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React)
- ✅ CSRF protection (NextAuth)
- ✅ Authorization checks on all endpoints
- ✅ License validation for safe rentals

## 📦 Deployment

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `APP_URL` | Application URL | Yes | - |
| `NEXTAUTH_URL` | NextAuth URL (same as APP_URL) | Yes | - |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | No | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | No | - |
| `FACEBOOK_CLIENT_ID` | Facebook App ID | No | - |
| `FACEBOOK_CLIENT_SECRET` | Facebook App Secret | No | - |

### Dokku Deployment

```bash
# Set environment variables
dokku config:set apps DATABASE_URL="..."
dokku config:set apps NEXTAUTH_SECRET="..."
dokku config:set apps APP_URL="https://your-domain.com"

# Deploy
git push dokku main

# Run migrations
dokku run apps npm run db:migrate
```

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build check
npm run build

# Test endpoints (coming soon)
npm test
```

## 📝 API Response Format

All API endpoints return consistent JSON responses:

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }  // Optional validation details
  }
}
```

## 🎯 Future Enhancements

- [ ] Real payment gateway integration (Stripe/PayPal)
- [ ] Email notifications for bookings
- [ ] Calendar sync (iCal/Google Calendar)
- [ ] Advanced search filters
- [ ] Favorite boats feature
- [ ] Chat system between renters and owners
- [ ] Insurance integration
- [ ] Weather API integration
- [ ] Multi-currency support
- [ ] Mobile app (React Native)

## 📄 License

Private and proprietary.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

For issues or questions:
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ for the boating community | Powered by Next.js, TypeScript, and Prisma
