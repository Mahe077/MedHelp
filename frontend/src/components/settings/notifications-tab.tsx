"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Bell as BellIcon } from "lucide-react";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/settings";
import type { NotificationSettings } from "@/lib/api/types";

export function NotificationsTab() {
    const [settings, setSettings] = useState<NotificationSettings>({
        emailPrescriptionReady: true,
        emailOrderUpdates: true,
        emailPromotions: false,
        emailNewsletter: true,
        emailSecurityAlerts: true,
        smsPrescriptionReady: true,
        smsOrderUpdates: false,
        smsPromotions: false,
        smsSecurityAlerts: true,
        pushPrescriptionReady: true,
        pushOrderUpdates: true,
        pushPromotions: false,
        pushSecurityAlerts: true,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsApi.getNotificationSettings();
                setSettings(data);
            } catch (error) {
                toast.error("Failed to load notification settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await settingsApi.updateNotificationSettings(settings);
            toast.success("Notification preferences saved");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to save preferences";
            toast.error(errorMessage);
        }
    };

    const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Email Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Notifications
                    </CardTitle>
                    <CardDescription>Choose what updates you want to receive via email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Prescription Ready</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when your prescription is ready for pickup
                            </p>
                        </div>
                        <Switch
                            checked={settings.emailPrescriptionReady}
                            onCheckedChange={(checked) => updateSetting('emailPrescriptionReady', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Order Updates</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive updates about your order status
                            </p>
                        </div>
                        <Switch
                            checked={settings.emailOrderUpdates}
                            onCheckedChange={(checked) => updateSetting('emailOrderUpdates', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Promotions & Offers</Label>
                            <p className="text-sm text-muted-foreground">
                                Get exclusive deals and promotional offers
                            </p>
                        </div>
                        <Switch
                            checked={settings.emailPromotions}
                            onCheckedChange={(checked) => updateSetting('emailPromotions', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Newsletter</Label>
                            <p className="text-sm text-muted-foreground">
                                Health tips and pharmacy news
                            </p>
                        </div>
                        <Switch
                            checked={settings.emailNewsletter}
                            onCheckedChange={(checked) => updateSetting('emailNewsletter', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Security Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                                Important security updates and alerts
                            </p>
                        </div>
                        <Switch
                            checked={settings.emailSecurityAlerts}
                            onCheckedChange={(checked) => updateSetting('emailSecurityAlerts', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SMS Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        SMS Notifications
                    </CardTitle>
                    <CardDescription>Manage text message notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Prescription Ready</Label>
                            <p className="text-sm text-muted-foreground">
                                SMS when prescription is ready
                            </p>
                        </div>
                        <Switch
                            checked={settings.smsPrescriptionReady}
                            onCheckedChange={(checked) => updateSetting('smsPrescriptionReady', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Order Updates</Label>
                            <p className="text-sm text-muted-foreground">
                                SMS for order status changes
                            </p>
                        </div>
                        <Switch
                            checked={settings.smsOrderUpdates}
                            onCheckedChange={(checked) => updateSetting('smsOrderUpdates', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Promotions</Label>
                            <p className="text-sm text-muted-foreground">
                                Special offers via SMS
                            </p>
                        </div>
                        <Switch
                            checked={settings.smsPromotions}
                            onCheckedChange={(checked) => updateSetting('smsPromotions', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Security Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                                Critical security notifications
                            </p>
                        </div>
                        <Switch
                            checked={settings.smsSecurityAlerts}
                            onCheckedChange={(checked) => updateSetting('smsSecurityAlerts', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BellIcon className="h-5 w-5" />
                        Push Notifications
                    </CardTitle>
                    <CardDescription>Manage browser and mobile app notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Prescription Ready</Label>
                            <p className="text-sm text-muted-foreground">
                                Push notification when ready
                            </p>
                        </div>
                        <Switch
                            checked={settings.pushPrescriptionReady}
                            onCheckedChange={(checked) => updateSetting('pushPrescriptionReady', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Order Updates</Label>
                            <p className="text-sm text-muted-foreground">
                                Real-time order notifications
                            </p>
                        </div>
                        <Switch
                            checked={settings.pushOrderUpdates}
                            onCheckedChange={(checked) => updateSetting('pushOrderUpdates', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Promotions</Label>
                            <p className="text-sm text-muted-foreground">
                                Special deals and offers
                            </p>
                        </div>
                        <Switch
                            checked={settings.pushPromotions}
                            onCheckedChange={(checked) => updateSetting('pushPromotions', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Security Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                                Immediate security notifications
                            </p>
                        </div>
                        <Switch
                            checked={settings.pushSecurityAlerts}
                            onCheckedChange={(checked) => updateSetting('pushSecurityAlerts', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
            </div>
        </div>
    );
}
