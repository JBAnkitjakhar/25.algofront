// src/having/adminquestions/components/CodeSnippetsManager.tsx

"use client";

import { TrashIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { PROGRAMMING_LANGUAGES } from "../constants";
import type { CodeSnippet } from "../types";

interface CodeSnippetsManagerProps {
  codeSnippets: CodeSnippet[];
  onChange: (snippets: CodeSnippet[]) => void;
}

export function CodeSnippetsManager({
  codeSnippets,
  onChange,
}: CodeSnippetsManagerProps) {
  const addCodeSnippet = () => {
    const defaultLanguage = PROGRAMMING_LANGUAGES[0];

    const newSnippet: CodeSnippet = {
      language: defaultLanguage.value,
      code: defaultLanguage.template,
      description: `${defaultLanguage.label} starter template`,
    };
    onChange([...codeSnippets, newSnippet]);
  };

  const updateCodeSnippet = (
    index: number,
    field: keyof CodeSnippet,
    value: string
  ) => {
    const updated = codeSnippets.map((snippet, i) =>
      i === index ? { ...snippet, [field]: value } : snippet
    );
    onChange(updated);
  };

  const removeCodeSnippet = (index: number) => {
    onChange(codeSnippets.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (index: number, language: string) => {
    const selectedLanguage = PROGRAMMING_LANGUAGES.find(
      (lang) => lang.value === language
    );
    const template = selectedLanguage?.template || "";
    const description = `${selectedLanguage?.label} starter template`;

    const updated = codeSnippets.map((snippet, i) =>
      i === index
        ? {
            ...snippet,
            language: language,
            code: template,
            description: description,
          }
        : snippet
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {codeSnippets.map((snippet, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Code Template {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => removeCodeSnippet(index)}
              className="text-red-600 hover:text-red-800"
              title="Remove code snippet"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Language
              </label>
              <select
                value={snippet.language}
                onChange={(e) => handleLanguageChange(index, e.target.value)}
                className="w-full text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Description
              </label>
              <input
                type="text"
                value={snippet.description}
                onChange={(e) =>
                  updateCodeSnippet(index, "description", e.target.value)
                }
                className="w-full text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Brief description of this template"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Code Template
            </label>
            <textarea
              value={snippet.code}
              onChange={(e) => updateCodeSnippet(index, "code", e.target.value)}
              className="w-full h-32 text-sm font-mono rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter starter code template..."
            />
          </div>
        </div>
      ))}

      {codeSnippets.length < 10 && (
        <button
          type="button"
          onClick={addCodeSnippet}
          className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CodeBracketIcon className="h-4 w-4 mr-2" />
          Add Code Template
        </button>
      )}

      <div className="text-xs text-gray-500">
        Code templates help users get started with their solutions. Maximum 10
        templates per question.
      </div>
    </div>
  );
}