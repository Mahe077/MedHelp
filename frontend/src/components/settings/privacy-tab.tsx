"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lock, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/settings";
import type { PrivacySettings } from "@/lib/api/types";

export function PrivacyTab() {
    const [settings, setSettings] = useState<PrivacySettings>({
        shareDataWithPartners: false,
        marketingCommunications: false,
        profileVisibility: true,
        showOnlineStatus: true,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsApi.getPrivacySettings();
                console.log(data);
                setSettings(data);
            } catch (error) {
                toast.error("Failed to load privacy settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await settingsApi.updatePrivacySettings(settings);
            toast.success("Privacy settings saved");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to save settings";
            toast.error(errorMessage);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await settingsApi.exportData();
            toast.success(response.message);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to request data export";
            toast.error(errorMessage);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await settingsApi.deleteAccount();
            toast.success("Account deletion requested");
            // Redirect to login or home page
            window.location.href = "/auth/login";
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to delete account";
            toast.error(errorMessage);
        }
    };

    const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Data Sharing */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Data Sharing & Privacy
                    </CardTitle>
                    <CardDescription>Control how your data is used and shared</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Share Data with Partners</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow sharing anonymized data with healthcare partners
                            </p>
                        </div>
                        <Switch
                            checked={settings.shareDataWithPartners}
                            onCheckedChange={(checked) => updateSetting('shareDataWithPartners', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Marketing Communications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive personalized offers and recommendations
                            </p>
                        </div>
                        <Switch
                            checked={settings.marketingCommunications}
                            onCheckedChange={(checked) => updateSetting('marketingCommunications', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Profile Visibility</Label>
                            <p className="text-sm text-muted-foreground">
                                Make your profile visible to other users
                            </p>
                        </div>
                        <Switch
                            checked={settings.profileVisibility}
                            onCheckedChange={(checked) => updateSetting('profileVisibility', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Online Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Let others see when you're online
                            </p>
                        </div>
                        <Switch
                            checked={settings.showOnlineStatus}
                            onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Data Management
                    </CardTitle>
                    <CardDescription>Download or delete your personal data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label>Export Your Data</Label>
                            <p className="text-sm text-muted-foreground">
                                Download a copy of your personal information
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleExportData}>
                            <Download className="h-4 w-4 mr-2" />
                            Request Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>Irreversible actions that affect your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-destructive">Delete Account</Label>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all associated data
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account
                                        and remove all your data from our servers including:
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Personal information</li>
                                            <li>Prescription history</li>
                                            <li>Order history</li>
                                            <li>Saved preferences</li>
                                        </ul>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Yes, delete my account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Privacy Settings</Button>
            </div>
        </div>
    );
}
