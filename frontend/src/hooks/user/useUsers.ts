import {useQuery} from "@tanstack/react-query";
import {apiGetUsers} from "@/lib/apis/users";

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: apiGetUsers, // Automatically handles 401 and token refresh!
        staleTime: 5 * 60 * 1000,
    });
}
