"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Key, Smartphone, Monitor, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/settings";

export function SecurityTab() {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const activeSessions = [
        { id: 1, device: "Chrome on Windows", location: "New York, US", lastActive: "Active now", current: true },
        { id: 2, device: "Safari on iPhone", location: "New York, US", lastActive: "2 hours ago", current: false },
    ];

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            await settingsApi.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });
            toast.success("Password changed successfully");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to change password";
            toast.error(errorMessage);
        }
    };

    const handleToggle2FA = async () => {
        try {
            // TODO: API call to toggle 2FA
            setTwoFactorEnabled(!twoFactorEnabled);
            toast.success(twoFactorEnabled ? "2FA disabled" : "2FA enabled");
        } catch (error) {
            toast.error("Failed to update 2FA settings");
        }
    };

    const handleRevokeSession = async (sessionId: number) => {
        try {
            // TODO: API call to revoke session
            toast.success("Session revoked successfully");
        } catch (error) {
            toast.error("Failed to revoke session");
        }
    };

    return (
        <div className="space-y-6">
            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>Update your password regularly to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleChangePassword}>Update Password</Button>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable 2FA</Label>
                            <p className="text-sm text-muted-foreground">
                                Require a verification code in addition to your password
                            </p>
                        </div>
                        <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
                    </div>
                    {twoFactorEnabled && (
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Scan the QR code with your authenticator app or enter the setup key manually.
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                                <Smartphone className="h-4 w-4 mr-2" />
                                Setup Authenticator
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Active Sessions
                    </CardTitle>
                    <CardDescription>Manage devices where you're currently logged in</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activeSessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{session.device}</p>
                                        {session.current && <Badge variant="secondary">Current</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{session.location}</p>
                                    <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                                </div>
                                {!session.current && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRevokeSession(session.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
