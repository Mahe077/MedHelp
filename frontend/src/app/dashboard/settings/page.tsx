"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { User, Shield, Bell, Lock, Settings as SettingsIcon } from "lucide-react";
import { ProfileTab } from "@/components/settings/profile-tab";
import { SecurityTab } from "@/components/settings/security-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { PrivacyTab } from "@/components/settings/privacy-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="hidden sm:inline">Privacy</span>
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Preferences</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="profile" className="mt-0">
                        <ProfileTab />
                    </TabsContent>

                    <TabsContent value="security" className="mt-0">
                        <SecurityTab />
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0">
                        <NotificationsTab />
                    </TabsContent>

                    <TabsContent value="privacy" className="mt-0">
                        <PrivacyTab />
                    </TabsContent>

                    <TabsContent value="preferences" className="mt-0">
                        <PreferencesTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}