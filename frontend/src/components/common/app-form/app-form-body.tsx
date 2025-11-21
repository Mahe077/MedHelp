import {AnimatePresence, motion} from "framer-motion";
import {FormEvent, ReactNode} from "react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle} from "lucide-react";

interface Props {
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    children: ReactNode;
    error?: string;
}

export function AppFormBody({handleSubmit, children, error}: Props) {
    return (
        <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {children}
            <AnimatePresence>
                {error && (
                    <motion.div
                        key="error"
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                    >
                        <Alert
                            variant="destructive"
                            className="bg-destructive/10 border-destructive/30 dark:bg-red-900/20 dark:border-red-800"
                        >
                            <AlertCircle className="h-5 w-5"/>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>
    )
}