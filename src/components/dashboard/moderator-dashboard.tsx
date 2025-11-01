import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "./stats-card";
import {
  Shield,
  Users,
  Ban,
  AlertTriangle,
  MessageSquare,
  Video,
} from "lucide-react";

interface ModeratorDashboardProps {
  userData: {
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    totalModerationActions: number;
    recentBans: number;
    recentMutes: number;
    recentMessageDeletions: number;
    activeReports: number;
    liveStreams: number;
    totalUsers: number;
  };
}

export function ModeratorDashboard({ userData }: ModeratorDashboardProps) {
  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">
            Moderator Dashboard - {userData.displayName || "Moderator"}
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
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/50"
            />
          )}
          <div>
            <p className="text-sm text-gray-300">Role: Moderator</p>
            <p className="text-sm font-medium text-orange-400">
              Platform Moderation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Actions"
          value={userData.totalModerationActions}
          description="All-time moderation"
          icon={Shield}
          chartData={[50, 80, 120, 180, 220, 280, 350, userData.totalModerationActions]}
          chartColor="orange"
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatsCard
          title="Recent Bans"
          value={userData.recentBans}
          description="Last 30 days"
          icon={Ban}
          chartData={[2, 5, 3, 8, 6, 4, 7, userData.recentBans]}
          chartColor="red"
        />
        <StatsCard
          title="Recent Mutes"
          value={userData.recentMutes}
          description="Last 30 days"
          icon={AlertTriangle}
          chartData={[10, 15, 12, 18, 20, 16, 22, userData.recentMutes]}
          chartColor="orange"
        />
        <StatsCard
          title="Message Deletions"
          value={userData.recentMessageDeletions}
          description="Last 30 days"
          icon={MessageSquare}
          chartData={[25, 35, 40, 50, 55, 60, 70, userData.recentMessageDeletions]}
          chartColor="purple"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Active Reports"
          value={userData.activeReports}
          description="Needs attention"
          icon={AlertTriangle}
          chartData={[5, 8, 6, 10, 7, 4, 3, userData.activeReports]}
          chartColor="red"
          trend={{ value: 8.5, isPositive: false }}
        />
        <StatsCard
          title="Live Streams"
          value={userData.liveStreams}
          description="Currently active"
          icon={Video}
          chartData={[15, 25, 35, 40, 38, 45, 50, userData.liveStreams]}
          chartColor="purple"
        />
        <StatsCard
          title="Total Users"
          value={userData.totalUsers}
          description="Platform users"
          icon={Users}
          chartData={[500, 650, 800, 1000, 1200, 1400, 1600, userData.totalUsers]}
          chartColor="blue"
          trend={{ value: 22.4, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <a
            href="/streaming"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Monitor Streams
          </a>
          <a
            href="/profile"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Edit Profile
          </a>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Moderation Overview</CardTitle>
          <CardDescription className="text-gray-400">
            Keep the platform safe and welcoming
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">
            You have taken {userData.totalModerationActions} moderation actions
            to date.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
