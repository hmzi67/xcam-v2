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
import { Eye, EyeOff } from "lucide-react"

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
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

        } catch (error: unknown) {
            console.error("Registration error:", error)
            setError((error as Error).message || "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="w-full flex items-center justify-center">
                <div className="w-full min-h-screen overflow-hidden shadow-2xl bg-gray-900 flex items-center justify-center">
                    <Card className="bg-transparent border-none shadow-none w-full max-w-lg text-center text-white">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold">Registration Successful!</CardTitle>
                            <CardDescription className="text-gray-400 mt-2">
                                Please check your email to verify your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert className="mb-4 bg-green-900 border-green-700 text-green-100">
                                <p className="text-sm">
                                    We've sent a verification link to your email address.
                                    Please click the link to activate your account.
                                </p>
                            </Alert>
                            <p className="text-sm text-gray-400 mt-4">
                                You can now <Link href="/login" className="text-blue-400 hover:underline">sign in</Link>.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full flex items-center justify-center">
            <div className="w-full min-h-screen overflow-hidden shadow-2xl bg-gray-900 flex flex-col md:flex-row">
                {/* Left side - Image and branding */}
                <div
                    className="md:w-1/2 bg-gradient-to-br from-purple-900 to-gray-900 p-8 sm:flex flex-col justify-between relative hidden"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1511884642898-4c92249e20b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-gray-900/80 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-white text-2xl font-bold">XCam</h1>
                        </div>
                    </div>
                </div>

                {/* Right side - Register Form */}
                <div className="md:w-1/2 sm:p-8 flex items-center justify-center min-h-screen">
                    <Card className="bg-transparent border-none shadow-none w-full max-w-lg text-center">
                        <CardHeader>
                            <CardTitle className="text-white text-3xl font-bold">Create Account</CardTitle>
                            <CardDescription className="text-gray-400 mt-2">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-400 hover:underline">
                                    Sign in
                                </Link>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <Alert variant="destructive" className="mb-4 bg-red-900 border-red-700 text-red-100">
                                    <p className="text-sm">{error}</p>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <Input
                                        {...register("displayName")}
                                        type="text"
                                        placeholder="Display Name"
                                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                                        disabled={isLoading}
                                    />
                                    {errors.displayName && (
                                        <p className="text-sm text-red-400 mt-1">{errors.displayName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        placeholder="Email"
                                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                                        disabled={isLoading}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="relative">
                                    <Input
                                        {...register("password")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 pr-10"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    {errors.password && (
                                        <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="relative">
                                    <Input
                                        {...register("confirmPassword")}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 pr-10"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-400 mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating account..." : "Create Account"}
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="flex items-center my-4">
                                    <div className="flex-1 border-t border-gray-700"></div>
                                    <span className="px-4 text-gray-400 text-sm">Or register with</span>
                                    <div className="flex-1 border-t border-gray-700"></div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                                    >
                                        <svg width="80px" height="80px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g id="Dribbble-Light-Preview" transform="translate(-300.000000, -7399.000000)" fill="#ffffff">
                                                    <g id="icons" transform="translate(56.000000, 160.000000)">
                                                        <path d="M263.821537,7247.00386 L254.211298,7247.00386 C254.211298,7248.0033 254.211298,7250.00218 254.205172,7251.00161 L259.774046,7251.00161 C259.560644,7252.00105 258.804036,7253.40026 257.734984,7254.10487 C257.733963,7254.10387 257.732942,7254.11086 257.7309,7254.10986 C256.309581,7255.04834 254.43389,7255.26122 253.041161,7254.98137 C250.85813,7254.54762 249.130492,7252.96451 248.429023,7250.95364 C248.433107,7250.95064 248.43617,7250.92266 248.439233,7250.92066 C248.000176,7249.67336 248.000176,7248.0033 248.439233,7247.00386 L248.438212,7247.00386 C249.003881,7245.1669 250.783592,7243.49084 252.969687,7243.0321 C254.727956,7242.65931 256.71188,7243.06308 258.170978,7244.42831 C258.36498,7244.23842 260.856372,7241.80579 261.043226,7241.6079 C256.0584,7237.09344 248.076756,7238.68155 245.090149,7244.51127 L245.089128,7244.51127 C245.089128,7244.51127 245.090149,7244.51127 245.084023,7244.52226 L245.084023,7244.52226 C243.606545,7247.38565 243.667809,7250.75975 245.094233,7253.48622 C245.090149,7253.48921 245.087086,7253.49121 245.084023,7253.49421 C246.376687,7256.0028 248.729215,7257.92672 251.563684,7258.6593 C254.574796,7259.44886 258.406843,7258.90916 260.973794,7256.58747 C260.974815,7256.58847 260.975836,7256.58947 260.976857,7256.59047 C263.15172,7254.63157 264.505648,7251.29445 263.821537,7247.00386" id="google-[#178]">
                                                        </path>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg>
                                        Google
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
