import {motion, MotionProps} from "framer-motion";
import {ReactNode} from "react";

interface AppDivProps extends MotionProps {
    /** Optional unique key for AnimatePresence transitions */
    motionKey?: string;
    /** Child content to render inside */
    children: ReactNode;
}

/** A reusable animated container with smooth fade + scale transitions */
export function AppDiv({
                           motionKey,
                           children,
                           initial = {opacity: 0, scale: 0.95},
                           animate = {opacity: 1, scale: 1},
                           exit = {opacity: 0},
                           transition = {duration: 0.3},
                           ...props
                       }: AppDivProps) {
    return (
        <motion.div
            key={motionKey}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
            {...props}
        >
            {children}
        </motion.div>
    );
}