"use client";

import React, { useState } from 'react';
import FileUploadZone from './FileUploadZone';
import FilePreview from './FilePreview';
import DataPreview from './DataPreview';
import { processFile, validateParsedData, ParsedData, FileProcessingResult } from './fileProcessing';

interface FileUploadProps {
  onDataProcessed?: (data: ParsedData) => void;
  maxFileSize?: number;
  className?: string;
}

type UploadState = 'idle' | 'processing' | 'success' | 'error';

const FileUpload: React.FC<FileUploadProps> = ({
  onDataProcessed,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className = '',
}) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setValidationErrors([]);
    setParsedData(null);
    setUploadState('processing');

    try {
      const result: FileProcessingResult = await processFile(file);

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to process file');
        setUploadState('error');
        return;
      }

      // Validate the parsed data
      const validation = validateParsedData(result.data);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        // Still allow preview but show warnings
      }

      setParsedData(result.data);
      setUploadState('success');

      // Notify parent component
      if (onDataProcessed) {
        onDataProcessed(result.data);
      }

      // Store in localStorage for future use
      localStorage.setItem('lastUploadedData', JSON.stringify({
        data: result.data,
        timestamp: new Date().toISOString(),
      }));

    } catch (err) {
      console.error('File processing error:', err);
      setError('An unexpected error occurred while processing the file');
      setUploadState('error');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setParsedData(null);
    setError(null);
    setValidationErrors([]);
    setUploadState('idle');
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDataUpdate = (updatedData: ParsedData) => {
    setParsedData(updatedData);
    
    // Notify parent component
    if (onDataProcessed) {
      onDataProcessed(updatedData);
    }

    // Update localStorage
    localStorage.setItem('lastUploadedData', JSON.stringify({
      data: updatedData,
      timestamp: new Date().toISOString(),
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Zone */}
      {!selectedFile && (
        <FileUploadZone
          onFileSelect={handleFileSelect}
          maxSize={maxFileSize}
          disabled={uploadState === 'processing'}
        />
      )}

      {/* File Preview */}
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          onRemove={handleRemoveFile}
          isProcessing={uploadState === 'processing'}
        />
      )}

      {/* Error Display */}
      {error && uploadState === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Processing Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              <div className="mt-3">
                <button
                  onClick={handleRetry}
                  className="bg-red-100 dark:bg-red-900/40 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationErrors.length > 0 && uploadState === 'success' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Data Validation Warnings
              </h3>
              <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                You can still proceed, but please review the data carefully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadState === 'success' && validationErrors.length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                File processed successfully!
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Your file has been parsed and is ready for preview.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview */}
      {parsedData && uploadState === 'success' && (
        <DataPreview 
          data={parsedData} 
          onDataUpdate={handleDataUpdate}
        />
      )}
    </div>
  );
};

export default FileUpload;
