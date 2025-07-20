"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  disabled?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/csv': ['.csv'],
  },
  disabled = false,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setUploadError(null);

      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          setUploadError(`File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`);
        } else if (error.code === 'file-invalid-type') {
          setUploadError('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV (.csv) files only.');
        } else {
          setUploadError('File upload failed. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  });

  const getBorderColor = () => {
    if (disabled) return 'border-gray-300';
    if (isDragReject || uploadError) return 'border-red-400';
    if (isDragAccept) return 'border-green-400';
    if (isDragActive) return 'border-blue-400';
    return 'border-gray-300 dark:border-gray-600';
  };

  const getBgColor = () => {
    if (disabled) return 'bg-gray-50 dark:bg-gray-800';
    if (isDragReject || uploadError) return 'bg-red-50 dark:bg-red-900/20';
    if (isDragAccept) return 'bg-green-50 dark:bg-green-900/20';
    if (isDragActive) return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-white dark:bg-gray-800';
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${getBorderColor()}
          ${getBgColor()}
          ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {/* Upload Icon */}
          <div className="w-16 h-16 mx-auto">
            <svg
              className="w-full h-full text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive
                ? 'Drop your file here'
                : 'Upload Excel or CSV file'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isDragActive
                ? 'Release to upload'
                : 'Drag and drop your file here, or click to browse'}
            </p>
          </div>

          {/* Supported Formats */}
          <div className="text-xs text-gray-400 dark:text-gray-500">
            <p>Supported formats: .xlsx, .xls, .csv</p>
            <p>Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB</p>
          </div>

          {/* Browse Button */}
          {!isDragActive && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={disabled}
            >
              Browse Files
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mt-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
