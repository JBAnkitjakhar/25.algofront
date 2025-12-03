// src/having/adminSolutions/components/LinksManager.tsx
// FIXED: Client-side validation without API calls

"use client";

import { useState, useCallback } from "react";
import { LinkIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface LinksManagerProps {
  youtubeLink?: string;
  onYoutubeLinkChange: (link: string) => void;
  driveLink?: string;
  onDriveLinkChange: (link: string) => void;
}

export function LinksManager({
  youtubeLink,
  onYoutubeLinkChange,
  driveLink,
  onDriveLinkChange,
}: LinksManagerProps) {
  const [youtubeLinkInput, setYoutubeLinkInput] = useState(youtubeLink || "");
  const [driveLinkInput, setDriveLinkInput] = useState(driveLink || "");
  const [youtubeError, setYoutubeError] = useState<string | undefined>();
  const [driveError, setDriveError] = useState<string | undefined>();

  // ✅ Client-side YouTube validation
  const validateYoutubeLink = (link: string): { valid: boolean; error?: string } => {
    if (!link.trim()) {
      return { valid: true }; // Empty is valid (optional field)
    }

    // YouTube URL patterns
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/, // https://www.youtube.com/watch?v=VIDEO_ID
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/, // https://www.youtube.com/embed/VIDEO_ID
      /^https?:\/\/youtu\.be\/[\w-]+/, // https://youtu.be/VIDEO_ID
    ];

    const isValid = patterns.some(pattern => pattern.test(link));

    if (!isValid) {
      return {
        valid: false,
        error: "Invalid YouTube URL. Use format: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID"
      };
    }

    return { valid: true };
  };

  // ✅ Client-side Drive validation
  const validateDriveLink = (link: string): { valid: boolean; error?: string } => {
    if (!link.trim()) {
      return { valid: true }; // Empty is valid (optional field)
    }

    // Google Drive URL patterns
    const patterns = [
      /^https?:\/\/drive\.google\.com\/file\/d\/[\w-]+/, // https://drive.google.com/file/d/FILE_ID
      /^https?:\/\/drive\.google\.com\/open\?id=[\w-]+/, // https://drive.google.com/open?id=FILE_ID
      /^https?:\/\/docs\.google\.com\//, // https://docs.google.com/...
    ];

    const isValid = patterns.some(pattern => pattern.test(link));

    if (!isValid) {
      return {
        valid: false,
        error: "Invalid Google Drive URL. Use format: drive.google.com/file/d/FILE_ID"
      };
    }

    return { valid: true };
  };

  // ✅ Handle YouTube link change
  const handleYoutubeLinkBlur = useCallback(() => {
    if (youtubeLinkInput === youtubeLink) return;

    const validation = validateYoutubeLink(youtubeLinkInput);
    
    if (validation.valid) {
      setYoutubeError(undefined);
      onYoutubeLinkChange(youtubeLinkInput.trim());
    } else {
      setYoutubeError(validation.error);
    }
  }, [youtubeLinkInput, youtubeLink, onYoutubeLinkChange]);

  // ✅ Handle Drive link change
  const handleDriveLinkBlur = useCallback(() => {
    if (driveLinkInput === driveLink) return;

    const validation = validateDriveLink(driveLinkInput);
    
    if (validation.valid) {
      setDriveError(undefined);
      onDriveLinkChange(driveLinkInput.trim());
    } else {
      setDriveError(validation.error);
    }
  }, [driveLinkInput, driveLink, onDriveLinkChange]);

  // ✅ Real-time validation on input change
  const handleYoutubeInputChange = (value: string) => {
    setYoutubeLinkInput(value);
    if (value.trim()) {
      const validation = validateYoutubeLink(value);
      setYoutubeError(validation.error);
    } else {
      setYoutubeError(undefined);
    }
  };

  const handleDriveInputChange = (value: string) => {
    setDriveLinkInput(value);
    if (value.trim()) {
      const validation = validateDriveLink(value);
      setDriveError(validation.error);
    } else {
      setDriveError(undefined);
    }
  };

  return (
    <div className="space-y-4">
      {/* YouTube Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <LinkIcon className="h-4 w-4 inline mr-1" />
          YouTube Video Link
        </label>
        <div className="relative">
          <input
            type="url"
            value={youtubeLinkInput}
            onChange={(e) => handleYoutubeInputChange(e.target.value)}
            onBlur={handleYoutubeLinkBlur}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm pr-10 ${
              youtubeError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {youtubeLinkInput && !youtubeError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
          )}
          {youtubeError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <XCircleIcon className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {youtubeError && (
          <p className="mt-1 text-xs text-red-600">{youtubeError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Provide a YouTube video explaining this solution
        </p>
      </div>

      {/* Google Drive Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <LinkIcon className="h-4 w-4 inline mr-1" />
          Google Drive Link
        </label>
        <div className="relative">
          <input
            type="url"
            value={driveLinkInput}
            onChange={(e) => handleDriveInputChange(e.target.value)}
            onBlur={handleDriveLinkBlur}
            placeholder="https://drive.google.com/file/d/..."
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm pr-10 ${
              driveError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {driveLinkInput && !driveError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
          )}
          {driveError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <XCircleIcon className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {driveError && (
          <p className="mt-1 text-xs text-red-600">{driveError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Link to additional resources (PDFs, notes, etc.)
        </p>
      </div>
    </div>
  );
}

export default LinksManager;