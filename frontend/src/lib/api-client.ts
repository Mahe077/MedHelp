import createCustomFetch from "./fetch";
import {apiRefresh} from "@/lib/apis/auth";

// Global customFetch instance
let customFetch: (url: string, options: RequestInit) => Promise<Response>;
let isInitialized = false;

export const initializeApiClient = (
    getAccessToken: () => string | null,
    getRefreshToken: () => string | null,
    logout: () => void,
    setAccessToken: (token: string) => void
) => {
    if (!isInitialized) {
        customFetch = createCustomFetch(
            getAccessToken,
            getRefreshToken,
            logout,
            apiRefresh, // Pass apiRefresh function
            setAccessToken
        );
        isInitialized = true;
        console.log("✅ API client initialized with custom fetch");
    }
};

// Helper to ensure initialization
export function getCustomFetch() {
    if (!isInitialized) {
        throw new Error("API client not initialized. Call initializeApiClient first.");
    }
    return customFetch;
}