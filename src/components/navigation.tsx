"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Video,
    LayoutDashboard,
    Settings,
    Shield,
    LogOut,
    User,
    Hand,
    DollarSign
} from "lucide-react"

import React, { useCallback, useMemo, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function Navigation() {
    const { data: session, status } = useSession()

    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Memoize the fetch function to prevent recreation on every render
    const fetchProfile = useCallback(async (userId: string) => {
        setLoading(true)
        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            })
            if (!res.ok) throw new Error("Failed to fetch profile")
            const data = await res.json()
            setUserData(data)
        } catch (err) {
            setUserData(null)
        } finally {
            setLoading(false)
        }
    }, [])

    const userId = useMemo(() => session?.user?.id, [session?.user?.id])

    React.useEffect(() => {
        if (userId && !userData) {
            fetchProfile(userId)
        }
    }, [userId, userData, fetchProfile])

    const handleSignOut = () => {
        void signOut({ callbackUrl: "/" })
    }

    if (status === "loading" || loading) {
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
            <div className="container mx-auto px-4">
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

                        {session?.user && ((session.user as any).role === "CREATOR" || (session.user as any).role === "VIEWER" || (session.user as any).role === "ADMIN") && (
                            <div className="hidden md:flex items-center space-x-1">
                                <Link href="/pricing">
                                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
                                        Pricing
                                    </Button>
                                </Link>
                                {(session.user as any).role === "ADMIN" && (
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div tabIndex={0} className="outline-none">
                                        <Avatar className="w-8 h-8 cursor-pointer transition-all hover:ring-2 hover:ring-purple-400 hover:shadow-[0_0_16px_4px_rgba(168,85,247,0.5)]">
                                            <AvatarImage src={userData?.profile?.avatarUrl || undefined} alt="User avatar" className="object-cover w-8 h-8 rounded-full" />
                                            <AvatarFallback>
                                                <User className="w-4 h-4 text-gray-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-300">
                                    <DropdownMenuLabel className={'flex items-center justify-start'}>
                                        <Hand className={'w-4 h-4 mr-2'} /> hi, {(session.user as import("../../lib/auth-utils").SessionUser).name}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="w-4 h-4 mr-2" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/streaming" className="cursor-pointer">
                                            <Video className="w-4 h-4 mr-2" />
                                            <span>Streaming</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {((session.user as import("../../lib/auth-utils").SessionUser).role === "CREATOR" ||
                                        (session.user as import("../../lib/auth-utils").SessionUser).role === "ADMIN") && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/creator" className="cursor-pointer">
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    <span>Creator Studio</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer text-red-400">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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