// src/app/admin/settings/page.tsx - Settings page (Super Admin only)
'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/useAdminData';
import { SystemSettings } from '@/types';

function SettingsSection({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading, error } = useSystemSettings();
  const updateMutation = useUpdateSystemSettings();
  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(null);

  // Update local settings when server data loads
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = () => {
    if (localSettings) {
      updateMutation.mutate(localSettings);
    }
  };

  const updateSetting = (section: string, key: string, value: unknown) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      [section]: {
        ...(localSettings[section as keyof SystemSettings] as Record<string, unknown>),
        [key]: value
      }
    });
  };

  if (isLoading) {
    return (
      <AdminLayout requireSuperAdmin>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !localSettings) {
    return (
      <AdminLayout requireSuperAdmin>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Settings</h3>
            <p className="text-red-700">{error?.message || 'Failed to load system settings'}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout requireSuperAdmin>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure global platform settings and preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Site Settings */}
          <SettingsSection
            title="Site Settings"
            description="Basic configuration for your platform"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={localSettings.site.siteName}
                  onChange={(e) => updateSetting('site', 'siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={localSettings.site.contactEmail}
                  onChange={(e) => updateSetting('site', 'contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  rows={3}
                  value={localSettings.site.siteDescription}
                  onChange={(e) => updateSetting('site', 'siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.site.maintenanceMode}
                    onChange={(e) => updateSetting('site', 'maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Maintenance Mode
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  When enabled, the site will display a maintenance message to users.
                </p>
              </div>
            </div>
          </SettingsSection>

          {/* User Settings */}
          <SettingsSection
            title="User Settings"
            description="Configure user registration and account settings"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users Per Day
                  </label>
                  <input
                    type="number"
                    value={localSettings.users.maxUsersPerDay}
                    onChange={(e) => updateSetting('users', 'maxUsersPerDay', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default User Role
                  </label>
                  <select
                    value={localSettings.users.defaultUserRole}
                    onChange={(e) => updateSetting('users', 'defaultUserRole', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.users.allowRegistration}
                    onChange={(e) => updateSetting('users', 'allowRegistration', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Allow New Registrations
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.users.requireEmailVerification}
                    onChange={(e) => updateSetting('users', 'requireEmailVerification', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Require Email Verification
                  </label>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Security Settings */}
          <SettingsSection
            title="Security Settings"
            description="Configure authentication and security options"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  value={localSettings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 24)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={localSettings.security.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="sm:col-span-2 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.security.allowOAuth}
                    onChange={(e) => updateSetting('security', 'allowOAuth', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Allow OAuth Login
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.security.requireTwoFactor}
                    onChange={(e) => updateSetting('security', 'requireTwoFactor', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Require Two-Factor Authentication
                  </label>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* API Settings */}
          <SettingsSection
            title="API Settings"
            description="Configure API limits and documentation access"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Limit (requests/hour)
                </label>
                <input
                  type="number"
                  value={localSettings.api.rateLimitPerHour}
                  onChange={(e) => updateSetting('api', 'rateLimitPerHour', parseInt(e.target.value) || 1000)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={localSettings.api.apiTimeout}
                  onChange={(e) => updateSetting('api', 'apiTimeout', parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={localSettings.api.maxFileSize}
                  onChange={(e) => updateSetting('api', 'maxFileSize', parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.api.enableApiDocs}
                  onChange={(e) => updateSetting('api', 'enableApiDocs', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable API Documentation
                </label>
              </div>
            </div>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection
            title="Notification Settings"
            description="Configure system and user notifications"
          >
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.emailNotifications}
                  onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.systemAlerts}
                  onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  System Alerts
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.userWelcomeEmail}
                  onChange={(e) => updateSetting('notifications', 'userWelcomeEmail', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  User Welcome Emails
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.adminNotifications}
                  onChange={(e) => updateSetting('notifications', 'adminNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Admin Notifications
                </label>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}