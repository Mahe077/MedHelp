"use client"

import {ReactNode} from "react";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {DashboardSidebar} from "@/components/dashboard-sidebar";

interface DashboardLayoutProps {
    children?: ReactNode;
}


export default function DashboardLayout({children}: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <DashboardSidebar/>
            <SidebarInset>
                <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4">
                    <SidebarTrigger className="-ml-1"/>
                    {/*<div className="text-sm text-muted-foreground">Dashboard</div>*/}
                </header>
                <main className="flex-1 overflow-auto m-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}