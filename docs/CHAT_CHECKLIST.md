# 🚀 Chat System - Pre-Launch Checklist

## Before Going Live

### 1. ✅ Authentication Setup

- [ ] Fix auth imports in `/app/api/streams/[streamId]/chat/token/route.ts`
- [ ] Fix auth imports in `/app/api/streams/[streamId]/moderate/route.ts`
- [ ] Verify `NEXTAUTH_SECRET` is set in `.env`
- [ ] Test JWT token generation works

### 2. ✅ Database

- [ ] Run `npx prisma generate` to update Prisma client
- [ ] Verify `ChatMessage` model exists in schema
- [ ] Verify `ModerationAction` model exists in schema
- [ ] Test database connection with `npx prisma studio`

### 3. ✅ Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters"

# Optional (defaults work for development)
NEXTAUTH_URL="http://localhost:3000"
```

### 4. ✅ Dependencies

Run:

```bash
npm install jsonwebtoken @types/jsonwebtoken @radix-ui/react-dropdown-menu class-variance-authority
```

Verify in `package.json`:

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.x.x",
    "@radix-ui/react-dropdown-menu": "^2.x.x",
    "class-variance-authority": "^0.x.x"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.x.x"
  }
}
```

### 5. ✅ Test Scenarios

#### 5.1 Basic Chat Flow

- [ ] User with credits > 0 can see chat
- [ ] User can send a message
- [ ] Message appears in real-time
- [ ] Message persists after page refresh

#### 5.2 Credit Gating

- [ ] User with 0 balance sees gate prompt
- [ ] Gate prompt shows current balance
- [ ] "Top Up" button works
- [ ] After adding credits, chat becomes available

#### 5.3 Rate Limiting

- [ ] Send 10 messages rapidly (all succeed)
- [ ] 11th message is rejected with 429 error
- [ ] Warning appears at < 3 remaining
- [ ] Counter resets after 30 seconds

#### 5.4 Real-Time Features

- [ ] Open stream in 2 browsers
- [ ] Message sent in browser A appears in browser B
- [ ] Disconnect Wi-Fi → Shows "Disconnected" status
- [ ] Reconnect → Auto-reconnects within 30 seconds

#### 5.5 Moderation (Creator/Mod Only)

- [ ] Hover over message → See moderation menu
- [ ] Delete message → Disappears for all users
- [ ] Mute user → They can't send messages
- [ ] Ban user → They can't access chat
- [ ] Moderation panel shows recent actions

#### 5.6 Security

- [ ] Try sending `<script>alert('xss')</script>` → Renders as text
- [ ] Try sending 501+ character message → Rejected
- [ ] Try sending without balance → Rejected
- [ ] Try accessing chat API without token → 401 Unauthorized

### 6. ✅ Integration

Add chat to your stream viewer page:

```tsx
// Example: /app/watch/[streamId]/page.tsx
import { ChatContainer } from "@/components/chat";

export default function WatchPage({
  params,
}: {
  params: { streamId: string };
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Video Player */}
      <div className="col-span-2">
        <VideoPlayer streamId={params.streamId} />
      </div>

      {/* Chat */}
      <div className="col-span-1 h-screen">
        <ChatContainer streamId={params.streamId} />
      </div>
    </div>
  );
}
```

### 7. ✅ Performance Considerations

#### For Production:

- [ ] Consider Redis for rate limiting (currently in-memory)
- [ ] Add message caching layer for frequently accessed streams
- [ ] Implement message virtualization for 1000+ messages
- [ ] Add CDN for static assets
- [ ] Monitor SSE connection count

#### Scaling Checklist:

- [ ] Database indexes on `ChatMessage(streamId, createdAt)`
- [ ] Connection pooling configured in Prisma
- [ ] Rate limit cleanup runs every 5 minutes
- [ ] SSE connections properly closed on client disconnect

### 8. ✅ Monitoring & Logging

Add to your monitoring:

```typescript
// Track these metrics
- Active SSE connections per stream
- Messages sent per minute
- Rate limit violations
- Failed authentication attempts
- Moderation actions taken
- Average message latency
```

### 9. ✅ Error Handling

Verify these scenarios:

- [ ] Database connection fails → Graceful error
- [ ] Stream doesn't exist → 404 error
- [ ] User not authenticated → Redirect to login
- [ ] Token expired → Refresh token flow
- [ ] SSE connection fails → Auto-reconnect

### 10. ✅ Mobile Testing

Test on mobile devices:

- [ ] Chat container is responsive
- [ ] Input keyboard doesn't cover messages
- [ ] Scroll works smoothly
- [ ] Touch gestures work (tap to show moderation menu)
- [ ] Connection stable on mobile network

### 11. ✅ Accessibility

Verify accessibility:

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces new messages
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG standards
- [ ] Alt text on all icons

### 12. ✅ Documentation

Ensure team knows:

- [ ] How to moderate chat
- [ ] How to handle user reports
- [ ] How to clear chat in emergencies
- [ ] How to check rate limit status
- [ ] How to review moderation logs

## 🚨 Critical Issues to Watch

### Issue: Rate Limiter Memory Leak

**Symptom:** Server memory grows over time  
**Fix:** RateLimiter cleanup runs every 5 minutes (already implemented)

### Issue: SSE Connection Leaks

**Symptom:** Too many open connections  
**Fix:** Ensure `request.signal.addEventListener('abort', cleanup)` is working

### Issue: Database Connection Pool Exhausted

**Symptom:** "Too many connections" errors  
**Fix:** Configure Prisma connection pool:

```env
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

## ✅ Ready for Launch

Once all items are checked:

1. Deploy to staging environment
2. Run all tests again
3. Monitor for 24 hours
4. Deploy to production
5. Announce feature to users!

## 📊 Success Metrics (Week 1)

Track these after launch:

- Total messages sent
- Active chatters per stream
- Average chat engagement rate
- Rate limit violations (should be < 1%)
- Moderation actions taken
- Reported chat bugs (target: 0)

---

**Last Updated:** Ready for deployment after auth fix  
**Status:** ✅ Implementation complete, pending auth configuration  
**Next Step:** Fix auth imports and test end-to-end
