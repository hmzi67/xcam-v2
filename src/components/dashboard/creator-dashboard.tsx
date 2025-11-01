import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "./stats-card";
import {
  DollarSign,
  Users,
  Video,
  Eye,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

interface CreatorDashboardProps {
  userData: {
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    balance: number;
    totalStreams: number;
    liveStreams: number;
    totalViews: number;
    totalEarnings: number;
    totalChatMessages: number;
    avgViewersPerStream: number;
  };
}

export function CreatorDashboard({ userData }: CreatorDashboardProps) {
  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Creator Dashboard - {userData.displayName || "Creator"}
          </CardTitle>
          <CardDescription>{userData.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {userData.avatarUrl && (
            <img
              src={userData.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm text-muted-foreground">Role: Creator</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Earnings"
          value={`$${userData.totalEarnings.toFixed(2)}`}
          description="From all streams"
          icon={DollarSign}
        />
        <StatsCard
          title="Wallet Balance"
          value={`$${userData.balance.toFixed(2)}`}
          description="Available balance"
          icon={DollarSign}
        />
        <StatsCard
          title="Total Views"
          value={userData.totalViews}
          description="All-time views"
          icon={Eye}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Streams"
          value={userData.totalStreams}
          description="All streams created"
          icon={Video}
        />
        <StatsCard
          title="Live Now"
          value={userData.liveStreams}
          description="Currently streaming"
          icon={Video}
        />
        <StatsCard
          title="Chat Engagement"
          value={userData.totalChatMessages}
          description="Total chat messages"
          icon={MessageSquare}
        />
        <StatsCard
          title="Avg. Viewers"
          value={userData.avgViewersPerStream.toFixed(1)}
          description="Per stream"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <a href="/creator" className="text-blue-600 hover:underline">
            Go Live
          </a>
          <a href="/creator/stream" className="text-blue-600 hover:underline">
            Manage Streams
          </a>
          <a href="/profile" className="text-blue-600 hover:underline">
            Edit Profile
          </a>
          <a href="/pricing" className="text-blue-600 hover:underline">
            Buy Credits
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
