import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => Promise<boolean>;
    disabled?: boolean;
    remaining: number | null;
    maxLength?: number;
}

export function ChatInput({
    onSend,
    disabled = false,
    remaining,
    maxLength = 500,
}: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim() || sending || disabled) return;

        setSending(true);
        const success = await onSend(message.trim());

        if (success) {
            setMessage("");
        }

        setSending(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isApproachingLimit = remaining !== null && remaining < 3;
    const characterCount = message.length;
    const isOverLimit = characterCount > maxLength;

    return (
        <div className="border-t p-4 bg-white">
            {/* Rate limit warning */}
            {isApproachingLimit && remaining !== null && (
                <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ Rate limit warning: {remaining} messages remaining
                </div>
            )}

            <div className="flex gap-2">
                {/* Emoji Picker Button (placeholder) */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    disabled={disabled}
                    title="Emoji picker (coming soon)"
                >
                    <Smile className="h-5 w-5" />
                </Button>

                {/* Message Input */}
                <div className="flex-1">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            disabled
                                ? "Chat is disabled"
                                : "Type a message... (Shift+Enter for new line)"
                        }
                        disabled={disabled || sending}
                        className="min-h-[60px] max-h-[120px] resize-none"
                        maxLength={maxLength + 50} // Soft limit
                    />

                    {/* Character count */}
                    <div className="text-xs text-right mt-1">
                        <span className={isOverLimit ? "text-red-600" : "text-gray-500"}>
                            {characterCount} / {maxLength}
                        </span>
                    </div>
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={disabled || sending || !message.trim() || isOverLimit}
                    className="flex-shrink-0"
                    size="icon"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>

            {/* Enter to send hint */}
            <div className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
            </div>
        </div>
    );
}
