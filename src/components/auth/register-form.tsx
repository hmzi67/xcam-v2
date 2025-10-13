"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    displayName: z.string().min(3, "Display name must be at least 3 characters").max(50, "Display name must be less than 50 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    displayName: data.displayName,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Registration failed")
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 2000)

        } catch (error: unknown) {
            console.error("Registration error:", error)
            setError((error as Error).message || "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Registration Successful!</CardTitle>
                    <CardDescription>
                        Please check your email to verify your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <p className="text-sm">
                            We&apos;ve sent a verification link to your email address.
                            Please click the link to activate your account.
                        </p>
                    </Alert>
                    <p className="text-sm text-gray-600 mt-4 text-center">
                        Redirecting to login page...
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                    Sign up to start using the platform
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <p className="text-sm">{error}</p>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input
                            {...register("displayName")}
                            type="text"
                            placeholder="Display Name"
                            disabled={isLoading}
                        />
                        {errors.displayName && (
                            <p className="text-sm text-red-600 mt-1">{errors.displayName.message}</p>
                        )}
                    </div>

                    <div>
                        <Input
                            {...register("email")}
                            type="email"
                            placeholder="Email"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <Input
                            {...register("password")}
                            type="password"
                            placeholder="Password"
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <Input
                            {...register("confirmPassword")}
                            type="password"
                            placeholder="Confirm Password"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}