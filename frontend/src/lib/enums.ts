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

export interface UserType {
    CUSTOMER: "CUSTOMER"
    EMPLOYEE: "EMPLOYEE"
}

export interface User {
    id: string
    email: string
    roles: string[]
    permissions: string[]
    branchName: string
    userType: "INTERNAL" | "EXTERNAL"
    isTwoFactorEnabled: boolean
    // ... other fields can remain or be optional if not returned by /me yet
}