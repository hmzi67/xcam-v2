# XCAM Authentication System

A complete authentication system using NextAuth.js v5 for a Next.js app with role-based access control.

## Features

- ✅ Email/password authentication with bcrypt password hashing
- ✅ JWT-based sessions with secure configuration
- ✅ Role-based access control (VIEWER, CREATOR, MODERATOR, ADMIN)
- ✅ Email verification workflow
- ✅ Protected route middleware
- ✅ Type-safe authentication with TypeScript
- ✅ Form validation with Zod and React Hook Form
- ✅ Modern UI components with Tailwind CSS

## Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and update the values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

- `NEXTAUTH_SECRET` - A secret key for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for development)
- `DATABASE_URL` - PostgreSQL connection string

### 2. Database Setup

Make sure your PostgreSQL database is running and the schema is up to date:

```bash
npx prisma generate
npx prisma db push
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

## File Structure

```
lib/
├── auth.ts              # NextAuth.js configuration
└── auth-utils.ts        # Authentication helper functions

app/
├── api/auth/
│   ├── [...nextauth]/route.ts    # NextAuth API route
│   ├── register/route.ts         # Registration endpoint
│   └── verify/route.ts           # Email verification endpoint
├── (auth)/
│   ├── login/page.tsx           # Login page
│   └── register/page.tsx        # Registration page
├── dashboard/page.tsx           # Protected dashboard
├── admin/page.tsx               # Admin-only page
├── creator/page.tsx             # Creator/Admin page
└── unauthorized/page.tsx        # Access denied page

src/components/auth/
├── auth-provider.tsx           # NextAuth session provider
├── login-form.tsx             # Login form component
└── register-form.tsx          # Registration form component

middleware.ts                   # Route protection middleware
```

## Usage

### Registration Flow

1. User visits `/register`
2. Fills out the registration form (email, password, display name)
3. System creates user account with hashed password
4. System sends verification email (placeholder implementation)
5. User redirected to login page

### Authentication Flow

1. User visits `/login`
2. Enters email and password
3. NextAuth.js validates credentials against database
4. JWT token generated with user info and role
5. User redirected to dashboard or requested page

### Protected Routes

- `/dashboard/*` - Requires any authenticated user
- `/admin/*` - Requires ADMIN role
- `/creator/*` - Requires CREATOR or ADMIN role

### Role-Based Access

The system supports four user roles:

- `VIEWER` - Basic user (default)
- `CREATOR` - Can create content
- `MODERATOR` - Can moderate content
- `ADMIN` - Full access

## API Endpoints

### POST /api/auth/register

Register a new user account.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

### GET /api/auth/verify

Verify email address with token.

**Query Parameters:**

- `token` - Verification token
- `email` - User email address

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with secure configuration
- CSRF protection via NextAuth.js
- Input validation with Zod schemas
- Protected routes with middleware
- Email verification workflow

## Development Notes

- The email verification currently uses a placeholder implementation
- RS256 keys for JWT signing are generated during setup
- All forms include loading states and error handling
- TypeScript types are properly extended for session and JWT
- Responsive design with Tailwind CSS

## Next Steps

To complete the system, consider implementing:

- Email service integration (SendGrid, Nodemailer, etc.)
- Password reset functionality
- Two-factor authentication
- Social login providers (Google, GitHub, etc.)
- User profile management
- Account suspension/deletion
