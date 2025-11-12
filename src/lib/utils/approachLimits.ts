// src/lib/utils/approachLimits.ts

import { APPROACH_VALIDATION } from '@/constants';
import type { ApproachDTO, ApproachLimitsResponse, ApproachSizeUsage } from '@/types';

/**
 * Centralized approach limit calculations
 * This ensures consistency across all components
 */
export class ApproachLimitCalculator {
  
  /**
   * Calculate the byte size of content (text + code)
   */
  static calculateContentSize(textContent: string, codeContent: string = ''): number {
    const textBytes = new TextEncoder().encode(textContent || '').length;
    const codeBytes = new TextEncoder().encode(codeContent || '').length;
    return textBytes + codeBytes;
  }

  /**
   * Calculate size usage for a user on a specific question
   */
  static calculateSizeUsage(
    existingApproaches: ApproachDTO[],
    excludeApproachId?: string
  ): ApproachSizeUsage {
    // Filter out the approach being updated if excludeApproachId is provided
    const relevantApproaches = existingApproaches.filter(
      approach => !excludeApproachId || approach.id !== excludeApproachId
    );

    const totalUsed = relevantApproaches.reduce(
      (sum, approach) => sum + approach.contentSize, 
      0
    );

    const maxAllowed = APPROACH_VALIDATION.MAX_TOTAL_SIZE_PER_USER_PER_QUESTION;
    const remaining = Math.max(0, maxAllowed - totalUsed);
    const usagePercentage = (totalUsed / maxAllowed) * 100;

    return {
      totalUsed,
      totalUsedKB: totalUsed / 1024,
      remaining,
      remainingKB: remaining / 1024,
      maxAllowed,
      maxAllowedKB: maxAllowed / 1024,
      usagePercentage,
      approachCount: relevantApproaches.length,
      maxApproaches: APPROACH_VALIDATION.MAX_APPROACHES_PER_QUESTION,
    };
  }

  /**
   * Check if user can add/update an approach with given content
   */
  static checkApproachLimits(
    existingApproaches: ApproachDTO[],
    newTextContent: string,
    newCodeContent: string = '',
    excludeApproachId?: string
  ): ApproachLimitsResponse {
    // Calculate current usage (excluding the approach being updated)
    const sizeUsage = this.calculateSizeUsage(existingApproaches, excludeApproachId);
    
    // Calculate size of new content
    const newContentSize = this.calculateContentSize(newTextContent, newCodeContent);
    
    // Calculate total size after adding/updating
    const totalSizeAfterUpdate = sizeUsage.totalUsed + newContentSize;
    
    // Check count limits
    const canAddCount = sizeUsage.approachCount < APPROACH_VALIDATION.MAX_APPROACHES_PER_QUESTION;
    const remainingCount = Math.max(0, APPROACH_VALIDATION.MAX_APPROACHES_PER_QUESTION - sizeUsage.approachCount);
    
    // Check size limits
    const canAddSize = totalSizeAfterUpdate <= APPROACH_VALIDATION.MAX_TOTAL_SIZE_PER_USER_PER_QUESTION;
    const remainingBytes = Math.max(0, APPROACH_VALIDATION.MAX_TOTAL_SIZE_PER_USER_PER_QUESTION - totalSizeAfterUpdate);

    return {
      canAdd: canAddCount && canAddSize,
      canAddCount,
      canAddSize,
      currentCount: sizeUsage.approachCount,
      maxCount: APPROACH_VALIDATION.MAX_APPROACHES_PER_QUESTION,
      remainingCount,
      currentSize: sizeUsage.totalUsed,
      newSize: newContentSize,
      totalSizeAfterUpdate,
      maxAllowedSize: APPROACH_VALIDATION.MAX_TOTAL_SIZE_PER_USER_PER_QUESTION,
      remainingBytes,
    };
  }

  /**
   * Get approach submission status with user-friendly messages
   */
  static getSubmissionStatus(
    existingApproaches: ApproachDTO[],
    textContent: string,
    codeContent: string = '',
    excludeApproachId?: string
  ): {
    canSubmit: boolean;
    message: string;
    type: 'info' | 'warning' | 'error' | 'loading';
  } {
    // Validate content first
    if (!textContent.trim() && !codeContent.trim()) {
      return {
        canSubmit: false,
        message: 'Please provide some content before submitting.',
        type: 'error',
      };
    }

    if (textContent.trim().length < APPROACH_VALIDATION.TEXT_MIN_LENGTH && 
        codeContent.trim().length < APPROACH_VALIDATION.TEXT_MIN_LENGTH) {
      return {
        canSubmit: false,
        message: `Content must be at least ${APPROACH_VALIDATION.TEXT_MIN_LENGTH} characters long.`,
        type: 'error',
      };
    }

    const limits = this.checkApproachLimits(
      existingApproaches,
      textContent,
      codeContent,
      excludeApproachId
    );

    // No approaches yet - show encouragement
    if (limits.currentCount === 0) {
      const remainingKB = (limits.remainingBytes / 1024).toFixed(1);
      return {
        canSubmit: true,
        message: `Ready to submit! ${limits.maxCount} approaches, ${remainingKB}KB available.`,
        type: 'info',
      };
    }

    // Check if we can add more approaches
    if (!limits.canAdd) {
      if (!limits.canAddCount) {
        return {
          canSubmit: false,
          message: `Maximum ${limits.maxCount} approaches reached for this question.`,
          type: 'error',
        };
      }
      if (!limits.canAddSize) {
        const remainingKB = (limits.remainingBytes / 1024).toFixed(1);
        const newSizeKB = (limits.newSize / 1024).toFixed(1);
        return {
          canSubmit: false,
          message: `Content too large (${newSizeKB}KB). Only ${remainingKB}KB remaining.`,
          type: 'error',
        };
      }
    }

    // Can still add - show current usage
    const remainingKB = (limits.remainingBytes / 1024).toFixed(1);
    const usedKB = ((limits.maxAllowedSize - limits.remainingBytes) / 1024).toFixed(1);
    const totalKB = (limits.maxAllowedSize / 1024).toFixed(0);
    
    // Warning if getting close to limits
    const sizeWarningThreshold = limits.maxAllowedSize * 0.8; // 80% threshold
    const countWarningThreshold = limits.maxCount - 1; // 1 remaining

    if (limits.totalSizeAfterUpdate > sizeWarningThreshold || limits.currentCount >= countWarningThreshold) {
      return {
        canSubmit: true,
        message: `${limits.currentCount}/${limits.maxCount} approaches used. ${usedKB}KB/${totalKB}KB used (${remainingKB}KB remaining)`,
        type: 'warning',
      };
    }

    return {
      canSubmit: true,
      message: `${limits.currentCount}/${limits.maxCount} approaches used. ${usedKB}KB/${totalKB}KB used (${remainingKB}KB remaining)`,
      type: 'info',
    };
  }

  /**
   * Format size for display
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} bytes`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  /**
   * Get percentage usage with color coding
   */
  static getUsageColor(percentage: number): {
    bg: string;
    text: string;
    bar: string;
  } {
    if (percentage >= 90) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-300',
        bar: 'bg-red-600',
      };
    } else if (percentage >= 70) {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-800 dark:text-yellow-300',
        bar: 'bg-yellow-600',
      };
    } else {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-800 dark:text-blue-300',
        bar: 'bg-blue-600',
      };
    }
  }

  /**
   * Validate approach content
   */
  static validateContent(textContent: string, codeContent: string = ''): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check minimum length
    if (!textContent.trim() && !codeContent.trim()) {
      errors.push('Either description or code content is required.');
    }

    if (textContent.trim().length > 0 && textContent.trim().length < APPROACH_VALIDATION.TEXT_MIN_LENGTH) {
      errors.push(`Description must be at least ${APPROACH_VALIDATION.TEXT_MIN_LENGTH} characters long.`);
    }

    // Check maximum length
    if (textContent.length > APPROACH_VALIDATION.TEXT_MAX_LENGTH) {
      errors.push(`Description must not exceed ${APPROACH_VALIDATION.TEXT_MAX_LENGTH} characters.`);
    }

    if (codeContent.length > APPROACH_VALIDATION.CODE_MAX_LENGTH) {
      errors.push(`Code must not exceed ${APPROACH_VALIDATION.CODE_MAX_LENGTH} characters.`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}