"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Video,
  Wallet,
  User,
  Settings,
  TrendingUp,
  Users,
  Shield,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  Activity,
  Database,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  userRole: UserRole;
  userName: string | null;
  userEmail: string;
  avatarUrl: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardSidebar({
  userRole,
  userName,
  userEmail,
  avatarUrl,
  isCollapsed,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["VIEWER", "CREATOR", "MODERATOR", "ADMIN"],
      },
      {
        label: "Profile",
        href: "/profile",
        icon: User,
        roles: ["VIEWER", "CREATOR", "MODERATOR", "ADMIN"],
      },
    ];

    const viewerItems = [
      {
        label: "Browse Streams",
        href: "/streaming",
        icon: Video,
        roles: ["VIEWER"],
      },
      {
        label: "Buy Credits",
        href: "/pricing",
        icon: Wallet,
        roles: ["VIEWER"],
      },
    ];

    const creatorItems = [
      {
        label: "Creator Studio",
        href: "/creator",
        icon: Video,
        roles: ["CREATOR"],
      },
      {
        label: "My Streams",
        href: "/creator/stream",
        icon: Activity,
        roles: ["CREATOR"],
      },
      {
        label: "Analytics",
        href: "/creator/analytics",
        icon: TrendingUp,
        roles: ["CREATOR"],
      },
      {
        label: "Earnings",
        href: "/creator/earnings",
        icon: DollarSign,
        roles: ["CREATOR"],
      },
      {
        label: "Browse Streams",
        href: "/streaming",
        icon: Video,
        roles: ["CREATOR"],
      },
      {
        label: "Buy Credits",
        href: "/pricing",
        icon: Wallet,
        roles: ["CREATOR"],
      },
    ];

    const moderatorItems = [
      {
        label: "Monitor Streams",
        href: "/streaming",
        icon: Video,
        roles: ["MODERATOR"],
      },
      {
        label: "Moderation Queue",
        href: "/moderator/queue",
        icon: AlertTriangle,
        roles: ["MODERATOR"],
      },
      {
        label: "Reports",
        href: "/moderator/reports",
        icon: Bell,
        roles: ["MODERATOR"],
      },
      {
        label: "User Management",
        href: "/moderator/users",
        icon: Users,
        roles: ["MODERATOR"],
      },
      {
        label: "Chat Logs",
        href: "/moderator/chat-logs",
        icon: MessageSquare,
        roles: ["MODERATOR"],
      },
    ];

    const adminItems = [
      {
        label: "User Management",
        href: "/admin/users",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Stream Management",
        href: "/admin/streams",
        icon: Video,
        roles: ["ADMIN"],
      },
      {
        label: "Financial Overview",
        href: "/admin/finances",
        icon: DollarSign,
        roles: ["ADMIN"],
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: Wallet,
        roles: ["ADMIN"],
      },
      {
        label: "Moderation",
        href: "/admin/moderation",
        icon: Shield,
        roles: ["ADMIN"],
      },
      {
        label: "System Config",
        href: "/admin/config",
        icon: Database,
        roles: ["ADMIN"],
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        roles: ["ADMIN"],
      },
    ];

    let items = [...baseItems];

    switch (userRole) {
      case "VIEWER":
        items = [...items, ...viewerItems];
        break;
      case "CREATOR":
        items = [...items, ...creatorItems];
        break;
      case "MODERATOR":
        items = [...items, ...moderatorItems];
        break;
      case "ADMIN":
        items = [...items, ...adminItems];
        break;
    }

    return items.filter((item) => item.roles.includes(userRole));
  };

  const navigationItems = getNavigationItems();

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "MODERATOR":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CREATOR":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "VIEWER":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User avatar"
              className={cn(
                "rounded-full object-cover",
                collapsed ? "w-10 h-10" : "w-12 h-12"
              )}
            />
          ) : (
            <div
              className={cn(
                "rounded-full bg-gray-200 flex items-center justify-center",
                collapsed ? "w-10 h-10" : "w-12 h-12"
              )}
            >
              <User
                className={cn(
                  collapsed ? "w-5 h-5" : "w-6 h-6",
                  "text-gray-500"
                )}
              />
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-3">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                getRoleBadgeColor()
              )}
            >
              {userRole}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/profile"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            collapsed ? "justify-center p-3" : "gap-3 px-3 py-2"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-16 lg:bottom-0 bg-white border-r border-gray-200 shadow-sm transition-all duration-300",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <SidebarContent collapsed={isCollapsed} />

        {/* Collapse Toggle Button - Desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-sm z-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent collapsed={false} />
      </aside>
    </>
  );
}
