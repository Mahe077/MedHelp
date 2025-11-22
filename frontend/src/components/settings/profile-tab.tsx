"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, X } from "lucide-react";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/settings";

export function ProfileTab() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        dateOfBirth: user?.dateOfBirth || "",
        address: user?.address || "",
        city: user?.city || "",
        state: user?.state || "",
        postalCode: user?.postalCode || "",
    });

    const handleSave = async () => {
        try {
            const updatedUser = await settingsApi.updateProfile(formData);

            // Update local user state if needed (you might want to update auth context)
            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to update profile";
            toast.error(errorMessage);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
            dateOfBirth: user?.dateOfBirth || "",
            address: user?.address || "",
            city: user?.city || "",
            state: user?.state || "",
            postalCode: user?.postalCode || "",
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            {/* Profile Picture */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Update your profile photo</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback className="text-2xl">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                            <Camera className="h-4 w-4 mr-2" />
                            Upload Photo
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG or GIF. Max size 2MB.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details</CardDescription>
                        </div>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                Edit
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                                id="postalCode"
                                value={formData.postalCode}
                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                            <Button onClick={handleCancel} variant="outline">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
