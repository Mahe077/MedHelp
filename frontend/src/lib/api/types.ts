// Settings API Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  profilePicture?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserPreferences {
  id?: number;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  theme: string;
  defaultBranchId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationSettings {
  id?: number;
  // Email notifications
  emailPrescriptionReady: boolean;
  emailOrderUpdates: boolean;
  emailPromotions: boolean;
  emailNewsletter: boolean;
  emailSecurityAlerts: boolean;
  // SMS notifications
  smsPrescriptionReady: boolean;
  smsOrderUpdates: boolean;
  smsPromotions: boolean;
  smsSecurityAlerts: boolean;
  // Push notifications
  pushPrescriptionReady: boolean;
  pushOrderUpdates: boolean;
  pushPromotions: boolean;
  pushSecurityAlerts: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrivacySettings {
  id?: number;
  shareDataWithPartners: boolean;
  marketingCommunications: boolean;
  profileVisibility: boolean;
  showOnlineStatus: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageResponse {
  message: string;
}
