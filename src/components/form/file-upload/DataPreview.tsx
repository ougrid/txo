"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ParsedData, exportToCSV, exportToJSON, exportToExcel, processRevenueCalculation, getStatusBadgeColor } from './fileProcessing';
import Badge from '../../ui/badge/Badge';

interface DataPreviewProps {
  data: ParsedData;
  onClose?: () => void;
  onDataUpdate?: (newData: ParsedData) => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, onClose, onDataUpdate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [processedData, setProcessedData] = useState<ParsedData>(data);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Pagination logic
  const totalPages = Math.ceil(processedData.totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = processedData.rows.slice(startIndex, endIndex);

  // Check if revenue calculation is possible
  const canCalculateRevenue = processedData.totalRows <= 10000 && !processedData.hasRevenueCalculation;

  // Auto-scroll to revenue column after calculation
  useEffect(() => {
    if (processedData.hasRevenueCalculation && tableContainerRef.current) {
      // Scroll to the right to show the new revenue column
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTo({
            left: tableContainerRef.current.scrollWidth,
            behavior: 'smooth'
          });
        }
      }, 100); // Small delay to ensure DOM has updated
    }
  }, [processedData.hasRevenueCalculation]);

  const handleCalculateRevenue = async () => {
    setIsCalculating(true);
    try {
      const calculatedData = processRevenueCalculation(processedData);
      setProcessedData(calculatedData);
      if (onDataUpdate) {
        onDataUpdate(calculatedData);
      }
    } catch (error) {
      console.error('Error calculating revenue:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    let content: string | ArrayBuffer;
    let fileName: string;
    let mimeType: string;

    const baseFileName = processedData.fileName.replace(/\.[^/.]+$/, '');
    const suffix = processedData.hasRevenueCalculation ? '_processed' : '_exported';

    if (format === 'csv') {
      content = exportToCSV(processedData);
      fileName = `${baseFileName}${suffix}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = exportToJSON(processedData);
      fileName = `${baseFileName}${suffix}.json`;
      mimeType = 'application/json';
    } else {
      content = exportToExcel(processedData, true); // With protection
      fileName = `${baseFileName}${suffix}.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
  };

  const renderCellContent = (cell: string | number, columnIndex: number) => {
    // Check if this is the status column
    if (processedData.statusColumnIndex === columnIndex) {
      const status = String(cell).trim();
      const badgeColor = getStatusBadgeColor(status);
      
      return (
        <Badge variant="light" color={badgeColor} size="sm">
          {status}
        </Badge>
      );
    }

    // Check if this is the revenue column (last column when calculated)
    if (processedData.hasRevenueCalculation && columnIndex === processedData.headers.length - 1) {
      const revenue = parseFloat(String(cell));
      const isZero = isNaN(revenue) || revenue === 0;
      
      return (
        <span className={`font-medium ${
          isZero 
            ? 'text-gray-500 dark:text-gray-400' 
            : 'text-green-600 dark:text-green-400'
        }`}>
          ฿{isNaN(revenue) ? '0.00' : revenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
      );
    }

    return String(cell);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Data Preview
              {processedData.hasRevenueCalculation && (
                <span className="ml-2">
                  <Badge variant="light" color="success" size="sm">
                    Revenue Calculated
                  </Badge>
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {processedData.fileName} • {processedData.totalRows} rows • {processedData.headers.length} columns
            </p>
            
            {/* Calculation Summary */}
            {processedData.calculationSummary && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Total Revenue: </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ฿{processedData.calculationSummary.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
                <span className="mx-2">•</span>
                <span>{processedData.calculationSummary.processedRows} orders processed</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Calculate Revenue Button */}
            {canCalculateRevenue && (
              <button
                onClick={handleCalculateRevenue}
                disabled={isCalculating}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCalculating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </>
                ) : (
                  'Calculate Revenue'
                )}
              </button>
            )}

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                onClick={() => processedData.hasRevenueCalculation && setShowExportMenu(!showExportMenu)}
                disabled={!processedData.hasRevenueCalculation}
                className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  processedData.hasRevenueCalculation
                    ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                }`}
              >
                Export
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Tooltip for disabled state */}
              {!processedData.hasRevenueCalculation && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                  Calculate revenue first to enable export
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}

              {showExportMenu && processedData.hasRevenueCalculation && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('excel')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Export as Excel (Protected)
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rows per page:
            </label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={1000}>1000</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, processedData.totalRows)} of {processedData.totalRows} rows
          </div>
        </div>
      </div>

      {/* Table */}
      <div ref={tableContainerRef} className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {processedData.headers.map((header, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    processedData.hasRevenueCalculation && index === processedData.headers.length - 1
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : ''
                  }`}
                >
                  {header}
                  {processedData.hasRevenueCalculation && index === processedData.headers.length - 1 && (
                    <span className="ml-1">
                      <Badge variant="light" color="success" size="sm">
                        New
                      </Badge>
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentRows.map((row, rowIndex) => (
              <tr key={startIndex + rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      processedData.hasRevenueCalculation && cellIndex === processedData.headers.length - 1
                        ? 'bg-green-50 dark:bg-green-900/10 font-medium'
                        : 'text-gray-900 dark:text-gray-300'
                    }`}
                  >
                    {renderCellContent(cell, cellIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};

export default DataPreview;
