"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CreatorBroadcast, ViewerPlayer, StreamCard } from '@/components/stream';
import { MediaPermissions } from '@/components/stream/media-permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Loader2, Video, Users, Plus, CheckCircle, XCircle, Info } from 'lucide-react';
import { TabbedChatContainer } from '@/components/chat';
import { Navigation } from "@/components/navigation";

interface Stream {
  id: string;
  title: string;
  description: string;
  status: 'LIVE' | 'SCHEDULED' | 'ENDED';
  createdAt: Date;
  creator: {
    id: string;
    name: string;
    image?: string;
  };
  participantCount?: number;
}

export default function StreamingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<'browse' | 'create' | 'broadcast' | 'watch'>('browse');
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [currentStreamData, setCurrentStreamData] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMediaPermissions, setHasMediaPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string>('');
  const [showAgeVerification, setShowAgeVerification] = useState(true);

  // New stream form
  const [newStream, setNewStream] = useState({
    title: '',
    description: ''
  });

  // Check age verification on mount
  useEffect(() => {
    const hasVerified = localStorage.getItem('ageVerified');
    if (hasVerified === 'true') {
      setShowAgeVerification(false);
    }
  }, []);

  // Handle age verification
  const handleAgeVerification = () => {
    localStorage.setItem('ageVerified', 'true');
    setShowAgeVerification(false);
  };

  // Fetch available streams
  const fetchStreams = async () => {
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
    }
  };

  useEffect(() => {
    fetchStreams();
    // Refresh streams every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle join stream from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinStreamId = urlParams.get('join');

    if (joinStreamId && session) {
      console.log('Auto-joining stream from URL:', joinStreamId);
      handleJoinStream(joinStreamId);
      // Clean up URL
      window.history.replaceState({}, '', '/streaming');
    }
  }, [session]);

  // Create a new stream
  const handleCreateStream = async () => {
    if (!newStream.title.trim()) return;

    setLoading(true);
    try {
      console.log('🚀 Creating stream with:', newStream);
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStream)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Stream created successfully:', responseData);
        const stream = responseData.stream;
        setSelectedStream(stream.id);

        // Get creator token
        console.log('🔑 Requesting creator token for stream:', stream.id);
        const tokenResponse = await fetch(`/api/streams/${stream.id}/token`, {
          method: 'POST'
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          console.log('✅ Token received:', tokenData.token.substring(0, 20) + '...');
          console.log('✅ Role from API:', tokenData.role);
          console.log('📝 Setting state - Stream ID:', stream.id);
          console.log('📝 Setting state - Token:', 'received');

          // IMPORTANT: Set mode based on role from API
          const newMode = tokenData.role === 'creator' ? 'broadcast' : 'watch';
          console.log('📝 Setting state - Mode:', newMode);

          setStreamToken(tokenData.token);
          setCurrentStreamData(stream);
          setSelectedStream(stream.id);
          setMode(newMode);
          setNewStream({ title: '', description: '' }); // Reset form

          console.log('✅ All state updated, mode should be:', newMode);
        } else {
          const error = await tokenResponse.json();
          console.error('❌ Failed to get token:', error);
          alert('Failed to get stream token');
        }
      } else {
        const error = await response.json();
        console.error('❌ Failed to create stream:', error);
        alert(error.error || 'Failed to create stream');
      }
    } catch (error) {
      console.error('❌ Error creating stream:', error);
      alert('Failed to create stream');
    }
    setLoading(false);
  };

  // Join a stream as viewer
  const handleJoinStream = async (streamId: string) => {
    setLoading(true);
    try {
      // Find the stream data
      const stream = streams.find(s => s.id === streamId);

      const response = await fetch(`/api/streams/${streamId}/token`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Joined stream, role:', data.role);

        // Set mode based on role from API
        const newMode = data.role === 'creator' ? 'broadcast' : 'watch';

        setStreamToken(data.token);
        setSelectedStream(streamId);
        setCurrentStreamData(stream || null);
        setMode(newMode);

        console.log('✅ Mode set to:', newMode);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join stream');
      }
    } catch (error) {
      console.error('Error joining stream:', error);
      alert('Failed to join stream');
    }
    setLoading(false);
  };

  // End stream and go back to browse
  const handleStreamEnd = () => {
    setMode('browse');
    setSelectedStream(null);
    setStreamToken(null);
    fetchStreams(); // Refresh stream list
  };

  const LIVEKIT_SERVER_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://xcam-9i0fzyim.livekit.cloud';

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-gray-400 mb-4">Please sign in to access streaming features.</p>
              <Button onClick={() => router.push('/login')} className="w-full bg-purple-600 hover:bg-purple-700">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isCreator = session.user && 'role' in session.user && session.user.role === 'CREATOR';

  // Debug logging
  console.log('Current state:', { mode, selectedStream, streamToken, currentStreamData });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />

      {/* Age Verification Dialog */}
      <Dialog open={showAgeVerification} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white" showCloseButton={false}>
          <div className="p-6">
            {/* Disclaimer Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Disclaimer</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                The pages of this website contain explicit material and are not suitable for minors. If you are a minor (-18year)
                or do not wish to be confronted with explicit websites, please leave this website by clicking on{' '}
                <span className="font-semibold">Exit</span> below. By clicking on{' '}
                <span className="font-semibold">Enter</span> below you expressly confirm that you are of age and agree with this website's user
                agreement. All models on this website are at least 18 years old. Parents, protect your children against explicit
                websites using one of the following programs.
              </p>
            </div>

            {/* Cookie Policy Section */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-3">Cookie policy</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">
                This site uses cookies to analyze the website, to make it more user-friendly and to offer you products tailored to
                your needs. By using the site, you accept the terms of the{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAgeVerification}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                I'm 18 or older – Enter
              </Button>

              <Button
                onClick={() => window.location.href = 'https://google.com'}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3 rounded-lg font-medium"
              >
                <XCircle className="w-5 h-5 mr-2" />
                I'm under 18 – Exit
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    Access to explicit content is restricted until your age has been verified.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-purple-400">
                    <a href="#" className="hover:text-purple-300 underline">BIK+</a>
                    <span className="text-gray-500">|</span>
                    <a href="#" className="hover:text-purple-300 underline">RTA</a>
                    <span className="text-gray-500">|</span>
                    <a href="#" className="hover:text-purple-300 underline">ASACP</a>
                    <span className="text-gray-500">|</span>
                    <a href="#" className="hover:text-purple-300 underline">Netnanny</a>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    18 U.S.C 2257 Record-Keeping Requirements<br />
                    Compliance Statement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        <div className="">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Live Streaming</h1>
              <p className="text-gray-400">Create and watch live streams</p>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                onClick={() => setMode('browse')}
                variant={mode === 'browse' ? 'default' : 'outline'}
                className={mode === 'browse' ? "bg-purple-600 hover:bg-purple-700" : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"}
              >
                <Users className="w-4 h-4 mr-2" />
                Browse Streams
              </Button>
              <Button
                onClick={() => setMode('create')}
                variant={mode === 'create' ? 'default' : 'outline'}
                className={mode === 'create' ? "bg-purple-600 hover:bg-purple-700" : "border-gray-700 text-gray-900 hover:bg-gray-800 hover:text-white"}
              >
                <Plus className="w-4 h-4" />
                Go Live
              </Button>
            </div>
          </div>

          {/* Browse Mode */}
          {mode === 'browse' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Live Streams</h2>
                <Button onClick={fetchStreams} variant="outline" className="border-gray-700 text-gray-900 hover:bg-gray-800 hover:text-white">
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {streams.map((stream) => (
                  <StreamCard
                    key={stream.id}
                    stream={stream}
                    onJoinStream={handleJoinStream}
                  />
                ))}
              </div>

              {streams.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-12 text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl text-white font-semibold mb-2">No streams available</h3>
                    <p className="text-gray-400 mb-4">Be the first to start streaming!</p>
                    {isCreator && (
                      <Button onClick={() => setMode('create')} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Start Streaming
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Create Stream Mode */}
          {mode === 'create' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {!hasMediaPermissions ? (
                <div>
                  <MediaPermissions
                    onPermissionsGranted={() => setHasMediaPermissions(true)}
                    onPermissionsDenied={(error) => setPermissionError(error)}
                  />
                  {permissionError && (
                    <Card className="mt-4 bg-red-900/20 border-red-500">
                      <CardContent className="p-4">
                        <p className="text-sm text-red-400">{permissionError}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-6 h-6" />
                      Start a New Stream
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Stream Title *</label>
                      <Input
                        value={newStream.title}
                        onChange={(e) => setNewStream(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter an engaging stream title"
                        maxLength={100}
                        className="bg-gray-900 border-gray-700 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">{newStream.title.length}/100</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newStream.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewStream(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what you'll be streaming about..."
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-400 mt-1">{newStream.description.length}/500</p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleCreateStream}
                        disabled={loading || !newStream.title.trim()}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Stream...
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4 mr-2" />
                            Start Streaming
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setMode('browse')}
                        variant="outline"
                        className="border-gray-700 text-gray-900 hover:bg-gray-800 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Creator Broadcast */}
          {mode === 'broadcast' && selectedStream && streamToken && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Broadcasting Live</h2>
                <Button
                  onClick={handleStreamEnd}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Back to Browse
                </Button>
              </div>

              {/* Video + Chat Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Video Section - Takes 2/3 width on large screens */}
                <div className="lg:col-span-2">
                  <CreatorBroadcast
                    streamId={selectedStream}
                    token={streamToken}
                    serverUrl={LIVEKIT_SERVER_URL}
                    streamTitle={currentStreamData?.title || newStream.title}
                    onStreamEnd={handleStreamEnd}
                  />
                </div>

                {/* Chat Section - Takes 1/3 width on large screens */}
                <div className="lg:col-span-1">
                  <div className="h-[600px] lg:h-full">
                    <TabbedChatContainer
                      streamId={selectedStream}
                      canModerate={true}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Viewer Player */}
          {mode === 'watch' && selectedStream && streamToken && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Watching Stream</h2>
                <Button
                  onClick={handleStreamEnd}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Leave Stream
                </Button>
              </div>

              {/* Video + Chat Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Video Section - Takes 2/3 width on large screens */}
                <div className="lg:col-span-2">
                  <ViewerPlayer
                    streamId={selectedStream}
                    token={streamToken}
                    serverUrl={LIVEKIT_SERVER_URL}
                    streamTitle={currentStreamData?.title}
                    creatorName={currentStreamData?.creator?.name}
                    className="aspect-video w-full"
                  />
                </div>

                {/* Chat Section - Takes 1/3 width on large screens */}
                <div className="lg:col-span-1">
                  <div className="h-[600px] lg:h-full">
                    <TabbedChatContainer
                      streamId={selectedStream}
                      canModerate={false}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
