import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatGatePrompt } from "./chat-gate-prompt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, Wifi, WifiOff, ChevronUp } from "lucide-react";

interface ChatContainerProps {
    streamId: string;
    canModerate?: boolean;
    className?: string;
    onStartPrivateChat?: (userId: string, userName: string) => void;
}export function ChatContainer({ streamId, canModerate = false, className, onStartPrivateChat }: ChatContainerProps) {
    const { data: session } = useSession();
    const [chatToken, setChatToken] = useState<string | null>(null);
    const [canChat, setCanChat] = useState(true);
    const [chatReason, setChatReason] = useState<string | null>(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);

    // Get chat token
    useEffect(() => {
        const fetchChatToken = async () => {
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/streams/${streamId}/chat/token`, {
                    method: "POST",
                });

                if (response.ok) {
                    const data = await response.json();
                    setChatToken(data.token);
                    setCanChat(data.canChat);
                } else {
                    const data = await response.json();
                    setCanChat(false);
                    setChatReason(data.reason);

                    // Fetch balance if chat is gated
                    const balanceResponse = await fetch("/api/wallet/balance");
                    if (balanceResponse.ok) {
                        const balanceData = await balanceResponse.json();
                        setBalance(Number(balanceData.balance) || 0);
                    }
                }
            } catch (error) {
                console.error("Error fetching chat token:", error);
                setCanChat(false);
                setChatReason("Failed to connect to chat");
            } finally {
                setLoading(false);
            }
        };

        fetchChatToken();
    }, [streamId, session]);

    const {
        messages,
        connected,
        error,
        sendMessage,
        loadMoreMessages,
        hasMore,
        loading: messagesLoading,
        remaining,
    } = useChat({
        streamId,
        token: chatToken,
        enabled: canChat && !!chatToken,
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, autoScroll]);

    // Handle scroll to detect if user scrolled up
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

        setAutoScroll(isAtBottom);
        setShowScrollButton(!isAtBottom);

        // Load more messages when scrolling to top
        if (scrollTop < 100 && hasMore && !messagesLoading) {
            loadMoreMessages();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setAutoScroll(true);
    };

    // Handle moderation actions
    const handleDeleteMessage = async (messageId: string) => {
        try {
            await fetch(`/api/streams/${streamId}/moderate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "delete",
                    messageId,
                    reason: "Inappropriate content",
                }),
            });
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const handleMuteUser = async (userId: string) => {
        try {
            await fetch(`/api/streams/${streamId}/moderate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "mute",
                    targetUserId: userId,
                    duration: 60,
                    reason: "Muted by moderator",
                }),
            });
        } catch (error) {
            console.error("Error muting user:", error);
        }
    };

    const handleBanUser = async (userId: string) => {
        if (!confirm("Are you sure you want to ban this user?")) return;

        try {
            await fetch(`/api/streams/${streamId}/moderate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "ban",
                    targetUserId: userId,
                    reason: "Banned by moderator",
                }),
            });
        } catch (error) {
            console.error("Error banning user:", error);
        }
    };

    // Loading state
    if (loading) {
        return (
            <Card className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Loading chat...</p>
                </div>
            </Card>
        );
    }

    // Not authenticated
    if (!session) {
        return (
            <Card className="flex items-center justify-center h-[600px]">
                <div className="text-center p-6">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                    <p className="text-sm text-gray-600">
                        Please sign in to participate in chat.
                    </p>
                </div>
            </Card>
        );
    }

    // Chat gated (no credits)
    if (!canChat) {
        return <ChatGatePrompt balance={balance} reason={chatReason || undefined} />;
    }

    return (
        <Card className={`flex flex-col h-[600px] ${className || ''}`}>
            {/* Header */}
            <div className="border-b p-3 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">Live Chat</h3>
                    {connected ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                </div>
                <div className="text-xs text-gray-500">
                    {messages.length} {messages.length === 1 ? "message" : "messages"}
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-2 space-y-1"
            >
                {/* Load more indicator */}
                {hasMore && (
                    <div className="text-center py-2">
                        {messagesLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-400" />
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadMoreMessages}
                                className="text-xs"
                            >
                                Load earlier messages
                            </Button>
                        )}
                    </div>
                )}

                {/* Messages list */}
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        currentUserId={session?.user?.id || ''}
                        canModerate={canModerate}
                        onDelete={handleDeleteMessage}
                        onMute={handleMuteUser}
                        onBan={handleBanUser}
                        onPrivateMessage={onStartPrivateChat}
                    />
                ))}                {/* Empty state */}
                {messages.length === 0 && !messagesLoading && (
                    <div className="flex items-center justify-center h-full text-center p-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">No messages yet</p>
                            <p className="text-xs text-gray-400">Be the first to say something!</p>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollButton && (
                <div className="absolute bottom-32 right-4">
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={scrollToBottom}
                        className="rounded-full shadow-lg"
                    >
                        <ChevronUp className="h-5 w-5" />
                    </Button>
                </div>
            )}

            {/* Error display */}
            {error && (
                <div className="mx-4 mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {error}
                </div>
            )}

            {/* Input */}
            <ChatInput
                onSend={sendMessage}
                disabled={!connected}
                remaining={remaining}
            />
        </Card>
    );
}
