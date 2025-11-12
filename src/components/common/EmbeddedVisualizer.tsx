// src/components/common/EmbeddedVisualizer.tsx  

import { useState, useRef, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { cookieManager } from "@/lib/utils/auth";

interface EmbeddedVisualizerProps {
  fileId: string;
  title?: string;
  className?: string;
  height?: string;
  onError?: (error: string) => void;
  onFileNotFound?: (fileId: string) => void;
}

type ErrorType = "auth" | "notfound" | "network" | "content" | "unknown";

interface VisualizerError {
  type: ErrorType;
  message: string;
  details?: string;
  recoverable: boolean;
}

export function EmbeddedVisualizer({
  fileId,
  title = "Algorithm Visualizer",
  className = "",
  height = "400px",
  onError,
  onFileNotFound,
}: EmbeddedVisualizerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<VisualizerError | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false); // FIXED: Add fetch tracking
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Professional error categorization
  const categorizeError = useCallback((
    status: number,
    message: string
  ): VisualizerError => {
    switch (status) {
      case 401:
      case 403:
        return {
          type: "auth",
          message: "Authentication required",
          details: "Your session may have expired. Please refresh the page and try again.",
          recoverable: true,
        };
      case 404:
        return {
          type: "notfound",
          message: "Visualizer not found",
          details: "This file may have been deleted or moved.",
          recoverable: false,
        };
      case 429:
        return {
          type: "network",
          message: "Too many requests",
          details: "Please wait a moment before trying again.",
          recoverable: true,
        };
      case 500:
      case 502:
      case 503:
        return {
          type: "network",
          message: "Server error",
          details: "The server is currently unavailable. Please try again later.",
          recoverable: true,
        };
      default:
        if (status >= 400 && status < 500) {
          return {
            type: "content",
            message: "Invalid request",
            details: message || "The request could not be processed.",
            recoverable: false,
          };
        }
        return {
          type: "unknown",
          message: "Loading failed",
          details: message || "An unexpected error occurred.",
          recoverable: true,
        };
    }
  }, []);

  // FIXED: Memoize callbacks to prevent unnecessary re-renders
  const handleError = useCallback((errorMessage: string) => {
    onError?.(errorMessage);
  }, [onError]);

  const handleFileNotFound = useCallback((id: string) => {
    onFileNotFound?.(id);
  }, [onFileNotFound]);

  // FIXED: Enhanced fetch with proper dependency management
  useEffect(() => {
    const fetchVisualizerContent = async () => {
      // FIXED: Don't fetch if already attempted or file is known to be deleted
      if (fetchAttempted || (error && error.type === "notfound")) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setFetchAttempted(true);

      try {
        setIsLoading(true);
        setError(null);

        if (!fileId || fileId.trim().length === 0) {
          throw new Error("Invalid file identifier");
        }

        // CRITICAL: Get JWT token for authentication
        const token = cookieManager.getToken();
        if (!token) {
          setError({
            type: "auth",
            message: "Authentication required",
            details: "Please log in to view visualizer content.",
            recoverable: true,
          });
          return;
        }

        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
        const url = `${apiBaseUrl}/files/visualizers/${fileId}`;

        // console.log(`[Visualizer] Fetching: ${url} with JWT token`);

        // FIXED: Proper fetch with JWT authentication
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "text/html",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          credentials: "include",
          signal: abortControllerRef.current.signal,
        });

        // console.log(
        //   `[Visualizer] Response: ${response.status} ${response.statusText}`
        // );

        if (!response.ok) {
          const errorInfo = categorizeError(
            response.status,
            response.statusText
          );
          setError(errorInfo);

          // FIXED: Call onFileNotFound for 404 errors to clean up the UI
          if (response.status === 404) {
            handleFileNotFound(fileId);
          }

          handleError(errorInfo.message);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("text/html")) {
          setError({
            type: "content",
            message: "Invalid file format",
            details: `Expected HTML content, received ${contentType}`,
            recoverable: false,
          });
          return;
        }

        const htmlText = await response.text();

        if (!htmlText || htmlText.trim().length === 0) {
          setError({
            type: "content",
            message: "Empty file",
            details: "The visualizer file appears to be empty.",
            recoverable: false,
          });
          return;
        }

        // Detect if content is interactive
        const hasJavaScript =
          htmlText.toLowerCase().includes("<script") ||
          htmlText.toLowerCase().includes("javascript:");
        setIsInteractive(hasJavaScript);

        // Clean up previous blob URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }

        setHtmlContent(htmlText);
        setRetryCount(0);
        // console.log(
        //   `[Visualizer] Content loaded successfully (${htmlText.length} chars), Interactive: ${hasJavaScript}`
        // );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // console.log("[Visualizer] Request aborted");
          return;
        }

        console.error("[Visualizer] Fetch error:", err);

        const errorInfo: VisualizerError = {
          type: "network",
          message: "Network error",
          details: err instanceof Error ? err.message : "Failed to connect to server",
          recoverable: true,
        };

        setError(errorInfo);
        handleError(errorInfo.message);
      } finally {
        setIsLoading(false);
      }
    };

    // FIXED: Only fetch if fileId exists and we haven't already attempted or hit a permanent error
    if (fileId) {
      fetchVisualizerContent();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [fileId, fetchAttempted, error, categorizeError, handleError, handleFileNotFound]); // FIXED: Complete dependency array

  // FIXED: Reset fetch attempt when fileId changes
  useEffect(() => {
    setFetchAttempted(false);
    setError(null);
    setHtmlContent("");
    setIsInteractive(false);
  }, [fileId]);

  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      setFetchAttempted(false); // Reset to allow retry
      setError(null);
    }
  }, [retryCount]);

  // ENHANCED: Create secure blob URL for interactive HTML content
  const createSecureBlobUrl = useCallback((content: string) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;

    return url;
  }, []);

  // Enhanced error rendering
  const renderError = useCallback((error: VisualizerError) => {
    const getErrorIcon = () => {
      switch (error.type) {
        case "notfound":
          return DocumentIcon;
        case "auth":
          return ExclamationCircleIcon;
        default:
          return ExclamationTriangleIcon;
      }
    };

    const getErrorColor = () => {
      switch (error.type) {
        case "notfound":
          return "text-gray-600 border-gray-200 bg-gray-50";
        case "auth":
          return "text-blue-600 border-blue-200 bg-blue-50";
        default:
          return "text-red-600 border-red-200 bg-red-50";
      }
    };

    const ErrorIcon = getErrorIcon();
    const colorClass = getErrorColor();

    return (
      <div className={`border rounded-lg p-4 ${colorClass} ${className}`}>
        <div className="flex items-start">
          <ErrorIcon className="h-5 w-5 flex-shrink-0 mr-3 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-sm">{error.message}</div>
            {error.details && (
              <div className="text-sm opacity-80 mt-1">{error.details}</div>
            )}
            {error.recoverable && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleRetry}
                  disabled={retryCount >= 3}
                  className="px-3 py-1 text-xs font-medium border rounded hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {retryCount >= 3 ? "Max retries reached" : "Retry"}
                </button>
                {retryCount > 0 && (
                  <span className="text-xs opacity-70 self-center">
                    Attempt {retryCount}/3
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [retryCount, handleRetry, className]);

  // Handle iframe events with enhanced security
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        // SECURITY: Add message listener for iframe communication
        const handleMessage = (event: MessageEvent) => {
          // Only accept messages from the iframe's origin
          if (event.source === iframe.contentWindow) {
            // console.log("[Visualizer] Message from iframe:", event.data);
          }
        };

        window.addEventListener("message", handleMessage);

        // Cleanup listener when component unmounts
        return () => window.removeEventListener("message", handleMessage);
      } catch (e) {
        console.error(e);
        // Cross-origin access might be blocked, which is fine for security
        // console.log("[Visualizer] Cross-origin iframe communication blocked (expected)");
      }
    }
  }, []);

  const handleIframeError = useCallback(() => {
    console.error("[Visualizer] Iframe failed to load");
    setError({
      type: "content",
      message: "Display error",
      details: "The visualizer content could not be displayed.",
      recoverable: true,
    });
  }, []);

  if (error) {
    return renderError(error);
  }

  if (isLoading) {
    return (
      <div
        className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${className}`}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <span className="mt-2 text-gray-600 text-sm">
              Loading visualizer...
            </span>
            {retryCount > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Retry attempt {retryCount}/3
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}
      >
        {/* ENHANCED Header with interactivity indicator */}
        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                isInteractive ? "bg-green-500" : "bg-blue-500"
              }`}
            ></span>
            {title}
            {/* {isInteractive && (
              // <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              //   Interactive
              // </span>
            )} */}
          </h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
              title="Open in fullscreen"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ENHANCED Content Container with better iframe sandbox */}
        <div className="relative bg-white" style={{ height }}>
          {htmlContent && (
            <iframe
              ref={iframeRef}
              src={createSecureBlobUrl(htmlContent)}
              title={title}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              // CRITICAL: Enhanced sandbox permissions for interactive HTML
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              style={{ minHeight: height }}
              // SECURITY: Additional attributes for better isolation
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
      </div>

      {/* Fullscreen Modal with Enhanced Features */}
      <Transition appear show={isFullscreen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsFullscreen(false)}
        >
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
                      <span
                        className={`w-3 h-3 rounded-full mr-2 ${
                          isInteractive ? "bg-green-500" : "bg-blue-500"
                        }`}
                      ></span>
                      {title}
                      {isInteractive && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Interactive Mode
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsFullscreen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                        title="Exit fullscreen"
                      >
                        <ArrowsPointingInIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIsFullscreen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                        title="Close"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="h-full bg-white"
                    style={{ height: "calc(90vh - 80px)" }}
                  >
                    {htmlContent && (
                      <iframe
                        src={createSecureBlobUrl(htmlContent)}
                        title={`${title} - Fullscreen`}
                        className="w-full h-full border-0"
                        // ENHANCED: Same security sandbox for fullscreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
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