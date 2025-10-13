import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PrivateMessage } from "@/hooks/use-private-chat";
import { cn } from "@/lib/utils";

interface PrivateMessageBubbleProps {
    message: PrivateMessage;
    isOwnMessage: boolean;
    showAvatar?: boolean;
}

export function PrivateMessageBubble({
    message,
    isOwnMessage,
    showAvatar = true,
}: PrivateMessageBubbleProps) {
    const roleColors = {
        CREATOR: "bg-purple-500",
        MODERATOR: "bg-green-500",
        ADMIN: "bg-red-500",
        VIEWER: "bg-gray-500",
    };

    const roleBadges = {
        CREATOR: "Creator",
        MODERATOR: "Mod",
        ADMIN: "Admin",
        VIEWER: "",
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div
            className={cn(
                "flex gap-2 px-3 py-2 group",
                isOwnMessage ? "flex-row-reverse" : "flex-row"
            )}
        >
            {showAvatar && (
                <div className="flex-shrink-0">
                    <div className="relative">
                        <Avatar className="w-8 h-8">
                            <img
                                src={message.sender.image || "/default-avatar.png"}
                                alt={message.sender.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/default-avatar.png";
                                }}
                            />
                        </Avatar>
                        {message.sender.role !== "VIEWER" && (
                            <div
                                className={cn(
                                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                                    roleColors[message.sender.role as keyof typeof roleColors] ||
                                    "bg-gray-500"
                                )}
                            />
                        )}
                    </div>
                </div>
            )}

            <div
                className={cn(
                    "flex flex-col max-w-[70%]",
                    isOwnMessage ? "items-end" : "items-start"
                )}
            >
                {/* Sender info */}
                {showAvatar && !isOwnMessage && (
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                            {message.sender.name}
                        </span>
                        {roleBadges[message.sender.role as keyof typeof roleBadges] && (
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-xs px-1 py-0 text-white border-0",
                                    roleColors[message.sender.role as keyof typeof roleColors] ||
                                    "bg-gray-500"
                                )}
                            >
                                {roleBadges[message.sender.role as keyof typeof roleBadges]}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Message bubble */}
                <div
                    className={cn(
                        "rounded-2xl px-3 py-2 max-w-full break-words text-sm",
                        isOwnMessage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    )}
                >
                    {message.message}
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-500 mt-1">
                    {formatTime(message.createdAt)}
                </span>
            </div>
        </div>
    );
}