"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/common/app-form/form-header";
import { motion } from "motion/react";
import { AppCard } from "@/components/common/app-form/app-card";
import { AppFormBody } from "@/components/common/app-form/app-form-body";
import { AppButton } from "@/components/common/app-button";
import apiClient, { setAccessToken } from "@/lib/api/client";

export default function Verify2FAPage() {
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session')

    useEffect(() => {
        if (!sessionId) {
            router.push("/auth/login")
        }
    }, [sessionId, router])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        if (!sessionId) {
            setError("Invalid session. Please login again.")
            setIsLoading(false)
            return
        }

        try {
            const { data } = await apiClient.post('/auth/verify-2fa', {
                sessionId,
                code,
            })

            // Set access token and redirect to dashboard
            setAccessToken(data.accessToken)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid code. Please try again.")
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
                        title={"Two-Factor Authentication"}
                        subtitle={"Enter the code from your authenticator app"}
                    />

                    {/* 2FA Card */}
                    <AppCard
                        bodyTitle={"Verify Identity"}
                        bodySubtitle={"Enter the 6-digit code from your authenticator app"}
                    >
                        <AppFormBody handleSubmit={handleSubmit} error={error}>
                            {/* Code Field */}
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-foreground font-medium">
                                    Authentication Code
                                </Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                    className="bg-input border-border focus:ring-primary text-center text-2xl tracking-widest"
                                    autoComplete="one-time-code"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the 6-digit code displayed in your authenticator app
                                </p>
                            </div>

                            {/* Submit Button */}
                            <AppButton
                                isLoading={isLoading}
                                loadingText={"Verifying..."}
                                disabled={isLoading || code.length !== 6}
                            >
                                Verify Code
                            </AppButton>

                            {/* Back to Login */}
                            <div className="text-sm text-center">
                                <button
                                    type="button"
                                    onClick={() => router.push("/auth/login")}
                                    className="text-primary hover:text-primary/80"
                                >
                                    ← Back to login
                                </button>
                            </div>
                        </AppFormBody>
                    </AppCard>
                </motion.div>
            </div>
        </div>
    );
}
