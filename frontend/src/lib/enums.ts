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
    username: string
    email: string
    fullname: string
    phone: string
    dateOfBirth: Date
    gender: string
    address: string
    city: string
    state: string
    postalCode: string
    employeeId: string
    licenseNumber: string
    licenseExpiry: Date
    qualification: string
    specialization: string
    yearsOfExperience: number
    dateOfJoining: Date
    branchId: string
    branchName: string
    roles: string[]
    status: keyof UserStatus
    isEmailVerified: boolean
    isPhoneVerified: boolean
    twoFactorEnabled: boolean
    lastLogin: Date | null
    profileImageUrl: string | null
    createdAt: Date
    updatedAt: Date
    userType: keyof UserType
    customerId: string | null
    loyaltyCardNumber: string | null
    loyaltyPoints: number | null
    memberSince: Date | null
    permissions: string[]
}