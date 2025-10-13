import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChatContainer, PrivateChatContainer } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, MessageSquare } from "lucide-react";
import { usePrivateChat } from "@/hooks/use-private-chat";
import { cn } from "@/lib/utils";

interface TabbedChatContainerProps {
    streamId: string;
    canModerate?: boolean;
    className?: string;
}

export function TabbedChatContainer({
    streamId,
    canModerate = false,
    className,
}: TabbedChatContainerProps) {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"public" | "private">("public");
    const [chatToken, setChatToken] = useState<string | null>(null);
    const [selectedPrivateUserId, setSelectedPrivateUserId] = useState<string | null>(null);

    // Get chat token for private messages
    useEffect(() => {
        const fetchChatToken = async () => {
            if (!session?.user?.id) return;

            try {
                const response = await fetch(`/api/streams/${streamId}/chat/token`, {
                    method: "POST",
                });

                if (response.ok) {
                    const data = await response.json();
                    setChatToken(data.token);
                }
            } catch (error) {
                console.error("Error fetching chat token:", error);
            }
        };

        fetchChatToken();
    }, [streamId, session]);

    // Get unread private message count
    const { conversations } = usePrivateChat({
        streamId,
        token: chatToken,
        enabled: !!chatToken && activeTab === "private",
    });

    const totalUnreadPrivateMessages = conversations.reduce(
        (total, conv) => total + conv.unreadCount,
        0
    );

    // Handle starting a private conversation
    const handleStartPrivateChat = (userId: string, userName: string) => {
        setSelectedPrivateUserId(userId);
        setActiveTab("private");
    };

    return (
        <Card className={cn("flex flex-col h-full", className)}>
            {/* Tab Header */}
            <div className="flex border-b bg-gray-50 dark:bg-gray-800">
                <Button
                    variant={activeTab === "public" ? "default" : "ghost"}
                    className={cn(
                        "flex-1 rounded-none border-0 justify-center gap-2",
                        activeTab === "public" && "bg-white dark:bg-gray-900 shadow-none"
                    )}
                    onClick={() => setActiveTab("public")}
                >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Public Chat</span>
                    <span className="sm:hidden">Public</span>
                </Button>

                <Button
                    variant={activeTab === "private" ? "default" : "ghost"}
                    className={cn(
                        "flex-1 rounded-none border-0 justify-center gap-2 relative",
                        activeTab === "private" && "bg-white dark:bg-gray-900 shadow-none"
                    )}
                    onClick={() => setActiveTab("private")}
                >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Private</span>
                    <span className="sm:hidden">DMs</span>
                    {totalUnreadPrivateMessages > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4 rounded-full"
                        >
                            {totalUnreadPrivateMessages > 99 ? "99+" : totalUnreadPrivateMessages}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === "public" ? (
                    <ChatContainer
                        streamId={streamId}
                        canModerate={canModerate}
                        className="h-full border-0 rounded-none"
                        onStartPrivateChat={handleStartPrivateChat}
                    />
                ) : (
                    <PrivateChatContainer
                        streamId={streamId}
                        token={chatToken}
                        className="h-full border-0 rounded-none"
                        initialPartnerId={selectedPrivateUserId}
                    />
                )}
            </div>

            {/* Footer info */}
            <div className="border-t px-3 py-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                        {activeTab === "public" ? "Stream Chat" : "Private Messages"}
                    </span>
                    {session && (
                        <span>Signed in as {session.user?.name}</span>
                    )}
                </div>
            </div>
        </Card>
    );
}