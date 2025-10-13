"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Eye,
    Clock,
    Play,
    Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StreamCardProps {
    stream: {
        id: string;
        title: string;
        description?: string;
        status: 'LIVE' | 'SCHEDULED' | 'ENDED';
        createdAt: Date;
        scheduledFor?: Date;
        creator: {
            id: string;
            name: string;
            image?: string;
        };
        participantCount?: number;
        thumbnailUrl?: string;
    };
    onJoinStream?: (streamId: string) => void;
    className?: string;
}

export function StreamCard({
    stream,
    onJoinStream,
    className = ""
}: StreamCardProps) {
    const [participantCount, setParticipantCount] = useState(stream.participantCount || 0);
    const [isHovered, setIsHovered] = useState(false);

    // Poll for participant count if stream is live
    useEffect(() => {
        if (stream.status !== 'LIVE') return;

        const pollParticipants = async () => {
            try {
                const response = await fetch(`/api/streams/${stream.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setParticipantCount(data.participantCount || 0);
                }
            } catch (error) {
                console.error('Error fetching participant count:', error);
            }
        };

        // Initial fetch
        pollParticipants();

        // Poll every 30 seconds
        const interval = setInterval(pollParticipants, 30000);

        return () => clearInterval(interval);
    }, [stream.id, stream.status]);

    const handleJoinStream = () => {
        onJoinStream?.(stream.id);
    };

    const getStatusBadge = () => {
        switch (stream.status) {
            case 'LIVE':
                return (
                    <div className="absolute top-3 left-3 z-10">
                        <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                        </div>
                    </div>
                );
            case 'SCHEDULED':
                return (
                    <div className="absolute top-3 left-3 z-10">
                        <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            SCHEDULED
                        </div>
                    </div>
                );
            case 'ENDED':
                return (
                    <div className="absolute top-3 left-3 z-10">
                        <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                            ENDED
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getTimeDisplay = () => {
        if (stream.status === 'SCHEDULED' && stream.scheduledFor) {
            return (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>
                        Starts {formatDistanceToNow(new Date(stream.scheduledFor), { addSuffix: true })}
                    </span>
                </div>
            );
        }

        if (stream.status === 'LIVE') {
            return (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{participantCount} watching</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                    {formatDistanceToNow(new Date(stream.createdAt), { addSuffix: true })}
                </span>
            </div>
        );
    };

    return (
        <Card
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg bg-gray-800 border border-gray-700 hover:border-purple-600 rounded-lg overflow-hidden ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleJoinStream}
        >
            <div className="relative aspect-video bg-gray-700">
                {/* Thumbnail */}
                {stream.thumbnailUrl ? (
                    <img
                        src={stream.thumbnailUrl}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-500" />
                    </div>
                )}

                {/* Status Badge */}
                {getStatusBadge()}

                {/* Participant Count (Live streams only) */}
                {stream.status === 'LIVE' && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {participantCount}
                        </div>
                    </div>
                )}

                {/* Play Overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <div className="w-16 h-16 bg-purple-600/50 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-purple-500/70">
                        <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                </div>
            </div>

            <CardContent className="p-4">
                {/* Stream Title */}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white group-hover:text-purple-400 transition-colors">
                    {stream.title}
                </h3>

                {/* Creator Info */}
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={stream.creator.image} />
                        <AvatarFallback>
                            {stream.creator.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-gray-200">
                            {stream.creator.name}
                        </p>
                        {getTimeDisplay()}
                    </div>
                </div>

                {/* Description */}
                {stream.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {stream.description}
                    </p>
                )}

                {/* Action Button */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {stream.status === 'LIVE' && (
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoinStream();
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <Play className="w-4 h-4 mr-1" />
                                Watch Live
                            </Button>
                        )}
                        {stream.status === 'SCHEDULED' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle remind/notify functionality
                                }}
                                className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                            >
                                <Clock className="w-4 h-4 mr-1" />
                                Remind Me
                            </Button>
                        )}
                        {stream.status === 'ENDED' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoinStream();
                                }}
                                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                                <Play className="w-4 h-4 mr-1" />
                                Watch Replay
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Skeleton loader for loading states
export function StreamCardSkeleton() {
    return (
        <Card className="animate-pulse bg-gray-800 border-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-700" />
            <CardContent className="p-4">
                <div className="h-6 bg-gray-700 rounded mb-2 w-3/4" />
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full" />
                    <div>
                        <div className="h-4 bg-gray-700 rounded w-24 mb-1" />
                        <div className="h-3 bg-gray-700 rounded w-16" />
                    </div>
                </div>
                <div className="h-4 bg-gray-700 rounded mb-2 w-full" />
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-700 rounded w-28" />
            </CardContent>
        </Card>
    );
}