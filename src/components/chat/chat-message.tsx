import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Ban, Volume2, VolumeX, MessageCircle } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/hooks/use-chat";

interface ChatMessageProps {
    message: ChatMessageType;
    currentUserId?: string;
    canModerate?: boolean;
    onDelete?: (messageId: string) => void;
    onMute?: (userId: string) => void;
    onBan?: (userId: string) => void;
    onPrivateMessage?: (userId: string, userName: string) => void;
}

export function ChatMessage({
    message,
    currentUserId,
    canModerate = false,
    onDelete,
    onMute,
    onBan,
    onPrivateMessage,
}: ChatMessageProps) {
    const isOwnMessage = message.userId === currentUserId;
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
        VIEWER: null,
    };

    const roleColor = roleColors[message.user.role as keyof typeof roleColors] || roleColors.VIEWER;
    const roleBadge = roleBadges[message.user.role as keyof typeof roleBadges];

    return (
        <div className="flex items-start gap-3 py-2 px-3 hover:bg-gray-50 group">
            {/* Avatar */}
            <Avatar className="h-8 w-8 flex-shrink-0">
                {message.user.avatarUrl ? (
                    <img src={message.user.avatarUrl} alt={message.user.displayName} />
                ) : (
                    <div className={`${roleColor} w-full h-full flex items-center justify-center text-white text-sm font-semibold`}>
                        {message.user.displayName.charAt(0).toUpperCase()}
                    </div>
                )}
            </Avatar>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                        {message.user.displayName}
                    </span>

                    {roleBadge && (
                        <Badge variant="secondary" className={`${roleColor} text-white text-xs px-1.5 py-0`}>
                            {roleBadge}
                        </Badge>
                    )}

                    <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>

                <div className="text-sm text-gray-800 break-words whitespace-pre-wrap">
                    {message.message}
                </div>
            </div>

            {/* Actions Menu */}
            {!isOwnMessage && (canModerate || onPrivateMessage) && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onPrivateMessage && (
                                <DropdownMenuItem
                                    onClick={() => onPrivateMessage(message.userId, message.user.displayName)}
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Send Private Message
                                </DropdownMenuItem>
                            )}
                            {canModerate && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => onDelete?.(message.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Message
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onMute?.(message.userId)}>
                                        <VolumeX className="h-4 w-4 mr-2" />
                                        Mute User (60 min)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onBan?.(message.userId)}
                                        className="text-red-600"
                                    >
                                        <Ban className="h-4 w-4 mr-2" />
                                        Ban User
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
