"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { StreamCard } from "@/components/stream";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PrivateChatContainer } from "@/components/chat";
import {
  Video,
  Users,
  RefreshCw,
  Play,
  Star,
  MapPin,
  Calendar,
  Heart,
  Languages,
  Filter,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Eye,
  Flame,
  MessageCircle,
  DollarSign
} from "lucide-react";

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
  const router = useRouter();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [filteredStreams, setFilteredStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Girls Cams");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedEthnicity, setSelectedEthnicity] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCategoryClick = (categoryName: string) => {
   
      setSelectedCategory(categoryName);
  };
  const categories = [
    { name: "All Girls Cams", icon: Heart, count: 0, active: true },
    { name: "Private Messages", icon: MessageCircle, count: 0 },
    { name: "New Models", icon: Star, count: 0 },
    { name: "GOLD Shows", icon: Star, count: 0 },
  ];

  const categoryFilters = [
    { name: "Asian", hot: false },
    { name: "BDSM", hot: true },
    { name: "Big Cock", hot: false },
    { name: "Big Tits", hot: false },
    { name: "Black", hot: false },
    { name: "Huge Tits", hot: false },
    { name: "Latino", hot: false },
    { name: "Mature", hot: false },
    { name: "Medium Tits", hot: false },
    { name: "Mobile", hot: false },
    { name: "Small Tits", hot: false },
    { name: "Teen 18+", hot: false },
    { name: "Transgirl", hot: false },
    { name: "Transguy", hot: false },
    { name: "Uncut", hot: false },
  ];

  // Calculate category counts from streams
  const categoryCounts = categoryFilters.map((filter) => {
    const count = streams.filter(
      (stream) => stream.category === filter.name
    ).length;
    return { ...filter, count };
  });


  const regions = ["All Regions", "North America", "Europe", "Asia", "South America", "Africa", "Oceania"];
  const ages = ["All Ages", "18-22", "23-30", "31-40", "40+"];
  const ethnicities = ["All Ethnicities", "White", "Asian", "Latina", "Black", "Mixed", "Other"];
  const languages = ["All Languages", "English", "Spanish", "French", "German", "Italian", "Portuguese"];

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

  // Filter streams based on current filters
  useEffect(() => {
    let filtered = [...streams];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(stream =>
        stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "All Girls Cams") {
      filtered = filtered.filter(stream => stream.category === selectedCategory);
    }

    setFilteredStreams(filtered);
  }, [streams, searchQuery, selectedCategory, selectedRegion, selectedAge, selectedEthnicity, selectedLanguage]);

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

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700 p-4 pt-20 overflow-y-auto scrollbar-hide">
          {/* Main Categories */}
          <div className="mb-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isCreator = !!(
              session?.user &&
              (
                // common possible flags for "creator" role
                (session.user as any).isCreator ||
                (session.user as any).role === "CREATOR" ||
                (Array.isArray((session.user as any).roles) && (session.user as any).roles.includes("CREATOR"))
              )
              );


              return (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors neon-hover ${selectedCategory === category.name
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <IconComponent
                className={`w-5 h-5 ${selectedCategory === category.name ? 'neon-purple-icon' : 'neon-target-icon'}`}
                />
                <span
                className={`font-medium ${selectedCategory === category.name ? 'neon-purple-text' : 'neon-target-text'}`}
                >
                {category.name}
                </span>
                {category.name === "All Girls Cams" && (
                <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto" />
                )}
                {category.name === "Private Messages" && (
                <div className="w-2 h-2 bg-green-400 rounded-full ml-auto animate-pulse" />
                )}
              
              </button>
              );
            })}
          </div>

          {/* Category Pages */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Categories
            </h3>
            <div className="space-y-1">
              {categoryCounts.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => setSelectedCategory(filter.name)}
                  className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors neon-hover ${selectedCategory === filter.name
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`${selectedCategory === filter.name ? 'neon-purple-text' : 'neon-target-text'}`}>{filter.name}</span>
                    {filter.hot && (
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 neon-red-badge">
                        hot
                      </Badge>
                    )}
                  </span>
                  <span className="text-gray-400 text-xs">{filter.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Top Filters Bar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Regions Filter */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <select
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {ages.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ethnicity Filter */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <select
                  value={selectedEthnicity}
                  onChange={(e) => setSelectedEthnicity(e.target.value)}
                  className="bg-purple-600 border border-purple-500 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {ethnicities.map((ethnicity) => (
                    <option key={ethnicity} value={ethnicity}>
                      {ethnicity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Features Filter */}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-900 hover:bg-gray-700 hover:text-purple-300"
              >
                <Star className="w-4 h-4" />
                Features
              </Button>

              {/* Fetishes Filter */}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-900 hover:bg-gray-700 hover:text-purple-300"
              >
                <Heart className="w-4 h-4" />
                Fetishes
              </Button>

              {/* Language Filter */}
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-purple-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 text-gray-900 hover:bg-gray-700 hover:text-purple-300'}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 text-gray-900 hover:bg-gray-700 hover:text-purple-300'}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-900 hover:bg-gray-700 hover:text-purple-300"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search models, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 focus:border-purple-500 text-white"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4">
            {selectedCategory === "Private Messages" ? (
              <PrivateChatContainer streamId="homepage" token={null} />
            ) : loading && streams.length === 0 ? (
              <div className={`grid gap-4 ${viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-1'
                }`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Card key={i} className="animate-pulse bg-gray-800 border-gray-700">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-700 rounded-t-lg" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-700 rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredStreams.length > 0 ? (
              <div className={`grid gap-4 ${viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-1'
                }`}>
                {filteredStreams.map((stream) => (
                  <StreamCard
                    key={stream.id}
                    stream={stream}
                    onJoinStream={handleJoinStream}
                    className={viewMode === 'list' ? 'flex-row' : ''}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-gray-700 bg-gray-800">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Streams Found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery ? 'No streams match your search criteria.' : 'No streams available right now.'}
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
        </div>
      </div>
    </div>
  );
}
