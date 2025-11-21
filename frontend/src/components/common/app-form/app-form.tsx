import { motion } from "motion/react";
import {FormHeader} from "@/components/common/app-form/form-header";
import {AppCard} from "@/components/common/app-form/app-card";
import {ReactNode} from "react";

interface FormBodyProps {
    title: string;
    subtitle: string;
    bodyTitle: string;
    bodySubtitle: string;
    body: ReactNode;
}
export function formBody({ title, subtitle, bodyTitle, bodySubtitle,  body }: FormBodyProps) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/10 transition-colors duration-300 p-4">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            <FormHeader
                title = {title}
                subtitle = {subtitle}
            />

            <AppCard bodyTitle={bodyTitle} bodySubtitle={bodySubtitle}>
                {body}
            </AppCard>
        </motion.div>
    </div>
}