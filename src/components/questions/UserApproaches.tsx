// src/components/questions/UserApproaches.tsx  

'use client';

import { useState } from 'react';
import { 
  Code,
  Edit, 
  Trash2, 
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { 
  useApproachesByQuestion, 
  useDeleteApproach,
} from '@/hooks/useApproachManagement';
import { ApproachEditor } from './ApproachEditor';
import { ApproachLimitCalculator } from '@/lib/utils/approachLimits';
import { APPROACH_VALIDATION } from '@/constants';
import { dateUtils } from '@/lib/utils/common';
import type { ApproachDTO } from '@/types/admin';

interface UserApproachesProps {
  questionId: string;
  onEditApproach?: (approach: ApproachDTO) => void;
}

// Individual approach card component with truncation
function ApproachCard({ 
  approach, 
  onEdit, 
  onDelete 
}: { 
  approach: ApproachDTO; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  const [showCode, setShowCode] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this approach? This action cannot be undone.')) {
      onDelete();
    }
  };

  // Truncate description logic
  const descriptionLines = approach.textContent.split('\n');
  const shouldTruncateDescription = descriptionLines.length > 3 || approach.textContent.length > 200;
  const truncatedDescription = shouldTruncateDescription && !showFullDescription
    ? (descriptionLines.length > 3 
        ? descriptionLines.slice(0, 3).join('\n') + '...' 
        : approach.textContent.substring(0, 200) + '...')
    : approach.textContent;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Submitted {dateUtils.formatRelativeTime(approach.createdAt)}
          </span>
          {approach.updatedAt !== approach.createdAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (Updated {dateUtils.formatRelativeTime(approach.updatedAt)})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Edit approach"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete approach"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description with truncation */}
      <div className="mb-3">
        {approach.textContent === "Click edit to add your approach description and explanation..." ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
            Click the edit button to add your approach description and explanation...
          </p>
        ) : (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {truncatedDescription}
            </p>
            {shouldTruncateDescription && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs mt-1 flex items-center space-x-1"
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp size={12} />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} />
                    <span>Show more</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Code Section */}
      {approach.codeContent && (
        <div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-2"
          >
            <Code size={14} />
            <span>
              {showCode ? 'Hide' : 'Show'} Code ({approach.codeLanguage})
            </span>
          </button>

          {showCode && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <pre 
                className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-3 overflow-auto text-gray-900 dark:text-gray-100 custom-scrollbar"
                style={{ maxHeight: "300px" }}
              >
                <code>{approach.codeContent}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* UPDATED: Metadata with centralized size calculation */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span>Size: {ApproachLimitCalculator.formatSize(approach.contentSize)}</span>
        <span>Language: {approach.codeLanguage}</span>
      </div>
    </div>
  );
}

// UPDATED: Usage stats component with centralized calculator
function UsageStatsCard({ 
  approaches 
}: { 
  approaches: ApproachDTO[] 
}) {
  // Calculate usage using centralized calculator
  const sizeUsage = ApproachLimitCalculator.calculateSizeUsage(approaches);
  const colors = ApproachLimitCalculator.getUsageColor(sizeUsage.usagePercentage);

  return (
    <div className={`rounded-lg p-4 ${colors.bg}`}>
      <h4 className={`text-sm font-medium mb-3 ${colors.text}`}>
        Approach Usage Stats
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Approaches:</span>
          <span className="ml-2 font-medium">
            {sizeUsage.approachCount}/{sizeUsage.maxApproaches}
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Size Used:</span>
          <span className="ml-2 font-medium">
            {sizeUsage.totalUsedKB.toFixed(1)}KB/{sizeUsage.maxAllowedKB.toFixed(0)}KB
          </span>
        </div>
        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-400">Storage:</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${colors.bar}`}
                style={{ width: `${Math.min(sizeUsage.usagePercentage, 100)}%` }}
              ></div>
            </div>
            <span className={`text-xs font-medium ${colors.text}`}>
              {sizeUsage.usagePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Additional info for warnings */}
      {sizeUsage.usagePercentage > 80 && (
        <div className="mt-3 text-xs">
          <div className="flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>
              {sizeUsage.usagePercentage > 95 
                ? `Only ${sizeUsage.remainingKB.toFixed(1)}KB remaining!`
                : `${sizeUsage.remainingKB.toFixed(1)}KB remaining`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function UserApproaches({ questionId, onEditApproach }: UserApproachesProps) {
  const [editingApproach, setEditingApproach] = useState<ApproachDTO | null>(null);
  
  // API hooks
  const { data: approaches = [], isLoading, error } = useApproachesByQuestion(questionId);
  const deleteApproachMutation = useDeleteApproach();

  // Handle edit approach
  const handleEditApproach = (approach: ApproachDTO) => {
    if (onEditApproach) {
      // Use the parent's edit handler (for full-screen mode)
      onEditApproach(approach);
    } else {
      // Fallback to local state (for standalone mode)
      setEditingApproach(approach);
    }
  };

  // Handle close editor (only used in standalone mode)
  const handleCloseEditor = () => {
    setEditingApproach(null);
  };

  // Handle delete approach
  const handleDeleteApproach = (id: string) => {
    deleteApproachMutation.mutate({ id, questionId });
  };

  // Show full screen editor if editing in standalone mode
  if (editingApproach && !onEditApproach) {
    return (
      <ApproachEditor
        approach={editingApproach}
        onBack={handleCloseEditor}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="flex space-x-2">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to Load Approaches
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {error.message || 'An error occurred while loading your approaches.'}
        </p>
      </div>
    );
  }

  // Empty state
  if (approaches.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Approaches Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Submit your first approach using the Submit button in the code editor.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>You can submit up to {APPROACH_VALIDATION.MAX_APPROACHES_PER_QUESTION} approaches per question</p>
          <p>Total size limit: {ApproachLimitCalculator.formatSize(APPROACH_VALIDATION.MAX_TOTAL_SIZE_PER_USER_PER_QUESTION)} per question</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UPDATED: Usage Stats using centralized calculator */}
      <UsageStatsCard approaches={approaches} />

      {/* Approaches List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Your Approaches ({approaches.length})
        </h4>
        
        {approaches.map((approach) => (
          <ApproachCard
            key={approach.id}
            approach={approach}
            onEdit={() => handleEditApproach(approach)}
            onDelete={() => handleDeleteApproach(approach.id)}
          />
        ))}
      </div>
    </div>
  );
}