// src/having/adminSolutions/components/SolutionContentArea.tsx

"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { FileText } from "lucide-react";
import { SolutionEditor } from "./SolutionEditor";
import { CubeTransparentIcon } from "@heroicons/react/24/outline";
import { VisualizerManager } from "./VisualizerManager";
import { useVisualizerFilesBySolution } from "../hooks";

interface SolutionContentAreaProps {
  content: string;
  onContentChange: (content: string) => void;
  onEditorReady?: (editor: Editor) => void;
  solutionId?: string;
  visualizerFileIds: string[];
  onVisualizerFileIdsChange: (fileIds: string[]) => void;
}

export function SolutionContentArea({
  content,
  onContentChange,
  onEditorReady,
  solutionId,
  visualizerFileIds,
  onVisualizerFileIdsChange,
}: SolutionContentAreaProps) {
  const [activeView, setActiveView] = useState<"editor" | "visualizers">("editor");
  
  // Fetch actual visualizers to get correct count
  const { data: visualizerFiles } = useVisualizerFilesBySolution(solutionId || "");
  const actualVisualizerCount = visualizerFiles?.data?.length || 0;

  // Sync visualizerFileIds with actual uploaded files
  useEffect(() => {
    if (visualizerFiles?.data && solutionId) {
      const fileIds = visualizerFiles.data.map(file => file.fileId);
      if (JSON.stringify(fileIds) !== JSON.stringify(visualizerFileIds)) {
        onVisualizerFileIdsChange(fileIds);
      }
    }
  }, [visualizerFiles, solutionId, visualizerFileIds, onVisualizerFileIdsChange]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveView("editor")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === "editor"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            <FileText className="w-4 h-4" />
            Solution Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveView("visualizers")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === "visualizers"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            <CubeTransparentIcon className="w-4 h-4" />
            Visualizers ({actualVisualizerCount}/2)
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeView === "editor" ? (
          <SolutionEditor
            content={content}
            onChange={onContentChange}
            onEditorReady={onEditorReady}
            placeholder="Explain your solution approach, algorithm, and implementation details..."
          />
        ) : (
          <VisualizerManager
            solutionId={solutionId}
            visualizerFileIds={visualizerFileIds}
            onVisualizerFileIdsChange={onVisualizerFileIdsChange}
          />
        )}
      </div>
    </div>
  );
}