// src/lib/utils/auth.ts  

import Cookies from 'js-cookie';
import { User, UserRole, UserListItem } from '@/types';
import { STORAGE_KEYS, COOKIE_OPTIONS, USER_ROLE_LABELS } from '@/constants';
 
// COOKIE MANAGEMENT 
 
export const cookieManager = {
  setToken: (token: string) => {
    Cookies.set(STORAGE_KEYS.TOKEN, token, COOKIE_OPTIONS.TOKEN);
  },
  getToken: (): string | undefined => {
    return Cookies.get(STORAGE_KEYS.TOKEN);
  },
  setRefreshToken: (refreshToken: string) => {
    Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS.REFRESH_TOKEN);
  },
  getRefreshToken: (): string | undefined => {
    return Cookies.get(STORAGE_KEYS.REFRESH_TOKEN);
  },
  setUser: (user: User) => {
    Cookies.set(STORAGE_KEYS.USER, JSON.stringify(user), COOKIE_OPTIONS.USER);
  },
  getUser: (): User | null => {
    const userJson = Cookies.get(STORAGE_KEYS.USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Failed to parse user from cookie:', error);
      Cookies.remove(STORAGE_KEYS.USER);
      return null;
    }
  },
  clearAll: () => {
    Cookies.remove(STORAGE_KEYS.TOKEN);
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Cookies.remove(STORAGE_KEYS.USER);
  },
  setAuthData: (token: string, refreshToken: string, user: User) => {
    cookieManager.setToken(token);
    cookieManager.setRefreshToken(refreshToken);
    cookieManager.setUser(user);
  },
};

// ROLE UTILITIES - UPDATED to match backend exactly

const PRIMARY_SUPER_ADMIN_EMAIL = "ankitjakharabc@gmail.com";

export const roleUtils = {
  // Basic role checks
  isAdmin: (user: User | null): boolean => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN;
  },
  isSuperAdmin: (user: User | null): boolean => {
    return user?.role === UserRole.SUPERADMIN;
  },
  hasRole: (user: User | null, role: UserRole): boolean => {
    return user?.role === role;
  },
  canAccessAdmin: (user: User | null): boolean => {
    return roleUtils.isAdmin(user);
  },
  hasRoleOrHigher: (user: User | null, minimumRole: UserRole): boolean => {
    if (!user) return false;
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPERADMIN]: 3,
    };
    return roleHierarchy[user.role] >= roleHierarchy[minimumRole];
  },
  formatRole: (role: UserRole): string => {
    return USER_ROLE_LABELS[role] || role;
  },
  hasAnyRole: (user: User | null, roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  },

  // Check if user is Primary SuperAdmin - ADDED
  isPrimarySuperAdmin: (user: User | null): boolean => {
    return user?.email === PRIMARY_SUPER_ADMIN_EMAIL && user?.role === UserRole.SUPERADMIN;
  },

  // ROLE VALIDATION - Updated to match backend business rules exactly
  canChangeRole: (currentUser: User | null, targetUser: UserListItem): boolean => {
    if (!currentUser) return false;
    
    // Only SUPERADMIN can change roles (Admins have ZERO role permissions)
    if (currentUser.role !== UserRole.SUPERADMIN) return false;
    
    // Cannot change your own role
    if (currentUser.id === targetUser.id) return false;
    
    // Primary SuperAdmin protection - cannot be modified by anyone
    if (targetUser.email === PRIMARY_SUPER_ADMIN_EMAIL) return false;
    
    // SuperAdmins cannot change other SuperAdmins (except Primary can change all)
    if (targetUser.role === UserRole.SUPERADMIN && !roleUtils.isPrimarySuperAdmin(currentUser)) {
      return false;
    }
    
    return true;
  },

  // UPDATED: Role assignment logic based on Primary SuperAdmin status
  getAvailableRoles: (currentUser: User | null, targetUser: UserListItem): UserRole[] => {
    if (!roleUtils.canChangeRole(currentUser, targetUser)) return [];
    
    // Primary SuperAdmin can assign all roles (including creating SuperAdmins)
    if (roleUtils.isPrimarySuperAdmin(currentUser)) {
      return [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN];
    }
    
    // Regular SuperAdmin can only assign USER and ADMIN roles
    return [UserRole.USER, UserRole.ADMIN];
  },

  // UPDATED: Validation includes SuperAdmin creation check
  validateRoleChange: (
    currentUser: User | null, 
    targetUser: UserListItem, 
    newRole: UserRole
  ): { isValid: boolean; error?: string } => {
    if (!currentUser) {
      return { isValid: false, error: 'User not authenticated' };
    }

    // Admins have ZERO role management permissions
    if (currentUser.role === UserRole.ADMIN) {
      return { isValid: false, error: 'Admins do not have permission to modify user roles' };
    }

    if (!roleUtils.canChangeRole(currentUser, targetUser)) {
      return { isValid: false, error: 'You do not have permission to change this user\'s role' };
    }

    // Only Primary SuperAdmin can create SuperAdmins
    if (newRole === UserRole.SUPERADMIN && !roleUtils.isPrimarySuperAdmin(currentUser)) {
      return { isValid: false, error: 'Only Primary Super Admin can create Super Admins' };
    }

    const availableRoles = roleUtils.getAvailableRoles(currentUser, targetUser);
    if (!availableRoles.includes(newRole)) {
      return { isValid: false, error: `You cannot assign the role ${newRole}` };
    }

    if (targetUser.role === newRole) {
      return { isValid: false, error: 'User already has this role' };
    }

    return { isValid: true };
  },

  // Helper functions for role change descriptions
  getRoleChangeDescription: (oldRole: UserRole, newRole: UserRole): string => {
    const roleNames = {
      [UserRole.USER]: 'User',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.SUPERADMIN]: 'Super Admin'
    };
    return `Change from ${roleNames[oldRole]} to ${roleNames[newRole]}`;
  },

  isPromotion: (oldRole: UserRole, newRole: UserRole): boolean => {
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPERADMIN]: 3,
    };
    return roleHierarchy[newRole] > roleHierarchy[oldRole];
  },

  isDemotion: (oldRole: UserRole, newRole: UserRole): boolean => {
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPERADMIN]: 3,
    };
    return roleHierarchy[newRole] < roleHierarchy[oldRole];
  },

  getRoleChangeImpact: (oldRole: UserRole, newRole: UserRole): string => {
    if (roleUtils.isPromotion(oldRole, newRole)) {
      if (oldRole === UserRole.USER && newRole === UserRole.ADMIN) {
        return 'This user will gain access to admin features including question management, solution creation, and analytics page.';
      }
      if (newRole === UserRole.SUPERADMIN) {
        return 'This user will gain full system access including user role management and system settings.';
      }
    }
    if (roleUtils.isDemotion(oldRole, newRole)) {
      if (oldRole === UserRole.ADMIN && newRole === UserRole.USER) {
        return 'This user will lose admin privileges and will only have access to basic user features.';
      }
      if (oldRole === UserRole.SUPERADMIN) {
        return 'This user will lose SuperAdmin privileges and associated system access.';
      }
    }
    return 'Role change will update user permissions accordingly.';
  },

  getRolePermissions: (role: UserRole): string[] => {
    switch (role) {
      case UserRole.USER:
        return [
          'View and solve questions',
          'Create personal approaches',
          'Track personal progress',
          'Access solutions after solving',
        ];
      case UserRole.ADMIN:
        return [
          'All user permissions',
          'Create and manage questions',
          'Create official solutions',
          'View analytics page',
          'Manage categories',
          'View user progress data',
          'NO role management permissions',
        ];
      case UserRole.SUPERADMIN:
        return [
          'All admin permissions',
          'Manage user roles (USER ↔ ADMIN only)',
          'Access system settings',
          'View system health metrics',
          'Manage admin accounts',
          'Full platform control',
          '(Primary SuperAdmin: Can create SuperAdmins)',
        ];
      default:
        return [];
    }
  }
};