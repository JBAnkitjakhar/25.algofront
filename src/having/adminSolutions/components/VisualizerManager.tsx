// src/having/adminSolutions/components/VisualizerManager.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import {
  CubeTransparentIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  useUploadVisualizerFile,
  useDeleteVisualizerFile,
  useVisualizerFilesBySolution,
} from "../hooks";
import { adminSolutionsService } from "../service";
import { SOLUTION_VALIDATION } from "../constants";
import toast from "react-hot-toast";
import { EmbeddedVisualizer } from "@/components/common/EmbeddedVisualizer";

interface VisualizerManagerProps {
  solutionId?: string;
  visualizerFileIds: string[];
  onVisualizerFileIdsChange: (fileIds: string[]) => void;
}

export function VisualizerManager({
  solutionId,
}: VisualizerManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);

  const uploadVisualizerMutation = useUploadVisualizerFile();
  const deleteVisualizerMutation = useDeleteVisualizerFile();
  const { data: visualizerFiles, refetch: refetchVisualizers } =
    useVisualizerFilesBySolution(solutionId || "");

  // Get actual count from fetched data
  const currentVisualizerCount = visualizerFiles?.data?.length || 0;

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

      // Check limit BEFORE uploading
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

      // Upload files one by one
      let uploadedCount = 0;
      for (const file of htmlFiles) {
        // Check size
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
          }
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedCount > 0) {
        // Refetch to get updated list
        await refetchVisualizers();
        toast.success(`Successfully uploaded ${uploadedCount} visualizer(s)`);
      }
    },
    [
      solutionId,
      currentVisualizerCount,
      uploadVisualizerMutation,
      refetchVisualizers,
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
        
        // Refetch to get updated list
        await refetchVisualizers();
      } catch (error) {
        console.error("Failed to remove visualizer:", error);
      }
    },
    [deleteVisualizerMutation, refetchVisualizers]
  );

  const handleVisualizerFileNotFound = useCallback(
    async () => {
      // File was deleted, refetch the list
      await refetchVisualizers();
    },
    [refetchVisualizers]
  );

  // Clear file input after selection
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleVisualizerUpload(e.target.files);
      // Clear the input
      e.target.value = "";
    }
  };

  return (
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
            disabled={currentVisualizerCount >= 2 || !solutionId}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !solutionId
                ? "Save solution first to upload visualizers"
                : currentVisualizerCount >= 2
                ? "Maximum 2 visualizers already uploaded"
                : "Upload HTML visualizer"
            }
          >
            <CubeTransparentIcon className="h-4 w-4 mr-2" />
            Upload HTML File
          </button>

          {!solutionId && (
            <div className="text-sm text-amber-600 px-3 py-2 bg-amber-50 border border-amber-200 rounded">
              Save solution first to upload visualizers
            </div>
          )}

          {solutionId && currentVisualizerCount >= 2 && (
            <div className="text-sm text-orange-600 px-3 py-2 bg-orange-50 border border-orange-200 rounded">
              Maximum limit reached (2/2)
            </div>
          )}
        </div>
      </div>

      {visualizerFiles?.data && visualizerFiles.data.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Visualizers ({visualizerFiles.data.length}/2)
          </h4>
          {visualizerFiles.data.map((file) => (
            <div
              key={file.fileId}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <CubeTransparentIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {file.originalFileName || file.filename}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • Uploaded{" "}
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={adminSolutionsService.getVisualizerFileUrl(
                      file.fileId
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    title="Open visualizer in new tab"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    New Tab
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveVisualizerFile(file.fileId)}
                    disabled={deleteVisualizerMutation.isPending}
                    className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    title="Delete visualizer"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-0">
                <EmbeddedVisualizer
                  fileId={file.fileId}
                  title={file.originalFileName || "Algorithm Visualizer"}
                  height="400px"
                  onError={(error) => {
                    console.error("Visualizer error:", error);
                  }}
                  onFileNotFound={handleVisualizerFileNotFound}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center ${
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
  );
}