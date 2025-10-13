"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Video,
    LayoutDashboard,
    Settings,
    Shield,
    LogOut,
    User,
    Coins
} from "lucide-react"

export function Navigation() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <nav className="bg-gray-900 shadow-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="animate-pulse h-6 w-24 bg-gray-700 rounded" />
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="bg-gray-900 shadow-sm border-b border-gray-700 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                <Video className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
                                XCAM
                            </span>
                        </Link>

                        {session?.user && (
                            <div className="hidden md:flex items-center space-x-1">
                                <Link href="/streaming">
                                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
                                        <Video className="w-4 h-4 mr-2" />
                                        Streaming
                                    </Button>
                                </Link>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                                {((session.user as import("../../lib/auth-utils").SessionUser).role === "CREATOR" ||
                                    (session.user as import("../../lib/auth-utils").SessionUser).role === "ADMIN") && (
                                        <Link href="/creator">
                                            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
                                                <Settings className="w-4 h-4 mr-2" />
                                                Creator Studio
                                            </Button>
                                        </Link>
                                    )}
                                {(session.user as import("../../lib/auth-utils").SessionUser).role === "ADMIN" && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Admin
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {session?.user ? (
                            <>
                                <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 bg-gray-800 rounded-lg">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-300">
                                        {(session.user as import("../../lib/auth-utils").SessionUser).email}
                                    </span>
                                    <span className="px-2 py-0.5 bg-purple-900 text-purple-300 text-xs font-semibold rounded">
                                        {(session.user as import("../../lib/auth-utils").SessionUser).role}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-700 text-red-400 hover:bg-red-900/50 hover:text-red-300"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}