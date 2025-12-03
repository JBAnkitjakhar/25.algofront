// src/having/adminSolutions/components/VisualizerManager.tsx
// FIXED VERSION - All errors resolved

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  CubeTransparentIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  useUploadVisualizerFile,
  useDeleteVisualizerFile,
  useVisualizerFilesBySolution,
} from "../hooks";
import { adminSolutionsService } from "../service";
import { SOLUTION_VALIDATION } from "../constants";
import toast from "react-hot-toast";
import { cookieManager } from "@/lib/utils/auth";

// Embedded visualizer component
const EmbeddedVisualizer = ({
  fileId,
  title,
  height = "400px",
  onError,
  onFileNotFound,
}: {
  fileId: string;
  title: string;
  height?: string;
  onError?: (error: Error) => void;
  onFileNotFound?: (fileId: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");

  const handleError = useCallback(
    (err: Error) => {
      onError?.(err);
    },
    [onError]
  );

  const handleFileNotFound = useCallback(
    (id: string) => {
      onFileNotFound?.(id);
    },
    [onFileNotFound]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchVisualizerContent = async () => {
      if (error === "File has been deleted") {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = cookieManager.getToken();
        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
        const url = `${apiBaseUrl}/files/visualizers/${fileId}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "text/html",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        });

        if (!isMounted) return;

        if (!response.ok) {
          if (response.status === 404) {
            handleFileNotFound(fileId);
            setError("File has been deleted");
            return;
          }

          if (response.status === 401) {
            throw new Error(
              "Authentication expired. Please refresh the page and try again."
            );
          }
          throw new Error(`Failed to load visualizer: ${response.status}`);
        }

        const htmlText = await response.text();

        if (!htmlText || htmlText.trim().length === 0) {
          throw new Error("Empty response received from server");
        }

        if (isMounted) {
          setHtmlContent(htmlText);
        }
      } catch (err) {
        if (!isMounted) return;

        const errorMessage =
          err instanceof Error ? err.message : "Failed to load visualizer";
        setError(errorMessage);
        if (!(err instanceof Error && err.message.includes("404"))) {
          handleError(new Error(errorMessage));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (fileId) {
      fetchVisualizerContent();
    }

    return () => {
      isMounted = false;
    };
  }, [fileId, error, handleError, handleFileNotFound]);

  const createBlobUrl = useCallback((content: string) => {
    const blob = new Blob([content], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, []);

  if (error) {
    if (error === "File has been deleted") {
      return (
        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
          <div className="flex items-center text-amber-800">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>
              <div className="font-medium">Visualizer Removed</div>
              <div className="text-sm text-amber-700 mt-1">
                This visualizer has been deleted and is no longer available.
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-center text-red-800">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <div className="font-medium">Unable to load visualizer</div>
            <div className="text-sm text-red-600 mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading visualizer...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative border border-gray-200 rounded-lg overflow-hidden"
      style={{ height }}
    >
      {htmlContent && (
        <iframe
          src={createBlobUrl(htmlContent)}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{ minHeight: height }}
        />
      )}
    </div>
  );
};

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
  const htmlFileInputRef = useRef<HTMLInputElement>(null);

  const uploadVisualizerMutation = useUploadVisualizerFile();
  const deleteVisualizerMutation = useDeleteVisualizerFile();
  const { data: visualizerFiles, refetch: refetchVisualizers } =
    useVisualizerFilesBySolution(solutionId || "");

  // Handle HTML visualizer file upload
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

      const currentVisualizerCount = visualizerFileIds.length;
      const maxVisualizers = SOLUTION_VALIDATION.MAX_VISUALIZERS_PER_SOLUTION;

      if (currentVisualizerCount + htmlFiles.length > maxVisualizers) {
        toast.error(
          `Maximum ${maxVisualizers} HTML visualizers allowed per solution`
        );
        return;
      }

      try {
        const newFileIds: string[] = [];
        for (const file of htmlFiles) {
          // Validate file size
          if (file.size > SOLUTION_VALIDATION.MAX_VISUALIZER_SIZE) {
            toast.error(
              `${file.name} exceeds maximum size of ${
                SOLUTION_VALIDATION.MAX_VISUALIZER_SIZE / 1024
              }KB`
            );
            continue;
          }

          const result = await uploadVisualizerMutation.mutateAsync({
            solutionId,
            file,
          });
          if (result.fileId) {
            newFileIds.push(result.fileId);
          }
        }

        const updatedFileIds = [...visualizerFileIds, ...newFileIds];
        onVisualizerFileIdsChange(updatedFileIds);
        refetchVisualizers();
      } catch (error) {
        console.error("Visualizer upload failed:", error);
      }
    },
    [
      solutionId,
      visualizerFileIds,
      onVisualizerFileIdsChange,
      uploadVisualizerMutation,
      refetchVisualizers,
    ]
  );

  // Handle drag and drop
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

  // Remove visualizer file
  const handleRemoveVisualizerFile = useCallback(
    async (fileId: string) => {
      try {
        const updatedFileIds = visualizerFileIds.filter((id) => id !== fileId);
        onVisualizerFileIdsChange(updatedFileIds);

        await deleteVisualizerMutation.mutateAsync(fileId);

        refetchVisualizers();
      } catch (error) {
        console.error("Failed to remove visualizer:", error);
        onVisualizerFileIdsChange(visualizerFileIds);
      }
    },
    [
      visualizerFileIds,
      onVisualizerFileIdsChange,
      deleteVisualizerMutation,
      refetchVisualizers,
    ]
  );

  const handleVisualizerFileNotFound = useCallback(
    (fileId: string) => {
      const updatedFileIds = visualizerFileIds.filter((id) => id !== fileId);
      if (updatedFileIds.length !== visualizerFileIds.length) {
        onVisualizerFileIdsChange(updatedFileIds);
      }
    },
    [visualizerFileIds, onVisualizerFileIdsChange]
  );

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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => htmlFileInputRef.current?.click()}
            disabled={visualizerFileIds.length >= 2 || !solutionId}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !solutionId
                ? "Save solution first to upload visualizers"
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
        </div>
      </div>

      {/* Visualizer Files List */}
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
              {/* File Info Header */}
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
                  <a // ❌ BROKEN - missing href and other attributes
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
                    className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                    title="Delete visualizer"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Embedded Preview */}
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

      {/* Drag and Drop Zone for HTML files */}
      <div
        className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
        } ${visualizerFileIds.length >= 2 ? "opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CubeTransparentIcon className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {visualizerFileIds.length >= 2
            ? "Maximum 2 visualizers reached"
            : "Drag and drop HTML files here, or click upload button"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          HTML files only • Max 500KB per file
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={htmlFileInputRef}
        type="file"
        multiple
        accept=".html"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleVisualizerUpload(e.target.files);
          }
        }}
      />
    </div>
  );
}
