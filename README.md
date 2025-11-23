# 🚀 ValentePro App

Modern e-commerce web application built with the latest technologies.

## ✨ Tech Stack

- **Frontend**: Next.js 14 (App Router) with React Server Components
- **Language**: TypeScript for type-safe development
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma - Modern database toolkit
- **Styling**: Tailwind CSS via Next.js built-in support
- **Runtime**: Node.js 20+

## 🎯 Features

- ✅ Modern Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Prisma ORM with automatic migrations
- ✅ RESTful API endpoints
- ✅ Server-side rendering (SSR)
- ✅ Responsive design
- ✅ Database seeding with sample data
- ✅ Drop and recreate tables on setup

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. **Clone the repository** (if not already done)

```bash
git clone <repository-url>
cd valentepro-apps
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the database**

The database setup script will:
- Drop existing tables if they exist
- Create new tables from the Prisma schema
- This ensures a clean database state

```bash
npm run db:setup
```

4. **Seed the database with sample data**

```bash
npm run db:seed
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
valentepro-apps/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── products/      # Products API
│   │   ├── orders/        # Orders API
│   │   └── users/         # Users API
│   ├── products/          # Products page
│   ├── orders/            # Orders page
│   ├── users/             # Users page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── prisma/
│   └── schema.prisma      # Database schema
├── scripts/
│   ├── setup-db.js        # Database initialization
│   └── seed.js            # Sample data seeding
├── lib/
│   └── prisma.ts          # Prisma client singleton
└── .github/
    └── workflows/         # CI/CD workflows
```

## 🗄️ Database Schema

### Models

- **User**: User accounts with roles (user/admin)
- **Product**: Products with categories, prices, and stock
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual items within orders

## 📊 Sample Data

The seed script creates:

- 3 users (1 admin, 2 regular users)
- 8 products across different categories
- 2 sample orders with multiple items

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:setup` | Drop and recreate database tables |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio GUI |

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# SQLite (for development)
DATABASE_URL="file:./dev.db"

# PostgreSQL (for production)
# DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

NODE_ENV="development"
```

### Switching from SQLite to PostgreSQL

1. Update `.env` with your PostgreSQL connection string
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `npm run db:setup` to recreate tables
4. Run `npm run db:seed` to add sample data

## 🎨 Pages

- **Home** (`/`): Dashboard with navigation cards
- **Products** (`/products`): Browse all products with images and details
- **Orders** (`/orders`): View all orders with status and items
- **Users** (`/users`): Manage user accounts

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | Get all products |
| `/api/products` | POST | Create a product |
| `/api/orders` | GET | Get all orders |
| `/api/users` | GET | Get all users |

## 🚢 Deployment

### Dokku (via GitHub Actions)

The project includes a GitHub workflow that automatically deploys to Dokku on push to `main`.

1. Ensure your Dokku server is configured
2. Set up the `DOKKU_SSH_KEY` secret in GitHub
3. Push to `main` branch to trigger deployment

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Ensure your database is configured for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🎉 Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
