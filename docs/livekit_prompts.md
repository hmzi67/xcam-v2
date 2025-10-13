# NextJS LiveKit Streaming Platform - Implementation Prompts

## Prerequisites Prompt

```
I'm building a credit-gated live streaming platform using Next.js 14+ (App Router), TypeScript, PostgreSQL with Prisma ORM, and LiveKit for video streaming. 

Please help me set up the initial project structure:

1. Initialize a Next.js 14+ project with TypeScript and App Router
2. Install and configure these dependencies:
   - Prisma ORM with PostgreSQL
   - LiveKit server SDK (@livekit/components-react, livekit-client, livekit-server-sdk)
   - NextAuth.js v5 for authentication
   - Stripe SDK for payments
   - Tailwind CSS for styling
   - Zod for validation
   - React Hook Form for forms

3. Set up the folder structure following Next.js App Router conventions:
   - /app (routes)
   - /lib (utilities, configs)
   - /components (React components)
   - /prisma (schema and migrations)
   - /types (TypeScript types)
   - /hooks (custom React hooks)

4. Create a .env.example file with all required environment variables:
   - DATABASE_URL
   - NEXTAUTH_SECRET, NEXTAUTH_URL
   - LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_WS_URL
   - STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
   - COINBASE_API_KEY, COINBASE_WEBHOOK_SECRET

5. Set up the base tsconfig.json with path aliases (@/ for root imports)

6. Create a basic next.config.js with necessary configurations

Provide the complete setup with all configuration files and installation commands.
```

---

## Prompt 1: Prisma Schema & Database Setup

```
I'm building a credit-gated live streaming platform. Create a complete Prisma schema for PostgreSQL that includes:

**Models Required:**
1. User - id (cuid), email (unique), password (hashed), role (enum: VIEWER, CREATOR, MODERATOR, ADMIN), status (enum: ACTIVE, SUSPENDED, DELETED), emailVerified (DateTime), createdAt, updatedAt

2. Profile - id, userId (unique FK), displayName, avatarUrl, bio, isCreator (boolean), createdAt, updatedAt

3. Stream - id, creatorId (FK to User), title, category, status (enum: SCHEDULED, LIVE, PAUSED, ENDED), ingestUrl, playbackUrl, thumbnailUrl, startedAt, endedAt, createdAt, updatedAt

4. StreamSession - id, streamId (FK), status (enum: STARTING, ACTIVE, ENDED), metadata (Json), createdAt, endedAt

5. Wallet - userId (unique FK), balance (Decimal, default 0), currency (default "USD"), createdAt, updatedAt

6. LedgerEntry - id, userId (FK), type (enum: DEPOSIT, DEBIT, REFUND, ADJUSTMENT), amount (Decimal), currency, referenceType (enum: PAYMENT, METER_EVENT, REFUND, ADMIN), referenceId, metadata (Json), createdAt

7. Payment - id, userId (FK), provider (enum: STRIPE, COINBASE), providerRef (unique), status (enum: PENDING, SUCCEEDED, FAILED, REFUNDED), amount (Decimal), currency, metadata (Json), createdAt, updatedAt

8. Price - id, productCode (unique), credits (Int), amount (Decimal), currency, active (boolean), createdAt, updatedAt

9. Follow - id, userId (FK), creatorId (FK to User), createdAt (compound unique on userId + creatorId)

10. ChatMessage - id, streamId (FK), userId (FK), message (text), createdAt

11. ModerationAction - id, targetType (enum: USER, STREAM, MESSAGE), targetId, action (enum: MUTE, BAN, DELETE, WARN), reason, actorId (FK to User), expiresAt, createdAt

12. MeterEvent - id, userId (FK), streamId (FK), sessionId, intervalIndex (Int), playbackMs (Int), creditsDebited (Decimal), createdAt (compound unique on sessionId + intervalIndex)

**Requirements:**
- Add proper indexes on: ledgerEntry(userId, createdAt), stream(status, startedAt), chatMessage(streamId, createdAt), meterEvent(sessionId, intervalIndex)
- Add cascading deletes where appropriate
- Include proper relations between models
- Add @@map directives to use snake_case table names if needed

Also provide:
1. The initial migration command
2. A seed script (prisma/seed.ts) that creates: 1 admin user, 2 creator users, 3 viewer users, 5 price tiers (100-10000 credits), and 2 test categories
3. Helper functions in /lib/prisma.ts for database connection with proper error handling and connection pooling
```

---

## Prompt 2: Authentication System with NextAuth.js

```
Create a complete authentication system using NextAuth.js v5 for a Next.js App Router application with:

**Requirements:**
1. Email/password authentication with bcrypt password hashing
2. JWT-based sessions with RS256 signing (generate keys if needed)
3. Role-based access control (VIEWER, CREATOR, MODERATOR, ADMIN)
4. Email verification workflow
5. Protected route middleware

**Files to create:**

1. **/lib/auth.ts** - NextAuth configuration with:
   - Credentials provider
   - JWT callback to include userId, role, emailVerified
   - Session callback to expose user data
   - Custom authorize function that checks Prisma User table

2. **/lib/auth-utils.ts** - Helper functions:
   - hashPassword(password: string)
   - verifyPassword(password: string, hash: string)
   - generateVerificationToken()
   - requireAuth() - server action helper
   - requireRole(role: Role[]) - authorization checker

3. **/app/api/auth/[...nextauth]/route.ts** - NextAuth API route handler

4. **/app/api/auth/register/route.ts** - POST endpoint:
   - Validate email/password with Zod
   - Check if user exists
   - Hash password
   - Create user and profile
   - Send verification email (placeholder)
   - Return success response

5. **/app/api/auth/verify/route.ts** - GET endpoint to verify email token

6. **/middleware.ts** - Protect routes:
   - /dashboard/* requires authenticated user
   - /admin/* requires ADMIN role
   - /creator/* requires CREATOR or ADMIN role

7. **/components/auth/login-form.tsx** - Client component with React Hook Form and Zod validation

8. **/components/auth/register-form.tsx** - Registration form component

9. **/app/(auth)/login/page.tsx** - Login page
10. **/app/(auth)/register/page.tsx** - Register page

**Include:**
- Proper TypeScript types for session, user, and JWT
- Error handling with appropriate status codes
- Zod schemas for validation
- Loading states and error messages in forms
- Redirect logic after successful auth
```

---

## Prompt 3: LiveKit Integration & Stream Management

```
Implement LiveKit integration for live streaming with room-based broadcasting:

**Requirements:**
1. Server-side LiveKit room creation and token generation
2. Creator broadcast component using LiveKit React SDK
3. Viewer playback component
4. Stream lifecycle management

**Files to create:**

1. **/lib/livekit.ts** - LiveKit utility functions:
   - createRoom(streamId: string, creatorId: string) - creates LiveKit room
   - generateCreatorToken(roomName: string, userId: string) - token with publish permissions
   - generateViewerToken(roomName: string, userId: string) - token with subscribe permissions
   - deleteRoom(roomName: string)
   - getRoomInfo(roomName: string) - get participant count and status

2. **/app/api/streams/route.ts** - POST endpoint (creator only):
   - Validate user is creator
   - Create Stream record in database
   - Create LiveKit room
   - Generate ingest URL (room name)
   - Return stream details with ingest credentials

3. **/app/api/streams/[streamId]/route.ts** - GET (public), PATCH (creator), DELETE (creator/admin):
   - GET: Return stream details with live status
   - PATCH: Update metadata (title, category, status)
   - DELETE: End stream, close room, update database

4. **/app/api/streams/[streamId]/token/route.ts** - POST endpoint:
   - Check if stream exists and is live
   - Check user authentication
   - For creator: return token with publish permissions
   - For viewer: check credit balance > 0, return token with subscribe permissions
   - Return JWT token and room configuration

5. **/app/api/streams/list/route.ts** - GET endpoint with query params:
   - ?status=live|ended
   - ?category=gaming|music|etc
   - ?search=query
   - Return paginated stream list with creator info
   - Include participant count for live streams

6. **/components/stream/creator-broadcast.tsx** - Creator streaming component:
   - Use @livekit/components-react (LiveKitRoom, VideoPreview, ControlBar)
   - Camera/microphone toggle
   - Screen share option
   - Stream status indicator
   - End stream button
   - Participant count display

7. **/components/stream/viewer-player.tsx** - Viewer component:
   - LiveKitRoom with subscribe-only mode
   - Video/audio quality controls
   - Fullscreen toggle
   - Loading and error states
   - Automatic reconnection logic

8. **/components/stream/stream-card.tsx** - Stream preview card:
   - Thumbnail, title, creator name
   - Live badge with viewer count
   - Category tag
   - Click to watch

9. **/app/creator/stream/page.tsx** - Creator streaming page:
   - Stream setup form (title, category, thumbnail)
   - Start/Stop broadcast buttons
   - Embedded creator-broadcast component
   - Stream analytics (current viewers, duration)

10. **/app/watch/[streamId]/page.tsx** - Viewer watch page:
    - Embedded viewer-player component
    - Stream info sidebar
    - Chat component (to be integrated later)
    - Credit balance indicator

**Include:**
- Proper error handling and loading states
- TypeScript types for LiveKit events
- Cleanup on component unmount
- WebRTC connection status indicators
- Responsive design for mobile
```

---

## Prompt 4: Credit Wallet & Ledger System

```
Implement a double-entry ledger system for credit management:

**Requirements:**
1. Wallet balance management with atomic operations
2. Ledger entries for all transactions (DEPOSIT, DEBIT, REFUND, ADJUSTMENT)
3. Transaction idempotency
4. Balance calculation with reconciliation

**Files to create:**

1. **/lib/wallet.ts** - Core wallet operations:
   - getWalletBalance(userId: string): Promise<Decimal>
   - creditWallet(userId: string, amount: Decimal, referenceType: string, referenceId: string, metadata?: Json): Promise<LedgerEntry> - creates DEPOSIT entry
   - debitWallet(userId: string, amount: Decimal, referenceType: string, referenceId: string, metadata?: Json): Promise<LedgerEntry | null> - creates DEBIT entry, returns null if insufficient balance
   - refundWallet(userId: string, amount: Decimal, referenceId: string): Promise<LedgerEntry>
   - adjustWallet(userId: string, amount: Decimal, reason: string, adminId: string): Promise<LedgerEntry>
   - recalculateBalance(userId: string): Promise<Decimal> - sum all ledger entries
   - createLedgerEntry() - internal function with database transaction

2. **/lib/wallet-validation.ts** - Validation utilities:
   - validateSufficientBalance(userId: string, requiredAmount: Decimal): Promise<boolean>
   - isTransactionIdempotent(referenceType: string, referenceId: string): Promise<boolean>
   - getLedgerEntryByReference(referenceType: string, referenceId: string): Promise<LedgerEntry | null>

3. **/app/api/wallet/balance/route.ts** - GET endpoint:
   - Require authentication
   - Return current balance and currency
   - Include pending transactions count

4. **/app/api/wallet/ledger/route.ts** - GET endpoint with pagination:
   - Require authentication
   - Query params: ?cursor=id&limit=50&type=DEPOSIT|DEBIT|REFUND
   - Return ledger entries with metadata
   - Include running balance calculation

5. **/app/api/wallet/reconcile/route.ts** - POST endpoint (admin only):
   - Recalculate user balance from ledger
   - Compare with current wallet balance
   - Create adjustment entry if mismatch found
   - Return reconciliation report

6. **/components/wallet/balance-display.tsx** - Client component:
   - Show current credit balance
   - Visual indicator (green/yellow/red based on balance)
   - "Top Up" button
   - Real-time updates via polling or websocket

7. **/components/wallet/ledger-table.tsx** - Transaction history table:
   - Paginated list of ledger entries
   - Type badges (color-coded)
   - Amount with +/- indicator
   - Date/time
   - Reference details
   - Running balance column

8. **/components/wallet/top-up-dialog.tsx** - Modal for purchasing credits:
   - Display available price packages
   - Select payment method (card/crypto/bank)
   - Redirect to checkout
   - Show loading state

9. **/app/dashboard/wallet/page.tsx** - User wallet page:
   - Balance display
   - Ledger table
   - Top-up button
   - Export transactions (CSV)

10. **/hooks/use-wallet.ts** - Custom React hook:
    - Fetch and cache balance
    - Auto-refresh on interval
    - Optimistic updates
    - Error handling

**Include:**
- Use Prisma transactions for atomic operations
- Proper Decimal handling (avoid floating point issues)
- Comprehensive error handling
- TypeScript types for all operations
- Unit test examples for critical functions
```

---

## Prompt 5: Playback Metering System

```
Implement credit-based metering for live stream playback:

**Requirements:**
1. Client pings server every 10 seconds during playback
2. Server debits credits based on configured rate
3. Idempotent debit processing (no double charges)
4. Automatic playback pause when credits exhausted
5. Session tracking

**Files to create:**

1. **/lib/metering.ts** - Metering logic:
   - calculateCreditsForInterval(playbackMs: number, ratePerMinute: Decimal): Decimal
   - processMetering(userId: string, streamId: string, sessionId: string, intervalIndex: number, playbackMs: number): Promise<MeteringResult>
   - getMeteringRate(streamId: string): Promise<Decimal> - get rate per minute (default 6 credits = 1 credit per 10s)
   - createMeterEvent() - create idempotent meter event
   - Types: MeteringResult { success: boolean, remainingCredits: Decimal, nextAllowedMs: number, message?: string }

2. **/app/api/meter/route.ts** - POST endpoint:
   - Body: { streamId, sessionId, intervalIndex, playbackMs }
   - Require authentication
   - Validate stream is live
   - Check idempotency (sessionId + intervalIndex unique)
   - Calculate credits to debit
   - Call wallet.debitWallet()
   - Create MeterEvent record
   - Return { success, remainingCredits, nextAllowedMs, message }
   - Status codes: 200 (success), 402 (insufficient credits), 409 (already processed), 400 (invalid request)

3. **/app/api/streams/[streamId]/session/route.ts** - POST endpoint to start viewing session:
   - Generate unique sessionId (UUID)
   - Create StreamSession record if needed
   - Check user has sufficient balance
   - Return { sessionId, meteringRate, minimumBalance }

4. **/hooks/use-metering.ts** - Client-side metering hook:
   - Parameters: streamId, sessionId, enabled
   - useEffect with 10-second interval
   - Track intervalIndex and playbackMs
   - Call POST /api/meter
   - Handle responses: update balance state, pause video on 402, show errors
   - Cleanup on unmount
   - Return: { remainingCredits, isMetering, error, pauseRequired }

5. **/components/stream/metered-player.tsx** - Enhanced viewer player:
   - Wrap viewer-player component
   - Integrate use-metering hook
   - Show balance indicator overlay
   - Pause playback when insufficient credits
   - Display top-up modal on pause
   - Resume on balance refill
   - Show metering status (next debit countdown)

6. **/components/stream/credit-warning.tsx** - Warning component:
   - Show when balance < 50 credits
   - "Low balance" banner
   - Countdown to next debit
   - Quick top-up button

7. **/app/api/admin/metering-stats/route.ts** - GET endpoint (admin):
   - Query params: ?startDate&endDate&streamId
   - Return metering statistics: total debits, unique viewers, average watch time, revenue generated

8. **/lib/metering-config.ts** - Configuration:
   - Default rate per minute
   - Per-category rate overrides
   - Premium stream multipliers
   - Minimum balance threshold

**Include:**
- Comprehensive error handling for network issues
- Retry logic with exponential backoff
- Client-side balance caching
- Server-side rate validation
- Proper TypeScript types
- Handle edge cases (page visibility, network offline, rapid interval changes)
```

---

## Prompt 6: Payment Integration (Stripe)

```
Implement Stripe payment integration for credit purchases:

**Requirements:**
1. Stripe Checkout for card payments
2. Webhook handling for payment confirmation
3. Credit deposit on successful payment
4. Refund handling
5. Price package management

**Files to create:**

1. **/lib/stripe.ts** - Stripe utility functions:
   - Initialize Stripe client with secret key
   - createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<string> - returns checkout URL
   - constructWebhookEvent(payload: string, signature: string): Stripe.Event - verify webhook signature
   - handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void>
   - handlePaymentFailed(session: Stripe.Checkout.Session): Promise<void>
   - createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund>

2. **/app/api/payments/checkout/route.ts** - POST endpoint:
   - Body: { priceId: string }
   - Require authentication
   - Get Price record from database
   - Create Payment record with status PENDING
   - Create Stripe Checkout session with metadata { userId, priceId, paymentId }
   - Return { checkoutUrl, sessionId }

3. **/app/api/webhooks/stripe/route.ts** - POST endpoint:
   - Raw body required (export const config = { api: { bodyParser: false } })
   - Verify webhook signature
   - Handle events:
     - checkout.session.completed: Update payment status to SUCCEEDED, call wallet.creditWallet()
     - checkout.session.expired: Update payment status to FAILED
     - charge.refunded: Create refund ledger entry, call wallet.refundWallet()
   - Idempotency: Check if payment already processed
   - Return 200 for all events (even if already processed)
   - Log errors but don't return 4xx/5xx to avoid retry storms

4. **/app/api/payments/history/route.ts** - GET endpoint:
   - Require authentication
   - Query params: ?cursor&limit=20
   - Return user's payment history with status

5. **/app/api/admin/prices/route.ts** - GET/POST endpoints (admin only):
   - GET: Return all price packages (active and inactive)
   - POST: Create new price package
   - Body: { productCode, credits, amount, currency, active }

6. **/components/payments/price-card.tsx** - Price package display:
   - Credits amount (large)
   - Price in currency
   - "Best value" badge for highest credit-per-dollar
   - "Buy Now" button
   - Bonus credits indicator

7. **/components/payments/checkout-button.tsx** - Client component:
   - Click handler calls /api/payments/checkout
   - Redirects to Stripe Checkout
   - Loading state
   - Error handling

8. **/components/payments/payment-history.tsx** - Transaction list:
   - Table: Date, Amount, Credits, Status, Payment Method
   - Status badges (Succeeded/Failed/Pending/Refunded)
   - Pagination

9. **/app/dashboard/credits/page.tsx** - Credits purchase page:
   - Grid of price cards
   - Payment history section
   - Current balance prominently displayed

10. **/app/api/payments/success/route.ts** - GET endpoint (redirect after checkout):
    - Query param: ?session_id
    - Verify session
    - Show success message
    - Redirect to dashboard

**Include:**
- Proper error handling and logging
- Webhook signature verification
- Idempotency checks using Stripe event IDs
- Decimal precision for amounts
- TypeScript types for Stripe objects
- Environment variable validation
- Test mode detection
```

---

## Prompt 7: Chat System (Credit-Gated)

```
Implement real-time chat for streams with credit gating:

**Requirements:**
1. WebSocket-based chat (or Server-Sent Events alternative)
2. Chat access only for users with balance > 0
3. Rate limiting (10 messages per 30 seconds)
4. Moderation capabilities
5. Emoji support

**Files to create:**

1. **/lib/chat-server.ts** - Chat server utilities (if using WebSocket):
   - Type definitions for chat messages and events
   - Rate limiter class: RateLimiter(maxMessages, windowSeconds)
   - Message validation
   - Ban/mute check functions

2. **/app/api/streams/[streamId]/chat/token/route.ts** - POST endpoint:
   - Require authentication
   - Check wallet balance > 0 (credit gate)
   - Check user not banned/muted for this stream
   - Generate chat token (JWT with streamId, userId, role)
   - Return { token, canChat: boolean, reason?: string }

3. **/app/api/chat/route.ts** - WebSocket endpoint or SSE:
   - Verify chat token
   - Join stream room
   - Listen for messages
   - Validate and broadcast messages
   - Apply rate limiting
   - Store messages in database
   - Handle disconnections

4. **/app/api/streams/[streamId]/messages/route.ts** - GET endpoint:
   - Return recent chat messages (last 100)
   - Include user info (name, avatar, role)
   - Pagination support

5. **/components/chat/chat-container.tsx** - Main chat component:
   - Split layout: messages list + input
   - Auto-scroll to bottom
   - Load more messages on scroll up
   - Connection status indicator

6. **/components/chat/chat-message.tsx** - Single message component:
   - User avatar and name
   - Message text with emoji rendering
   - Timestamp
   - Role badge (creator/mod/admin)
   - Action menu for moderators (delete, mute user)

7. **/components/chat/chat-input.tsx** - Message input component:
   - Textarea with enter-to-send (shift+enter for new line)
   - Character limit (200 chars)
   - Emoji picker
   - Disabled state when not eligible
   - Rate limit warning when approaching limit

8. **/components/chat/chat-gate-prompt.tsx** - Component shown when chat is locked:
   - "Chat requires credits" message
   - Current balance display
   - "Top Up" button
   - Minimum balance required (1 credit)

9. **/hooks/use-chat.ts** - Chat WebSocket hook:
   - Connect/disconnect logic
   - Send message function
   - Receive message handler
   - State: messages array, connected status, error
   - Reconnection logic
   - Clean up on unmount

10. **/app/api/streams/[streamId]/moderate/route.ts** - POST endpoint (creator/mod):
    - Body: { action: 'mute' | 'ban' | 'delete', targetUserId?: string, messageId?: string, duration?: number, reason: string }
    - Create ModerationAction record
    - Apply action: delete message, temporarily mute, ban user
    - Broadcast moderation event to chat
    - Return success

11. **/components/chat/moderation-panel.tsx** - Mod tools (shown to creators/mods):
    - User list with quick actions
    - Ban/mute duration selector
    - Recent moderation log
    - Clear chat button

**Include:**
- TypeScript types for all message formats
- XSS protection (sanitize messages)
- Emoji rendering (using emoji-mart or similar)
- Graceful fallback if WebSocket fails
- Mobile-responsive design
- Accessibility (keyboard navigation)
```

---

## Prompt 8: Admin Dashboard & Analytics

```
Create an admin dashboard for platform management:

**Requirements:**
1. User management (view, suspend, adjust credits)
2. Stream moderation (take down content)
3. Payment analytics
4. Real-time platform stats
5. Audit logs

**Files to create:**

1. **/app/admin/layout.tsx** - Admin layout with sidebar:
   - Protected by requireRole(['ADMIN'])
   - Navigation: Dashboard, Users, Streams, Payments, Prices, Analytics, Logs
   - Breadcrumbs

2. **/app/admin/page.tsx** - Admin dashboard overview:
   - Key metrics cards: Total users, Active streams, Revenue today/month, Active viewers
   - Recent activity feed
   - Quick actions panel

3. **/app/admin/users/page.tsx** - User management:
   - Data table with search, filter, sort
   - Columns: Email, Role, Status, Balance, Created, Actions
   - Actions: View details, Suspend/Activate, Adjust credits, Delete
   - Bulk actions

4. **/app/api/admin/users/route.ts** - GET endpoint:
   - Query params: ?search&role&status&page&limit
   - Return paginated user list with profile and wallet info

5. **/app/api/admin/users/[userId]/route.ts** - PATCH/DELETE endpoints:
   - PATCH: Update role, status, or adjust wallet balance
   - Create audit log entry
   - DELETE: Soft delete user

6. **/app/admin/streams/page.tsx** - Stream management:
   - Live streams table
   - Past streams with filters
   - Takedown action with reason input
   - View stream details modal

7. **/app/api/admin/streams/[streamId]/takedown/route.ts** - POST endpoint:
   - Body: { reason: string }
   - End stream immediately
   - Update status to REMOVED
   - Close LiveKit room
   - Create moderation action record
   - Notify creator

8. **/app/admin/payments/page.tsx** - Payment analytics:
   - Revenue chart (daily/weekly/monthly)
   - Payment method breakdown (card/crypto/bank)
   - Failed payments table
   - Refund requests

9. **/app/api/admin/analytics/revenue/route.ts** - GET endpoint:
   - Query params: ?startDate&endDate&groupBy=day|week|month
   - Return aggregated revenue data
   - Include payment provider breakdown

10. **/app/api/admin/analytics/streams/route.ts** - GET endpoint:
    - Return stream analytics: total streams, avg duration, peak concurrent viewers, total watch time

11. **/app/admin/prices/page.tsx** - Price management:
    - CRUD for price packages
    - Toggle active status
    - Set as featured/best value
    - Preview how prices display to users

12. **/components/admin/stat-card.tsx** - Reusable metric card:
    - Title, value, change percentage
    - Trend indicator (up/down)
    - Icon
    - Click to drill down

13. **/components/admin/audit-log.tsx** - Audit trail table:
    - Action, Actor, Target, Timestamp, Metadata
    - Filter by action type, date range
    - Export capability

14. **/app/api/admin/audit-logs/route.ts** - GET endpoint:
    - Return paginated audit logs
    - Created automatically on sensitive admin actions

15. **/lib/audit-log.ts** - Audit logging utility:
    - logAuditEvent(action: string, actorId: string, targetType: string, targetId: string, metadata?: Json)
    - Store in AuditLog table (you may need to add this to Prisma schema)

**Include:**
- Server-side pagination and filtering
- Export to CSV functionality
- Real-time updates for live metrics (polling or WebSocket)
- Responsive design
- Loading skeletons
- Error boundaries
- Confirmation dialogs for destructive actions
```

---

## Prompt 9: Frontend Components & UI

```
Create shared frontend components and layouts:

**Requirements:**
1. Responsive navigation
2. Dashboard layouts
3. Forms and inputs
4. Loading states
5. Error handling components

**Files to create:**

1. **/components/layout/navbar.tsx** - Main navigation:
   - Logo/brand
   - Navigation links (Home, Browse, Dashboard)
   - User menu dropdown (Profile, Wallet, Settings, Logout)
   - Balance display in navbar
   - Mobile hamburger menu
   - Notifications bell (phase 2 ready)

2. **/components/layout/sidebar.tsx** - Dashboard sidebar:
   - Role-based navigation items
   - Viewer: Watch, Wallet, Following
   - Creator: Stream, Analytics, Settings
   - Admin: Admin panel link
   - Active route highlighting

3. **/components/layout/footer.tsx** - Site footer:
   - Links: About, Terms, Privacy, Support
   - Social media icons
   - Copyright notice

4. **/components/ui/button.tsx** - Reusable button component:
   - Variants: primary, secondary, outline, ghost, danger
   - Sizes: sm, md, lg
   - Loading state with spinner
   - Disabled state
   - Icon support

5. **/components/ui/input.tsx** - Form input component:
   - Text, email, password, number types
   - Label and error message
   - Icon support (prefix/suffix)
   - Validation state styling

6. **/components/ui/card.tsx** - Card container component:
   - Header, body, footer sections
   - Variants: default, bordered, elevated

7. **/components/ui/modal.tsx** - Modal/dialog component:
   - Overlay with backdrop
   - Close button
   - Size variants
   - Animation
   - Focus trap

8. **/components/ui/tabs.tsx** - Tabs component:
   - Tab list and panels
   - Controlled and uncontrolled modes
   - Keyboard navigation

9. **/components/ui/data-table.tsx** - Generic data table:
   - Column definitions
   - Sorting
   - Pagination
   - Loading skeleton
   - Empty state

10. **/components/ui/loading-spinner.tsx** - Loading indicators:
    - Spinner component (various sizes)
    - Skeleton loaders for text, cards, avatars

11. **/components/ui/error-boundary.tsx** - Error boundary component:
    - Catch errors in component tree
    - Display fallback UI
    - Log errors
    - Reset button

12. **/components/ui/toast.tsx** - Toast notifications:
    - Success, error, warning, info variants
    - Auto-dismiss with timer
    - Stack multiple toasts
    - Close button

13. **/app/(main)/layout.tsx** - Main app layout:
    - Navbar at top
    - Main content area
    - Footer
    - Toast container

14. **/app/dashboard/layout.tsx** - Dashboard layout:
    - Sidebar navigation
    - Main content area with breadcrumbs
    - Protected route wrapper

15. **/components/ui/badge.tsx** - Badge component:
    - Status indicators (live, offline, pending)
    - Role badges (creator, mod, admin)
    - Color variants

16. **/hooks/use-toast.ts** - Toast hook:
    - show(message, type, duration)
    - Global toast state management
    - Auto-dismiss logic

17. **/lib/utils.ts** - Utility functions:
    - cn() - className merger with clsx and tailwind-merge
    - formatDate(), formatCurrency(), formatNumber()
    - formatDuration() - convert ms to readable format
    - truncateText()

**Include:**
- Tailwind CSS custom theme configuration
- Dark mode support (optional)
- Accessibility attributes (ARIA)
- Mobile-responsive breakpoints
- Animation classes
- Consistent spacing and typography
```

---

## Prompt 10: Discovery & Browse Features

```
Create stream discovery and browsing functionality:

**Requirements:**
1. Browse all creators
2. Filter and search streams
3. Category navigation
4. Live stream directory
5. Follow/unfollow creators

**Files to create:**

1. **/app/browse/page.tsx** - Main browse page:
   - Featured live streams carousel
   - Category filter chips
   - Search bar
   - Stream grid with infinite scroll or pagination
   - Toggle: Show all / Live only

2. **/app/api/streams/discover/route.ts** - GET endpoint:
   - Query params: ?status=live|all&category&search&cursor&limit=20
   - Return streams with creator profile info
   - Include viewer count for live streams
   - Sort by: live first, then by viewer count/recency

3. **/components/discover/stream-grid.tsx** - Stream grid layout:
   - Responsive grid (1-4 columns based on screen size)
   - Stream card components
   - Loading skeleton
   - Empty state

4. **/components/discover/category-filter.tsx** - Category chips:
   - All, Gaming, Music, Talk Shows, Education, etc.
   - Active state highlighting
   - Horizontal scroll on mobile

5. **/components/discover/search-bar.tsx** - Search input:
   - Debounced search (500ms)
   - Clear button
   - Search icon
   - Recent searches (localStorage)

6. **/components/discover/featured-carousel.tsx** - Featured streams carousel:
   - Auto-play slideshow
   - Dot indicators
   - Next/prev buttons
   - Touch/swipe support

7. **/app/creator/[creatorId]/page.tsx** - Creator profile page:
   - Creator avatar, name, bio
   - Follow button with follower count
   - Current stream (if live)
   - Past streams list
   - Social links (phase 2)

8. **/app/api/creators/[creatorId]/route.ts** - GET endpoint:
   - Return creator profile
   - Include follower count, total streams, total watch time
   - Current live stream if any

9. **/app/api/creators/[creatorId]/follow/route.ts** - POST/DELETE endpoints:
   - POST: Create follow relationship
   - DELETE: Remove follow relationship
   - Require authentication
   - Return updated follower count

10. **/components/creator/follow-button.tsx** - Follow/unfollow button:
    - Toggle state
    - Loading state
    - Optimistic update
    - Login prompt if not authenticated

11. **/app/dashboard/following/page.tsx** - User's following page:
    - List of followed creators
    - Show who's live with badge
    - Unfollow action
    - Sort by: Online first, then alphabetically

12. **/app/api/following/route.ts** - GET endpoint:
    - Return user's followed creators
    - Include live status for each
    - Paginated

13. **/components/discover/online-indicator.tsx** - Live status indicator:
    - Animated red dot for live
    - "LIVE" badge
    - Viewer count

14. **/hooks/use-live-streams.ts** - Hook to fetch and auto-refresh live streams:
    - Poll every 30 seconds
    - Update stream list
    - Notify on new live streams from followed creators

**Include:**
- SEO meta tags for public pages
- Open Graph tags for social sharing
- Thumbnail lazy loading
- Debounced search
- URL state management for filters
- Responsive image handling
```

---

## Prompt 11: Creator Dashboard & Analytics

```
Build creator-specific features and analytics:

**Requirements:**
1. Stream management interface
2. Earnings and analytics
3. Stream schedule (phase 2 ready)
4. Creator settings
5. Moderation tools

**Files to create:**

1. **/app/creator/dashboard/page.tsx** - Creator dashboard home:
   - Quick stats: Total earnings, Follower count, Avg viewers, Total watch time
   - Recent streams table
   - Upcoming scheduled streams
   - Quick "Go Live" button

2. **/app/creator/streams/page.tsx** - Stream management:
   - All streams table (live, ended, scheduled)
   - Filters: Status, date range
   - Actions: Edit, Delete, View analytics
   - Create new stream button

3. **/app/creator/analytics/page.tsx** - Creator analytics:
   - Date range selector
   - Charts: Viewers over time, Revenue over time, Watch time by stream
   - Top streams table
   - Viewer demographics (phase 2)

4. **/app/api/creator/analytics/route.ts** - GET endpoint:
   - Query params: ?startDate&endDate&streamId
   - Return aggregated analytics: total views, unique viewers, total revenue, avg concurrent viewers, peak viewers
   - Time-series data for charts

5. **/app/api/creator/earnings/route.ts** - GET endpoint:
   - Return earnings summary: total, by month, by stream
   - Breakdown by credit source
   - Include pending payouts (phase 2)

6. **/app/creator/settings/page.tsx** - Creator settings:
   - Profile settings (name, bio, avatar)
   - Stream defaults (category, tags, quality)
   - Notification preferences
   - Payout settings (phase 2)

7. **/components/creator/earnings-chart.tsx** - Revenue chart:
   - Use recharts library
   - Line or bar chart
   - Time period selector (7d, 30d, 90d, all time)
   - Tooltip with detailed breakdown

8. **/components/creator/viewer-stats.tsx** - Viewer statistics card:
   - Current viewers (if live)
   - Peak viewers
   - Average viewers
   - Total unique viewers

9. **/components/creator/stream-table.tsx** - Stream management table:
   - Sortable columns: Title, Date, Duration, Viewers, Revenue, Status
   - Row actions: Edit, Delete, Analytics
   - Bulk actions

10. **/app/creator/stream/[streamId]/analytics/page.tsx** - Individual stream analytics:
    - Stream details summary
    - Minute-by-minute viewer graph
    - Revenue breakdown
    - Chat activity stats
    - Export report button

11. **/components/creator/go-live-wizard.tsx** - Multi-step stream creation:
    - Step 1: Stream details (title, category, thumbnail)
    - Step 2: Preview and settings
    - Step 3: Get ingest URL and go live
    - Progress indicator

12. **/components/creator/thumbnail-uploader.tsx** - Image upload component:
    - Drag and drop
    - Preview
    - Crop tool
    - Upload to storage (S3/Cloudflare R2)
    - Progress bar

13. **/app/api/upload/thumbnail/route.ts** - POST endpoint:
    - Accept multipart/form-data
    - Validate image type and size
    - Upload to cloud storage
    - Return public URL

**Include:**
- Responsive charts with recharts
- Export to CSV/PDF functionality
- Date range pickers
- Loading states for async data
- Empty states with helpful messages
- Currency formatting
```

---

## Prompt 12: Notifications System (Phase 2 Ready)

```
Implement notification infrastructure (in-app and email):

**Requirements:**
1. In-app notification center
2. Real-time notifications
3. Email notifications
4. Notification preferences
5. Mark as read functionality

**Files to create:**

1. **/prisma/schema.prisma** - Add Notification model:
   - id, userId (FK), type (enum: STREAM_LIVE, LOW_BALANCE, PAYMENT_SUCCESS, FOLLOW, SYSTEM), title, message, read (boolean), metadata (Json), createdAt
   - Add index on (userId, read, createdAt)

2. **/lib/notifications.ts** - Notification utilities:
   - createNotification(userId: string, type: NotificationType, title: string, message: string, metadata?: Json)
   - getUnreadCount(userId: string): Promise<number>
   - markAsRead(notificationId: string)
   - markAllAsRead(userId: string)
   - sendEmail(to: string, subject: string, body: string) - wrapper for email service

3. **/app/api/notifications/route.ts** - GET endpoint:
   - Return user's notifications (paginated)
   - Query params: ?read=true|false&limit=20&cursor

4. **/app/api/notifications/[notificationId]/read/route.ts** - PATCH endpoint:
   - Mark single notification as read
   - Return updated notification

5. **/app/api/notifications/read-all/route.ts** - POST endpoint:
   - Mark all user's notifications as read
   - Return updated count

6. **/components/notifications/notification-bell.tsx** - Bell icon in navbar:
   - Badge with unread count
   - Click to open dropdown
   - Show recent 5 notifications
   - "View all" link to notification center

7. **/components/notifications/notification-dropdown.tsx** - Dropdown menu:
   - List of recent notifications
   - Click notification to mark as read and navigate
   - "Mark all as read" button
   - Empty state

8. **/components/notifications/notification-item.tsx** - Single notification:
   - Icon based on type
   - Title and message
   - Timestamp (relative)
   - Unread indicator (blue dot)
   - Click handler

9. **/app/dashboard/notifications/page.tsx** - Notification center:
   - Full list of notifications
   - Filter: All, Unread, Read
   - Bulk actions
   - Pagination

10. **/app/dashboard/settings/notifications/page.tsx** - Notification preferences:
    - Toggle email notifications by type
    - Toggle in-app notifications
    - Email frequency (instant, daily digest)
    - Save preferences

11. **/hooks/use-notifications.ts** - Notifications hook:
    - Fetch notifications
    - Subscribe to real-time updates (WebSocket/polling)
    - Mark as read function
    - Unread count state

12. **/lib/email-templates.ts** - Email templates:
    - streamLiveTemplate(creatorName, streamTitle, streamUrl)
    - lowBalanceTemplate(balance, topUpUrl)
    - paymentSuccessTemplate(amount, credits, balance)
    - Generic template wrapper with branding

13. **/lib/notification-triggers.ts** - Trigger functions:
    - notifyFollowersOnLive(streamId: string) - notify all followers when creator goes live
    - notifyLowBalance(userId: string) - when balance < threshold
    - notifyPaymentSuccess(userId: string, paymentId: string)
    - Called from relevant parts of the app (stream start, metering, payment webhook)

**Include:**
- Real-time updates (WebSocket or polling)
- Email service integration (SendGrid/AWS SES)
- Notification grouping (multiple similar notifications)
- Deep linking to relevant pages
- Responsive design
- Accessibility (screen reader support)
```

---

## Prompt 13: Moderation & Safety Features

```
Implement content moderation and user safety tools:

**Requirements:**
1. Report system for streams and messages
2. Automated content filtering
3. Moderation queue
4. Ban/mute management
5. Appeal process

**Files to create:**

1. **/prisma/schema.prisma** - Add Report model:
   - id, reporterId (FK to User), targetType (enum: STREAM, MESSAGE, USER), targetId, reason (enum: SPAM, HARASSMENT, INAPPROPRIATE, COPYRIGHT, OTHER), description, status (enum: PENDING, REVIEWED, RESOLVED, REJECTED), reviewerId (FK to User), reviewNote, createdAt, reviewedAt

2. **/app/api/reports/route.ts** - POST endpoint:
   - Body: { targetType, targetId, reason, description }
   - Require authentication
   - Create Report record
   - Notify moderators
   - Return success

3. **/app/api/reports/list/route.ts** - GET endpoint (moderator/admin):
   - Query params: ?status=PENDING|REVIEWED&targetType&page
   - Return paginated reports with reporter and target info

4. **/app/api/reports/[reportId]/review/route.ts** - PATCH endpoint (moderator/admin):
   - Body: { action: 'APPROVE' | 'REJECT', note: string, moderationAction?: { action, duration } }
   - Update report status
   - If approved, apply moderation action (ban, delete, etc.)
   - Create ModerationAction record
   - Notify reporter of outcome

5. **/components/moderation/report-button.tsx** - Report button/modal:
   - Click opens modal with report form
   - Reason dropdown
   - Description textarea
   - Submit button
   - Success/error toast

6. **/components/moderation/report-modal.tsx** - Report form modal:
   - Target info display
   - Reason selection (radio buttons)
   - Additional details textarea
   - Submit and cancel buttons

7. **/app/admin/moderation/page.tsx** - Moderation queue:
   - Tabs: Pending, Reviewed, All
   - Reports table with priority indicators
   - Quick actions: View, Review, Dismiss
   - Filters: Type, Date, Reporter

8. **/app/admin/moderation/[reportId]/page.tsx** - Report review page:
   - Full report details
   - Target content preview (stream/message/user)
   - Reporter history (past reports)
   - Target history (past violations)
   - Action selector (no action, warn, mute, ban, delete)
   - Duration selector for temp bans/mutes
   - Note textarea
   - Approve/Reject buttons

9. **/components/moderation/ban-list.tsx** - Banned users list:
   - Table: User, Reason, Banned by, Date, Expires
   - Actions: Extend, Unban, View history
   - Filter by permanent/temporary

10. **/app/api/moderation/bans/route.ts** - GET endpoint (moderator/admin):
    - Return list of active bans
    - Include ban details and expiration

11. **/app/api/moderation/bans/[userId]/route.ts** - DELETE endpoint (admin):
    - Unban user
    - Update ModerationAction record
    - Create audit log

12. **/lib/content-filter.ts** - Content filtering utilities:
    - containsProfanity(text: string): boolean
    - containsSpam(text: string): boolean
    - containsLinks(text: string): boolean
    - filterMessage(text: string): string - replace prohibited words with asterisks
    - Use a profanity library or custom word list

13. **/middleware/moderation.ts** - Middleware to check bans/mutes:
    - checkUserBanned(userId: string): Promise<boolean>
    - checkUserMuted(userId: string, streamId: string): Promise<boolean>
    - checkStreamRestricted(streamId: string): Promise<boolean>
    - Used in chat and stream APIs

14. **/components/moderation/auto-mod-settings.tsx** - Auto-moderation config (admin):
    - Toggle auto-filter profanity
    - Toggle block spam
    - Toggle block links
    - Whitelist domains
    - Custom blocked words list

**Include:**
- Rate limiting on report submissions (prevent abuse)
- Email notifications for moderators on new reports
- Appeal form for banned users
- Moderation activity logs
- Content preview with context
- Quick action buttons
```

---

## Prompt 14: Testing & Validation Setup

```
Set up testing infrastructure and write example tests:

**Requirements:**
1. Unit tests for critical functions
2. API endpoint tests
3. Component tests
4. Test database setup
5. Mocking utilities

**Files to create:**

1. **jest.config.js** - Jest configuration:
   - TypeScript support
   - Path aliases matching tsconfig
   - Coverage thresholds
   - Test environment (node for API, jsdom for components)

2. **vitest.config.ts** - Alternative: Vitest configuration (faster, Vite-native):
   - Similar setup to Jest
   - Better TypeScript support

3. **/lib/__tests__/wallet.test.ts** - Wallet function tests:
   - Test creditWallet() creates DEPOSIT entry and updates balance
   - Test debitWallet() fails when insufficient balance
   - Test refundWallet() creates negative entry
   - Test recalculateBalance() handles multiple entries correctly
   - Test transaction idempotency

4. **/lib/__tests__/metering.test.ts** - Metering logic tests:
   - Test calculateCreditsForInterval() with various inputs
   - Test processMetering() debits correct amount
   - Test idempotency (same session+interval)
   - Test insufficient balance handling

5. **/app/api/__tests__/auth.test.ts** - Auth API tests:
   - Test registration creates user and profile
   - Test registration validates email format
   - Test login returns JWT token
   - Test login fails with wrong password
   - Test protected routes require authentication

6. **/app/api/__tests__/streams.test.ts** - Stream API tests:
   - Test creating stream as creator returns ingest URL
   - Test creating stream as viewer returns 403
   - Test getting stream list returns active streams
   - Test getting stream token requires authentication
   - Test viewer token requires balance > 0

7. **/app/api/__tests__/payments.test.ts** - Payment tests:
   - Test checkout session creation
   - Test webhook signature verification
   - Test successful payment creates deposit
   - Test idempotent webhook handling
   - Mock Stripe API calls

8. **/components/__tests__/balance-display.test.tsx** - Component tests:
   - Test displays correct balance
   - Test shows low balance warning
   - Test top-up button click handler
   - Mock API calls

9. **/components/__tests__/chat-input.test.tsx** - Chat input tests:
   - Test message sending
   - Test character limit enforcement
   - Test disabled when no credits
   - Test rate limit warning

10. **/lib/test-utils.ts** - Testing utilities:
    - mockUser() - create test user data
    - mockSession() - create authenticated session
    - mockStream() - create test stream
    - mockPayment() - create test payment
    - cleanupDatabase() - clear test data

11. **/lib/test-db.ts** - Test database setup:
    - Create test database connection
    - Run migrations before tests
    - Seed test data
    - Teardown after tests

12. **setup-tests.ts** - Global test setup:
    - Mock environment variables
    - Mock Next.js router
    - Mock fetch API
    - Setup testing library

13. **/lib/__tests__/auth-utils.test.ts** - Auth utility tests:
    - Test password hashing and verification
    - Test token generation
    - Test role checking

14. **package.json** - Add test scripts:
    - "test": run all tests
    - "test:watch": watch mode
    - "test:coverage": coverage report
    - "test:unit": unit tests only
    - "test:integration": integration tests

**Include:**
- Example of mocking Prisma client
- Example of mocking external APIs (Stripe, LiveKit)
- React Testing Library setup for components
- Coverage reports configuration
- CI/CD test commands
- Test data factories
```

---

## Prompt 15: Deployment & DevOps Setup

```
Set up deployment infrastructure and DevOps pipeline:

**Requirements:**
1. Docker containerization
2. Environment configuration
3. CI/CD pipeline
4. Database migrations
5. Monitoring and logging

**Files to create:**

1. **Dockerfile** - Multi-stage Docker build:
   - Stage 1: Dependencies (node_modules)
   - Stage 2: Build (Next.js build)
   - Stage 3: Production (minimal runtime)
   - Expose port 3000
   - Health check endpoint

2. **docker-compose.yml** - Local development stack:
   - Services: app, postgres, redis (for future caching)
   - Volume mounts for hot reload
   - Environment variables from .env
   - Network configuration

3. **.dockerignore** - Exclude from Docker build:
   - node_modules
   - .next
   - .git
   - *.md
   - .env*

4. **.github/workflows/ci.yml** - GitHub Actions CI:
   - Trigger on push and PR
   - Jobs: lint, type-check, test, build
   - Cache dependencies
   - Upload coverage
   - Status checks

5. **.github/workflows/deploy.yml** - Deployment workflow:
   - Trigger on push to main
   - Build Docker image
   - Push to container registry
   - Deploy to production (Vercel/Railway/Fly.io)
   - Run database migrations
   - Health check after deploy

6. **scripts/migrate.sh** - Migration script:
   - Run Prisma migrations
   - Handle rollback on failure
   - Backup database before migration
   - Verify migration success

7. **scripts/seed.sh** - Seed database script:
   - Run Prisma seed
   - Create default admin user
   - Create price tiers
   - Create categories
   - Idempotent (safe to run multiple times)

8. **scripts/health-check.sh** - Health check script:
   - Check database connection
   - Check LiveKit connection
   - Check external APIs
   - Return status code

9. **/app/api/health/route.ts** - Health check endpoint:
   - GET /api/health
   - Check database connectivity
   - Check critical services
   - Return JSON: { status: 'ok' | 'degraded' | 'down', services: {...} }

10. **vercel.json** - Vercel configuration (if deploying to Vercel):
    - Build settings
    - Environment variables
    - Rewrites and redirects
    - Function regions

11. **railway.json** - Railway configuration (if deploying to Railway):
    - Build command
    - Start command
    - Health check path
    - Auto-scaling rules

12. **scripts/backup-db.sh** - Database backup script:
    - Dump PostgreSQL database
    - Upload to S3/Cloudflare R2
    - Rotate old backups
    - Schedule via cron

13. **scripts/monitor.sh** - Monitoring setup:
    - Configure logging (Winston/Pino)
    - Error tracking (Sentry)
    - APM (Application Performance Monitoring)
    - Metrics collection

14. **/lib/logger.ts** - Logging utility:
    - Structured logging with Winston or Pino
    - Different log levels (debug, info, warn, error)
    - Log to file and console
    - Integration with monitoring service

15. **/lib/sentry.ts** - Error tracking setup:
    - Initialize Sentry
    - Capture exceptions
    - User context
    - Performance monitoring

16. **.env.production.example** - Production environment template:
    - All required production variables
    - Comments explaining each variable
    - Security notes

17. **docs/deployment.md** - Deployment documentation:
    - Step-by-step deployment guide
    - Environment setup
    - Database migration process
    - Rollback procedures
    - Monitoring dashboard access

**Include:**
- Security best practices (secrets management)
- Scaling considerations
- Backup and recovery procedures
- Performance optimization tips
- SSL/TLS certificate setup
- CDN configuration
- Database connection pooling
- Rate limiting configuration
```

---

## Prompt 16: Documentation & Developer Guide

```
Create comprehensive documentation for the platform:

**Requirements:**
1. API documentation
2. Component documentation
3. Setup guide
4. Architecture overview
5. Contribution guidelines

**Files to create:**

1. **README.md** - Project overview:
   - Project description
   - Features list
   - Tech stack
   - Quick start guide
   - Links to detailed docs
   - Screenshots/demo
   - License

2. **docs/SETUP.md** - Development setup:
   - Prerequisites (Node.js, PostgreSQL, etc.)
   - Clone repository
   - Install dependencies
   - Environment variables setup
   - Database setup and migrations
   - Running development server
   - Running tests
   - Troubleshooting common issues

3. **docs/ARCHITECTURE.md** - System architecture:
   - High-level architecture diagram
   - Data flow diagrams
   - Technology choices and rationale
   - Folder structure explanation
   - Key design patterns used
   - Scalability considerations

4. **docs/API.md** - API documentation:
   - Authentication flow
   - Endpoint list with methods
   - Request/response examples
   - Error codes
   - Rate limiting details
   - Webhook signatures

5. **docs/DATABASE.md** - Database schema:
   - ERD diagram
   - Table descriptions
   - Relationships
   - Indexes and performance
   - Migration strategy
   - Backup and restore

6. **docs/LIVEKIT.md** - LiveKit integration guide:
   - How LiveKit is used
   - Room management
   - Token generation
   - Publishing and subscribing
   - Troubleshooting streaming issues

7. **docs/PAYMENTS.md** - Payment integration:
   - Stripe setup
   - Coinbase Commerce setup
   - Webhook configuration
   - Testing payments
   - Handling refunds
   - Security considerations

8. **docs/DEPLOYMENT.md** - Deployment guide:
   - Deployment options (Vercel, Railway, self-hosted)
   - Production environment setup
   - CI/CD pipeline
   - Database migration in production
   - Monitoring and logging
   - Scaling strategies

9. **docs/CONTRIBUTING.md** - Contribution guidelines:
   - Code of conduct
   - How to contribute
   - Code style guide
   - Commit message conventions
   - Pull request process
   - Testing requirements

10. **docs/COMPONENTS.md** - Component library:
    - List of all reusable components
    - Props documentation
    - Usage examples
    - Storybook setup (optional)

11. **docs/SECURITY.md** - Security guidelines:
    - Authentication and authorization
    - Data encryption
    - API security
    - XSS and CSRF protection
    - Rate limiting
    - Incident response

12. **docs/TESTING.md** - Testing guide:
    - Testing philosophy
    - Running tests
    - Writing new tests
    - Test coverage requirements
    - Mocking strategies
    - E2E testing (future)

13. **docs/TROUBLESHOOTING.md** - Common issues:
    - Database connection errors
    - LiveKit connection issues
    - Payment webhook failures
    - Build errors
    - Performance issues
    - FAQ

14. **CHANGELOG.md** - Version history:
    - Release notes format
    - Version 1.0 (MVP) features
    - Future versions planned

15. **.github/PULL_REQUEST_TEMPLATE.md** - PR template:
    - Description
    - Type of change
    - Testing done
    - Checklist (tests, docs, lint)

16. **.github/ISSUE_TEMPLATE/** - Issue templates:
    - Bug report template
    - Feature request template
    - Question template

**Include:**
- Mermaid diagrams for architecture
- Code examples for common tasks
- Links between related docs
- Table of contents in long docs
- Screenshots where helpful
```

---

## Bonus Prompt: Performance Optimization

```
Implement performance optimizations across the platform:

**Requirements:**
1. Database query optimization
2. Caching strategy
3. Image optimization
4. Code splitting
5. API response optimization

**Files to create:**

1. **/lib/cache.ts** - Caching utility:
   - Redis client setup
   - Cache get/set/delete functions
   - TTL management
   - Cache invalidation strategies
   - Fallback to memory cache if Redis unavailable

2. **/lib/db-query-cache.ts** - Database query caching:
   - Wrap Prisma queries with cache layer
   - Cache frequently accessed data (user profiles, stream details)
   - Invalidate on updates
   - Cache warming on app start

3. **/middleware/cache-middleware.ts** - HTTP cache middleware:
   - Cache GET responses
   - Set appropriate Cache-Control headers
   - Vary by authentication status
   - Purge on relevant mutations

4. **/lib/image-optimizer.ts** - Image optimization:
   - Resize and compress uploads
   - Generate multiple sizes (thumbnail, medium, large)
   - Convert to WebP format
   - Use Next.js Image component everywhere

5. **/components/optimized-image.tsx** - Optimized image wrapper:
   - Next.js Image with blur placeholder
   - Lazy loading
   - Responsive sizes
   - Error fallback

6. **/lib/db-optimizations.ts** - Database performance:
   - Query batching with Prisma
   - N+1 query prevention (include relations)
   - Connection pooling configuration
   - Index recommendations

7. **/app/api/streams/list/route.ts** - Optimize stream listing:
   - Add pagination
   - Select only needed fields
   - Include eager loading for relations
   - Cache results for 30 seconds

8. **next.config.js** - Next.js optimizations:
   - Enable SWC minification
   - Configure image domains
   - Enable compression
   - Optimize bundle size

9. **/lib/rate-limiter.ts** - Rate limiting:
   - Sliding window rate limiter
   - Per-user and per-IP limits
   - Different limits for different endpoints
   - Redis-backed for distributed systems

10. **/hooks/use-intersection-observer.ts** - Lazy loading hook:
    - Detect when element enters viewport
    - Load data only when needed
    - Use for infinite scroll

11. **/hooks/use-debounce.ts** - Debounce hook:
    - Debounce search inputs
    - Prevent excessive API calls
    - Configurable delay

12. **/lib/analytics-batch.ts** - Batch analytics:
    - Queue analytics events
    - Batch send every N seconds
    - Reduce database writes

**Include:**
- Bundle analyzer configuration
- Lighthouse score targets
- Core Web Vitals monitoring
- Performance budget
- Profiling tools setup
```

---

## Implementation Order Recommendation

```
Recommended implementation sequence:

**Week 1: Foundation**
1. Prerequisites Prompt - Project setup
2. Prompt 1 - Database schema
3. Prompt 2 - Authentication

**Week 2: Core Features**
4. Prompt 3 - LiveKit integration
5. Prompt 4 - Wallet system
6. Prompt 9 - UI components (partially, basic components first)

**Week 3: Streaming & Payments**
7. Prompt 5 - Metering system
8. Prompt 6 - Stripe payments
9. Prompt 10 - Discovery pages

**Week 4: Social & Moderation**
10. Prompt 7 - Chat system
11. Prompt 11 - Creator dashboard
12. Prompt 13 - Moderation basics

**Week 5-6: Admin & Polish**
13. Prompt 8 - Admin dashboard
14. Prompt 12 - Notifications
15. Prompt 14 - Testing
16. Prompt 15 - Deployment

**Week 7: Documentation & Optimization**
17. Prompt 16 - Documentation
18. Bonus Prompt - Performance optimization

**Notes:**
- Run migrations after each database schema change
- Test integrations (LiveKit, Stripe) early
- Deploy to staging environment by Week 4
- Gather feedback and iterate
```