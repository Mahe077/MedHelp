import {User} from "@/lib/enums";
import {CreateUserInput} from "@/lib/validation-schemas";

export async function apiLogin(
    email: string,
    password: string
): Promise<{ accessToken: string; refreshToken: string; mfaEnabled: boolean; secretImageUri?: string }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/authenticate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
    }

    return await response.json();
}

export async function apiVerify(
    email: string,
    code: string
): Promise<{ accessToken: string; refreshToken: string; mfaEnabled: boolean }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email, code}),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
    }

    return await response.json();
}

export async function apiMe(accessToken: string): Promise<User> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user details");
    }

    return await response.json();
}

export async function apiRefresh(refreshToken: string): Promise<{ accessToken: string, user: User }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({refreshToken}), // Send refresh token in body
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Token refresh failed");
    }

    const responseData = await response.json();
    const {user, accessToken, permissions} = responseData.data;
    user.permissions = permissions;
    return {accessToken, user};
}

export async function apiSignup(data: CreateUserInput): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
    }

    return;
}

export async function apiForgotPassword(email: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email}),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Forgot password failed");
    }

    return;
}

export async function apiResetPassword(resetToken: string, newPassword: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({token: resetToken, newPassword}),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Reset password failed");
    }

    return;
}

export async function apiValidateResetToken(token: string): Promise<boolean> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-reset-token?token=${token}`, {
        method: "GET",
    });

    return response.ok;
}

export async function apiVerifyEmail(token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`, {
        method: "GET",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Email verification failed");
    }

    return;
}

export async function apiResendVerificationEmail(email: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email}),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend verification email");
    }

    return;
}