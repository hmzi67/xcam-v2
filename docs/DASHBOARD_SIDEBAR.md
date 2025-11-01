# Dashboard Sidebar Documentation

## Overview

The dashboard now includes a comprehensive role-based sidebar that provides easy navigation and displays user information.

## Features

### 1. **Responsive & Collapseable Design**

- **Desktop**:
  - Fixed sidebar on the left (264px expanded, 80px collapsed)
  - Toggle button to collapse/expand sidebar
  - Icons remain visible when collapsed with tooltips on hover
  - Smooth width transitions (300ms)
- **Mobile**: Collapsible sidebar with hamburger menu button
- **Smooth transitions and animations**

### 2. **User Profile Section**

- Displays user avatar (or default icon if no avatar)
- Shows display name and email
- Role badge with color coding:
  - 🔴 **Admin**: Red badge
  - 🟠 **Moderator**: Orange badge
  - 🟣 **Creator**: Purple badge
  - 🔵 **Viewer**: Blue badge

### 3. **Role-Based Navigation**

#### Viewer Navigation

- Dashboard
- Profile
- Browse Streams
- Buy Credits

#### Creator Navigation

- Dashboard
- Profile
- Creator Studio
- My Streams
- Analytics
- Earnings
- Browse Streams
- Buy Credits

#### Moderator Navigation

- Dashboard
- Profile
- Monitor Streams
- Moderation Queue
- Reports
- User Management
- Chat Logs

#### Admin Navigation

- Dashboard (Platform Stats)
- Profile
- User Management
- Stream Management
- Financial Overview
- Payments
- Moderation
- System Config
- Settings

### 4. **Visual Indicators**

- **Active page highlighting**: Purple background with border
- **Hover effects**: Gray background on hover
- **Bottom dot indicator**: Small purple dot under active nav item

### 5. **Collapseable Functionality**

- **Toggle Button**: Circular button on the right edge of sidebar (desktop only)
- **Collapsed State**:
  - Width reduces to 80px
  - Shows only icons (centered)
  - User profile shows only avatar
  - Tooltips appear on hover for navigation items
- **Expanded State**:
  - Full width at 264px
  - Shows icons with labels
  - Full user profile information
  - Role badge visible
- **State Persistence**: Collapse state maintained across page navigation
- **Smooth Animation**: 300ms transition for all width changes

### 6. **Layout Integration**

The sidebar is integrated with the main dashboard layout using the `DashboardLayout` component:

- Automatically adjusts content padding for desktop (pl-64 expanded, pl-20 collapsed)
- Full-width content on mobile
- Maintains header at top
- Content area transitions smoothly when sidebar collapses/expands

## Usage

The sidebar is automatically rendered based on the user's role in the database. No additional configuration needed.

## Components Structure

```
src/components/dashboard/
├── dashboard-sidebar.tsx      # Main sidebar component
├── dashboard-layout.tsx       # Layout wrapper with sidebar
├── viewer-dashboard.tsx       # Viewer-specific content
├── creator-dashboard.tsx      # Creator-specific content
├── moderator-dashboard.tsx    # Moderator-specific content
├── admin-dashboard.tsx        # Admin-specific content
└── stats-card.tsx            # Reusable stats card component
```

## Mobile Experience

- Hamburger menu button appears in top-left corner
- Sidebar slides in from left when opened
- Semi-transparent overlay when sidebar is open
- Tap outside to close
- Navigation items close sidebar on click

## Desktop Collapse Feature

- **Toggle Button**: Located on right edge of sidebar, outside the main border
- **Keyboard Accessible**: Button has proper ARIA labels
- **Visual Feedback**: Hover effects on toggle button
- **Icons**: ChevronLeft (collapse) and ChevronRight (expand)
- **Position**: Fixed at top-8 of sidebar for easy access

## State Management

- Collapse state managed by `DashboardLayout` component
- Uses React `useState` hook for state management
- Can be extended to use localStorage for persistence across sessions

## Future Enhancements

- Add localStorage persistence for collapse state
- Add notification badges
- Add quick stats in sidebar
- Add collapsible sections for grouped navigation
- Add dark mode support
- Add keyboard shortcuts (e.g., Ctrl+B to toggle sidebar)
