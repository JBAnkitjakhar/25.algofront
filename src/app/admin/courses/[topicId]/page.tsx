// src/app/admin/courses/[topicId]/page.tsx

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useDocumentsByTopic,
  useDeleteDocument,
  useAdminTopics,
  useMoveDocument, // ✅ CHANGED: Import useMoveDocument instead of useUpdateDocument
} from "@/having/courses/hooks";
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { dateUtils } from "@/lib/utils/common";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import type { Document } from "@/having/courses";

export default function AdminTopicDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const { data: docsData, isLoading: isLoadingDocs } =
    useDocumentsByTopic(topicId);
  const { data: allTopicsData } = useAdminTopics();
  const deleteDocumentMutation = useDeleteDocument();
  const moveDocumentMutation = useMoveDocument(); // ✅ CHANGED: Use useMoveDocument

  const documents = docsData?.docs || [];
  const allTopics = allTopicsData?.data || [];

  const topic = docsData?.topic;

  const [movingDoc, setMovingDoc] = useState<Document | null>(null);
  const [selectedTargetTopic, setSelectedTargetTopic] = useState("");

  const handleDeleteDocument = async (docId: string) => {
    if (
      window.confirm(
        "Are you sure? This will delete the document and all its images permanently!"
      )
    ) {
      await deleteDocumentMutation.mutateAsync({ docId, topicId });
    }
  };

  // ✅ CHANGED: Simplified move handler using dedicated API
  const handleMoveDocument = async () => {
    if (!movingDoc || !selectedTargetTopic) return;

    if (selectedTargetTopic === topicId) {
      toast.error("Document is already in this topic");
      return;
    }

    try {
      await moveDocumentMutation.mutateAsync({
        docId: movingDoc.id,
        newTopicId: selectedTargetTopic,
        oldTopicId: topicId, // Pass current topic ID for cache invalidation
      });
      setMovingDoc(null);
      setSelectedTargetTopic("");
    } catch (error) {
      console.error("Failed to move document:", error);
      // Error toast is already handled in the hook
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoadingDocs) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2Icon className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  if (!topic) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Topic not found</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push("/admin/courses")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-1" />
              Back to Topics
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {topic.name}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    topic.isPublic
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {topic.isPublic ? "Public" : "Private"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{topic.description}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Created by: {topic.createdByName}</span>
                <span>•</span>
                <span>
                  Updated: {dateUtils.formatRelativeTime(topic.updatedAt)}
                </span>
              </div>
            </div>
            <Link
              href={`/admin/courses/${topicId}/new`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create Document
            </Link>
          </div>
        </div>

        {/* Move Document Modal */}
        {movingDoc && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Move Document
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    Moving:{" "}
                    <span className="font-medium">{movingDoc.title}</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    From: <span className="font-medium">{topic.name}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Move to Topic:
                  </label>
                  <select
                    value={selectedTargetTopic}
                    onChange={(e) => setSelectedTargetTopic(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  >
                    <option value="">Select a topic...</option>
                    {allTopics
                      .filter((t) => t.id !== topicId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.isPublic ? "(Public)" : "(Private)"}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setMovingDoc(null);
                    setSelectedTargetTopic("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMoveDocument}
                  disabled={
                    !selectedTargetTopic || moveDocumentMutation.isPending
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {moveDocumentMutation.isPending ? (
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                  ) : (
                    "Move Document"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Documents ({documents.length})
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No documents
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new document for this topic.
              </p>
              <div className="mt-6">
                <Link
                  href={`/admin/courses/${topicId}/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Document
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <li key={doc.id} className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {doc.title}
                          </h4>
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            <span>Order: {doc.displayOrder}</span>
                            <span>Size: {formatSize(doc.totalSize)}</span>
                            {doc.imageUrls.length > 0 && (
                              <span>{doc.imageUrls.length} images</span>
                            )}
                            <span>By: {doc.createdByName}</span>
                            <span>
                              Updated:{" "}
                              {dateUtils.formatRelativeTime(doc.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/interview-prep/${topicId}/${doc.id}`}
                        target="_blank"
                        className="inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
                        title="Preview"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setMovingDoc(doc);
                          setSelectedTargetTopic("");
                        }}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-full text-purple-600 hover:bg-purple-100 focus:outline-none"
                        title="Move to another topic"
                      >
                        <ArrowsRightLeftIcon className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/admin/courses/${topicId}/${doc.id}`}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-full text-blue-600 hover:bg-blue-100 focus:outline-none"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deleteDocumentMutation.isPending}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteDocumentMutation.isPending ? (
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
