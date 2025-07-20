"use client";

import React from 'react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  isProcessing?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  isProcessing = false,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): React.JSX.Element => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const iconClass = "w-8 h-8";
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return (
          <svg className={`${iconClass} text-green-600`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 2h8v2H6V4zm0 4h4v2H6V8zm0 4h8v2H6v-2z"/>
          </svg>
        );
      case 'csv':
        return (
          <svg className={`${iconClass} text-blue-600`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 2h10v10H5V5z"/>
          </svg>
        );
      default:
        return (
          <svg className={`${iconClass} text-gray-600`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 2h10v10H5V5z"/>
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon(file.name)}
          </div>
          
          {/* File Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)} • {file.type || 'Unknown type'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-600 dark:text-blue-400">Processing...</span>
            </div>
          )}
          
          {/* Remove Button */}
          <button
            onClick={onRemove}
            disabled={isProcessing}
            className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remove file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Processing Progress Bar */}
      {isProcessing && (
        <div className="mt-3">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
