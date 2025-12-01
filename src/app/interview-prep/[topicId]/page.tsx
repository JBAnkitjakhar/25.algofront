// src/app/interview-prep/[topicId]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { dateUtils } from '@/lib/utils/common';
import Image from 'next/image';
import { Loader2Icon } from 'lucide-react';
import { useDocumentsByTopic } from '@/having/courses';

function TopicContent() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  
  const { data: docsData, isLoading } = useDocumentsByTopic(topicId);
  
  const topic = docsData?.topic;
  const documents = docsData?.docs || [];

  if (isLoading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
          <Loader2Icon className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </UserLayout>
    );
  }

  if (!topic) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300">Topic not found</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.push('/interview-prep')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                Back to Topics
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {topic.name}
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  {topic.description}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{documents.length} documents</span>
                  <span>•</span>
                  <span>Created by {topic.createdByName}</span>
                </div>
              </div>
              {topic.iconUrl ? (
                <Image
                  src={topic.iconUrl}
                  alt={topic.name}
                  className="h-16 w-16 rounded-full"
                  width={64}
                  height={64}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <BookOpenIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {documents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-12 text-center border border-gray-200 dark:border-gray-700">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Documents will be added soon for this topic.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((doc, index) => (
                  <Link
                    key={doc.id}
                    href={{
                      pathname: `/interview-prep/${topicId}/${doc.id}`,
                      query: { topicName: topic.name } // ✅ Pass topic name
                    }}
                    className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {doc.title}
                            </h3>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Updated {dateUtils.formatRelativeTime(doc.updatedAt)}</span>
                              {doc.imageUrls && doc.imageUrls.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{doc.imageUrls.length} images</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-4" />
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

export default function TopicDocumentsPage() {
  return (
    <ProtectedRoute>
      <TopicContent />
    </ProtectedRoute>
  );
}