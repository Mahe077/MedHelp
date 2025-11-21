import {motion} from "framer-motion";

interface Props {
    title: string,
    subtitle: string,
}
export function FormHeader({title, subtitle}: Props) {
    return <div className="text-center mb-8">
        <Logo/>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
            {subtitle}
        </p>
    </div>
}

export function Logo(){
    return <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary mb-4 shadow-md"
    >
        <span className="text-2xl font-bold text-primary-foreground">Rx</span>
    </motion.div>;
}
