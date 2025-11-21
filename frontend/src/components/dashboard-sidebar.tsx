import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { AlertCircle, BarChart3, FileText, LayoutDashboard, Package, Settings, Users } from "lucide-react";
import { UserMenu } from "@/components/common/user-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/enums";

interface NavItem {
    title: string
    icon: React.ReactNode
    href: string
    entity?: string // Changed from permissions to entity
}

export function DashboardSidebar() {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();

    // ✅ Fixed active state logic
    const isActive = (href: string) => {
        // Exact match for dashboard root
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        // For other routes, check if current path starts with the href
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    if (isLoading) {
        return null; // Or a loading spinner/skeleton
    }

    const navigationItems: NavItem[] = [
        {
            title: "Overview",
            icon: <LayoutDashboard className="h-4 w-4" />,
            href: "/dashboard",
        },
        {
            title: "Inventory",
            icon: <Package className="h-4 w-4" />,
            href: "/dashboard/inventory",
            entity: "product", // Example entity
        },
        {
            title: "Customers",
            icon: <Users className="h-4 w-4" />,
            href: "/dashboard/customers",
            entity: "user", // Example entity
        },
        {
            title: "Prescriptions",
            icon: <FileText className="h-4 w-4" />,
            href: "/dashboard/prescriptions",
            entity: "prescription", // Example entity
        },
        {
            title: "Invoices",
            icon: <FileText className="h-4 w-4" />,
            href: "/dashboard/invoices",
            entity: "invoice", // Example entity
        },
        {
            title: "Reports",
            icon: <BarChart3 className="h-4 w-4" />,
            href: "/dashboard/reports",
            entity: "report", // Example entity
        },
        {
            title: "Alerts",
            icon: <AlertCircle className="h-4 w-4" />,
            href: "/dashboard/alerts",
            entity: "alert", // Example entity
        },
    ]

    const visibleItems = navigationItems.filter(({ entity }) => {
        if (!entity) return true; // item visible to everyone
        if (!user || !user.permissions) return false;

        if (user.roles.includes(UserRole.ADMIN)) return true;

        // Check if the user has any permission for the given entity
        return user.permissions.some((permission) =>
            permission.startsWith(`${entity}:`)
        );
    });

    return (
        <Sidebar variant="sidebar">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-2 my-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
                        <span className="text-xs font-bold text-sidebar-primary-foreground">Rx</span>
                    </div>
                    <span
                        className="font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">Pharmacy</span>
                </div>
            </SidebarHeader>


            <SidebarContent className="mt-2">
                <SidebarMenu>
                    {visibleItems.map((item) => {
                        const active = isActive(item.href);
                        return (<SidebarMenuItem key={item.href} className="mx-2">
                            <SidebarMenuButton asChild tooltip={item.title}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-2 mt-1 rounded-md transition-colors text-primary-foreground",
                                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        active && [
                                            "bg-sidebar-accent text-sidebar-accent-foreground",
                                            "font-medium",
                                            "border-l-2 border-sidebar-primary"
                                        ]
                                    )}
                                >
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>)
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Settings">
                            <Link href="#" className="flex items-center gap-2 text-primary-foreground">
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="flex items-center justify-between px-2 py-2 border-t border-sidebar-border">
                    <div className="text-xs text-sidebar-foreground/70">
                        <p className="font-medium">{user?.email}</p>
                        <p className="capitalize">{user?.userType}</p>
                    </div>
                    <UserMenu />
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}