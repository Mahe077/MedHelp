import {useAuth} from "@/context/auth-context";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {CreateUserInput} from "@/lib/validation-schemas";

export function useCreateUser() {
    const { getAccessToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData: CreateUserInput) => {
            const token = getAccessToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error('Failed to create user');
            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch users list
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}