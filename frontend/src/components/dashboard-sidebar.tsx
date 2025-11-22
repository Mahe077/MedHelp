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
import { UserMenu } from "@/components/common/user-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getEnabledModules, FOOTER_MODULES } from "@/config/modules";
import { useModuleAccess } from "@/hooks/useModuleAccess";

export function DashboardSidebar() {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();
    const { getAccessibleModules } = useModuleAccess();

    // Get all enabled modules
    const allModules = getEnabledModules();

    // Filter modules based on user permissions
    const visibleModules = getAccessibleModules(allModules);
    const visibleFooterModules = getAccessibleModules(FOOTER_MODULES);

    // Check if a route is active
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

    return (
        <Sidebar variant="sidebar">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-2 my-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
                        <span className="text-xs font-bold text-sidebar-primary-foreground">Rx</span>
                    </div>
                    <span className="font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                        Pharmacy
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent className="mt-2">
                <SidebarMenu>
                    {visibleModules.map((module) => {
                        const active = isActive(module.href);
                        const Icon = module.icon;

                        return (
                            <SidebarMenuItem key={module.id} className="mx-2">
                                <SidebarMenuButton asChild tooltip={module.title}>
                                    <Link
                                        href={module.href}
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
                                        <Icon className="h-4 w-4" />
                                        <span className="flex-1">{module.title}</span>
                                        {module.badge && (
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                                                {module.badge}
                                            </span>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                {visibleFooterModules.length > 0 && (
                    <SidebarMenu>
                        {visibleFooterModules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <SidebarMenuItem key={module.id}>
                                    <SidebarMenuButton asChild tooltip={module.title}>
                                        <Link
                                            href={module.href}
                                            className="flex items-center gap-2 text-primary-foreground"
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{module.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                )}
                <div className="flex items-center justify-between px-2 py-2 border-t border-sidebar-border">
                    <div className="text-xs text-sidebar-foreground/70">
                        <p className="font-medium">{user?.email}</p>
                        <p className="capitalize">{user?.userType}</p>
                    </div>
                    <UserMenu />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}