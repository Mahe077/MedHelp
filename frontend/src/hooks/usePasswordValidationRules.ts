"use client";

export const usePasswordValidationRules = () => {
    return [
        { id: "digit", message: "At least one digit", regex: /^(?=.*[0-9]).*$/ },
        { id: "lowercase", message: "At least one lowercase letter", regex: /^(?=.*[a-z]).*$/ },
        { id: "uppercase", message: "At least one uppercase letter", regex: /^(?=.*[A-Z]).*$/ },
        { id: "special", message: "At least one special character (@#$%^&+=)", regex: /^(?=.*[@#$%^&+=]).*$/ },
        { id: "length", message: "At least 8 characters long", regex: /^.{8,}$/ },
    ];
};
