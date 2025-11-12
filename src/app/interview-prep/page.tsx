// src/app/interview-prep/page.tsx

'use client';

import { useTopics } from '@/hooks/useCoursesManagement';
import Link from 'next/link';
import {
  AcademicCapIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import Image from 'next/image';
import { Loader2Icon } from 'lucide-react';

function Content() {
  const { data: topicsData, isLoading } = useTopics();
  const { user } = useAuth();
  
  const topics = topicsData?.data || [];

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Interview Preparation
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  Master key concepts for technical interviews
                </p>
              </div>
              <BookOpenIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2Icon className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : topics.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-12 text-center">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No topics available</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Check back later for interview preparation materials.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/interview-prep/${topic.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {topic.iconUrl ? (
                          <Image
                            src={topic.iconUrl}
                            alt={topic.name}
                            className="h-12 w-12 rounded-full"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {topic.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {topic.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        <span>{topic.docsCount} documents</span>
                      </div>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* User Info Card */}
          {user && (
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {user.image ? (
                    <Image
                      className="h-12 w-12 rounded-full"
                      src={user.image}
                      alt={user.name}
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Welcome, {user.name}!
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start learning with our comprehensive interview prep materials.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

export default function InterviewPrepPage() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}