// src/app/admin/page.tsx  

'use client';

import { 
  UsersIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
  TagIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { useAdminStats, useSystemHealth, useGlobalProgress } from '@/hooks/useAdminData';
import { dateUtils } from '@/lib/utils/common';

function OverviewStats() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load statistics: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={stats?.totalUsers || 0}
        icon={UsersIcon}
        loading={isLoading}
      />
      <StatCard
        title="Total Questions"
        value={stats?.totalQuestions || 0}
        icon={QuestionMarkCircleIcon}
        loading={isLoading}
      />
      <StatCard
        title="Total Solutions"
        value={stats?.totalSolutions || 0}
        icon={LightBulbIcon}
        loading={isLoading}
      />
      <StatCard
        title="User Approaches"
        value={stats?.totalApproaches || 0}
        icon={ChartBarIcon}
        loading={isLoading}
      />
      <StatCard
        title="Categories"
        value={stats?.totalCategories || 0}
        icon={TagIcon}
        loading={isLoading}
      />
      <StatCard
        title="Questions Solved"
        value={stats?.totalSolved || 0}
        icon={CheckCircleIcon}
        loading={isLoading}
      />
      <StatCard
        title="Avg Progress/User"
        value={stats ? `${stats.avgProgressPerUser.toFixed(1)}` : '0.0'}
        icon={ChartBarIcon}
        loading={isLoading}
      />
      <StatCard
        title="Avg Solved/User"
        value={stats ? `${stats.avgSolvedPerUser.toFixed(1)}` : '0.0'}
        icon={CheckCircleIcon}
        loading={isLoading}
      />
    </div>
  );
}

function SystemHealthStatus() {
  const { data: health, isLoading, error } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-800 text-sm">Failed to load health status</p>
        </div>
      </div>
    );
  }

  const isHealthy = health?.database === 'healthy';

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        {isHealthy ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
        )}
        System Health
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Database Status:</span>
          <span className={`text-sm font-medium ${
            isHealthy ? 'text-green-600' : 'text-red-600'
          }`}>
            {health?.database || 'Unknown'}
          </span>
        </div>
        
        {health?.userCount !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Connected Users:</span>
            <span className="text-sm font-medium text-gray-900">
              {health.userCount.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Last Check:</span>
          <span className="text-sm text-gray-500">
            {health?.timestamp 
              ? dateUtils.formatRelativeTime(new Date(health.timestamp).toISOString())
              : 'Never'
            }
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgressSummary() {
  const { data: progress, isLoading, error } = useGlobalProgress();

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Global Progress</h3>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-800 text-sm">Failed to load progress data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Global Progress</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Completion Rate:</span>
          <span className="text-sm font-medium text-blue-600">
            {progress?.averageCompletion 
              ? `${progress.averageCompletion.toFixed(1)}%` 
              : '0.0%'
            }
          </span>
        </div>
        
        {progress?.progressByLevel && (
          <>
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">By Difficulty Level</h4>
              
              {/* Easy */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Easy:</span>
                <span className="text-sm">
                  {progress.progressByLevel.easy.solved} / {progress.progressByLevel.easy.total}
                  <span className="ml-1 text-green-600 font-medium">
                    ({progress.progressByLevel.easy.total > 0 
                      ? ((progress.progressByLevel.easy.solved / progress.progressByLevel.easy.total) * 100).toFixed(1)
                      : '0.0'
                    }%)
                  </span>
                </span>
              </div>
              
              {/* Medium */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Medium:</span>
                <span className="text-sm">
                  {progress.progressByLevel.medium.solved} / {progress.progressByLevel.medium.total}
                  <span className="ml-1 text-yellow-600 font-medium">
                    ({progress.progressByLevel.medium.total > 0 
                      ? ((progress.progressByLevel.medium.solved / progress.progressByLevel.medium.total) * 100).toFixed(1)
                      : '0.0'
                    }%)
                  </span>
                </span>
              </div>
              
              {/* Hard */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hard:</span>
                <span className="text-sm">
                  {progress.progressByLevel.hard.solved} / {progress.progressByLevel.hard.total}
                  <span className="ml-1 text-red-600 font-medium">
                    ({progress.progressByLevel.hard.total > 0 
                      ? ((progress.progressByLevel.hard.solved / progress.progressByLevel.hard.total) * 100).toFixed(1)
                      : '0.0'
                    }%)
                  </span>
                </span>
              </div>
            </div>
          </>
        )}
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Users:</span>
            <span className="text-sm font-medium text-gray-900">
              {progress?.activeUsers?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentActivity() {
  const { data: stats } = useAdminStats();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
        Recent Activity
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2">
              <UsersIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">New Users</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-blue-600">
            {stats?.recentUsers || '0'}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2">
              <QuestionMarkCircleIcon className="h-4 w-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">New Questions</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-green-600">
            {stats?.recentQuestions || '0'}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-2">
              <LightBulbIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">New Solutions</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-purple-600">
            {stats?.recentSolutions || '0'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your platforms performance and manage key metrics.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <OverviewStats />
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* System Health - Full width on mobile, 1 col on desktop */}
          <div className="lg:col-span-1">
            <SystemHealthStatus />
          </div>
          
          {/* Progress Summary - Full width on mobile, 1 col on desktop */}
          <div className="lg:col-span-1">
            <ProgressSummary />
          </div>
          
          {/* Recent Activity - Full width on mobile, 1 col on desktop */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}