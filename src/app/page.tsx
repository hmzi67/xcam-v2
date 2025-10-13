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
  status: string;
  category?: string;
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
          createdAt: new Date(stream.createdAt)
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to XCAM
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Watch amazing live streams from talented creators
          </p>
          {!session && (
            <div className="space-x-4">
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Sign In to Stream
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Join Now
                </Button>
              </Link>
            </div>
          )}
          {session && (
            <Link href="/streaming">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                <Video className="w-5 h-5 mr-2" />
                Go Live
              </Button>
            </Link>
          )}
        </div>

        {/* Live Streams Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-3xl font-bold">Live Now</h2>
              <span className="text-gray-500">({streams.length})</span>
            </div>
            <Button
              onClick={fetchStreams}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading && streams.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-200 rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : streams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  onJoinStream={handleJoinStream}
                />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Live Streams</h3>
                <p className="text-gray-500 mb-6">
                  No one is streaming right now. Check back later!
                </p>
                {session && (
                  <Link href="/streaming">
                    <Button>
                      <Video className="w-4 h-4 mr-2" />
                      Be the First to Go Live
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">HD Streaming</h3>
              <p className="text-gray-600">
                Experience high-quality live streams with crystal clear video and audio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Connect with creators and viewers from around the world
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Start streaming in seconds with our user-friendly platform
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
