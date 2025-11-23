# Gearbnb - Sports Equipment Rental Platform

Gearbnb is a modern, full-stack Airbnb-style marketplace for renting sports equipment. Built with Next.js 14, TypeScript, Prisma, and PostgreSQL, it features full multilingual support (English and Italian) and a responsive, user-friendly interface.

## Features

- 🏂 **Equipment Marketplace**: Browse and rent sports equipment (skis, bikes, surfboards, etc.)
- 🗺️ **Interactive Map**: View equipment locations on an OpenStreetMap-powered map
- 🔐 **Authentication**: Email/password login plus Google and Facebook OAuth
- 🌍 **Multilingual**: Full support for English and Italian with automatic translation
- 📱 **Responsive Design**: Airbnb-inspired UI that works on all devices
- 💳 **Booking System**: Request bookings with date selection and price calculation
- ⭐ **Reviews**: Rate and review equipment
- 📊 **Dashboard**: Manage your equipment, bookings, and profile
- 🔍 **Advanced Filters**: Filter by sport type, price range, and location

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **Maps**: Leaflet with OpenStreetMap
- **Internationalization**: next-intl
- **Deployment**: Dokku on dedicated server

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

## Getting Started

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

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgres://postgres:c9a811a2f303e0d57cac5c717ca7874d@dokku-postgres-valenteapps-db:5432/valenteapps_db"

# App
APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Map Token (not required for OpenStreetMap)
MAP_TOKEN=""
```

**Important**: Replace `NEXTAUTH_SECRET` with a strong random string. You can generate one with:

```bash
openssl rand -base64 32
```

### 4. Set Up the Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate deploy
```

Or for development (includes seeding if configured):

```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following database models:

- **User**: User accounts with authentication
- **Equipment**: Sports equipment listings
- **Booking**: Rental bookings
- **Review**: Equipment reviews and ratings
- **Account/Session**: NextAuth.js authentication tables

### Database Commands

- **Run migrations**: `npm run db:migrate`
- **Reset database** (⚠️ destructive): `npm run db:reset`
- **Open Prisma Studio**: `npm run db:studio`

## Multilingual Support

The application supports multiple languages out of the box:

- **English** (en)
- **Italian** (it)

### Adding a New Language

1. Create a new translation file in `messages/`:

```bash
cp messages/en.json messages/fr.json
```

2. Translate all strings in the new file

3. Update `i18n.ts` to include the new locale:

```typescript
export const locales = ['en', 'it', 'fr'];
```

4. Update `middleware.ts` to match the new locale in the route matcher

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Copy the App ID and App Secret to your `.env.local`

## Deployment to Dokku

This application is configured for deployment to Dokku using GitHub Actions.

### Dokku Server Setup

On your Dokku server, set the required environment variables:

```bash
dokku config:set apps DATABASE_URL="postgres://postgres:c9a811a2f303e0d57cac5c717ca7874d@dokku-postgres-valenteapps-db:5432/valenteapps_db"
dokku config:set apps NEXTAUTH_SECRET="your-production-secret"
dokku config:set apps NEXTAUTH_URL="https://your-domain.com"
dokku config:set apps APP_URL="https://your-domain.com"
```

If using OAuth providers:

```bash
dokku config:set apps GOOGLE_CLIENT_ID="your-google-client-id"
dokku config:set apps GOOGLE_CLIENT_SECRET="your-google-client-secret"
dokku config:set apps FACEBOOK_CLIENT_ID="your-facebook-client-id"
dokku config:set apps FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

### GitHub Actions Workflow

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that automatically deploys to Dokku when you push to the `main` branch.

**Required GitHub Secret:**

- `DOKKU_SSH_KEY`: SSH private key for deploying to Dokku (already configured)

The workflow:
1. Checks out the code
2. Sets up SSH with the Dokku server
3. Pushes the code to Dokku
4. Dokku automatically builds and deploys the application

### Manual Deployment

If you need to deploy manually:

```bash
git remote add dokku dokku@164.68.99.198:apps
git push dokku main
```

## Project Structure

```
valentepro-apps/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── equipment/       # Equipment CRUD
│   │   ├── bookings/        # Booking management
│   │   ├── reviews/         # Review management
│   │   └── users/           # User profile
│   ├── [locale]/            # Internationalized pages
│   │   ├── auth/            # Login/signup pages
│   │   ├── equipment/       # Equipment detail page
│   │   ├── dashboard/       # User dashboard
│   │   └── page.tsx         # Home/explore page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Header.tsx           # Navigation header
│   ├── Logo.tsx             # Gearbnb logo
│   ├── LanguageSwitcher.tsx # Language toggle
│   ├── Map.tsx              # Leaflet map component
│   └── EquipmentCard.tsx    # Equipment card
├── lib/                     # Utilities
│   ├── prisma.ts            # Prisma client
│   └── auth.ts              # NextAuth configuration
├── messages/                # Translation files
│   ├── en.json              # English translations
│   └── it.json              # Italian translations
├── prisma/                  # Database
│   └── schema.prisma        # Database schema
├── .github/workflows/       # CI/CD
│   └── deploy.yml           # Dokku deployment
├── i18n.ts                  # i18n configuration
├── middleware.ts            # Next.js middleware
├── Procfile                 # Dokku process file
├── .env.example             # Environment variables template
└── package.json             # Dependencies and scripts
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run db:migrate`: Run Prisma migrations
- `npm run db:reset`: Reset database (destructive)
- `npm run db:studio`: Open Prisma Studio

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in (via NextAuth)
- `GET /api/auth/signout` - Sign out

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile

### Equipment
- `GET /api/equipment` - List equipment (with filters)
- `POST /api/equipment` - Create equipment (auth required)
- `GET /api/equipment/[id]` - Get equipment details
- `PATCH /api/equipment/[id]` - Update equipment (owner only)
- `DELETE /api/equipment/[id]` - Delete equipment (owner only)

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create booking (auth required)

### Reviews
- `GET /api/reviews?equipmentId=[id]` - List equipment reviews
- `POST /api/reviews` - Create review (auth required)
- `PATCH /api/reviews/[id]` - Update review (author only)
- `DELETE /api/reviews/[id]` - Delete review (author only)

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgres://user:pass@host:5432/db` |
| `APP_URL` | Application URL | Yes | `http://localhost:3000` |
| `NEXTAUTH_URL` | NextAuth URL (same as APP_URL) | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Yes | Random string |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | No | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | No | From Google Console |
| `FACEBOOK_CLIENT_ID` | Facebook App ID | No | From Facebook Developers |
| `FACEBOOK_CLIENT_SECRET` | Facebook App Secret | No | From Facebook Developers |
| `MAP_TOKEN` | Map provider token (if needed) | No | Not used with OpenStreetMap |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js and TypeScript
