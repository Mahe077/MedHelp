"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppCard } from "@/components/common/app-form/app-card";
import { FormHeader } from "@/components/common/app-form/form-header";
import { AppDiv } from "@/components/common/app-div";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { motion } from "motion/react";
import { AppButton } from "@/components/common/app-button";
import { apiVerifyEmail } from "@/lib/apis/auth";

import { Suspense } from "react";

const VerifyEmailContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialToken = searchParams.get("token");

    const [status, setStatus] = useState<
        "loading" | "success" | "error"
    >(initialToken ? "loading" : "error");
    const [message, setMessage] = useState(
        initialToken ? "" : "Verification token not found. Please check your email and try again."
    );
    const hasProcessedToken = useRef(false);

    const verifyToken = useCallback(async (currentToken: string) => {
        try {
            await apiVerifyEmail(currentToken);
            setStatus("success");
            setMessage("Your email has been successfully verified. You can now log in.");
        } catch (err) {
            setStatus("error");
            setMessage(
                err instanceof Error
                    ? err.message
                    : "Email verification failed. Please try again."
            );
        }
    }, []);

    useEffect(() => {
        if (hasProcessedToken.current || !initialToken) {
            return;
        }

        hasProcessedToken.current = true;
        const initiateVerification = async () => {
            await verifyToken(initialToken);
        };
        initiateVerification();
    }, [initialToken, verifyToken]);

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
                        title="Email Verification"
                        subtitle="Please wait while we verify your email address."
                    />
                    <AppCard bodyTitle={"Email Verification"} bodySubtitle={"Verify your email address."}>
                        <AppDiv motionKey="success">
                            {status === "loading" && (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <Loader className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-muted-foreground">Verifying...</p>
                                </div>
                            )}

                            {status === "success" && (
                                <><Alert variant="success" className={"mb-4"}>
                                    <CheckCircle2 className="h-5 w-5" />
                                    <AlertTitle>Verification Successful!</AlertTitle>
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                                    <AppButton
                                        isLoading={false}
                                        loadingText={"Signing up..."}
                                        disabled={false}
                                        onClick={async () => { await router.push("/auth/login"); }}
                                    >
                                        Go to Login
                                    </AppButton></>
                            )}

                            {status === "error" && (
                                <><Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-5 w-5" />
                                    <AlertTitle>Verification Failed</AlertTitle>
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                                    <AppButton
                                        isLoading={false}
                                        loadingText={"Signing up..."}
                                        disabled={false}
                                        onClick={async () => { await router.push("/auth/signup"); }}
                                    >
                                        Back to Signup
                                    </AppButton></>
                            )}
                        </AppDiv>
                    </AppCard>
                </motion.div>
            </div>
        </div>
    );
};

const VerifyEmailPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
};

export default VerifyEmailPage;
