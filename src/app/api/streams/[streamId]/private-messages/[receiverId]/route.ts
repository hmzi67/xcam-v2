import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateMessage } from "@/lib/chat-server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// GET /api/streams/[streamId]/private-messages/[receiverId] - Fetch conversation history
// POST /api/streams/[streamId]/private-messages/[receiverId] - Send private message

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string; receiverId: string }> }
) {
  try {
    const { streamId, receiverId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = session.user.id;

    // Get conversation history between sender and receiver in this stream
    const messages = await prisma.privateMessage.findMany({
      where: {
        streamId,
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        isDeleted: false,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to recent 50 messages
    });

    // Mark messages as read if they were sent to current user
    await prisma.privateMessage.updateMany({
      where: {
        streamId,
        senderId: receiverId,
        receiverId: senderId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const formattedMessages = messages.reverse().map((message) => ({
      id: message.id,
      message: message.message,
      senderId: message.senderId,
      receiverId: message.receiverId,
      createdAt: message.createdAt,
      isRead: message.isRead,
      sender: {
        id: message.sender.id,
        name: message.sender.profile?.displayName || "Anonymous",
        image: message.sender.profile?.avatarUrl,
        role: message.sender.role,
      },
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching private messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string; receiverId: string }> }
) {
  try {
    const { streamId, receiverId } = await params;
    const { message } = await request.json();

    // Verify JWT token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const senderId = decoded.userId;

    // Validate message
    const validationResult = validateMessage(message);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.reason },
        { status: 400 }
      );
    }

    // Check if sender has sufficient balance for private messaging
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      include: { wallet: true },
    });

    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    if (!sender.wallet || Number(sender.wallet.balance) < 1) {
      return NextResponse.json(
        {
          error: "Insufficient credits for private messaging",
          balance: sender.wallet?.balance ? Number(sender.wallet.balance) : 0,
        },
        { status: 402 }
      );
    }

    // Verify stream exists
    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      include: { creator: true },
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Create private message
    const privateMessage = await prisma.privateMessage.create({
      data: {
        senderId,
        receiverId,
        streamId,
        message: validationResult.sanitized!,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });

    const formattedMessage = {
      id: privateMessage.id,
      message: privateMessage.message,
      senderId: privateMessage.senderId,
      receiverId: privateMessage.receiverId,
      createdAt: privateMessage.createdAt,
      isRead: privateMessage.isRead,
      sender: {
        id: privateMessage.sender.id,
        name: privateMessage.sender.profile?.displayName || "Anonymous",
        image: privateMessage.sender.profile?.avatarUrl,
        role: privateMessage.sender.role,
      },
    };

    // TODO: Broadcast to receiver via WebSocket/SSE
    // For now, we'll rely on polling or implement separate real-time endpoint

    return NextResponse.json({ message: formattedMessage });
  } catch (error) {
    console.error("Error sending private message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
