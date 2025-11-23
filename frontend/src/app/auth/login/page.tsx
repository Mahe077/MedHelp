"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormHeader } from "@/components/common/app-form/form-header";
import { FormFooter } from "@/components/common/app-form/form-footer";
import { motion } from "motion/react";
import { AppCard } from "@/components/common/app-form/app-card";
import { AppFormBody } from "@/components/common/app-form/app-form-body";
import { AppButton } from "@/components/common/app-button";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, router])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const result = await login(email, password)

            // Check if 2FA is required
            if (result?.mfaRequired && result?.sessionId) {
                // Redirect to 2FA page with session ID
                router.push(`/auth/verify-2fa?session=${result.sessionId}`)
            } else {
                // No 2FA - proceed to dashboard
                router.push("/dashboard")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <FormHeader
                        title={"Pharmacy System"}
                        subtitle={"Manage your pharmacy with ease"}
                    />

                    {/* Login Card */}
                    <AppCard
                        bodyTitle={"Sign In"}
                        bodySubtitle={"Enter your credentials to access the system"}
                        footerText={"Don't have an account?"}
                        footerLinkText={"Sign Up"}
                        footerHref="/auth/signup"
                    >
                        <AppFormBody handleSubmit={handleSubmit} error={error}>
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-input border-border focus:ring-primary"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-foreground font-medium"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-input border-border focus:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-sm text-right">
                                <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80">
                                    Forgot your password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <AppButton
                                isLoading={isLoading}
                                loadingText={"Sign in..."}
                                disabled={isLoading}
                            >
                                Sign In
                            </AppButton>
                        </AppFormBody>
                    </AppCard>

                    <FormFooter />
                </motion.div>
            </div>
        </div>
    );
}
