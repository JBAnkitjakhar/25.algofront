// src/app/questions/[id]/page.tsx - FIXED

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { QuestionCompilerLayout } from '@/having/userQuestion/components/QuestionCompilerLayout';
import { SolutionViewer } from '@/having/userQuestion/components/SolutionViewer';
import { UserApproaches } from '@/having/userQuestion/components/UserApproaches';
import { ApproachEditor } from '@/having/userQuestion/components/ApproachEditor';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle,
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  FileText,
  FolderOpen,
  Check,
  X,
  Play,
  Code,
  Upload,
} from 'lucide-react';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import { QUESTION_LEVEL_LABELS, QUESTION_LEVEL_COLORS } from '@/constants';
import { dateUtils } from '@/lib/utils/common';
import type { SolutionSummary, ApproachDetail } from '@/having/userQuestion/types';
import { useQuestionPageData, useUpdateQuestionProgress } from '@/having/userQuestion/hooks';
import { TipTapViewer } from '@/having/userQuestion/components/TipTapViewer';

// Keep existing SolutionCard component
function SolutionCard({ solution, onClick }: { solution: SolutionSummary; onClick: () => void }) {
  // const { data: visualizerFiles } = useVisualizerFilesBySolution(solution.id);
  // const hasVisualizers = Boolean(visualizerFiles?.data && visualizerFiles.data.length > 0);

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By {solution.createdByName} • {dateUtils.formatRelativeTime(solution.createdAt)}
          </p>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="text-gray-700 dark:text-gray-300 line-clamp-3 text-sm">
          {solution.content
            .replace(/<[^>]*>/g, '')
            .substring(0, 200)}
          {solution.content.length > 200 ? "..." : ""}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {solution.codeSnippet && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs">
            <Code className="w-3 h-3 mr-1" />
            {solution.codeSnippet.language}
          </span>
        )}
        {solution.youtubeLink && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs">
            <Play className="w-3 h-3 mr-1" />
            Video
          </span>
        )}
        {solution.driveLink && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs">
            <FolderOpen className="w-3 h-3 mr-1" />
            Resources
          </span>
        )}
        {solution.imageUrls && solution.imageUrls.length > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
            {solution.imageUrls.length} Image{solution.imageUrls.length !== 1 ? 's' : ''}
          </span>
        )}
        {/* {hasVisualizers && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs">
            <CubeTransparentIcon className="w-3 h-3 mr-1" />
            Visualizer
          </span>
        )} */}
      </div>
    </div>
  );
}

type TabType = 'description' | 'solutions' | 'submissions';

function QuestionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [selectedSolution, setSelectedSolution] = useState<SolutionSummary | null>(null);
  const [editingApproach, setEditingApproach] = useState<ApproachDetail | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const isResizingRef = useRef(false);

  // Fetch all data
  const { question, progress, solutions, approaches, isLoading, isError } = 
    useQuestionPageData(questionId);
  // const { data: category } = useCategoryById(question?.categoryId || '');
  const updateProgressMutation = useUpdateQuestionProgress();

  // Panel resizing
  const handlePanelMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercent, 30), 70);
      setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      isResizingRef.current = false;
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [leftPanelWidth]);

  const handleToggleSolved = () => {
    if (updateProgressMutation.isPending) return;
    
    updateProgressMutation.mutate({
      questionId,
      solved: !(progress?.solved || false)
    });
  };

  const handleEditApproach = (approach: ApproachDetail) => {
    setEditingApproach(approach);
  };

  useEffect(() => {
    const savedWidth = localStorage.getItem("question_panel_width");
    if (savedWidth) setLeftPanelWidth(parseFloat(savedWidth));
  }, []);

  useEffect(() => {
    localStorage.setItem("question_panel_width", leftPanelWidth.toString());
  }, [leftPanelWidth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Question Not Found
          </h3>
          <button
            onClick={() => router.push('/questions')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  const levelColors = QUESTION_LEVEL_COLORS[question.level];

  return (
    <UserLayout>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {selectedSolution ? (
          <div className="h-full">
            <SolutionViewer 
              solution={selectedSolution} 
              onBack={() => setSelectedSolution(null)}
            />
          </div>
        ) : editingApproach ? (
          <div className="h-full">
            <ApproachEditor
              approach={editingApproach}
              onBack={() => setEditingApproach(null)}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 flex min-h-0">
              {/* Left Panel - Compiler */}
              <div
                className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
                style={{ width: `${leftPanelWidth}%` }}
              >
                <QuestionCompilerLayout question={question} />
              </div>

              {/* Resizer */}
              <div
                className="w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
                onMouseDown={handlePanelMouseDown}
              >
                <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
              </div>

              {/* Right Panel - Question Info */}
              <div
                className="flex flex-col bg-white dark:bg-gray-800"
                style={{ width: `${100 - leftPanelWidth}%` }}
              >
                {/* Breadcrumb */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {/* {category && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <button
                          onClick={() => router.push(`/categories/${category.id}`)}
                          className="hover:text-gray-700 dark:hover:text-gray-300 truncate"
                        >
                          {category.name}
                        </button>
                      </>
                    )} */}
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900 dark:text-white font-medium truncate">
                      {question.title}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="sticky top-10 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <nav className="flex px-1">
                    {[
                      { id: 'description' as TabType, label: 'Description', icon: FileText },
                      { id: 'solutions' as TabType, label: `Solutions (${solutions.length})`, icon: Lightbulb },
                      { id: 'submissions' as TabType, label: `My Approaches (${approaches.length})`, icon: Upload },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-1.5 px-3 py-0.5 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {activeTab === 'description' && (
                    <div className="p-4">
                      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2 mb-3">
                          {progress?.solved ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {question.title}
                          </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-sm font-medium border ${levelColors.bg} ${levelColors.text} ${levelColors.border}`}>
                              {QUESTION_LEVEL_LABELS[question.level]}
                            </span>
                            
                            {/* {category && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <FolderOpen className="w-4 h-4" />
                                <span>{category.name}</span>
                              </div>
                            )} */}

                            {progress?.solved && progress.solvedAt && (
                              <div className="flex items-center space-x-2 text-sm text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Solved on {dateUtils.formatDate(progress.solvedAt)}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={handleToggleSolved}
                            disabled={updateProgressMutation.isPending}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
                              progress?.solved
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            } ${updateProgressMutation.isPending ? 'opacity-50' : ''}`}
                          >
                            {updateProgressMutation.isPending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : progress?.solved ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>{updateProgressMutation.isPending ? 'Updating...' : progress?.solved ? 'Mark Unsolved' : 'Mark Solved'}</span>
                          </button>
                        </div>
                      </div>
                      
                      <TipTapViewer 
                        content={question.statement}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  )}

                  {activeTab === 'solutions' && (
                    <div className="p-4 space-y-4">
                      {solutions.length === 0 ? (
                        <div className="text-center py-12">
                          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Solutions Yet
                          </h3>
                        </div>
                      ) : (
                        solutions.map((solution) => (
                          <SolutionCard
                            key={solution.id}
                            solution={solution}
                            onClick={() => setSelectedSolution(solution)}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'submissions' && (
                    <div className="p-4">
                      <UserApproaches 
                        questionId={questionId} 
                        onEditApproach={handleEditApproach}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}

export default function QuestionDetailPage() {
  return (
    <ProtectedRoute>
      <QuestionDetailContent />
    </ProtectedRoute>
  );
}