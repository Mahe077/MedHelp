"use client";

import { CircleCheck, CircleX } from "lucide-react";

interface ValidationRule {
    id: string;
    message: string;
    regex: RegExp;
}

interface PasswordStrengthIndicatorProps {
    password?: string;
    rules: ValidationRule[];
}

export function PasswordStrengthIndicator({ password, rules }: PasswordStrengthIndicatorProps) {
    return (
        <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border">
            {rules.map((rule) => {
                const isValid = password ? rule.regex.test(password) : false;
                return (
                    <div key={rule.id} className={`flex items-center text-sm ${isValid ? "text-success" : "text-destructive"}`}>
                        {isValid ? <CircleCheck className="w-4 h-4 mr-2" /> : <CircleX className="w-4 h-4 mr-2" />}
                        <span>{rule.message}</span>
                    </div>
                );
            })}
        </div>
    );
}
