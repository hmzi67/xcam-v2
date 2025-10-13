# LiveKit Streaming Integration

This implementation provides a complete live streaming solution using LiveKit with Next.js, featuring room-based broadcasting with creator and viewer roles.

## 🚀 Features

### Core Functionality

- **Server-side Room Creation**: Automatic LiveKit room management
- **Token Generation**: Role-based JWT tokens for creators and viewers
- **Creator Broadcasting**: Full broadcast controls with camera, microphone, and screen share
- **Viewer Playback**: Subscribe-only mode with quality controls and fullscreen
- **Stream Lifecycle Management**: Complete stream state management from creation to end

### Advanced Features

- **Real-time Participant Count**: Live viewer count updates
- **Connection State Management**: Automatic reconnection and status indicators
- **Role-based Access Control**: Creator/Viewer permissions with credit system
- **Stream Discovery**: Paginated stream listing with live status
- **Responsive Design**: Mobile-friendly streaming interface

## 📁 File Structure

```
src/
├── lib/
│   └── livekit.ts                 # Core LiveKit utilities
├── app/api/streams/
│   ├── route.ts                   # Create streams (POST)
│   ├── [streamId]/
│   │   ├── route.ts              # Stream management (GET/PATCH/DELETE)
│   │   └── token/route.ts        # Token generation (POST)
│   └── list/route.ts             # Stream discovery (GET)
└── components/stream/
    ├── creator-broadcast.tsx      # Creator broadcasting component
    ├── viewer-player.tsx         # Viewer playback component
    ├── stream-card.tsx           # Stream preview cards
    ├── streaming-example.tsx     # Usage example
    └── index.ts                  # Component exports
```

## 🛠 Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
# LiveKit Configuration
LIVEKIT_WS_URL=ws://localhost:7880        # Your LiveKit server URL
LIVEKIT_API_KEY=your_api_key              # LiveKit API key
LIVEKIT_API_SECRET=your_api_secret        # LiveKit API secret

# Public URL for client connections
NEXT_PUBLIC_LIVEKIT_WS_URL=ws://localhost:7880
```

### 2. Dependencies

Already installed packages:

```bash
npm install @livekit/components-react @livekit/components-core livekit-client livekit-server-sdk date-fns
```

### 3. Database Schema

The implementation uses existing Prisma models:

- `User` - User authentication and roles
- `Profile` - User profiles with credit system
- `Stream` - Stream metadata and status

## 🎯 Usage

### Basic Implementation

```tsx
import { CreatorBroadcast, ViewerPlayer, StreamCard } from '@/components/stream';

// Creator Broadcasting
<CreatorBroadcast
  streamId="stream_123"
  token="jwt_token"
  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
  onStreamEnd={() => console.log('Stream ended')}
/>

// Viewer Playback
<ViewerPlayer
  streamId="stream_123"
  token="jwt_token"
  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
  className="aspect-video"
/>

// Stream Card
<StreamCard
  stream={{
    id: "stream_123",
    title: "Live Stream",
    status: "LIVE",
    creator: { name: "Creator", image: "/avatar.jpg" },
    participantCount: 42
  }}
  onJoinStream={(id) => console.log('Joining:', id)}
/>
```

### Complete Example

See `streaming-example.tsx` for a full implementation showing:

- Stream creation flow
- Creator broadcasting interface
- Viewer experience
- Stream discovery

## 🔧 API Endpoints

### Create Stream

```bash
POST /api/streams
Content-Type: application/json

{
  "title": "My Live Stream",
  "description": "Stream description",
  "scheduledFor": "2025-10-13T18:00:00Z" // Optional
}
```

### Get Stream Token

```bash
POST /api/streams/{streamId}/token

Response: { "token": "jwt_token" }
```

### List Streams

```bash
GET /api/streams/list?status=LIVE&page=1&limit=10

Response: {
  "streams": [...],
  "pagination": { "total": 100, "pages": 10 }
}
```

## 🎮 Component Features

### CreatorBroadcast

- **Video Preview**: Real-time camera/screen share preview
- **Control Bar**: Camera, microphone, screen share controls
- **Live Status**: Real-time connection and publishing status
- **Viewer Count**: Live participant count updates
- **Stream Management**: End stream functionality

### ViewerPlayer

- **Auto-subscribe**: Automatic track subscription
- **Quality Controls**: Mute/unmute audio
- **Fullscreen Mode**: Toggle fullscreen viewing
- **Connection Status**: Visual connection indicators
- **Auto-hide Controls**: Smart UI that hides during viewing

### StreamCard

- **Live Badges**: Visual status indicators (LIVE, SCHEDULED, ENDED)
- **Participant Count**: Real-time viewer count for live streams
- **Creator Info**: Avatar and name display
- **Responsive Design**: Mobile-optimized layout
- **Action Buttons**: Context-appropriate CTAs

## 🔐 Security Features

### Role-based Access

- **Creator Tokens**: Full publish permissions
- **Viewer Tokens**: Subscribe-only permissions
- **Credit Validation**: Automatic credit deduction for creators
- **Room Isolation**: Each stream gets a unique room

### Authentication

- **JWT Tokens**: Secure LiveKit token generation
- **Session Validation**: NextAuth.js integration
- **Rate Limiting**: Built-in API protection

## 📱 Responsive Design

All components are mobile-optimized with:

- **Adaptive Layouts**: Responsive grid systems
- **Touch Controls**: Mobile-friendly interaction
- **Auto-rotation**: Fullscreen video support
- **Network Awareness**: Connection state indicators

## 🐛 Error Handling

### Connection Issues

- **Automatic Reconnection**: Built-in reconnection logic
- **Fallback States**: Graceful degradation
- **Error Boundaries**: Component-level error handling
- **User Feedback**: Clear status messages

### API Errors

- **Validation**: Comprehensive input validation
- **HTTP Status Codes**: Proper error responses
- **Logging**: Server-side error logging
- **User Messages**: Friendly error messages

## 🔄 Stream Lifecycle

1. **Creation**: Creator creates stream via API
2. **Room Setup**: LiveKit room automatically created
3. **Token Generation**: Role-based tokens issued
4. **Broadcasting**: Creator joins and starts publishing
5. **Discovery**: Stream appears in public listings
6. **Viewing**: Viewers join with subscribe-only tokens
7. **Management**: Real-time participant tracking
8. **Cleanup**: Stream end triggers room cleanup

## 🎯 Best Practices

### Performance

- **Lazy Loading**: Components load on demand
- **Efficient Polling**: Optimized API calls
- **Memory Management**: Proper cleanup on unmount
- **Network Optimization**: Minimal bandwidth usage

### User Experience

- **Loading States**: Clear progress indicators
- **Error Recovery**: Graceful error handling
- **Offline Support**: Connection awareness
- **Accessibility**: Screen reader compatible

## 🚀 Deployment Notes

### LiveKit Server

Ensure your LiveKit server is properly configured:

```yaml
# livekit.yaml
port: 7880
rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 60000
```

### Production Environment

- Set up proper SSL certificates for HTTPS
- Configure CORS for your domain
- Set up monitoring and logging
- Implement rate limiting and DDoS protection

## 📊 Monitoring

The implementation includes:

- **Connection State Tracking**: Real-time status monitoring
- **Participant Analytics**: Viewer count and engagement
- **Error Reporting**: Comprehensive error logging
- **Performance Metrics**: API response times and success rates

This implementation provides a production-ready streaming solution with comprehensive features for both creators and viewers, built on the robust LiveKit platform.
