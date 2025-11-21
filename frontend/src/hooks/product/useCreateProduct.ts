import {useMutation, useQueryClient} from "@tanstack/react-query";
import {apiCreateProduct} from "@/lib/apis/products";

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: apiCreateProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}