import {getCustomFetch} from "@/lib/api-client";
import {User} from "@/lib/enums";

export async function apiGetUsers(): Promise<User[]> {
    const fetch = getCustomFetch();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
    }

    const responseData = await response.json();
    return responseData.data;
}

export async function apiGetUserById(id: string): Promise<User> {
    const fetch = getCustomFetch();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user");
    }

    const responseData = await response.json();
    return responseData.data;
}

export async function apiUpdateUser(id: string, data: Partial<User>): Promise<User> {
    const fetch = getCustomFetch();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
    }

    const responseData = await response.json();
    return responseData.data;
}

export async function apiDeleteUser(id: string): Promise<void> {
    const fetch = getCustomFetch();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
    }
}