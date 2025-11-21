import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {ReactNode} from "react";

interface AppButtonProps {
    isLoading?: boolean,
    loadingText?: string,
    children: ReactNode,
    disabled?: boolean,
    onClick?: () => Promise<void>
}

export function AppButton({isLoading, loadingText, children, disabled, onClick}: AppButtonProps) {
    return (
        <Button
            type="submit"
            disabled={disabled}
            className="w-full bg-primary hover:bg-primary/50 transition-all flex items-center justify-center gap-2"
            onClick={onClick}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin"/> {loadingText}
                </>
            ) : (
                children
            )}
        </Button>
    );
}