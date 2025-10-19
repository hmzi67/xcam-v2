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

export function Navigation() {
    const { data: session, status } = useSession()

    const handleSignOut = () => {
        void signOut({ callbackUrl: "/" })
    }

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
            <div className="containewr mx-auto px-4">
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

                        {session?.user && ((session.user as any).role === "CREATOR" || (session.user as any).role === "ADMIN") && (
                            <div className="hidden md:flex items-center space-x-1">
                                <Link href="/earnings">
                                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Earnings
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
                                    <Button variant="ghost" className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                                        <User className="w-4 h-4 text-gray-400" />
                                        {/*<span className="text-sm font-medium text-gray-300">*/}
                                        {/*    /!*{(session.user as import("../../lib/auth-utils").SessionUser).email}*!/*/}
                                        {/*</span>*/}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-300">
                                    <DropdownMenuLabel className={'flex items-center justify-start'}>
                                        <Hand className={'w-4 h-4 mr-2'} /> hi, {(session.user as import("../../lib/auth-utils").SessionUser).name}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="cursor-pointer">
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/streaming" className="cursor-pointer">
                                            <Video className="w-4 h-4 mr-2" />
                                            <span>Streaming</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {((session.user as any).role === "CREATOR" || (session.user as any).role === "ADMIN") && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/earnings" className="cursor-pointer">
                                                <DollarSign className="w-4 h-4 mr-2" />
                                                <span>Earnings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
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