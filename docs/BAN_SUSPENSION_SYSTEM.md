# Time-Based Ban and Suspension System

## Overview

This system implements a comprehensive time-based ban and suspension feature that allows administrators to:

- Ban users for specific durations (7 days, 1 month, 6 months, 1 year, or permanent)
- Suspend users for shorter periods (1 hour, 3 hours, 6 hours, or 12 hours)
- Automatically unban/unsuspend users when their restriction period expires
- Display remaining time to users when they try to log in

## Database Schema

The following fields have been added to the `User` model:

```prisma
banExpiresAt      DateTime? @map("ban_expires_at")
suspendExpiresAt  DateTime? @map("suspend_expires_at")
banReason         String?   @map("ban_reason")
suspendReason     String?   @map("suspend_reason")
```

## Features

### 1. Admin Panel (User Management)

Located at `/users` page, administrators and moderators can:

**Ban Options:**

- 7 Days
- 1 Month (30 days)
- 6 Months (180 days)
- 1 Year (365 days)
- Permanent (no expiration)

**Suspend Options:**

- 1 Hour
- 3 Hours
- 6 Hours
- 12 Hours

Each action allows adding a custom reason that will be displayed to the user.

### 2. Login Restriction

When a banned or suspended user tries to log in:

**For Email/Password Login:**

- Error message shows the restriction type, duration, and reason
- Example: "Your account has been suspended for 2 hours. Reason: Spam behavior"

**For Google OAuth Login:**

- Redirects to login page with error parameters
- Displays formatted error message with time remaining

### 3. Automatic Expiration

The system automatically removes restrictions when they expire through two mechanisms:

**A. Login-Time Check:**

- Every time a user logs in, their restrictions are checked
- Expired bans/suspensions are automatically removed
- User can proceed with login if restriction has expired

**B. Cron Job (Scheduled Task):**

- Endpoint: `/api/cron/auto-unban`
- Schedule: Every 5 minutes (configurable in `vercel.json`)
- Batch updates all expired restrictions
- Secured with `CRON_SECRET` environment variable

## Setup Instructions

### 1. Database Migration

The schema has already been pushed to the database. If you need to create a new migration:

```bash
npx prisma migrate dev --name add_ban_suspension_fields
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Cron job security
CRON_SECRET=your-secure-random-secret-here
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### 3. Vercel Deployment (Optional)

If deploying to Vercel, the cron job is automatically configured via `vercel.json`.

For other platforms, set up a scheduled task to call:

```
GET /api/cron/auto-unban
Headers: Authorization: Bearer YOUR_CRON_SECRET
```

## API Endpoints

### PATCH /api/users

Update user status with time-based restrictions.

**Request Body:**

```json
{
  "userId": "user_id_here",
  "action": "BAN" | "SUSPEND" | "ACTIVATE",
  "reason": "Optional reason",
  "duration": 604800  // Duration in seconds (null for permanent ban)
}
```

**Response:**

```json
{
  "message": "User banned successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "status": "BANNED",
    "displayName": "John Doe",
    "banExpiresAt": "2025-11-09T12:00:00.000Z",
    "suspendExpiresAt": null
  }
}
```

### GET /api/cron/auto-unban

Automatic expiration check (called by cron job).

**Headers:**

```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:**

```json
{
  "success": true,
  "message": "Expired restrictions updated",
  "unbanned": 5,
  "unsuspended": 3,
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

## File Structure

```
src/
├── lib/
│   ├── auto-unban.ts              # Utility functions for checking/formatting restrictions
│   └── auth-config.ts             # Updated with restriction checks
├── components/
│   └── auth/
│       └── login-form.tsx         # Updated with detailed error messages
├── app/
│   ├── users/
│   │   └── page.tsx              # Admin panel with time selection dialogs
│   └── api/
│       ├── users/
│       │   └── route.ts          # Updated PATCH endpoint with duration support
│       └── cron/
│           └── auto-unban/
│               └── route.ts      # Automated expiration check
prisma/
└── schema.prisma                  # Updated User model with new fields
```

## Usage Examples

### 1. Ban a User for 7 Days

1. Navigate to `/users`
2. Click the ban icon for the user
3. Select "7 Days" from the duration dropdown
4. Enter a reason (optional)
5. Click "Confirm BAN"

### 2. Suspend a User for 3 Hours

1. Navigate to `/users`
2. Click the suspend icon for the user
3. Select "3 Hours" from the duration dropdown
4. Enter a reason (optional)
5. Click "Confirm SUSPEND"

### 3. View Status in User List

The user list displays:

- Status badge (Active, Banned, Suspended, Pending)
- Time remaining for banned/suspended users (e.g., "5d", "2h", "30m")
- "Permanent" indicator for permanent bans

## Security Considerations

1. **Authorization**: Only moderators and admins can ban/suspend users
2. **Self-Protection**: Users cannot ban/suspend themselves
3. **Admin Protection**: Moderators cannot ban administrators
4. **Cron Security**: Cron endpoint secured with bearer token
5. **Reason Tracking**: All actions logged with reasons for audit

## Future Enhancements

Possible improvements:

- Email notifications when restrictions are applied/removed
- Appeal system for banned users
- Moderation history/audit log
- Custom duration input
- Escalating ban system (progressive penalties)
- IP-based restrictions

## Troubleshooting

**Cron job not working:**

- Check `CRON_SECRET` is set correctly
- Verify cron schedule in `vercel.json`
- Check cron job logs in your hosting platform

**Users still can't login after expiration:**

- Check server time is correct
- Verify cron job is running
- User needs to attempt login for login-time check to trigger

**Time not displaying correctly:**

- Ensure server and client timezones are handled properly
- Check date formatting in frontend code
