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
        />
        <StatsCard
          title="Recent Bans"
          value={userData.recentBans}
          description="Last 30 days"
          icon={Ban}
        />
        <StatsCard
          title="Recent Mutes"
          value={userData.recentMutes}
          description="Last 30 days"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Message Deletions"
          value={userData.recentMessageDeletions}
          description="Last 30 days"
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Active Reports"
          value={userData.activeReports}
          description="Needs attention"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Live Streams"
          value={userData.liveStreams}
          description="Currently active"
          icon={Video}
        />
        <StatsCard
          title="Total Users"
          value={userData.totalUsers}
          description="Platform users"
          icon={Users}
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
