'use client';

import React, { useState } from 'react';
import { useDashboard, useDashboardAnalytics } from '@/context/DashboardContext';
import { DateFilter } from '@/utils/analytics/types';
import { DateFilterUtils } from '@/utils/analytics/dateFilters';

export default function AnalyticsPage() {
  const { 
    primaryDashboard, 
    isLoading, 
    error, 
    selectedDatasets, 
    aggregatedAnalytics 
  } = useDashboard();
  const singleAnalytics = useDashboardAnalytics();
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter | null>(null);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDateRange, setShowCustomDateRange] = useState<boolean>(false);

  // Use aggregated analytics if datasets are selected, otherwise use single dashboard analytics
  const analytics = selectedDatasets.length > 0 ? aggregatedAnalytics : singleAnalytics;
  const hasData = analytics !== null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-lg font-medium">Error loading dashboard</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Dashboard Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload and process your sales data to view analytics dashboard.
          </p>
          <a
            href="/file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload Data
          </a>
        </div>
      </div>
    );
  }

  const quickFilters = DateFilterUtils.getQuickDateRanges();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sales Analytics Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {selectedDatasets.length > 0 
                    ? `Analyzing ${selectedDatasets.length} selected dataset${selectedDatasets.length !== 1 ? 's' : ''}`
                    : primaryDashboard?.fileName
                  } • Last updated: {' '}
                  {new Date(analytics.metadata.lastUpdated).toLocaleString('th-TH')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Date Filter */}
                <div className="flex items-center space-x-2">
                  <select
                    value={showCustomDateRange ? 'custom' : (selectedDateFilter?.type || '')}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomDateRange(true);
                        setSelectedDateFilter(null);
                      } else {
                        setShowCustomDateRange(false);
                        const filter = quickFilters.find(f => f.type === e.target.value);
                        setSelectedDateFilter(filter || null);
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <option value="">All Time</option>
                    {quickFilters.map((filter) => (
                      <option key={filter.type} value={filter.type}>
                        {filter.label}
                      </option>
                    ))}
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <a
                  href="/file-upload"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload New Data
                </a>
              </div>
            </div>
            
            {/* Custom Date Range Section - Positioned below main header */}
            {showCustomDateRange && (
              <div className="mt-4 mx-4 sm:mx-6 lg:mx-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Custom Date Range
                    </h3>
                    <button
                      onClick={() => {
                        setShowCustomDateRange(false);
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Date Input Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <button
                        onClick={() => {
                          if (customStartDate && customEndDate) {
                            const startDate = new Date(customStartDate);
                            const endDate = new Date(customEndDate + 'T23:59:59');
                            const diffInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                            
                            // Check if date range exceeds 90 days (3 months)
                            if (diffInDays > 90) {
                              alert('Data range cannot exceed more than 90 days (3 months). Order data older than that cannot be searched or downloaded.');
                              return;
                            }
                            
                            // Check if start date is more than 90 days ago
                            const today = new Date();
                            const maxPastDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                            if (startDate < maxPastDate) {
                              alert('Cannot search for data older than 3 months. Please select a more recent date range.');
                              return;
                            }
                            
                            const customFilter: DateFilter = {
                              type: 'custom',
                              label: `${customStartDate} to ${customEndDate}`,
                              range: {
                                start: startDate,
                                end: endDate
                              }
                            };
                            setSelectedDateFilter(customFilter);
                            setShowCustomDateRange(false);
                          }
                        }}
                        disabled={!customStartDate || !customEndDate}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                  
                  {/* Helper Text and Guidelines */}
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Date Range Guidelines:</p>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                          <li>• Maximum range: 90 days (3 months)</li>
                          <li>• Data older than 3 months cannot be accessed</li>
                          <li>• End date cannot be in the future</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Data Retention Warning */}
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-r-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 text-yellow-400 dark:text-yellow-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Data Retention Policy
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                <strong>Important:</strong> We do not store order data older than 3 months. Order data older than that cannot be searched or downloaded.
              </p>
            </div>
          </div>
        </div>
        
        {/* Data Source Indicator */}
        {selectedDatasets.length > 0 && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Multi-Dataset Analysis Active
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Analyzing data from {selectedDatasets.length} selected dataset{selectedDatasets.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="/dashboard/data"
                  className="inline-flex items-center px-3 py-1.5 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Selection
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">฿</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ฿{analytics.revenue.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Orders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {analytics.orders.totalOrders.toLocaleString('th-TH')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📈</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Avg Order Value
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ฿{analytics.revenue.averageOrderValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Completion Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {analytics.orders.completionRate.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Revenue by Status */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Revenue by Order Status
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.revenue.revenueByStatus).map(([status, revenue]) => {
                const isCancelled = status === 'ยกเลิกแล้ว' || status.toLowerCase().includes('cancelled');
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        status === 'สำเร็จแล้ว' ? 'bg-green-500' :
                        status === 'ยกเลิกแล้ว' ? 'bg-red-500' :
                        status === 'ที่ต้องจัดส่ง' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                      {isCancelled && (
                        <span className="ml-2 text-xs text-red-500 dark:text-red-400 font-medium">
                          (Lost Potential)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        revenue < 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {revenue < 0 ? '-' : ''}฿{Math.abs(revenue).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                      {isCancelled && (
                        <div className="relative group">
                          <svg 
                            className="w-4 h-4 text-red-500 dark:text-red-400 cursor-help" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            Lost potential revenue (not deducted from total)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Explanatory Note */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Revenue Calculation Notes:</p>
                  <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                    <li>• <strong>Completed/Shipping orders:</strong> Show actual escrowed revenue from platform</li>
                    <li>• <strong>Cancelled orders:</strong> Show lost potential revenue (not deducted from total)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Order Status Distribution
            </h3>
            <div className="space-y-3">
              {analytics.orders.statusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      item.status === 'สำเร็จแล้ว' ? 'bg-green-500' :
                      item.status === 'ยกเลิกแล้ว' ? 'bg-red-500' :
                      item.status === 'ที่ต้องจัดส่ง' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Provinces */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Top Provinces by Revenue
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                      Province
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                      Revenue
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.geographic.topProvinces.slice(0, 5).map((province) => (
                    <tr key={province.province}>
                      <td className="py-2 text-sm text-gray-900 dark:text-white">
                        {province.province}
                      </td>
                      <td className="py-2 text-sm text-gray-900 dark:text-white text-right">
                        ฿{province.revenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                        {province.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Top Products by Revenue
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                      Product
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                      Revenue
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.products.topProductsByRevenue.slice(0, 5).map((product, index) => (
                    <tr key={index}>
                      <td className="py-2 text-sm text-gray-900 dark:text-white">
                        <div className="truncate max-w-xs" title={product.name}>
                          {product.name}
                        </div>
                      </td>
                      <td className="py-2 text-sm text-gray-900 dark:text-white text-right">
                        ฿{product.revenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                        {product.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
