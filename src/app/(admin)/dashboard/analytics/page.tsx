'use client';

import React, { useState } from 'react';
import { useDashboard, useDashboardAnalytics, useIsDashboardReady } from '@/context/DashboardContext';
import { DateFilter } from '@/utils/analytics/types';
import { DateFilterUtils } from '@/utils/analytics/dateFilters';

export default function AnalyticsPage() {
  const { 
    activeDashboard, 
    isLoading, 
    error, 
    selectedDatasets, 
    aggregatedAnalytics 
  } = useDashboard();
  const singleAnalytics = useDashboardAnalytics();
  const isReady = useIsDashboardReady();
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter | null>(null);

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
                    : activeDashboard?.fileName
                  } • Last updated: {' '}
                  {new Date(analytics.metadata.lastUpdated).toLocaleString('th-TH')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Date Filter */}
                <select
                  value={selectedDateFilter?.type || ''}
                  onChange={(e) => {
                    const filter = quickFilters.find(f => f.type === e.target.value);
                    setSelectedDateFilter(filter || null);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <option value="">All Time</option>
                  {quickFilters.map((filter) => (
                    <option key={filter.type} value={filter.type}>
                      {filter.label}
                    </option>
                  ))}
                </select>
                
                <a
                  href="/file-upload"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload New Data
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
              {Object.entries(analytics.revenue.revenueByStatus).map(([status, revenue]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      status === 'สำเร็จแล้ว' ? 'bg-green-500' :
                      status === 'ยกเลิกแล้ว' ? 'bg-red-500' :
                      status === 'ที่ต้องจัดส่ง' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ฿{revenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
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
