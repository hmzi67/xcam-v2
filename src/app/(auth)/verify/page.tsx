"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [status, setStatus] = useState("verifying") // verifying, success, error, idle
    const [error, setError] = useState<string | null>(null)
    const [isResending, setIsResending] = useState(false)
    const [resendMessage, setResendMessage] = useState<string | null>(null)


    useEffect(() => {
        if (token) {
            fetch(`/api/auth/verify-token?token=${token}`)
                .then(async (res) => {
                    if (res.ok) {
                        setStatus("success")
                        setTimeout(() => {
                            router.push("/login")
                        }, 3000)
                    } else {
                        const data = await res.json()
                        setStatus("error")
                        setError(data.error || "Invalid token")
                    }
                })
                .catch(() => {
                    setStatus("error")
                    setError("An unexpected error occurred.")
                })
        } else {
            setStatus("idle")
        }
    }, [token, router])

    const resendVerificationEmail = async () => {
        setIsResending(true)
        setResendMessage(null)
        try {

            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: localStorage.getItem("user"),
                }),
            })

            const data = await res.json()
            if (res.ok) {
                setResendMessage("A new verification link has been sent to your email.")
            } else {
                setResendMessage(data.error || "Failed to resend verification email.")
            }
        } catch (error) {
            setResendMessage("An unexpected error occurred. " + error)
        } finally {
            setIsResending(false)
        }
    }

    if (status === "verifying" && token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verifying your email...
                    </h2>
                </div>
            </div>
        )
    }

    if (status === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Email Verified!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        You will be redirected to the login page shortly.
                    </p>
                </div>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-red-600">
                        Verification Failed
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {error}
                    </p>
                    <button
                        onClick={resendVerificationEmail}
                        disabled={isResending}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isResending ? "Sending..." : "Resend Verification Email"}
                    </button>
                    {resendMessage && <p className="mt-2 text-sm text-gray-600">{resendMessage}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please check your email and click the verification link to continue.
                    </p>
                    <div className="mt-6">
                         <button
                            onClick={resendVerificationEmail}
                            disabled={isResending}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isResending ? "Sending..." : "Resend Verification Email"}
                        </button>
                        {resendMessage && <p className="mt-2 text-sm text-gray-600">{resendMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
        )

}
