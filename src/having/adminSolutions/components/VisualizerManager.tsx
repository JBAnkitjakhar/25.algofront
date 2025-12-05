// src/having/adminSolutions/components/VisualizerManager.tsx

"use client";

import { useState, useRef, useCallback } from "react";
import {
  CubeTransparentIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import {
  useVisualizerMetadata,
  useVisualizerContent,
  useUploadVisualizerFile,
  useDeleteVisualizerFile,
} from "../hooks";
import { SOLUTION_VALIDATION } from "../constants";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface VisualizerManagerProps {
  solutionId?: string;
  visualizerFileIds: string[];
  onVisualizerFileIdsChange: (fileIds: string[]) => void;
}

export function VisualizerManager({
  solutionId,
  visualizerFileIds,
  onVisualizerFileIdsChange,
}: VisualizerManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedVisualizerForPopup, setSelectedVisualizerForPopup] = useState<
    string | null
  >(null);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Only fetch metadata for files we have
  const { data: visualizerFiles = [], isLoading: isLoadingMetadata } =
    useVisualizerMetadata(visualizerFileIds);

  // ✅ Only fetch content when popup opens (lazy loading)
  const { data: popupContent, isLoading: isLoadingContent } =
    useVisualizerContent(
      selectedVisualizerForPopup || "",
      !!selectedVisualizerForPopup // Only enabled when popup is open
    );

  const uploadVisualizerMutation = useUploadVisualizerFile();
  const deleteVisualizerMutation = useDeleteVisualizerFile();
  const queryClient = useQueryClient();
  const currentVisualizerCount = visualizerFileIds.length;

  // ✅ Upload handler - optimistically update parent state
  const handleVisualizerUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!solutionId) {
        toast.error("Solution must be saved before uploading visualizers");
        return;
      }

      const fileArray = Array.from(files);
      const htmlFiles = fileArray.filter((file) =>
        file.name.toLowerCase().endsWith(".html")
      );

      if (htmlFiles.length === 0) {
        toast.error("Please select valid HTML files");
        return;
      }

      const maxVisualizers = SOLUTION_VALIDATION.MAX_VISUALIZERS_PER_SOLUTION;

      if (currentVisualizerCount >= maxVisualizers) {
        toast.error(`Maximum ${maxVisualizers} HTML visualizers already uploaded.`);
        return;
      }

      if (currentVisualizerCount + htmlFiles.length > maxVisualizers) {
        toast.error(`Cannot upload ${htmlFiles.length} files. Maximum ${maxVisualizers} allowed.`);
        return;
      }

      let uploadedCount = 0;
      const newFileIds: string[] = [];

      for (const file of htmlFiles) {
        if (file.size > SOLUTION_VALIDATION.MAX_VISUALIZER_SIZE) {
          toast.error(`${file.name} exceeds maximum size`);
          continue;
        }

        try {
          const result = await uploadVisualizerMutation.mutateAsync({
            solutionId,
            file,
          });

          if (result.fileId) {
            uploadedCount++;
            newFileIds.push(result.fileId);
            // console.log(`✅ Uploaded ${file.name}, fileId: ${result.fileId}`);
          }
        } catch (error) {
          console.error("❌ Upload error:", error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedCount > 0) {
        const updatedFileIds = [...visualizerFileIds, ...newFileIds];
        // console.log(`📤 Updating parent with new fileIds:`, updatedFileIds);
        
        // ✅ Update parent state
        onVisualizerFileIdsChange(updatedFileIds);
        
        // ✅ Manually refetch the query with new fileIds to show real-time update
        await queryClient.refetchQueries({
          queryKey: ["visualizers", "metadata", ...updatedFileIds.sort()],
        });

        toast.success(`Successfully uploaded ${uploadedCount} visualizer(s)`);
      }
    },
    [
      solutionId,
      currentVisualizerCount,
      visualizerFileIds,
      uploadVisualizerMutation,
      onVisualizerFileIdsChange,
      queryClient, // ✅ Add to deps
    ]
  );

  // ✅ Delete handler - optimistically remove from UI (no refetch needed)
  const handleRemoveVisualizerFile = useCallback(
    async (fileId: string) => {
      if (!confirm("Are you sure you want to delete this visualizer?")) {
        return;
      }

      try {
        // console.log(`🗑️ Deleting visualizer: ${fileId}`);

        // ✅ First update UI optimistically
        const updatedFileIds = visualizerFileIds.filter((id) => id !== fileId);
        onVisualizerFileIdsChange(updatedFileIds);

        // ✅ Then call API
        await deleteVisualizerMutation.mutateAsync(fileId);

        // console.log(`✅ Deleted ${fileId}, remaining:`, updatedFileIds);
        toast.success("Visualizer deleted successfully");
      } catch (error) {
        console.error("❌ Delete error:", error);

        // ✅ Rollback on error
        toast.error("Failed to delete visualizer");
        onVisualizerFileIdsChange(visualizerFileIds); // Restore
      }
    },
    [deleteVisualizerMutation, visualizerFileIds, onVisualizerFileIdsChange]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleVisualizerUpload(e.dataTransfer.files);
      }
    },
    [handleVisualizerUpload]
  );

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      await handleVisualizerUpload(e.target.files);
      e.target.value = "";
    }
  };

  // ✅ Only fetch content when popup opens
  const openPopup = (fileId: string) => {
    // console.log(`👁️ Opening popup for: ${fileId}`);
    setSelectedVisualizerForPopup(fileId);
  };

  const closePopup = () => {
    // console.log(`❌ Closing popup`);
    setSelectedVisualizerForPopup(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + " KB";
  };

  if (!solutionId) {
    return (
      <div className="text-center py-12">
        <div className="text-sm text-amber-600 px-3 py-2 bg-amber-50 border border-amber-200 rounded inline-block">
          Save solution first to upload visualizers
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CubeTransparentIcon className="h-4 w-4 inline mr-1" />
            HTML Visualizers (Max 2 files)
          </label>
          <div className="text-sm text-gray-600 mb-4">
            Upload interactive HTML files to visualize algorithms.
          </div>

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => htmlFileInputRef.current?.click()}
              disabled={
                currentVisualizerCount >= 2 ||
                uploadVisualizerMutation.isPending
              }
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CubeTransparentIcon className="h-4 w-4 mr-2" />
              {uploadVisualizerMutation.isPending
                ? "Uploading..."
                : "Upload HTML File"}
            </button>

            {currentVisualizerCount >= 2 && (
              <div className="text-sm text-orange-600 px-3 py-2 bg-orange-50 border border-orange-200 rounded">
                Maximum limit reached (2/2)
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingMetadata && visualizerFileIds.length > 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading visualizers...</p>
          </div>
        )}

        {/* Visualizer List */}
        {!isLoadingMetadata && visualizerFiles.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Visualizers ({visualizerFiles.length}/2)
            </h4>
            {visualizerFiles.map((file) => (
              <div
                key={file.fileId}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <CubeTransparentIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {file.originalFileName ||
                          file.filename ||
                          "Unknown File"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatSize(file.size)} • Uploaded{" "}
                        {formatDate(file.uploadDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openPopup(file.fileId)}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                    >
                      <CubeTransparentIcon className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveVisualizerFile(file.fileId)}
                      disabled={deleteVisualizerMutation.isPending}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      {deleteVisualizerMutation.isPending
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingMetadata &&
          visualizerFiles.length === 0 &&
          visualizerFileIds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CubeTransparentIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm">No visualizers uploaded yet</p>
            </div>
          )}

        {/* Error State - fileIds exist but metadata loading failed */}
        {!isLoadingMetadata &&
          visualizerFiles.length === 0 &&
          visualizerFileIds.length > 0 && (
            <div className="text-center py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 inline-block">
                <CubeTransparentIcon className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                <p className="text-sm text-amber-800">
                  Found {visualizerFileIds.length} visualizer(s) but failed to
                  load metadata
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Try refreshing the page
                </p>
              </div>
            </div>
          )}

        {/* Drag & Drop Zone */}
        <div
          className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
          } ${
            currentVisualizerCount >= 2
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CubeTransparentIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {currentVisualizerCount >= 2
              ? "Maximum 2 visualizers reached"
              : "Drag and drop HTML files here"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            HTML files only • Max 500KB per file
          </p>
        </div>

        <input
          ref={htmlFileInputRef}
          type="file"
          multiple
          accept=".html"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {/* ✅ Fullscreen Viewer Modal with Loading State */}
      <Transition appear show={!!selectedVisualizerForPopup} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closePopup}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full h-full max-w-7xl max-h-[90vh] transform overflow-hidden rounded-2xl bg-white shadow-xl">
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CubeTransparentIcon className="h-5 w-5 mr-2 text-blue-600" />
                      {visualizerFiles.find(
                        (f) => f.fileId === selectedVisualizerForPopup
                      )?.originalFileName || "Visualizer"}
                      {isLoadingContent && (
                        <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Loading...
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={closePopup}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                      title="Close"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div
                    className="h-full bg-white"
                    style={{ height: "calc(90vh - 80px)" }}
                  >
                    {isLoadingContent ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                        <p className="text-sm text-gray-600">
                          Loading visualizer content...
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          This may take a moment
                        </p>
                      </div>
                    ) : popupContent ? (
                      <iframe
                        key={selectedVisualizerForPopup}
                        srcDoc={popupContent}
                        title="Visualizer"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <CubeTransparentIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">
                          Failed to load visualizer
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try refreshing the page
                        </p>
                      </div>
                    )}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
