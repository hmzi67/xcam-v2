# Real-Time Chat System Implementation Guide

## 🎉 Implementation Complete!

A fully-functional real-time chat system with credit gating has been implemented for your streaming platform.

## 📁 Files Created

### Backend (API Routes)

1. **`/lib/chat-server.ts`** - Core chat utilities

   - `RateLimiter` class (10 messages per 30 seconds)
   - Message validation and sanitization (XSS protection)
   - Ban/mute checking functions
   - Chat message storage and retrieval

2. **`/app/api/streams/[streamId]/chat/token/route.ts`** - Chat token generation

   - Authenticates users
   - Checks wallet balance > 0 (credit gate)
   - Verifies not banned/muted
   - Returns JWT token with role

3. **`/app/api/chat/route.ts`** - Real-time messaging (SSE)

   - GET: Subscribe to chat events
   - POST: Send messages
   - Rate limiting enforcement
   - Message broadcasting to all connected clients

4. **`/app/api/streams/[streamId]/messages/route.ts`** - Message history

   - Fetch recent 100 messages
   - Pagination support
   - Includes user profile info

5. **`/app/api/streams/[streamId]/moderate/route.ts`** - Moderation actions
   - Mute users (temporary/permanent)
   - Ban users (stream-specific or global)
   - Delete messages
   - Warn users

### Frontend (Components)

6. **`/hooks/use-chat.ts`** - React hook for chat

   - Server-Sent Events (SSE) connection
   - Auto-reconnect with exponential backoff
   - Message sending with rate limit tracking
   - Real-time message updates

7. **`/components/chat/chat-container.tsx`** - Main chat UI

   - Message list with auto-scroll
   - Connection status indicator
   - Load more messages (pagination)
   - Moderation integration

8. **`/components/chat/chat-message.tsx`** - Single message component

   - User avatar and role badges (Creator/Mod/Admin)
   - Timestamp formatting
   - Moderation dropdown menu
   - Hover actions for moderators

9. **`/components/chat/chat-input.tsx`** - Message input

   - Textarea with Shift+Enter for new lines
   - Character limit (500 chars)
   - Rate limit warnings
   - Send button with loading state

10. **`/components/chat/chat-gate-prompt.tsx`** - Credit gate UI

    - Displays when balance = 0
    - Shows current balance
    - "Top Up" button
    - Minimum balance requirement message

11. **`/components/chat/moderation-panel.tsx`** - Moderator tools
    - Quick action buttons
    - Recent moderation log
    - Duration presets
    - Clear chat functionality

### Supporting Files

12. **`/lib/prisma.ts`** - Prisma client singleton
13. **`/components/ui/badge.tsx`** - Badge component for roles
14. **`/components/ui/dropdown-menu.tsx`** - Dropdown menu for actions

## 🔧 Dependencies Installed

```bash
✅ jsonwebtoken - JWT token generation
✅ @types/jsonwebtoken - TypeScript types
✅ @radix-ui/react-dropdown-menu - Dropdown UI
✅ class-variance-authority - Styling utilities
```

## 🚀 How to Use

### 1. In Your Stream Viewer Page

```tsx
import { ChatContainer } from "@/components/chat";

export default function WatchPage({ streamId }: { streamId: string }) {
  const { data: session } = useSession();
  const isCreator = /* check if user is creator */;
  const isModerator = session?.user?.role === "MODERATOR" || session?.user?.role === "ADMIN";

  return (
    <div className="flex gap-4">
      {/* Video Player */}
      <div className="flex-1">
        <VideoPlayer streamId={streamId} />
      </div>

      {/* Chat Sidebar */}
      <div className="w-96 h-screen">
        <ChatContainer
          streamId={streamId}
          canModerate={isCreator || isModerator}
        />
      </div>
    </div>
  );
}
```

### 2. Credit Gate Requirements

The system automatically enforces:

- ✅ Users must have **balance > 0** to chat
- ✅ Banned users cannot access chat
- ✅ Muted users cannot send messages
- ✅ Rate limit: **10 messages per 30 seconds**

### 3. Moderation

**For Creators and Moderators:**

- Hover over any message to see moderation options
- Right-click menu with: Delete, Mute (60 min), Ban
- Use `<ModerationPanel>` component for advanced tools

```tsx
import { ModerationPanel } from "@/components/chat";

<ModerationPanel streamId={streamId} />;
```

## 🔐 Security Features

### XSS Protection

- All messages sanitized before storage
- HTML tags escaped: `< > " '`
- Safe rendering in React

### Rate Limiting

- 10 messages per 30-second window per user
- In-memory tracking with automatic cleanup
- Warning shown when approaching limit

### Authentication & Authorization

- JWT tokens with 24-hour expiration
- Role-based permissions (Creator/Mod/Admin)
- Wallet balance verification
- Ban/mute status checking

### Message Validation

- Min length: 1 character
- Max length: 500 characters
- Spam pattern detection
- Empty message rejection

## 📊 Database Schema

Already exists in your Prisma schema:

```prisma
model ChatMessage {
  id        String   @id @default(cuid())
  streamId  String
  userId    String
  message   String   @db.Text
  isDeleted Boolean  @default(false)
  createdAt DateTime @default(now())

  stream Stream @relation(...)
  user   User   @relation(...)

  @@index([streamId, createdAt])
}

model ModerationAction {
  id         String   @id @default(cuid())
  targetType TargetType
  targetId   String
  action     ModerationActionType
  reason     String?
  actorId    String
  expiresAt  DateTime?
  createdAt  DateTime @default(now())

  @@index([targetType, targetId])
}
```

## 🎨 UI Features

### Chat Container

- **Auto-scroll** to latest messages
- **"New messages ↓"** button when scrolled up
- **Load more** button for history
- **Connection status** indicator (green dot = connected)
- **Empty state** with friendly message

### Message Display

- **User avatars** with first letter fallback
- **Role badges**: Creator (purple), Mod (green), Admin (red)
- **Timestamps** in local time
- **Hover effects** on messages
- **Moderation menu** for authorized users

### Input Box

- **Character counter** (500 max)
- **Rate limit warning** when < 3 remaining
- **Enter to send**, Shift+Enter for new line
- **Disabled state** when not connected
- **Send button** with loading spinner

### Credit Gate

- **Lock icon** with friendly message
- **Current balance** display
- **"Top Up Credits"** button
- **Minimum requirement** info (1 credit)

## 🔄 Real-Time Communication

### Technology: Server-Sent Events (SSE)

- Simpler than WebSocket for Next.js App Router
- Built-in browser support
- Auto-reconnection with exponential backoff
- Heartbeat every 30 seconds

### Event Types

1. **connection** - Initial handshake
2. **message** - New chat message
3. **moderation** - Delete/mute/ban events

### Message Flow

```
User -> POST /api/chat -> Validate -> Store in DB -> Broadcast via SSE -> All clients receive
```

## 🧪 Testing Checklist

### Basic Functionality

- [ ] Users can send messages when balance > 0
- [ ] Messages appear in real-time for all viewers
- [ ] Chat history loads on page load
- [ ] "Load more" fetches older messages
- [ ] Connection status shows correctly

### Credit Gating

- [ ] Users with 0 balance see gate prompt
- [ ] "Top Up" button redirects to wallet page
- [ ] Chat enables after adding credits

### Rate Limiting

- [ ] 10 messages sent successfully
- [ ] 11th message shows rate limit error
- [ ] Counter resets after 30 seconds
- [ ] Warning appears at < 3 remaining

### Moderation

- [ ] Creators/mods see moderation menu
- [ ] Delete removes message for all users
- [ ] Mute prevents user from sending messages
- [ ] Ban blocks user from chat entirely
- [ ] Mute expires after duration

### Edge Cases

- [ ] Connection lost/regained gracefully
- [ ] Multiple tabs don't duplicate messages
- [ ] Long messages wrap correctly
- [ ] Special characters render safely
- [ ] Deleted messages don't reappear

## 🐛 Troubleshooting

### "Cannot find module '@/lib/auth'"

Create `/lib/auth.ts` with your NextAuth configuration.

### "Cannot connect to chat"

- Check that stream is LIVE
- Verify user has balance > 0
- Check browser console for errors
- Ensure JWT_SECRET is set in .env

### Messages not appearing

- Check Network tab for SSE connection
- Verify POST /api/chat returns 200
- Check Prisma database for stored messages

### Rate limit not working

- RateLimiter uses in-memory Map
- Resets on server restart (expected)
- Consider Redis for production

## 📈 Next Steps (Optional Enhancements)

### Phase 2 Features

- [ ] **Emoji picker** - Add emoji-mart library
- [ ] **Message reactions** - Like/love/emoji reactions
- [ ] **User mentions** - @username autocomplete
- [ ] **Link previews** - Unfurl URLs automatically
- [ ] **Image uploads** - Share images in chat
- [ ] **Typing indicators** - "User is typing..."
- [ ] **Read receipts** - Message seen status
- [ ] **Search** - Find messages by keyword
- [ ] **Pinned messages** - Highlight important messages
- [ ] **Slow mode** - Enforced delay between messages
- [ ] **Subscriber-only chat** - Premium feature gate
- [ ] **Chat badges** - Custom user badges
- [ ] **Sound notifications** - Alert on new messages

### Performance Optimizations

- [ ] Implement message virtualization (react-window)
- [ ] Use Redis for rate limiting (scale horizontally)
- [ ] Add message caching layer
- [ ] Optimize database queries with indexes
- [ ] Implement WebSocket for lower latency

### Analytics

- [ ] Track chat engagement metrics
- [ ] Monitor moderation actions
- [ ] Measure rate limit violations
- [ ] Analyze peak chat times

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify all API endpoints return expected data
3. Test with Postman/Insomnia for API debugging
4. Check Prisma Studio for database state

## ✨ Success!

Your streaming platform now has a professional, secure, real-time chat system with:

- ✅ Credit gating (balance > 0 required)
- ✅ Rate limiting (10 messages/30s)
- ✅ Moderation tools (delete/mute/ban)
- ✅ Real-time messaging (SSE)
- ✅ Mobile-responsive design
- ✅ Accessibility features
- ✅ XSS protection
- ✅ Role-based permissions

Enjoy your new chat feature! 🎉
