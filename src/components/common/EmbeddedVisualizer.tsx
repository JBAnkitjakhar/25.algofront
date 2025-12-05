// src/components/common/EmbeddedVisualizer.tsx - SIMPLIFIED VERSION (if still needed elsewhere)

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface EmbeddedVisualizerProps {
  fileId: string;
  title?: string;
  className?: string;
  height?: string;
}

export function EmbeddedVisualizer({
  fileId,
  title = "Algorithm Visualizer",
  className = "",
  height = "400px",
}: EmbeddedVisualizerProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const token = document.cookie.split('token=')[1]?.split(';')[0];
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"}/files/visualizers/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load visualizer");
        }

        const htmlText = await response.text();
        setHtmlContent(htmlText);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load visualizer");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [fileId]);

  if (error) {
    return (
      <div className={`border rounded-lg p-4 text-red-600 border-red-200 bg-red-50 ${className}`}>
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mr-3 mt-0.5" />
          <div>
            <div className="font-medium text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
      <div className="relative bg-white" style={{ height }}>
        <iframe
          key={fileId}
          srcDoc={htmlContent}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}