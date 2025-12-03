// src/having/adminSolutions/components/SolutionContentArea.tsx
// Middle area with toggle between Editor and Visualizers

"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import { FileText} from "lucide-react";
import { SolutionEditor } from "./SolutionEditor";
import { CubeTransparentIcon } from "@heroicons/react/24/outline";
import { VisualizerManager } from "./VisualizerManager";

interface SolutionContentAreaProps {
  // Editor props
  content: string;
  onContentChange: (content: string) => void;
  onEditorReady?: (editor: Editor) => void;
  
  // Visualizer props
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

  return (
    <div className="flex-1 flex flex-col">
      {/* Toggle Buttons */}
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
            Visualizers ({visualizerFileIds.length}/2)
          </button>
        </div>
      </div>

      {/* Content Area */}
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