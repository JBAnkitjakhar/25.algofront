// src/app/me/page.tsx  

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCurrentUserProgressStats } from '@/hooks/useUserProgress';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { roleUtils } from '@/lib/utils/auth';
import { dateUtils, stringUtils } from '@/lib/utils/common';
import { QUESTION_LEVEL_COLORS, QUESTION_LEVEL_LABELS } from '@/constants';
import { BookOpen, Award, TrendingUp,Clock, Target } from 'lucide-react';
import Link from 'next/link';

// Loading component for skeleton UI
function LoadingStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Error component
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
        Failed to load progress data
      </h3>
      <p className="text-red-600 dark:text-red-400 text-sm">
        {error.message || 'Something went wrong while fetching your progress.'}
      </p>
    </div>
  );
}

function Content() {
  const { user} = useAuth();
  const { 
    data: progressStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useCurrentUserProgressStats();

  if (!user) return null;

  // Type for stat change types
  type ChangeType = 'positive' | 'negative' | 'neutral';

  // Show error state if API call failed
  if (statsError && !statsLoading) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {stringUtils.getInitials(user.name)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    Welcome back, {user.name.split(' ')[0]}!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Ready to tackle some coding challenges today?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorState error={statsError as Error} />
          </div>
        </div>
      </UserLayout>
    );
  }

  // Generate stats cards from real API data
  const statsCards = progressStats ? [
    {
      name: 'Problems Solved',
      value: progressStats.totalSolved.toString(),
      change: `${((progressStats.totalSolved / progressStats.totalQuestions) * 100).toFixed(1)}%`,
      changeType: 'positive' as ChangeType,
      icon: BookOpen,
      description: `out of ${progressStats.totalQuestions} total`,
    },
    {
      name: 'Recent Activity',
      value: progressStats.recentSolved.toString(),
      change: 'This week',
      changeType: 'neutral' as ChangeType,
      icon: TrendingUp,
      description: 'problems solved recently',
    },
    {
      name: 'Overall Progress',
      value: `${progressStats.progressPercentage.toFixed(1)}%`,
      change: progressStats.totalSolved > 0 ? '+' + progressStats.totalSolved : '0',
      changeType: (progressStats.totalSolved > 0 ? 'positive' : 'neutral') as ChangeType,
      icon: Target,
      description: 'completion rate',
    },
  ] : [];

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section with Left-Right Layout */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left side - Main welcome content */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {stringUtils.getInitials(user.name)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    Welcome back, {user.name.split(' ')[0]}!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                    Ready to tackle some coding challenges today?
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                    <Award size={16} className="mr-2" />
                    {roleUtils.formatRole(user.role)}
                  </div>
                </div>
              </div>

              {/* Right side - User info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:min-w-[280px]">
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</dt>
                    <dd className="text-sm text-gray-900 dark:text-white break-words">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{dateUtils.formatDate(user.createdAt)}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading state for stats */}
          {statsLoading && <LoadingStats />}

          {/* Stats Grid - Real data from API */}
          {!statsLoading && progressStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statsCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                          {stat.name}
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center text-sm">
                        <span className={`font-medium ${
                          stat.changeType === 'positive' 
                            ? 'text-green-600 dark:text-green-400' 
                            : stat.changeType === 'negative'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          {stat.description}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress by Level - Real data from API */}
          {!statsLoading && progressStats && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Progress by Difficulty
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['easy', 'medium', 'hard'] as const).map((level) => {
                    const solved = progressStats.solvedByLevel[level];
                    const total = progressStats.totalByLevel[level];
                    const percentage = progressStats.progressByLevel[level];
                    const levelKey = level.toUpperCase() as keyof typeof QUESTION_LEVEL_COLORS;
                    const colors = QUESTION_LEVEL_COLORS[levelKey];
                    
                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {QUESTION_LEVEL_LABELS[levelKey]}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {solved}/{total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              level === 'easy' ? 'bg-green-500' :
                              level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}% complete
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Recent Activity - Takes most space */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-start space-x-4">
                          <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : progressStats && progressStats.recentSolvedQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {progressStats.recentSolvedQuestions.map((activity) => {
                        const levelKey = activity.level.toUpperCase() as keyof typeof QUESTION_LEVEL_COLORS;
                        const colors = QUESTION_LEVEL_COLORS[levelKey];
                        
                        return (
                          <div key={activity.questionId} className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <Link 
                                  href={`/questions/${activity.questionId}`}
                                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                                >
                                  {activity.title}
                                </Link>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                  {dateUtils.formatRelativeTime(activity.solvedAt)}
                                </p>
                              </div>
                              <div className="mt-1 flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                  {activity.category}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                                  {QUESTION_LEVEL_LABELS[levelKey]}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                       
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No recent activity
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Start solving problems to see your activity here.
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/questions"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Browse Questions
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default function MePage() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}