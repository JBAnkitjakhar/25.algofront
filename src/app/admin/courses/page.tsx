// src/app/admin/courses/page.tsx

'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  useTopics, 
  useCreateTopic, 
  useUpdateTopic, 
  useDeleteTopic,
  useCourseStats 
} from '@/hooks/useCoursesManagement';
import { 
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Topic, CreateTopicRequest, UpdateTopicRequest } from '@/types/courses';
import { dateUtils } from '@/lib/utils/common';
import Image from 'next/image';
import { Loader2Icon } from 'lucide-react';

// Helper function to check if URL is from a configured domain
const isConfiguredDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    const configuredDomains = [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'res.cloudinary.com',
    ];
    return configuredDomains.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
};

export default function AdminCoursesPage() {
  const { data: topicsData, isLoading: isLoadingTopics } = useTopics();
  const { data: stats, isLoading: isLoadingStats } = useCourseStats();
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();
  const deleteTopicMutation = useDeleteTopic();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState<CreateTopicRequest>({
    name: '',
    description: '',
    displayOrder: 1,
    iconUrl: ''
  });

  const topics = topicsData?.data || [];

  const handleCreateOrUpdate = async () => {
    if (editingTopic) {
      await updateTopicMutation.mutateAsync({
        topicId: editingTopic.id,
        data: formData as UpdateTopicRequest
      });
      setEditingTopic(null);
    } else {
      await createTopicMutation.mutateAsync(formData);
    }
    
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      displayOrder: 1,
      iconUrl: ''
    });
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description,
      displayOrder: topic.displayOrder,
      iconUrl: topic.iconUrl || ''
    });
    setIsCreating(true);
  };

  const handleDelete = async (topicId: string) => {
    if (window.confirm('Are you sure? This will delete the topic and ALL its documents and images permanently!')) {
      await deleteTopicMutation.mutateAsync(topicId);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Interview Prep Courses</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage topics and documents for interview preparation
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingTopic(null);
                setFormData({
                  name: '',
                  description: '',
                  displayOrder: 1,
                  iconUrl: ''
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create Topic
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Topics</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingStats ? '-' : stats?.totalTopics || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Documents</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingStats ? '-' : stats?.totalDocuments || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Form Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingTopic ? 'Edit Topic' : 'Create New Topic'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    placeholder="React, JavaScript, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    placeholder="Brief description of the topic"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Icon URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.iconUrl || ''}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    placeholder="https://example.com/icon.png"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Note: External URLs will be loaded without optimization
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTopic(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrUpdate}
                  disabled={createTopicMutation.isPending || updateTopicMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createTopicMutation.isPending || updateTopicMutation.isPending ? (
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                  ) : editingTopic ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Topics List */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              All Topics
            </h3>
          </div>
          
          {isLoadingTopics ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No topics</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new topic.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {topics.map((topic) => (
                <li key={topic.id} className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {topic.iconUrl ? (
                          isConfiguredDomain(topic.iconUrl) ? (
                            <Image 
                              src={topic.iconUrl} 
                              alt={topic.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            // Use regular img tag for external URLs
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={topic.iconUrl} 
                              alt={topic.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          )
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {topic.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {topic.description}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{topic.docsCount} documents</span>
                          <span>Order: {topic.displayOrder}</span>
                          <span>Created: {dateUtils.formatDate(topic.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/courses/${topic.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Docs
                        <ChevronRightIcon className="ml-1 h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => handleEdit(topic)}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-full text-blue-600 hover:bg-blue-100 focus:outline-none"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        disabled={deleteTopicMutation.isPending}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none disabled:opacity-50"
                      >
                        {deleteTopicMutation.isPending ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}