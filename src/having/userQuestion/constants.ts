// src/having/userQuestion/constants.ts

export const USER_QUESTION_QUERY_KEYS = {
  DETAIL: (id: string) => ['user-question', 'detail', id],
  PROGRESS: (id: string) => ['user-question', 'progress', id],
  SOLUTIONS: (id: string) => ['user-question', 'solutions', id],
  APPROACHES: (id: string) => ['user-question', 'approaches', id],
  APPROACH_DETAIL: (questionId: string, approachId: string) => 
    ['user-question', 'approach', questionId, approachId],
  // ✅ Only content query - no metadata needed
  VISUALIZER_CONTENT: (fileId: string) => 
    ['user-question', 'visualizer-content', fileId],
} as const;