import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AnimatePresence} from "framer-motion";
import {FormFooterLink} from "@/components/common/app-form/form-footer-link";
import {ReactNode} from "react";

interface FormBodyProps {
    bodyTitle?: string;
    bodySubtitle?: string;
    children: ReactNode;
    footerText?: string;
    footerLinkText?: string;
    footerHref?: string;
}

export function AppCard({bodyTitle, bodySubtitle, children, footerText, footerLinkText, footerHref}: FormBodyProps) {
    return <Card
        className="border-border/60 shadow-xl backdrop-blur-sm bg-card/95 dark:bg-card/80 transition-colors duration-300">
        {(bodyTitle || bodySubtitle) && <CardHeader>
            <CardTitle className="text-lg font-semibold">{bodyTitle}</CardTitle>
            {bodySubtitle && <CardDescription>
                {bodySubtitle}
            </CardDescription>}
        </CardHeader>}

        <CardContent>
            <AnimatePresence mode="wait">
                {children}
            </AnimatePresence>
            {footerText &&
                <FormFooterLink
                    text={footerText}
                    linkText={footerLinkText}
                    href={footerHref}
                />}
        </CardContent>
    </Card>
}