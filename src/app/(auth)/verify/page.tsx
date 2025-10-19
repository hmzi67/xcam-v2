import { auth } from "../../../../lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function VerifyEmailPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    if ((session.user as import("../../../../lib/auth-utils").SessionUser).emailVerified) {
        redirect("/")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We&apos;ve sent a verification link to <strong>{session.user.email}</strong>
                    </p>
                    <p className="mt-4 text-sm text-gray-600">
                        Please check your email and click the verification link to continue.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/api/auth/signout"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Sign out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}