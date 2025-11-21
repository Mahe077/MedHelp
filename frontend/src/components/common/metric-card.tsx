import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {Badge} from "@/components/ui/badge";


interface MetricCardProps {
    label: string
    value: string | number
    change?: number
    description?: string
}

export default function MetricCard({label, value, change, description}: MetricCardProps) {
    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{value}</span>
                    {change !== undefined && (
                        <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs">
                            {change >= 0 ? "+" : ""}
                            {change}%
                        </Badge>
                    )}
                </div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}
