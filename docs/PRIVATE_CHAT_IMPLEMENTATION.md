# Private Chat Implementation

## Overview

The private chat system allows viewers and creators to have 1-on-1 conversations during live streams. This feature enhances user engagement by providing a more personal communication channel alongside the public stream chat.

## Features

✅ **Private 1-on-1 Messaging**: Direct messages between any two users in a stream
✅ **Tabbed Interface**: Switch between public chat and private messages
✅ **Conversation Management**: List of ongoing conversations with unread counts
✅ **Real-time Updates**: Polling-based message delivery (5-second intervals)
✅ **Message History**: Persistent conversation history per stream
✅ **Read Receipts**: Automatic marking of messages as read
✅ **Unread Notifications**: Visual indicators for new private messages
✅ **Message Bubble UI**: Chat-like interface with sender avatars and timestamps
✅ **Role Integration**: User roles (Creator/Mod/Admin) displayed in conversations

## Architecture

### Database Schema

```prisma
model PrivateMessage {
  id         String @id @default(cuid())
  senderId   String @map("sender_id")
  receiverId String @map("receiver_id")
  streamId   String @map("stream_id")
  message    String @db.Text

  isRead    Boolean @default(false) @map("is_read")
  isDeleted Boolean @default(false) @map("is_deleted")

  createdAt DateTime @default(now()) @map("created_at")
  readAt    DateTime? @map("read_at")

  // Relations
  sender   User   @relation("SentPrivateMessages", fields: [senderId], references: [id])
  receiver User   @relation("ReceivedPrivateMessages", fields: [receiverId], references: [id])
  stream   Stream @relation(fields: [streamId], references: [id])
}
```

### API Endpoints

#### 1. Send/Receive Private Messages

- **GET** `/api/streams/[streamId]/private-messages/[receiverId]`

  - Fetch conversation history between current user and receiver
  - Automatically marks messages as read
  - Returns last 50 messages in chronological order

- **POST** `/api/streams/[streamId]/private-messages/[receiverId]`
  - Send a new private message to the specified receiver
  - Requires JWT authentication token
  - Validates message content (XSS protection, length limits)

#### 2. Conversation Management

- **GET** `/api/streams/[streamId]/private-conversations`
  - Get list of all conversation partners for current user
  - Includes unread message counts per conversation
  - Sorted by last message timestamp

### Components

#### 1. `TabbedChatContainer`

- Main chat interface with tabs for public and private chat
- Handles switching between chat modes
- Shows unread private message count badge
- Integrates with existing stream layout

#### 2. `PrivateChatContainer`

- Core private messaging interface
- Two-view system: conversation list → individual chat
- Handles message sending and receiving
- Polling-based real-time updates

#### 3. `ConversationList`

- Displays all conversation partners
- Shows unread message counts
- User avatars with role indicators
- Last message timestamps

#### 4. `PrivateMessageBubble`

- Individual message display
- WhatsApp-like bubble interface
- Own messages aligned right, others left
- Sender info and timestamps

#### 5. `ChatMessage` (Enhanced)

- Added "Send Private Message" option to dropdown menu
- Available for all users (not just moderators)
- Initiates private conversation when clicked

### React Hooks

#### `usePrivateChat`

```typescript
const {
  messages, // Current conversation messages
  conversations, // List of all conversations
  loading, // Loading state for messages
  error, // Error state
  sending, // Sending state
  sendMessage, // Send a new message
  fetchMessages, // Manually fetch messages
  fetchConversations, // Manually fetch conversations
} = usePrivateChat({
  streamId,
  receiverId, // Optional: specific conversation
  token,
  enabled,
});
```

## Usage

### 1. Starting a Private Conversation

From public chat:

1. Click the menu button (⋮) next to any message
2. Select "Send Private Message"
3. Automatically switches to private chat tab
4. Opens conversation with that user

### 2. Managing Conversations

In private chat tab:

1. **Conversation List View**: See all your conversations

   - Unread message counts
   - Last message timestamps
   - User roles and avatars

2. **Individual Chat View**: Active conversation
   - Message history
   - Real-time message sending
   - Back button to conversation list

### 3. Message Features

- **Character Limit**: 500 characters per message
- **Read Receipts**: Messages marked as read automatically when viewed
- **Message History**: Persistent across sessions (per stream)
- **Real-time Updates**: 5-second polling interval

## Integration

### Streaming Page Integration

```tsx
// Replace ChatContainer with TabbedChatContainer
<TabbedChatContainer
  streamId={selectedStream}
  canModerate={userCanModerate}
  className="h-full"
/>
```

### Required Permissions

- **Authentication**: Users must be signed in
- **Chat Token**: Same JWT token used for public chat
- **Stream Access**: Users must have access to the stream

## Technical Details

### Polling vs WebSocket

Currently uses **polling** (5-second intervals) for simplicity:

- ✅ Simple implementation
- ✅ Works with existing Next.js App Router
- ✅ No additional infrastructure needed
- ❌ Less real-time than WebSocket
- ❌ Higher server load with many users

### Future Enhancements

1. **WebSocket Integration**: Replace polling with real-time WebSocket connections
2. **Message Encryption**: End-to-end encryption for private messages
3. **File Sharing**: Allow image/file attachments in private messages
4. **Message Reactions**: Emoji reactions to private messages
5. **Typing Indicators**: Show when the other person is typing
6. **Push Notifications**: Browser notifications for new private messages
7. **Message Search**: Search within conversation history
8. **Conversation Archives**: Export/archive old conversations

## Security Considerations

✅ **Authentication**: JWT token validation for all requests
✅ **Authorization**: Users can only access their own conversations
✅ **XSS Protection**: Message content sanitization
✅ **Rate Limiting**: Can be added using existing chat infrastructure
✅ **Message Validation**: Length limits and content validation

## Performance

- **Database Queries**: Optimized with proper indexing on sender/receiver pairs
- **Message Pagination**: Limits to 50 messages per fetch
- **Polling Efficiency**: Only active conversations are polled
- **Unread Counting**: Efficient aggregation queries

## Monitoring

Monitor these metrics:

- Private message send success rate
- Average conversation length
- Polling request frequency
- Database query performance for private messages
- User engagement with private chat feature

## Troubleshooting

### Common Issues

1. **Messages not appearing**: Check JWT token validity
2. **Unread counts not updating**: Verify polling is active
3. **Can't send messages**: Check authentication and message validation
4. **Performance issues**: Monitor database query performance

### Debug Mode

Enable detailed logging by setting debug flags in the `usePrivateChat` hook and API endpoints.
