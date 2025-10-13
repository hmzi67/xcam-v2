import { auth } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen">
            <Navigation />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
                    <div className="space-y-2">
                        <p><strong>Email:</strong> {(session.user as import("../../../lib/auth-utils").SessionUser).email}</p>
                        <p><strong>Role:</strong> {(session.user as import("../../../lib/auth-utils").SessionUser).role}</p>
                        <p><strong>Email Verified:</strong> {(session.user as import("../../../lib/auth-utils").SessionUser).emailVerified ? "Yes" : "No"}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}