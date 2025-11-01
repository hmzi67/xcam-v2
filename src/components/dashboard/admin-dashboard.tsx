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
  Video,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Database,
  Activity,
} from "lucide-react";

interface AdminDashboardProps {
  userData: {
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  platformStats: {
    totalUsers: number;
    activeUsers: number;
    totalCreators: number;
    totalStreams: number;
    liveStreams: number;
    totalRevenue: number;
    totalCreditsInCirculation: number;
    totalModerationActions: number;
    pendingVerifications: number;
    suspendedUsers: number;
    bannedUsers: number;
  };
}

export function AdminDashboard({
  userData,
  platformStats,
}: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card className="border-red-500/50 bg-red-900/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-400">
            Admin Dashboard - {userData.displayName || "Administrator"}
          </CardTitle>
          <CardDescription className="text-red-300/80">
            {userData.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {userData.avatarUrl && (
            <img
              src={userData.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-red-500/50"
            />
          )}
          <div>
            <p className="text-sm font-bold text-red-400">
              Role: Administrator
            </p>
            <p className="text-sm text-red-300/80">Full Platform Access</p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Platform Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={platformStats.totalUsers}
            description={`${platformStats.activeUsers} active`}
            icon={Users}
          />
          <StatsCard
            title="Creators"
            value={platformStats.totalCreators}
            description="Platform creators"
            icon={Activity}
          />
          <StatsCard
            title="Total Streams"
            value={platformStats.totalStreams}
            description={`${platformStats.liveStreams} live now`}
            icon={Video}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${platformStats.totalRevenue.toFixed(2)}`}
            description="All-time platform revenue"
            icon={DollarSign}
          />
        </div>
      </div>

      {/* Financial Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Financial Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Credits in Circulation"
            value={`$${platformStats.totalCreditsInCirculation.toFixed(2)}`}
            description="User wallet balances"
            icon={Database}
          />
          <StatsCard
            title="Platform Revenue"
            value={`$${platformStats.totalRevenue.toFixed(2)}`}
            description="Total payments received"
            icon={TrendingUp}
          />
          <StatsCard
            title="Live Streams"
            value={platformStats.liveStreams}
            description="Currently streaming"
            icon={Video}
          />
        </div>
      </div>

      {/* Moderation & Safety */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Moderation & Safety
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Actions"
            value={platformStats.totalModerationActions}
            description="Moderation actions"
            icon={Shield}
          />
          <StatsCard
            title="Pending Verifications"
            value={platformStats.pendingVerifications}
            description="Users awaiting approval"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Suspended Users"
            value={platformStats.suspendedUsers}
            description="Temporarily suspended"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Banned Users"
            value={platformStats.bannedUsers}
            description="Permanently banned"
            icon={AlertTriangle}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Admin Quick Actions</CardTitle>
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
          <a
            href="/pricing"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Manage Pricing
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
