// src/lib/utils/common.ts

// DATE UTILITIES

export const dateUtils = {
  // Format date for display
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return dateUtils.formatDate(dateString);
  },

  // Format date and time
  formatDateTime: (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};

// ============================================================================
// STRING UTILITIES  
// ============================================================================

export const stringUtils = {
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Generate initials from name
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  },

  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Truncate text with ellipsis
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  },

  // Convert camelCase to Title Case
  camelToTitle: (str: string): string => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  },
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

export const performanceUtils = {
  // Debounce function for search inputs
  debounce: <T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const validationUtils = {
  // Check if value is empty (null, undefined, empty string, empty array)
  isEmpty: (value: unknown): boolean => {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value as object).length === 0;
    return false;
  },

  // Validate required field
  isRequired: (value: unknown): boolean => {
    return !validationUtils.isEmpty(value);
  },

  // Validate minimum length
  hasMinLength: (value: string, minLength: number): boolean => {
    return value.length >= minLength;
  },

  // Validate maximum length
  hasMaxLength: (value: string, maxLength: number): boolean => {
    return value.length <= maxLength;
  },

  // Validate number range
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },
};