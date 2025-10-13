import { useState, useEffect, useCallback, useRef } from "react";

export interface PrivateMessage {
  id: string;
  message: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    image?: string;
    role: string;
  };
}

export interface PrivateConversation {
  partnerId: string;
  partnerName: string;
  partnerImage?: string;
  partnerRole: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface UsePrivateChatProps {
  streamId: string;
  receiverId?: string;
  token: string | null;
  enabled?: boolean;
}

export function usePrivateChat({
  streamId,
  receiverId,
  token,
  enabled = true,
}: UsePrivateChatProps) {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [conversations, setConversations] = useState<PrivateConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Polling refs
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!token || !enabled) return;

    try {
      const response = await fetch(
        `/api/streams/${streamId}/private-conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error("Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [streamId, token, enabled]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(
    async (partnerId: string) => {
      if (!token || !enabled) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/streams/${streamId}/private-messages/${partnerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);

          // Refresh conversations to update unread counts
          fetchConversations();
        } else {
          const data = await response.json();
          setError(data.error || "Failed to fetch messages");
        }
      } catch (error) {
        setError("Failed to fetch messages");
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [streamId, token, enabled, fetchConversations]
  );

  // Send a private message
  const sendMessage = useCallback(
    async (message: string, targetReceiverId: string) => {
      if (!token || !message.trim()) return false;

      setSending(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/streams/${streamId}/private-messages/${targetReceiverId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: message.trim() }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Add new message to current conversation if it's the active one
          if (targetReceiverId === receiverId) {
            setMessages((prev) => [...prev, data.message]);
          }

          // Refresh conversations list
          fetchConversations();
          return true;
        } else {
          const data = await response.json();
          setError(data.error || "Failed to send message");
          return false;
        }
      } catch (error) {
        setError("Failed to send message");
        console.error("Error sending message:", error);
        return false;
      } finally {
        setSending(false);
      }
    },
    [streamId, token, receiverId, fetchConversations]
  );

  // Start polling for new messages and conversations
  const startPolling = useCallback(() => {
    if (!enabled || !token) return;

    // Poll conversations every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchConversations();

      // If we have an active conversation, refresh its messages too
      if (receiverId) {
        fetchMessages(receiverId);
      }
    }, 5000);
  }, [enabled, token, fetchConversations, receiverId, fetchMessages]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Effect to manage polling
  useEffect(() => {
    if (enabled && token) {
      startPolling();
      fetchConversations();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, token, startPolling, stopPolling, fetchConversations]);

  // Effect to fetch messages when receiverId changes
  useEffect(() => {
    if (receiverId && enabled && token) {
      fetchMessages(receiverId);
    } else {
      setMessages([]);
    }
  }, [receiverId, enabled, token, fetchMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    messages,
    conversations,
    loading,
    error,
    sending,
    sendMessage,
    fetchMessages,
    fetchConversations,
  };
}
