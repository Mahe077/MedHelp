import apiClient from './client';
import type {
  UpdateProfileRequest,
  UpdatePasswordRequest,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  MessageResponse,
} from './types';
import type { User } from '@/lib/enums';

/**
 * Settings API Service
 * Centralized API calls for user settings management
 */
export const settingsApi = {
  // Profile Management
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: UpdatePasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.put('/users/password', data);
    return response.data;
  },

  // User Preferences
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get('/users/preferences');
    return response.data;
  },

  updatePreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await apiClient.put('/users/preferences', data);
    return response.data;
  },

  // Notification Settings
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await apiClient.get('/users/notifications');
    return response.data;
  },

  updateNotificationSettings: async (data: NotificationSettings): Promise<NotificationSettings> => {
    const response = await apiClient.put('/users/notifications', data);
    return response.data;
  },

  // Privacy Settings
  getPrivacySettings: async (): Promise<PrivacySettings> => {
    const response = await apiClient.get('/users/privacy');
    return response.data;
  },

  updatePrivacySettings: async (data: PrivacySettings): Promise<PrivacySettings> => {
    const response = await apiClient.put('/users/privacy', data);
    return response.data;
  },

  // Data Management
  exportData: async (): Promise<MessageResponse> => {
    const response = await apiClient.post('/users/export-data');
    return response.data;
  },

  deleteAccount: async (): Promise<MessageResponse> => {
    const response = await apiClient.delete('/users/account');
    return response.data;
  },
};
