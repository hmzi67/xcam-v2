import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import {
  storeChatMessage,
  validateMessage,
  RateLimiter,
  canUserChat,
} from "@/lib/chat-server";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// Store active connections by streamId
const connections = new Map<string, Set<{ userId: string; controller: ReadableStreamDefaultController }>>();

// Global rate limiter
const rateLimiter = new RateLimiter(10, 30);

// Cleanup rate limiter every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * SSE endpoint for real-time chat
 * GET /api/chat?token=xxx - Subscribe to chat events
 * POST /api/chat - Send a message
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      streamId: string;
      role: string;
    };

    const { userId, streamId, role } = decoded;

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Register connection
        if (!connections.has(streamId)) {
          connections.set(streamId, new Set());
        }
        const connection = { userId, controller };
        connections.get(streamId)!.add(connection);

        // Send initial connection event
        const data = JSON.stringify({
          type: "connection",
          status: "connected",
          role,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${data}\n\n`);

        // Send heartbeat every 30 seconds
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(`: heartbeat\n\n`);
          } catch {
            clearInterval(heartbeat);
          }
        }, 30000);

        // Cleanup on close
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          connections.get(streamId)?.delete(connection);
          if (connections.get(streamId)?.size === 0) {
            connections.delete(streamId);
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("SSE connection error:", error);
    return new Response("Invalid token", { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, message } = body;

    if (!token || !message) {
      return Response.json(
        { error: "Missing token or message" },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      streamId: string;
      role: string;
    };

    const { userId, streamId, role } = decoded;

    // Check if user can still chat
    const chatCheck = await canUserChat(userId, streamId);
    if (!chatCheck.canChat) {
      return Response.json(
        { error: chatCheck.reason },
        { status: 403 }
      );
    }

    // Rate limiting
    if (!rateLimiter.canSend(userId)) {
      const resetSeconds = rateLimiter.getResetSeconds(userId);
      return Response.json(
        {
          error: "Rate limit exceeded",
          resetIn: resetSeconds,
        },
        { status: 429 }
      );
    }

    // Validate message
    const validation = validateMessage(message);
    if (!validation.isValid) {
      return Response.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    // Store message in database
    const chatMessage = await storeChatMessage(
      streamId,
      userId,
      validation.sanitized!
    );

    // Increment rate limit
    rateLimiter.increment(userId);

    // Broadcast to all connected clients
    const streamConnections = connections.get(streamId);
    if (streamConnections) {
      const event = JSON.stringify({
        type: "message",
        data: {
          id: chatMessage.id,
          message: chatMessage.message,
          userId: chatMessage.userId,
          user: {
            id: chatMessage.user.id,
            displayName: chatMessage.user.profile?.displayName || "Anonymous",
            avatarUrl: chatMessage.user.profile?.avatarUrl,
            role: chatMessage.user.role,
          },
          createdAt: chatMessage.createdAt.toISOString(),
        },
        timestamp: new Date().toISOString(),
      });

      streamConnections.forEach(({ controller }) => {
        try {
          controller.enqueue(`data: ${event}\n\n`);
        } catch (error) {
          // Client disconnected, will be cleaned up
        }
      });
    }

    return Response.json({
      success: true,
      messageId: chatMessage.id,
      remaining: rateLimiter.getRemaining(userId),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return Response.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Broadcast moderation event to stream (called by moderation API)
 */
export function broadcastModerationEvent(
  streamId: string,
  event: {
    type: "delete" | "mute" | "ban";
    targetUserId?: string;
    messageId?: string;
    duration?: number;
  }
) {
  const streamConnections = connections.get(streamId);
  if (streamConnections) {
    const data = JSON.stringify({
      type: "moderation",
      data: event,
      timestamp: new Date().toISOString(),
    });

    streamConnections.forEach(({ controller }) => {
      try {
        controller.enqueue(`data: ${data}\n\n`);
      } catch {
        // Client disconnected
      }
    });
  }
}
