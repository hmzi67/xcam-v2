import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePrivateChat } from "@/hooks/use-private-chat";
import { PrivateMessageBubble } from "./private-message-bubble";
import { ConversationList } from "./conversation-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivateChatContainerProps {
    streamId: string;
    token: string | null;
    className?: string;
    initialPartnerId?: string | null;
}

export function PrivateChatContainer({
    streamId,
    token,
    className,
    initialPartnerId,
}: PrivateChatContainerProps) {
    const { data: session } = useSession();
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(initialPartnerId || null);
    const [messageInput, setMessageInput] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const [creatorInfo, setCreatorInfo] = useState<{ id: string, name: string, image?: string } | null>(null);

    const {
        messages,
        conversations,
        loading,
        error,
        sending,
        sendMessage,
    } = usePrivateChat({
        streamId,
        receiverId: selectedPartnerId || undefined,
        token,
        enabled: !!token,
    });

    // Fetch stream creator info
    useEffect(() => {
        const fetchCreatorInfo = async () => {
            try {
                const response = await fetch(`/api/streams/${streamId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCreatorInfo({
                        id: data.creator.id,
                        name: data.creator.name,
                        image: data.creator.avatar
                    });
                }
            } catch (error) {
                console.error("Error fetching creator info:", error);
            }
        };

        if (streamId) {
            fetchCreatorInfo();
        }
    }, [streamId]);

    // Set initial partner when prop changes
    useEffect(() => {
        if (initialPartnerId && initialPartnerId !== selectedPartnerId) {
            setSelectedPartnerId(initialPartnerId);
        }
    }, [initialPartnerId, selectedPartnerId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle sending message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedPartnerId || sending) return;

        const success = await sendMessage(messageInput, selectedPartnerId);
        if (success) {
            setMessageInput("");
        }
    };

    // Handle key press in input
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const selectedPartner = conversations.find(c => c.partnerId === selectedPartnerId);

    if (!session) {
        return (
            <Card className={cn("flex items-center justify-center h-[400px]", className)}>
                <div className="text-center p-6">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                    <p className="text-sm text-gray-600">
                        Please sign in to use private chat.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className={cn("flex flex-col h-[400px]", className)}>
            {!selectedPartnerId ? (
                // Conversation list view
                <>
                    <div className="border-b p-3 bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Private Messages
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Show "Message Creator" option if user is not the creator and no existing conversation */}
                        {creatorInfo && session?.user?.id !== creatorInfo.id && (
                            <div className="p-2">
                                {!conversations.find(c => c.partnerId === creatorInfo.id) && (
                                    <div className="mb-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start p-3 h-auto border-dashed"
                                            onClick={() => setSelectedPartnerId(creatorInfo.id)}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {creatorInfo.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-left">
                                                        Message {creatorInfo.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 text-left">
                                                        Creator • Start a private conversation
                                                    </p>
                                                </div>
                                                <MessageCircle className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <ConversationList
                            conversations={conversations}
                            selectedPartnerId={selectedPartnerId || undefined}
                            onSelectConversation={setSelectedPartnerId}
                            className="p-2"
                        />
                    </div>
                </>
            ) : (
                // Individual conversation view
                <>
                    {/* Header */}
                    <div className="border-b p-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPartnerId(null)}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">
                                {selectedPartner?.partnerName || "Private Chat"}
                            </h3>
                            {selectedPartner && (
                                <p className="text-xs text-gray-500 capitalize">
                                    {selectedPartner.partnerRole.toLowerCase()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto bg-white dark:bg-gray-900"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No messages yet</p>
                                    <p className="text-xs">Start the conversation!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {messages.map((message, index) => {
                                    const isOwnMessage = message.senderId === session?.user?.id;
                                    const showAvatar =
                                        index === 0 ||
                                        messages[index - 1].senderId !== message.senderId;

                                    return (
                                        <PrivateMessageBubble
                                            key={message.id}
                                            message={message}
                                            isOwnMessage={isOwnMessage}
                                            showAvatar={showAvatar}
                                        />
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Message input */}
                    <form onSubmit={handleSendMessage} className="border-t p-3 bg-gray-50 dark:bg-gray-800">
                        {error && (
                            <div className="text-xs text-red-500 mb-2">{error}</div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type a private message..."
                                disabled={sending}
                                maxLength={500}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!messageInput.trim() || sending}
                            >
                                {sending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {messageInput.length}/500 characters
                        </div>
                    </form>
                </>
            )}
        </Card>
    );
}