"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div>Loading...</div>
    }

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold">
                            XCAM
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {session?.user ? (
                            <>
                                <span className="text-sm text-gray-700">
                                    {(session.user as import("../../lib/auth-utils").SessionUser).email} ({(session.user as import("../../lib/auth-utils").SessionUser).role})
                                </span>
                                <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
                                    Dashboard
                                </Link>
                                {((session.user as import("../../lib/auth-utils").SessionUser).role === "CREATOR" || (session.user as import("../../lib/auth-utils").SessionUser).role === "ADMIN") ? (
                                    <Link href="/creator" className="text-blue-600 hover:text-blue-500">
                                        Creator Studio
                                    </Link>
                                ) : null}
                                {(session.user as import("../../lib/auth-utils").SessionUser).role === "ADMIN" ? (
                                    <Link href="/admin" className="text-blue-600 hover:text-blue-500">
                                        Admin
                                    </Link>
                                ) : null}
                                <Button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    variant="outline"
                                    size="sm"
                                >
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-blue-600 hover:text-blue-500">
                                    Sign In
                                </Link>
                                <Link href="/register" className="text-blue-600 hover:text-blue-500">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}