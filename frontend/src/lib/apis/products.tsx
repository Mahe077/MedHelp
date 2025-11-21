import {getCustomFetch} from "@/lib/api-client";

interface Product {
    id: string;
    name: string;
    price: number;
    // ... other fields
}

export async function apiGetProducts(): Promise<Product[]> {
    const fetch = getCustomFetch();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch products");
    }

    const responseData = await response.json();
    return responseData.data;
}

export async function apiCreateProduct(data: Partial<Product>): Promise<Product> {
    const fetch = getCustomFetch();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
    }

    const responseData = await response.json();
    return responseData.data;
}