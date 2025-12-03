// src/having/adminSolutions/components/CodeSnippetsManager.tsx

"use client";

import { useState } from "react";
import { CodeBracketIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PROGRAMMING_LANGUAGES, SOLUTION_VALIDATION } from "../constants";
import type { CodeSnippet } from "../types";

interface CodeSnippetsManagerProps {
  codeSnippet?: CodeSnippet;
  onChange: (snippet: CodeSnippet | undefined) => void;
}

export function CodeSnippetsManager({
  codeSnippet,
  onChange,
}: CodeSnippetsManagerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    codeSnippet?.language || "javascript"
  );
  const [code, setCode] = useState(codeSnippet?.code || "");
  const [description, setDescription] = useState(codeSnippet?.description || "");

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    if (code) {
      onChange({
        language,
        code,
        ...(description && { description }),
      });
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (newCode.trim()) {
      onChange({
        language: selectedLanguage,
        code: newCode,
        ...(description && { description }),
      });
    } else {
      onChange(undefined);
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    if (code) {
      onChange({
        language: selectedLanguage,
        code,
        ...(newDescription && { description: newDescription }),
      });
    }
  };

  const handleRemove = () => {
    setCode("");
    setDescription("");
    onChange(undefined);
  };

  const charCount = code.length;
  const isOverLimit = charCount > SOLUTION_VALIDATION.CODE_MAX_LENGTH;
  const isWarning = charCount > SOLUTION_VALIDATION.CODE_MAX_LENGTH * 0.8;

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Programming Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {PROGRAMMING_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Code Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            <CodeBracketIcon className="h-4 w-4 inline mr-1" />
            Code Solution
          </label>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs ${
                isOverLimit
                  ? "text-red-600 font-semibold"
                  : isWarning
                  ? "text-yellow-600"
                  : "text-gray-500"
              }`}
            >
              {charCount.toLocaleString()} / {SOLUTION_VALIDATION.CODE_MAX_LENGTH.toLocaleString()}
            </span>
            {code && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-800"
                title="Remove code snippet"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={`Write your ${selectedLanguage} solution here...`}
          rows={12}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm font-mono ${
            isOverLimit
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />
        {isOverLimit && (
          <p className="mt-1 text-sm text-red-600">
            Code exceeds maximum length of {SOLUTION_VALIDATION.CODE_MAX_LENGTH.toLocaleString()}{" "}
            characters
          </p>
        )}
      </div>

      {/* Description (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Brief description of this code solution..."
          maxLength={SOLUTION_VALIDATION.DESCRIPTION_MAX_LENGTH}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          {description.length} / {SOLUTION_VALIDATION.DESCRIPTION_MAX_LENGTH} characters
        </p>
      </div>

      {/* ✅ REMOVED: Code Preview section */}
    </div>
  );
}

export default CodeSnippetsManager;