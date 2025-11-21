"use client";

import {useState, FormEvent} from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {CheckCircle2} from "lucide-react";
import {FormHeader} from "@/components/common/app-form/form-header";
import {AppFormBody} from "@/components/common/app-form/app-form-body";
import {AppButton} from "@/components/common/app-button";
import {AppDiv} from "@/components/common/app-div";
import {AppCard} from "@/components/common/app-form/app-card";
import {FormFooter} from "@/components/common/app-form/form-footer";
import {apiForgotPassword} from "@/lib/apis/auth";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        setIsSuccess(false);

        try {
            await apiForgotPassword(email);
            setIsSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send reset link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/10 transition-colors duration-300 p-4">
            <motion.div
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                className="w-full max-w-md"
            >
                {/* Header */}
                <FormHeader
                    title={"Forgot Password"}
                    subtitle={"Enter your registered email to receive a password reset link."}
                />

                {/* Card */}
                <AppCard
                    bodyTitle={"Reset Your Password"}
                    bodySubtitle={"You’ll receive a secure link to create a new password"}
                    footerText={"Remember your password?"}
                    footerLinkText={"Sign In"}
                    footerHref="/auth/login"
                >
                    {isSuccess ? (
                        <AppDiv
                            motionKey="success"
                        >
                            <Alert variant="success" className="mb-4 dark:border-green-700 dark:bg-green-900/20">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400"/>
                                <AlertTitle className="font-semibold">Email Sent!</AlertTitle>
                                <AlertDescription>
                                    A password reset link has been sent to <b>{email}</b>
                                </AlertDescription>
                            </Alert>

                            <Button asChild className="w-full bg-primary hover:bg-primary/50">
                                <Link href="/auth/login">Return to Sign In</Link>
                            </Button>
                        </AppDiv>
                    ) : (
                        <AppFormBody handleSubmit={handleSubmit} error={error}>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground font-medium">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="bg-input border-border focus:ring-primary transition-colors duration-300"
                                />
                            </div>

                            <AppButton
                                isLoading={isLoading}
                                loadingText={"Sending..."}
                                disabled={isLoading}
                            >
                                Save Changes
                            </AppButton>
                        </AppFormBody>
                    )}
                </AppCard>

                <FormFooter/>
            </motion.div>
        </div>
    );
}
