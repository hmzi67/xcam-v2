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
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">
            Creator Dashboard - {userData.displayName || "Creator"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {userData.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {userData.avatarUrl && (
            <img
              src={userData.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
            />
          )}
          <div>
            <p className="text-sm text-gray-300">Role: Creator</p>
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
          chartData={[
            120,
            180,
            240,
            350,
            420,
            500,
            580,
            userData.totalEarnings,
          ]}
          chartColor="green"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Wallet Balance"
          value={`$${userData.balance.toFixed(2)}`}
          description="Available balance"
          icon={DollarSign}
          chartData={[50, 120, 80, 150, 100, 180, 140, userData.balance]}
          chartColor="blue"
        />
        <StatsCard
          title="Total Views"
          value={userData.totalViews}
          description="All-time views"
          icon={Eye}
          chartData={[100, 250, 400, 600, 850, 1100, 1400, userData.totalViews]}
          chartColor="purple"
          trend={{ value: 18.2, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Streams"
          value={userData.totalStreams}
          description="All streams created"
          icon={Video}
          chartData={[2, 4, 6, 9, 12, 15, 18, userData.totalStreams]}
          chartColor="purple"
        />
        <StatsCard
          title="Live Now"
          value={userData.liveStreams}
          description="Currently streaming"
          icon={Video}
          chartData={[0, 1, 0, 1, 2, 1, 0, userData.liveStreams]}
          chartColor="red"
        />
        <StatsCard
          title="Chat Engagement"
          value={userData.totalChatMessages}
          description="Total chat messages"
          icon={MessageSquare}
          chartData={[
            50,
            120,
            200,
            350,
            500,
            680,
            850,
            userData.totalChatMessages,
          ]}
          chartColor="blue"
          trend={{ value: 24.8, isPositive: true }}
        />
        <StatsCard
          title="Avg. Viewers"
          value={userData.avgViewersPerStream.toFixed(1)}
          description="Per stream"
          icon={TrendingUp}
          chartData={[
            15,
            25,
            30,
            45,
            55,
            65,
            70,
            Math.round(userData.avgViewersPerStream),
          ]}
          chartColor="orange"
          trend={{ value: 8.4, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <a
            href="/creator"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Go Live
          </a>
          <a
            href="/creator/stream"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Manage Streams
          </a>
          <a
            href="/profile"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Edit Profile
          </a>
          <a
            href="/pricing"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Buy Credits
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
