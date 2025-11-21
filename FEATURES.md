# 🏄‍♂️ Sportbnb - Complete Sports Equipment Rental Platform

A modern Airbnb-style platform for renting sports equipment with multi-language support, email notifications, reviews, and messaging.

## ✨ Features

### Authentication & User Management
- ✅ User registration with email verification
- ✅ Password reset functionality with secure tokens
- ✅ JWT-based authentication
- ✅ User roles: User, Host, Admin
- ✅ Multi-language preference (IT/EN)

### Equipment Management
- ✅ Create, read, update, delete equipment
- ✅ Multiple images per equipment
- ✅ Categories: Bici, Sci, Acquatici, Montagna
- ✅ Sport types and location data
- ✅ Rental rules and pricing
- ✅ Availability tracking

### Booking System
- ✅ Create booking requests
- ✅ Host can confirm/reject bookings
- ✅ Guest can cancel bookings
- ✅ Overlap prevention
- ✅ Automatic price calculation
- ✅ Booking status workflow: pending → confirmed → completed

### Reviews
- ✅ 1-5 star ratings
- ✅ Text comments
- ✅ Only for completed bookings
- ✅ One review per booking

### Messaging
- ✅ Direct messages between guests and hosts
- ✅ Message threads by booking or user
- ✅ Read/unread status
- ✅ Email notifications for new messages

### Email Notifications
- ✅ Welcome email with verification link
- ✅ Password reset emails
- ✅ Booking confirmations (guest & host)
- ✅ Booking cancellation notifications
- ✅ New message alerts
- ✅ Bilingual templates (IT/EN)

### Internationalization
- ✅ Backend i18n system with translation files
- ✅ Frontend language switcher (🇮🇹 IT / 🇬🇧 EN)
- ✅ User language preference stored
- ✅ All API responses localized
- ✅ All emails in user's preferred language

### Admin Dashboard
- ✅ User management
- ✅ Equipment moderation
- ✅ Booking overview
- ✅ Statistics dashboard:
  - Total users, hosts, equipment
  - Active equipment count
  - Total and pending bookings

## 🚀 Quick Start

### Development (SQLite)

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application (uses SQLite by default)
DATABASE_URL='sqlite:///./sportbnb.db' uvicorn app.main:app --reload --port 3000
```

**Default Admin Credentials:**
- Email: `admin@sportbnb.com`
- Password: `admin123`

Access the application at http://localhost:3000

### Production (PostgreSQL)

```bash
# Set environment variables
export DATABASE_URL='postgresql://user:password@host:5432/dbname'
export SMTP_HOST='smtp.gmail.com'
export SMTP_PORT='587'
export SMTP_USER='your-email@gmail.com'
export SMTP_PASS='your-password'
export MAIL_FROM='noreply@sportbnb.com'
export BASE_URL='https://your-domain.com'

# Run with gunicorn
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:3000
```

## 📁 Project Structure

```
valentepro-apps/
├── app/
│   ├── main.py           # FastAPI application & routes
│   ├── auth.py           # Authentication & JWT
│   ├── schemas.py        # Pydantic models
│   ├── i18n.py           # Backend i18n system
│   └── email_service.py  # Email sending with templates
├── db/
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # Database connection
│   └── migrations/       # Database migrations
├── static/
│   ├── index.html        # Frontend HTML
│   ├── app.js            # Frontend JavaScript
│   ├── i18n.js           # Frontend i18n
│   └── style.css         # Styles
├── locales/
│   ├── it.json           # Italian translations
│   └── en.json           # English translations
└── requirements.txt      # Python dependencies
```

## 🗄️ Database Models

### User
- Full name, first name, last name
- Email (unique, verified)
- Password (hashed)
- Phone (optional)
- Preferred language (it/en)
- Roles: is_host, is_admin
- Email verification token
- Password reset token

### Equipment
- Title, description
- Category, sport type
- Price per day
- Location (city, address, coordinates)
- Rental rules
- Images (multiple)
- Availability status
- Host reference

### Booking
- Equipment reference
- Guest reference
- Host reference (redundant but useful)
- Date from/to
- Total price
- Status (pending/confirmed/rejected/cancelled/completed)
- Notes

### Review
- Booking reference
- Equipment reference
- Author reference
- Rating (1-5)
- Comment

### Message
- Sender/receiver references
- Booking reference (optional)
- Text
- Read status

### Payment
- Booking reference
- Amount, currency
- Status (pending/paid/failed)
- Payment method
- Transaction ID

### EquipmentAvailability
- Equipment reference
- Date range
- Available flag

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user
POST   /api/auth/become-host       # Become a host
GET    /api/auth/verify-email      # Verify email with token
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
```

### Equipment
```
GET    /api/equipment              # List equipment (with filters)
GET    /api/equipment/{id}         # Get equipment details
POST   /api/equipment              # Create equipment (host only)
PUT    /api/equipment/{id}         # Update equipment
DELETE /api/equipment/{id}         # Delete equipment
GET    /api/equipment/my           # Get host's equipment
```

### Bookings
```
POST   /api/bookings               # Create booking
GET    /api/bookings/my            # Get user's bookings
PATCH  /api/bookings/{id}/status   # Update booking status
```

### Reviews
```
POST   /api/reviews                # Create review
GET    /api/equipment/{id}/reviews # List equipment reviews
```

### Messages
```
POST   /api/messages               # Send message
GET    /api/messages/thread        # Get message thread
```

### Admin
```
GET    /api/admin/stats            # Dashboard statistics
GET    /api/admin/users            # List all users
GET    /api/admin/bookings         # List all bookings
```

## 🔒 Security

- ✅ JWT tokens for authentication
- ✅ Password hashing with bcrypt
- ✅ Secure token generation for email verification and password reset
- ✅ Input validation with Pydantic
- ✅ SQL injection protection via SQLAlchemy ORM
- ✅ CodeQL security scanning: 0 vulnerabilities
- ✅ Proper error handling and logging

## 🌍 Internationalization

The application supports Italian and English:

**Backend:**
- Translation files in `locales/` directory
- `app/i18n.py` module for translations
- All API responses use `t()` function
- User's preferred language stored in database

**Frontend:**
- `static/i18n.js` module
- Language switcher in header
- Translations stored in localStorage
- Automatic UI update on language change

**Adding a New Language:**
1. Create `locales/xx.json` with translations
2. Add language option to frontend switcher
3. Update language flags in UI

## 📧 Email Configuration

Email notifications require SMTP configuration via environment variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=noreply@sportbnb.com
MAIL_FROM_NAME=Sportbnb
BASE_URL=https://your-domain.com
```

**Note:** If SMTP is not configured, the application will still work but email notifications will be skipped with a warning log.

## 🛠️ Technology Stack

- **Backend:** FastAPI 0.100.0
- **Database:** PostgreSQL / SQLite (with automatic fallback)
- **ORM:** SQLAlchemy 2.0.23
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt
- **Email:** SMTP with HTML templates
- **Frontend:** Vanilla JavaScript
- **Maps:** Leaflet.js
- **Validation:** Pydantic 2.5.0

## 🧪 Testing

```bash
# Run the application in test mode
DATABASE_URL='sqlite:///./test.db' uvicorn app.main:app --reload

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -F "username=admin@sportbnb.com" \
  -F "password=admin123"

# List equipment
curl http://localhost:3000/api/equipment
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-detected or SQLite fallback |
| `SMTP_HOST` | SMTP server hostname | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `MAIL_FROM` | Sender email address | noreply@sportbnb.com |
| `MAIL_FROM_NAME` | Sender name | Sportbnb |
| `BASE_URL` | Application base URL for emails | http://localhost:3000 |

## 🚀 Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@sportbnb.com or open an issue in the GitHub repository.
