import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrivateConversation } from "@/hooks/use-private-chat";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface ConversationListProps {
  conversations: PrivateConversation[];
  selectedPartnerId?: string;
  onSelectConversation: (partnerId: string) => void;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedPartnerId,
  onSelectConversation,
  className,
}: ConversationListProps) {
  const roleColors = {
    CREATOR: "bg-purple-500",
    MODERATOR: "bg-green-500",
    ADMIN: "bg-red-500",
    VIEWER: "bg-gray-500",
  };

  const formatLastMessage = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (conversations.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6 text-gray-500", className)}>
        <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-xs text-center">No active conversations</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {conversations.map((conversation) => (
        <Button
          key={conversation.partnerId}
          variant="ghost"
          className={cn(
            "w-full justify-start p-3 h-auto",
            selectedPartnerId === conversation.partnerId && "bg-gray-100 dark:bg-gray-700"
          )}
          onClick={() => onSelectConversation(conversation.partnerId)}
        >
          <div className="flex items-center gap-3 w-full">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-10 h-10">
                <img
                  src={conversation.partnerImage || "/default-avatar.png"}
                  alt={conversation.partnerName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-avatar.png";
                  }}
                />
              </Avatar>
              {conversation.partnerRole !== "VIEWER" && (
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                    roleColors[conversation.partnerRole as keyof typeof roleColors] ||
                      "bg-gray-500"
                  )}
                />
              )}
            </div>

            {/* Conversation info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-left truncate">
                  {conversation.partnerName}
                </p>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatLastMessage(conversation.lastMessageAt)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 capitalize">
                  {conversation.partnerRole.toLowerCase()}
                </span>
                {conversation.unreadCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="bg-blue-500 text-white text-xs px-2 py-0 rounded-full min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}