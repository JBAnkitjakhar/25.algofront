// src/app/admin/page.tsx

'use client';

import { useState } from 'react';
import { 
  UsersIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
  TagIcon,
  ClockIcon,
  UserGroupIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { useAdminOverview } from '@/adminOverview/hooks';
import { adminOverviewService } from '@/adminOverview/service';
import { dateUtils } from '@/lib/utils/common';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LoggedInUserToday } from '@/adminOverview/types';
import Image from 'next/image';

// Pagination Component
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// Logged In Users Table
function LoggedInUsersTable({ users }: { users: LoggedInUserToday[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = adminOverviewService.getPaginatedLoggedInUsers(
    users,
    currentPage
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
        Users Logged In Today ({users.length})
      </h3>

      {paginatedData.users.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No users logged in today
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Identifier
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedData.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {user.displayIdentifier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={paginatedData.currentPage}
            totalPages={paginatedData.totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

// System Health Status
function SystemHealthStatus({ 
  systemHealth 
}: { 
  systemHealth: { databaseConnected: boolean; databaseStatus: string } 
}) {
  const isHealthy = systemHealth.databaseConnected;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <ServerIcon className="h-5 w-5 text-gray-400 mr-2" />
        System Health
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Database:</span>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isHealthy ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isHealthy ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
          {systemHealth.databaseStatus}
        </div>
      </div>
    </div>
  );
}

// Recent Activity
function RecentActivity({ 
  newUsers, 
  newQuestions, 
  newSolutions 
}: { 
  newUsers: number;
  newQuestions: number;
  newSolutions: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
        Recent Activity (Last 7 Days)
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2">
              <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New Users</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Joined recently</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {newUsers}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-2">
              <QuestionMarkCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New Questions</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recently added</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
            {newQuestions}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-2">
              <LightBulbIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New Solutions</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recently uploaded</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
            {newSolutions}
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function AdminHomePage() {
  const { data: overview, isLoading, error } = useAdminOverview();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !overview) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-300">
              {error instanceof Error ? error.message : "Failed to load admin overview"}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Last updated: {dateUtils.formatRelativeTime(overview.generatedAt)}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <StatCard
            title="Total Users"
            value={overview.totalUsers}
            icon={UsersIcon}
          />
          <StatCard
            title="Categories"
            value={overview.totalCategories}
            icon={TagIcon}
          />
          <StatCard
            title="Questions"
            value={overview.totalQuestions}
            icon={QuestionMarkCircleIcon}
          />
          <StatCard
            title="Solutions"
            value={overview.totalSolutions}
            icon={LightBulbIcon}
          />
          <StatCard
            title="User Approaches"
            value={overview.totalUserApproaches}
            icon={ChartBarIcon}
          />
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-1">
            <SystemHealthStatus systemHealth={overview.systemHealth} />
          </div>
          
          <div className="lg:col-span-2">
            <RecentActivity
              newUsers={overview.newUsersLast7Days}
              newQuestions={overview.questionsLast7Days}
              newSolutions={overview.solutionsLast7Days}
            />
          </div>
        </div>

        {/* Logged In Users Table */}
        <LoggedInUsersTable users={overview.usersLoggedInTodayDetails} />
      </div>
    </AdminLayout>
  );
}