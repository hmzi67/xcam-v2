import { requireRole } from "../../../lib/auth-utils"
import { UserRole } from "@prisma/client"

export default async function AdminPage() {
    const session = await requireRole([UserRole.ADMIN])

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
                <p>Welcome to the admin panel, {session.user.email}!</p>
                <p>Only administrators can access this page.</p>
            </div>
        </div>
    )
}