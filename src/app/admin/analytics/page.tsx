// src/app/admin/analytics/page.tsx - Analytics page
'use client';

import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { useAdminStats, useGlobalProgress, useApplicationMetrics } from '@/hooks/useAdminData';

function EngagementMetrics() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: progress } = useGlobalProgress();

  const engagementRate = stats && stats.totalUsers > 0 
    ? ((stats.totalSolved / stats.totalQuestions) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Platform Engagement"
        value={`${engagementRate.toFixed(1)}%`}
        icon={ArrowTrendingUpIcon}
        loading={isLoading}
      />
      <StatCard
        title="Active Learning Rate"
        value={stats ? `${stats.avgSolvedPerUser.toFixed(1)}` : '0.0'}
        icon={AcademicCapIcon}
        loading={isLoading}
      />
      <StatCard
        title="Content Utilization"
        value={stats && stats.totalQuestions > 0 
          ? `${((stats.totalSolved / (stats.totalUsers * stats.totalQuestions)) * 100).toFixed(1)}%`
          : '0.0%'
        }
        icon={ChartBarIcon}
        loading={isLoading}
      />
      <StatCard
        title="User Retention"
        value={progress?.activeUsers || 0}
        icon={UserGroupIcon}
        loading={isLoading}
      />
    </div>
  );
}

function PerformanceMetrics() {
  const { data: metrics, isLoading, error } = useApplicationMetrics();

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-800 text-sm">Failed to load performance data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics?.performance.avgResponseTime || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">Avg Response Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics?.performance.requestsPerMinute || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">Requests/Min</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {metrics?.performance.errorRate || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">Error Rate</div>
        </div>
      </div>
    </div>
  );
}

function LevelDistribution() {
  const { data: progress, isLoading } = useGlobalProgress();

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const levels = progress?.progressByLevel;
  const totalQuestions = levels ? levels.easy.total + levels.medium.total + levels.hard.total : 0;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Question Distribution by Level</h3>
      
      {levels && totalQuestions > 0 ? (
        <div className="space-y-4">
          {/* Easy */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-green-700">Easy</span>
              <span>{levels.easy.total} questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(levels.easy.total / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {levels.easy.solved} solved ({((levels.easy.solved / levels.easy.total) * 100).toFixed(1)}% completion)
            </div>
          </div>
          
          {/* Medium */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-yellow-700">Medium</span>
              <span>{levels.medium.total} questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(levels.medium.total / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {levels.medium.solved} solved ({((levels.medium.solved / levels.medium.total) * 100).toFixed(1)}% completion)
            </div>
          </div>
          
          {/* Hard */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-red-700">Hard</span>
              <span>{levels.hard.total} questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${(levels.hard.total / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {levels.hard.solved} solved ({((levels.hard.solved / levels.hard.total) * 100).toFixed(1)}% completion)
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No question data available</p>
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Analytics Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Deep dive into platform metrics and user engagement patterns.
          </p>
        </div>

        {/* Engagement Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Metrics</h3>
          <EngagementMetrics />
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PerformanceMetrics />
          <LevelDistribution />
        </div>
      </div>
    </AdminLayout>
  );
}