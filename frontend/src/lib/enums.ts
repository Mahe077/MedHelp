export interface Permission {
    id: string
    name: string
}

export interface Role {
    id: string
    name: string
    permissions: Permission[]
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    LOCKED = "LOCKED",
    TERMINATED = "TERMINATED",
}

export enum UserRole {
    ADMIN = "ADMIN",
}

export enum UserType {
    INTERNAL = "INTERNAL",
    EXTERNAL = "EXTERNAL",
}

export interface User {
    id: string
    email: string
    roles: string[]
    permissions: string[]
    branchName: string
    userType: UserType
    isTwoFactorEnabled: boolean
    firstName: string
    lastName: string
    phone: string
    dateOfBirth: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    profilePicture: string
    // ... other fields can remain or be optional if not returned by /me yet
}