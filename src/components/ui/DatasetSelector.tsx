'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { StoredDashboardData } from '@/utils/analytics/types';

interface DatasetSelectorProps {
  className?: string;
}

export function DatasetSelector({ className = '' }: DatasetSelectorProps) {
  const {
    selectedDatasets,
    selectDataset,
    deselectDataset,
    selectAllDatasets,
    deselectAllDatasets,
    selectActiveDatasets,
    getAllStoredData
  } = useDashboard();

  const allData = getAllStoredData();
  const activeData = allData.filter(data => data.isActive);
  const isAllSelected = selectedDatasets.length === allData.length && allData.length > 0;
  const isActiveSelected = selectedDatasets.length === activeData.length && activeData.length > 0 && selectedDatasets.every(id => activeData.some(data => data.id === id));
  const hasSelection = selectedDatasets.length > 0;

  const handleDatasetToggle = (id: string) => {
    if (selectedDatasets.includes(id)) {
      deselectDataset(id);
    } else {
      selectDataset(id);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRevenue = (revenue: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(revenue);
  };

  if (allData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            📊
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No datasets available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Upload your first dataset to start selecting data for analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header with bulk actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Datasets for Analysis
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose which datasets to include in your dashboard analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDatasets.length} of {allData.length} selected
            </span>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={selectAllDatasets}
            disabled={isAllSelected}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Select All ({allData.length})
          </button>
          
          <button
            onClick={selectActiveDatasets}
            disabled={isActiveSelected}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Select Active ({activeData.length})
          </button>
          
          <button
            onClick={deselectAllDatasets}
            disabled={!hasSelection}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Dataset List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {allData.map((dataset: StoredDashboardData) => {
          const isSelected = selectedDatasets.includes(dataset.id);
          const revenue = dataset.analytics.revenue.totalRevenue;
          const orders = dataset.analytics.orders.totalOrders;
          const records = dataset.analytics.metadata.totalRecords;

          return (
            <div
              key={dataset.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => handleDatasetToggle(dataset.id)}
            >
              <div className="flex items-center">
                {/* Checkbox */}
                <div className="flex-shrink-0 mr-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleDatasetToggle(dataset.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                {/* Dataset Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {dataset.fileName}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(dataset.uploadDate)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {records.toLocaleString()} records
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            dataset.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {dataset.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Preview */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatRevenue(revenue)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Revenue
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {orders.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Orders
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {hasSelection && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedDatasets.length} dataset{selectedDatasets.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Analytics will be aggregated from selected datasets
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Ready for analysis
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                View dashboard to see combined insights
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
