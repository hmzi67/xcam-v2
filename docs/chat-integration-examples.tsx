/**
 * Example: Integrate Chat into Your Stream Viewer Page
 * 
 * This file shows how to add the chat system to your existing stream viewer.
 */

"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { ChatContainer } from "@/components/chat";
import { ViewerPlayer } from "@/components/stream/viewer-player";

interface StreamViewPageProps {
    params: {
        streamId: string;
    };
}

export default function StreamViewPage({ params }: StreamViewPageProps) {
    const { streamId } = params;
    const { data: session } = useSession();

    // Check if current user is the stream creator or moderator
    const [stream, setStream] = React.useState<any>(null);

    React.useEffect(() => {
        fetch(`/api/streams/${streamId}`)
            .then((res) => res.json())
            .then((data) => setStream(data.stream));
    }, [streamId]);

    const isCreator = stream?.creatorId === session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;
    const isModerator = userRole === "MODERATOR" || userRole === "ADMIN";
    const canModerate = isCreator || isModerator;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Main Content - Video Player */}
                    <div className="lg:col-span-2">
                        <div className="bg-black rounded-lg overflow-hidden aspect-video">
                            <ViewerPlayer streamId={streamId} />
                        </div>

                        {/* Stream Info */}
                        <div className="mt-4 bg-white rounded-lg p-4">
                            <h1 className="text-2xl font-bold">{stream?.title}</h1>
                            <p className="text-gray-600 mt-2">{stream?.description}</p>
                        </div>
                    </div>

                    {/* Sidebar - Chat */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">
                                <ChatContainer
                                    streamId={streamId}
                                    canModerate={canModerate}
                                    className="h-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Alternative: Mobile-Responsive Layout
 * 
 * For mobile devices, you might want to show chat in a tab or bottom sheet
 */

export function MobileStreamView({ streamId }: { streamId: string }) {
    const [activeTab, setActiveTab] = React.useState<"video" | "chat">("video");
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tab Switcher (Mobile) */}
            <div className="md:hidden flex border-b bg-white">
                <button
                    onClick={() => setActiveTab("video")}
                    className={`flex-1 py-3 ${activeTab === "video"
                        ? "border-b-2 border-blue-500 font-semibold"
                        : "text-gray-500"
                        }`}
                >
                    Video
                </button>
                <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 py-3 ${activeTab === "chat"
                        ? "border-b-2 border-blue-500 font-semibold"
                        : "text-gray-500"
                        }`}
                >
                    Chat
                </button>
            </div>

            {/* Content */}
            <div className="md:grid md:grid-cols-3 md:gap-4 p-4">
                {/* Video - Hidden on mobile when chat is active */}
                <div className={`md:col-span-2 ${activeTab === "chat" ? "hidden md:block" : ""}`}>
                    <ViewerPlayer streamId={streamId} />
                </div>

                {/* Chat - Hidden on mobile when video is active */}
                <div className={`md:col-span-1 ${activeTab === "video" ? "hidden md:block" : ""}`}>
                    <div className="h-[calc(100vh-120px)] md:h-[600px]">
                        <ChatContainer streamId={streamId} className="h-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * With Moderation Panel (Creator View)
 */

export function CreatorStreamView({ streamId }: { streamId: string }) {
    const [showModPanel, setShowModPanel] = React.useState(false);

    return (
        <div className="grid grid-cols-4 gap-4 p-4">
            {/* Video + Controls */}
            <div className="col-span-2">
                {/* Your creator broadcast component */}
            </div>

            {/* Chat */}
            <div className="col-span-1">
                <ChatContainer streamId={streamId} canModerate={true} />
            </div>

            {/* Moderation Panel (Collapsible) */}
            <div className="col-span-1">
                {showModPanel && (
                    <ModerationPanel streamId={streamId} />
                )}
                <button
                    onClick={() => setShowModPanel(!showModPanel)}
                    className="w-full mt-2 text-sm text-gray-600"
                >
                    {showModPanel ? "Hide" : "Show"} Mod Tools
                </button>
            </div>
        </div>
    );
}
