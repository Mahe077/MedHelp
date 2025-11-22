"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe, Clock, Calendar, Palette, MapPin } from "lucide-react";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/settings";
import type { UserPreferences } from "@/lib/api/types";

export function PreferencesTab() {
    const [preferences, setPreferences] = useState<UserPreferences>({
        language: "en",
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        theme: "light",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const data = await settingsApi.getPreferences();
                setPreferences(data);
            } catch (error) {
                toast.error("Failed to load preferences");
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, []);

    const handleSave = async () => {
        try {
            await settingsApi.updatePreferences(preferences);
            toast.success("Preferences saved successfully");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to save preferences";
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Language & Region */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Language & Region
                    </CardTitle>
                    <CardDescription>Set your language and regional preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={preferences.language}
                            onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                        >
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="zh">Chinese</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                            value={preferences.timezone}
                            onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                        >
                            <SelectTrigger id="timezone">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Date & Time Format */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Date & Time Format
                    </CardTitle>
                    <CardDescription>Customize how dates and times are displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <Select
                            value={preferences.dateFormat}
                            onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                        >
                            <SelectTrigger id="dateFormat">
                                <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                                <SelectItem value="DD MMM YYYY">DD MMM YYYY (31 Dec 2024)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Time Format</Label>
                        <RadioGroup
                            value={preferences.timeFormat}
                            onValueChange={(value) => setPreferences({ ...preferences, timeFormat: value })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="12h" id="12h" />
                                <Label htmlFor="12h" className="font-normal cursor-pointer">
                                    12-hour (2:30 PM)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="24h" id="24h" />
                                <Label htmlFor="24h" className="font-normal cursor-pointer">
                                    24-hour (14:30)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance
                    </CardTitle>
                    <CardDescription>Customize the look and feel of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <RadioGroup
                            value={preferences.theme}
                            onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="light" id="light" />
                                <Label htmlFor="light" className="font-normal cursor-pointer">
                                    Light
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="dark" id="dark" />
                                <Label htmlFor="dark" className="font-normal cursor-pointer">
                                    Dark
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="system" id="system" />
                                <Label htmlFor="system" className="font-normal cursor-pointer">
                                    System (auto)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
            </Card>

            {/* Default Branch */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Default Branch
                    </CardTitle>
                    <CardDescription>Set your preferred pharmacy branch</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="defaultBranch">Preferred Branch</Label>
                        <Select
                            value={preferences.defaultBranchId?.toString() || ""}
                            onValueChange={(value) => setPreferences({ ...preferences, defaultBranchId: value ? parseInt(value) : undefined })}
                        >
                            <SelectTrigger id="defaultBranch">
                                <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="branch1">Main Street Pharmacy</SelectItem>
                                <SelectItem value="branch2">Downtown Pharmacy</SelectItem>
                                <SelectItem value="branch3">Westside Pharmacy</SelectItem>
                                <SelectItem value="branch4">Eastside Pharmacy</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            This branch will be selected by default for prescriptions and orders
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
            </div>
        </div>
    );
}
