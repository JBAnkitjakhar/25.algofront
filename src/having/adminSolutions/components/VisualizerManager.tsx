// src/having/adminSolutions/components/VisualizerManager.tsx

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  CubeTransparentIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { useUploadVisualizerFile, useDeleteVisualizerFile } from "../hooks";
import { adminSolutionsService } from "../service";
import { SOLUTION_VALIDATION } from "../constants";
import toast from "react-hot-toast";
import { EmbeddedVisualizer } from "@/components/common/EmbeddedVisualizer";

interface VisualizerFileMetadata {
  fileId: string;
  filename: string;
  originalFileName: string;
  size: number;
  uploadDate: string;
  contentType?: string;
  isInteractive?: boolean;
  solutionId?: string;
}

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
  const [selectedVisualizerForPopup, setSelectedVisualizerForPopup] = useState<{
    fileId: string;
    title: string;
  } | null>(null);
  const [visualizerFiles, setVisualizerFiles] = useState<
    VisualizerFileMetadata[]
  >([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);

  const uploadVisualizerMutation = useUploadVisualizerFile();
  const deleteVisualizerMutation = useDeleteVisualizerFile();

  const currentVisualizerCount = visualizerFileIds.length;

  useEffect(() => {
    const fetchVisualizerMetadata = async () => {
      if (!solutionId || visualizerFileIds.length === 0) {
        setVisualizerFiles([]);
        return;
      }

      setIsLoadingFiles(true);

      try {
        const metadataPromises = visualizerFileIds.map(async (fileId) => {
          try {
            const response = await adminSolutionsService.getVisualizerMetadata(
              fileId
            );

            // ✅ FIX: Data is nested twice - response.data.data
            if (response.success && response.data?.data) {
              return response.data.data as VisualizerFileMetadata;
            }
            return null;
          } catch (error) {
            console.error("❌ Fetch error:", error);
            return null;
          }
        });

        const results = await Promise.all(metadataPromises);
        const validFiles = results.filter(
          (file): file is VisualizerFileMetadata => file !== null
        );

        setVisualizerFiles(validFiles);
      } catch (error) {
        console.error("❌ Error:", error);
        toast.error("Failed to load visualizer files");
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchVisualizerMetadata();
  }, [solutionId, visualizerFileIds]);

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
        toast.error(
          `Maximum ${maxVisualizers} HTML visualizers already uploaded. Delete existing files to add new ones.`
        );
        return;
      }

      if (currentVisualizerCount + htmlFiles.length > maxVisualizers) {
        toast.error(
          `Cannot upload ${htmlFiles.length} files. Maximum ${maxVisualizers} visualizers allowed. You currently have ${currentVisualizerCount}.`
        );
        return;
      }

      let uploadedCount = 0;
      const newFileIds: string[] = [];

      for (const file of htmlFiles) {
        if (file.size > SOLUTION_VALIDATION.MAX_VISUALIZER_SIZE) {
          toast.error(
            `${file.name} exceeds maximum size of ${
              SOLUTION_VALIDATION.MAX_VISUALIZER_SIZE / 1024
            }KB`
          );
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
          }
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedCount > 0) {
        const updatedFileIds = [...visualizerFileIds, ...newFileIds];
        onVisualizerFileIdsChange(updatedFileIds);
        toast.success(`Successfully uploaded ${uploadedCount} visualizer(s)`);
      }
    },
    [
      solutionId,
      currentVisualizerCount,
      visualizerFileIds,
      uploadVisualizerMutation,
      onVisualizerFileIdsChange,
    ]
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

  const handleRemoveVisualizerFile = useCallback(
    async (fileId: string) => {
      if (!confirm("Are you sure you want to delete this visualizer?")) {
        return;
      }

      try {
        await deleteVisualizerMutation.mutateAsync(fileId);

        const updatedFileIds = visualizerFileIds.filter((id) => id !== fileId);
        onVisualizerFileIdsChange(updatedFileIds);

        toast.success("Visualizer deleted successfully");
      } catch (error) {
        toast.error("Failed to delete visualizer");
      }
    },
    [deleteVisualizerMutation, visualizerFileIds, onVisualizerFileIdsChange]
  );

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      await handleVisualizerUpload(e.target.files);
      e.target.value = "";
    }
  };

  const openPopup = (fileId: string, title: string) => {
    setSelectedVisualizerForPopup({ fileId, title });
  };

  const closePopup = () => {
    setSelectedVisualizerForPopup(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid Date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
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
    if (isNaN(bytes) || bytes === null || bytes === undefined) {
      return "N/A";
    }
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CubeTransparentIcon className="h-4 w-4 inline mr-1" />
            HTML Visualizers (Max 2 files)
          </label>
          <div className="text-sm text-gray-600 mb-4">
            Upload interactive HTML files to visualize algorithms. Files will be
            embedded and displayed within our website.
          </div>

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => htmlFileInputRef.current?.click()}
              disabled={
                currentVisualizerCount >= 2 ||
                uploadVisualizerMutation.isPending
              }
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {isLoadingFiles && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading visualizers...</p>
          </div>
        )}

        {!isLoadingFiles && visualizerFiles.length > 0 && (
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
                      onClick={() =>
                        openPopup(
                          file.fileId,
                          file.originalFileName || file.filename || "Visualizer"
                        )
                      }
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                      title="View in popup"
                    >
                      <ArrowsPointingOutIcon className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveVisualizerFile(file.fileId)}
                      disabled={deleteVisualizerMutation.isPending}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 transition-colors"
                      title="Delete visualizer"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoadingFiles &&
          visualizerFiles.length === 0 &&
          currentVisualizerCount === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CubeTransparentIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm">No visualizers uploaded yet</p>
            </div>
          )}

        {!isLoadingFiles &&
          visualizerFiles.length === 0 &&
          currentVisualizerCount > 0 && (
            <div className="text-center py-8 text-amber-600">
              <CubeTransparentIcon className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">
                Found {currentVisualizerCount} visualizer(s) but failed to load
                metadata
              </p>
            </div>
          )}

        <div
          className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
          } ${currentVisualizerCount >= 2 ? "opacity-50" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CubeTransparentIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {currentVisualizerCount >= 2
              ? "Maximum 2 visualizers reached"
              : "Drag and drop HTML files here, or click upload button"}
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

      {/* Fullscreen Popup Modal */}
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
                <DialogPanel className="w-full h-full max-w-7xl max-h-[90vh] transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CubeTransparentIcon className="h-5 w-5 mr-2 text-blue-600" />
                      {selectedVisualizerForPopup?.title || "Visualizer"}
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
                    {selectedVisualizerForPopup && (
                      <EmbeddedVisualizer
                        fileId={selectedVisualizerForPopup.fileId}
                        title={selectedVisualizerForPopup.title}
                        height="100%"
                        onError={(error) => {
                          console.error("❌ Visualizer error:", error);
                          toast.error("Failed to load visualizer");
                        }}
                        onFileNotFound={() => {
                          const updatedFileIds = visualizerFileIds.filter(
                            (id) => id !== selectedVisualizerForPopup.fileId
                          );
                          onVisualizerFileIdsChange(updatedFileIds);
                          closePopup();
                        }}
                      />
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
