Settings Backend Implementation - Walkthrough
Overview
Successfully implemented comprehensive backend API for user settings functionality including profile management, password changes, user preferences, notification settings, and privacy controls.

What Was Implemented
1. Database Models (Entities)
Created three new JPA entities to store user settings:

UserPreferences.java
Stores language, timezone, date/time format, theme preferences
One-to-one relationship with User
Default values: English, America/New_York timezone, MM/DD/YYYY date format, 12h time format, light theme
NotificationSettings.java
Stores notification preferences for email, SMS, and push channels
Covers prescription ready, order updates, promotions, newsletter, and security alerts
One-to-one relationship with User
Sensible defaults: security alerts enabled, promotions disabled
PrivacySettings.java
Stores privacy preferences: data sharing, marketing communications, profile visibility, online status
One-to-one relationship with User
Privacy-first defaults: data sharing and marketing disabled, visibility enabled
Updated 
User.java
Added country field (VARCHAR 100)
Added profilePicture field (VARCHAR 500)
2. Data Transfer Objects (DTOs)
Created 5 new DTOs with comprehensive validation:

UpdateProfileRequest.java
Validates profile update requests
Fields: firstName, lastName, email, phone, dateOfBirth, gender, address, city, state, postalCode, country, profilePicture
Includes size constraints and email validation
UpdatePasswordRequest.java
Validates password change requests
Requires current password, new password (min 8 chars), and confirmation
Enforces password matching in service layer
UserPreferencesRequest.java
Validates preference updates
All fields required with size constraints
NotificationSettingsRequest.java
Validates notification settings (12 boolean fields)
All fields required (not null)
PrivacySettingsRequest.java
Validates privacy settings (4 boolean fields)
All fields required (not null)
Updated 
UserResponse.java
Added country and profilePicture fields
3. Repositories
Created 3 JPA repositories with custom query methods:

UserPreferencesRepository.java
NotificationSettingsRepository.java
PrivacySettingsRepository.java
Each repository includes:

findByUserId(Long userId)
 - Find settings by user ID
deleteByUserId(Long userId)
 - Delete settings by user ID (for account deletion)
4. Services
Created 3 new service classes and extended 2 existing ones:

UserPreferencesService.java
getUserPreferences(Long userId)
 - Get or create default preferences
updatePreferences(Long userId, UserPreferencesRequest)
 - Update preferences
createDefaultPreferences(Long userId)
 - Create defaults for new users
deleteUserPreferences(Long userId)
 - Delete preferences
NotificationSettingsService.java
getNotificationSettings(Long userId)
 - Get or create default settings
updateNotificationSettings(Long userId, NotificationSettingsRequest)
 - Update settings
createDefaultSettings(Long userId)
 - Create defaults for new users
deleteNotificationSettings(Long userId)
 - Delete settings
PrivacySettingsService.java
getPrivacySettings(Long userId)
 - Get or create default settings
updatePrivacySettings(Long userId, PrivacySettingsRequest)
 - Update settings
createDefaultSettings(Long userId)
 - Create defaults for new users
deletePrivacySettings(Long userId)
 - Delete settings
Extended 
UserService.java
updateProfile(User, UpdateProfileRequest)
 - Update user profile with null-safe field updates
deleteAccount(User)
 - Soft delete account (disables and locks account, deletes all settings)
exportUserData(User)
 - Export user data (placeholder for GDPR compliance)
Updated 
AuthenticationService.java
Updated 
changePassword
 to use 
UpdatePasswordRequest
 with password confirmation validation
Updated 
mapToUserResponse
 to include country and profilePicture fields
5. Controller Endpoints
Completely rewrote 
UserController.java
 with 10 endpoints:

Method	Endpoint	Description
GET	/api/v1/users/me	Get current user profile
PUT	/api/v1/users/profile	Update user profile
PUT	/api/v1/users/password	Change password
GET	/api/v1/users/preferences	Get user preferences
PUT	/api/v1/users/preferences	Update user preferences
GET	/api/v1/users/notifications	Get notification settings
PUT	/api/v1/users/notifications	Update notification settings
GET	/api/v1/users/privacy	Get privacy settings
PUT	/api/v1/users/privacy	Update privacy settings
POST	/api/v1/users/export-data	Request data export
DELETE	/api/v1/users/account	Delete account (soft delete)
All endpoints:

Require authentication (@AuthenticationPrincipal)
Use @Valid for request validation
Return appropriate response DTOs
Include proper error handling
6. Database Migration
Created 
V4__create_user_settings_tables.sql
:

Schema Changes:

Added columns to users table:

country VARCHAR(100)
profile_picture VARCHAR(500)
Created user_preferences table:

One-to-one with users
Stores language, timezone, date/time format, theme, default branch
Foreign key to branches table for default branch
Created notification_settings table:

One-to-one with users
12 boolean columns for email/SMS/push notifications
Created privacy_settings table:

One-to-one with users
4 boolean columns for privacy preferences
Created indexes:

idx_user_preferences_user_id
idx_notification_settings_user_id
idx_privacy_settings_user_id
All tables include:

CASCADE delete on user deletion
created_at and updated_at timestamps
Proper constraints and defaults
Verification Results
✅ Backend Compilation
docker compose -f docker/docker.compose.dev.yml exec backend mvn compile -DskipTests
Result: BUILD SUCCESS - All code compiles without errors

✅ Database Migration
The backend was restarted to apply the Flyway migration V4. The migration will:

Add new columns to existing users table
Create three new tables with proper relationships
Create indexes for performance
Testing Instructions
1. Start the Backend
docker compose -f docker/docker.compose.dev.yml up -d backend
2. Test Endpoints with curl
Get Current User:

curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
Update Profile:

curl -X PUT http://localhost:8080/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "country": "USA"
  }'
Change Password:

curl -X PUT http://localhost:8080/api/v1/users/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
Get/Update Preferences:

# Get preferences
curl -X GET http://localhost:8080/api/v1/users/preferences \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
# Update preferences
curl -X PUT http://localhost:8080/api/v1/users/preferences \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "timezone": "America/New_York",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "theme": "dark"
  }'
Get/Update Notification Settings:

# Get notification settings
curl -X GET http://localhost:8080/api/v1/users/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
# Update notification settings
curl -X PUT http://localhost:8080/api/v1/users/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailPrescriptionReady": true,
    "emailOrderUpdates": true,
    "emailPromotions": false,
    "emailNewsletter": true,
    "emailSecurityAlerts": true,
    "smsPrescriptionReady": true,
    "smsOrderUpdates": false,
    "smsPromotions": false,
    "smsSecurityAlerts": true,
    "pushPrescriptionReady": true,
    "pushOrderUpdates": true,
    "pushPromotions": false,
    "pushSecurityAlerts": true
  }'
Get/Update Privacy Settings:

# Get privacy settings
curl -X GET http://localhost:8080/api/v1/users/privacy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
# Update privacy settings
curl -X PUT http://localhost:8080/api/v1/users/privacy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shareDataWithPartners": false,
    "marketingCommunications": false,
    "profileVisibility": true,
    "showOnlineStatus": true
  }'
Frontend Integration
The frontend settings tabs are already implemented and ready to integrate:

profile-tab.tsx
security-tab.tsx
notifications-tab.tsx
privacy-tab.tsx
preferences-tab.tsx
Each tab has TODO comments where API calls should be added. Simply replace the TODO comments with actual API calls using the endpoints documented above.

Summary
✅ 3 Entity Models - UserPreferences, NotificationSettings, PrivacySettings
✅ 3 Repositories - With custom query methods
✅ 5 DTOs - With comprehensive validation
✅ 3 Service Classes - With CRUD operations and default creation
✅ Extended Services - UserService and AuthenticationService
✅ 10 API Endpoints - Full CRUD for all settings
✅ Database Migration - V4 with 3 new tables and 2 new columns
✅ Backend Compilation - Successful build
✅ Lint Errors - All fixed

The backend is now ready for frontend integration and testing!

