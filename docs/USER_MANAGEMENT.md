# User Management Feature

## Overview

A comprehensive user management system accessible to **Moderators** and **Admins** for managing platform users.

## Access Control

- **Moderators**: Can view, ban, suspend, and activate users (except admins)
- **Admins**: Full access including user deletion

## Features

### 1. User Listing & Filtering

- **Pagination**: Browse users with 20 users per page
- **Search**: Search by email or display name
- **Role Filter**: Filter by VIEWER, CREATOR, MODERATOR, ADMIN
- **Status Filter**: Filter by ACTIVE, BANNED, SUSPENDED, PENDING_VERIFICATION

### 2. User Information Display

Each user row shows:

- Avatar and display name
- Email address
- Role badge (color-coded)
- Status badge (color-coded)
- Wallet balance
- Streams count
- Messages count
- Join date
- Last login date

### 3. User Actions

#### Ban User

- Sets user status to BANNED
- Creates moderation action record
- Requires reason (optional)
- Cannot ban admins (for moderators)
- Cannot ban yourself

#### Suspend User

- Sets user status to SUSPENDED
- Creates moderation action record
- Requires reason (optional)
- Temporary restriction

#### Activate User

- Sets user status to ACTIVE
- Restores access for banned/suspended users

#### Delete User (Admin Only)

- Permanently removes user and all associated data
- Requires confirmation
- Cannot delete yourself

## API Endpoints

### GET `/api/users`

**Description**: List all users with pagination and filters

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Users per page (default: 20)
- `search` (string): Search by email or display name
- `role` (string): Filter by role (VIEWER, CREATOR, MODERATOR, ADMIN)
- `status` (string): Filter by status (ACTIVE, BANNED, SUSPENDED, PENDING_VERIFICATION)

**Authorization**: Requires MODERATOR or ADMIN role

**Response**:

```json
{
  "users": [
    {
      "id": "string",
      "email": "string",
      "role": "string",
      "status": "string",
      "emailVerified": boolean,
      "displayName": "string | null",
      "avatarUrl": "string | null",
      "isCreator": boolean,
      "balance": number,
      "streamsCount": number,
      "messagesCount": number,
      "moderationActionsCount": number,
      "moderationTargetCount": number,
      "createdAt": "string",
      "lastLoginAt": "string | null"
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

### PATCH `/api/users`

**Description**: Ban, unban, suspend, or activate a user

**Body**:

```json
{
  "userId": "string",
  "action": "BAN" | "UNBAN" | "SUSPEND" | "ACTIVATE",
  "reason": "string (optional)"
}
```

**Authorization**: Requires MODERATOR or ADMIN role

**Response**:

```json
{
  "message": "string",
  "user": {
    "id": "string",
    "email": "string",
    "status": "string",
    "displayName": "string | null"
  }
}
```

### DELETE `/api/users`

**Description**: Permanently delete a user

**Query Parameters**:

- `userId` (string): ID of user to delete

**Authorization**: Requires ADMIN role

**Response**:

```json
{
  "message": "User deleted successfully",
  "deletedUserId": "string"
}
```

## UI Components

### Users Management Page (`/users`)

- Full-page table view with filters
- Color-coded badges for roles and statuses
- Action buttons with icons
- Confirmation dialogs for destructive actions
- Toast notifications for feedback

### Confirmation Dialogs

1. **Delete Confirmation**: Alert dialog for permanent deletion
2. **Ban/Suspend Dialog**: Modal with optional reason field
3. **Activate Dialog**: Simple confirmation modal

## Database Schema

The existing User model already includes the `status` field with these values:

- `ACTIVE`: User can access the platform normally
- `SUSPENDED`: User access is temporarily restricted
- `BANNED`: User is permanently banned
- `PENDING_VERIFICATION`: User has not verified email

## Security Features

1. **Role-Based Access Control**

   - Middleware checks user role before allowing access
   - Moderators cannot ban admins
   - Users cannot ban/delete themselves

2. **Audit Trail**

   - All ban/suspend actions are logged in `ModerationAction` table
   - Includes actor ID, target user, action type, reason, and timestamp

3. **Error Handling**
   - Proper HTTP status codes
   - User-friendly error messages
   - Toast notifications for user feedback

## Navigation

The "User Management" link appears in the dashboard sidebar for:

- **Moderators**: Under moderation tools section
- **Admins**: Under admin tools section

## Future Enhancements

1. **Bulk Actions**: Select and ban/suspend multiple users
2. **Export**: Export user list to CSV
3. **Advanced Filters**: Filter by registration date, last login, balance range
4. **User Details Modal**: Click user to view detailed profile
5. **Unban Scheduling**: Set automatic unban date for temporary bans
6. **Email Notifications**: Notify users when they are banned/suspended
7. **Ban History**: View all moderation actions for a user
8. **IP Banning**: Ban by IP address for repeat offenders

## Testing Checklist

- [ ] Moderator can access `/users` page
- [ ] Admin can access `/users` page
- [ ] Viewer is redirected from `/users` page
- [ ] Search functionality works correctly
- [ ] Role filter works correctly
- [ ] Status filter works correctly
- [ ] Pagination works correctly
- [ ] Moderator can ban viewers and creators
- [ ] Moderator cannot ban admins
- [ ] Admin can ban all users
- [ ] User cannot ban themselves
- [ ] Ban reason is recorded in moderation actions
- [ ] Suspended users can be activated
- [ ] Banned users can be activated
- [ ] Admin can delete users
- [ ] Moderator cannot delete users
- [ ] User cannot delete themselves
- [ ] Toast notifications appear for all actions
- [ ] Confirmation dialogs work properly

## Usage Example

### For Moderators

1. Navigate to Dashboard
2. Click "User Management" in sidebar
3. Use filters to find problematic users
4. Click ban icon to ban user
5. Enter reason and confirm

### For Admins

1. Navigate to Dashboard
2. Click "User Management" in sidebar
3. Use filters to find users
4. Click delete icon to permanently remove user
5. Confirm deletion in alert dialog
