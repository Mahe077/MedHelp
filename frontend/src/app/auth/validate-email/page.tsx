"use client";

import { useState } from "react";
import { AppCard } from "@/components/common/app-form/app-card";
import { FormHeader } from "@/components/common/app-form/form-header";
import { useSearchParams } from "next/navigation";
import { AppDiv } from "@/components/common/app-div";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppButton } from "@/components/common/app-button";
import {apiResendVerificationEmail} from "@/lib/apis/auth";

const ValidateEmailPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(email ? "" : "Email not found in URL.");

  const handleResendEmail = async (): Promise<void> => {
    if (!email) {
      setError("Email not found.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await apiResendVerificationEmail(email);
      setMessage("A new verification email has been sent.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <FormHeader title="Validate Your Email" subtitle=" " />

          <AppCard bodyTitle={"Validate Your Email"}>
            <AppDiv motionKey="success">
              {email && (
                <Alert
                  variant="success"
                  className="mb-4 dark:border-green-700 dark:bg-green-900/20"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <AlertTitle className="font-semibold">Email Sent!</AlertTitle>
                  <AlertDescription>
                    We have sent an email to <b>{email}</b> to validate your
                    email address. Please click the link in the email to
                    continue.
                  </AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert variant="success" className="mb-4">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col space-y-4">
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/50"
                >
                  <Link href="/auth/login">Return to Sign In</Link>
                </Button>

                <AppButton
                  onClick={handleResendEmail}
                  isLoading={isLoading}
                  loadingText="Resending..."
                  disabled={!email || isLoading}
                >
                  Resend Email
                </AppButton>
              </div>
            </AppDiv>
          </AppCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ValidateEmailPage;

