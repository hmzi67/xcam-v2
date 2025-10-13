"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { StreamCard } from "@/components/stream";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Users, RefreshCw, Play } from "lucide-react";

interface Stream {
  id: string;
  title: string;
  description: string;
  status: 'LIVE' | 'SCHEDULED' | 'ENDED';
  category?: string;
  tags?: string[];
  thumbnailUrl?: string;
  createdAt: Date;
  creator: {
    id: string;
    name: string;
    image?: string;
  };
  participantCount?: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/streams/list');
      if (response.ok) {
        const data = await response.json();
        const streamsWithDates = (data.streams || []).map((stream: any) => ({
          ...stream,
          createdAt: new Date(stream.createdAt),
          creator: {
            ...stream.creator,
            image: stream.creator.avatar // Map avatar to image for consistency
          }
        }));
        setStreams(streamsWithDates);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    // Refresh streams every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinStream = (streamId: string) => {
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = `/login?callbackUrl=/streaming?join=${streamId}`;
    } else {
      // Go to streaming page
      window.location.href = `/streaming?join=${streamId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />

      <main className="container mx-auto px-4 py-8">

        {/* Live Streams Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-3xl font-bold">Live Now</h2>
              <span className="text-gray-400">({streams.length})</span>
            </div>
            <Button
              onClick={fetchStreams}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-gray-700 text-gray-900 hover:bg-gray-800 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading && streams.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse bg-gray-800 border-gray-700">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-700 rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-700 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : streams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {streams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  onJoinStream={handleJoinStream}
                />
              ))}\
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-700 bg-gray-800">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Live Streams</h3>
                <p className="text-gray-500 mb-6">
                  No one is streaming right now. Check back later!
                </p>
                {session && (
                  <Link href="/streaming">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Video className="w-4 h-4 mr-2" />
                      Be the First to Go Live
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}