import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "./stats-card";
import { Wallet, Video, Clock, TrendingUp } from "lucide-react";

interface ViewerDashboardProps {
  userData: {
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    balance: number;
    totalWatchTimeMs: number;
    activeStreamSessions: number;
  };
}

export function ViewerDashboard({ userData }: ViewerDashboardProps) {
  const watchTimeHours = Math.floor(
    userData.totalWatchTimeMs / (1000 * 60 * 60)
  );
  const watchTimeMinutes = Math.floor(
    (userData.totalWatchTimeMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Welcome back, {userData.displayName || "Viewer"}!
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
            <p className="text-sm text-muted-foreground">Role: Viewer</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Credit Balance"
          value={`$${userData.balance.toFixed(2)}`}
          description="Available credits"
          icon={Wallet}
        />
        <StatsCard
          title="Watch Time"
          value={`${watchTimeHours}h ${watchTimeMinutes}m`}
          description="Total viewing time"
          icon={Clock}
        />
        <StatsCard
          title="Active Sessions"
          value={userData.activeStreamSessions}
          description="Currently watching"
          icon={Video}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <a href="/streaming" className="text-blue-600 hover:underline">
            Browse Streams
          </a>
          <a href="/pricing" className="text-blue-600 hover:underline">
            Buy Credits
          </a>
          <a href="/profile" className="text-blue-600 hover:underline">
            Edit Profile
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
