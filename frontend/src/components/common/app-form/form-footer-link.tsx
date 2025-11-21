import Link from "next/link";

interface FormFooterLinkProps {
    /** Text before the link, e.g., "Remember your password?" */
    text: string;
    /** Text of the link, e.g., "Sign In" */
    linkText?: string;
    /** Href of the link */
    href?: string;
    /** Optional additional styling */
    className?: string;
}

/**
 * Reusable footer link for forms, e.g., "Remember your password? Sign In"
 */
export function FormFooterLink({
                                   text,
                                   linkText,
                                   href,
                                   className = "",
                               }: FormFooterLinkProps) {
    return (
        <div className={`mt-6 text-center text-sm ${className}`}>
            <p className="text-muted-foreground">
                {text}{" "}
                {
                    linkText &&
                    href &&
                    <Link href={href} className="text-primary hover:text-primary/50">
                        {linkText}
                    </Link>}
            </p>
        </div>
    );
}
