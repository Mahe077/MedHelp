import MetricCard from "@/components/common/metric-card";

export default function InventoryPage() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Sales" value="$45,230" change={12} description="This month" />
                <MetricCard label="Inventory Items" value="668" change={5} description="Active products" />
                <MetricCard label="Customers" value="1,234" change={8} description="Total registered" />
                <MetricCard label="Pending Orders" value="23" change={-2} description="To be processed" />
            </div>
        </div>
    )
}