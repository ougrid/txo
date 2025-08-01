'use client';

import React, { useState, useEffect } from 'react';
import { ShopService } from '@/services/shopService';
import { Order, Shop, DashboardStats } from '@/types/shop';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import OrderList from '@/components/dashboard/OrderList';

export default function OrderAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all');
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [highlightExport, setHighlightExport] = useState(false);

  // Handle hash navigation for export options
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#export-options') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const exportSection = document.getElementById('export-options');
        if (exportSection) {
          exportSection.scrollIntoView({ behavior: 'smooth', block: 'start'});
          
          // Highlight the export section for 3 seconds
          setHighlightExport(true);
          setTimeout(() => setHighlightExport(false), 3000);
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    const shopsData = ShopService.getShops();
    const statsData = ShopService.getDashboardStats();
    
    // Get all orders from different statuses
    const pendingOrders = ShopService.getOrdersByStatus('pending_scan');
    const scannedOrders = ShopService.getScannedOrders();
    const allOrders = [...pendingOrders, ...scannedOrders];
    
    setShops(shopsData);
    setStats(statsData);
    setOrders(allOrders);
    setIsLoading(false);
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    if (selectedShop !== 'all') {
      filtered = filtered.filter(order => order.shopId === selectedShop);
    }
    
    return filtered;
  };

  const getOrderStats = () => {
    const filtered = getFilteredOrders();
    const totalAmount = filtered.reduce((sum, order) => sum + order.amount, 0);
    const averageAmount = filtered.length > 0 ? totalAmount / filtered.length : 0;
    
    const statusCounts = {
      pending_scan: filtered.filter(o => o.status === 'pending_scan').length,
      scanned: filtered.filter(o => o.status === 'scanned').length,
      processed: filtered.filter(o => o.status === 'processed').length,
      shipped: filtered.filter(o => o.status === 'shipped').length,
      delivered: filtered.filter(o => o.status === 'delivered').length,
      completed: filtered.filter(o => o.status === 'completed').length
    };
    
    return {
      totalOrders: filtered.length,
      totalAmount,
      averageAmount,
      statusCounts
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Loading order analytics...</span>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();
  const orderStats = getOrderStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes subtleBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes subtlePulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        .highlight-export {
          animation: subtlePulse 2s ease-in-out infinite, subtleBounce 2s ease-in-out infinite;
        }
        `
      }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Analytics</h1>
          <p className="text-gray-600 mt-2">Detailed view and analysis of all orders across platforms</p>
        </div>

        {/* Dashboard Overview */}
        {stats && <DashboardOverview stats={stats} />}

        {/* Order Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">📊</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{orderStats.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
            </div>
            <p className="text-xs text-gray-500">In current filter</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">💰</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">฿{orderStats.totalAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Sum of order amounts</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">📈</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">฿{orderStats.averageAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Average Order</div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Mean order value</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">📱</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">{orderStats.statusCounts.pending_scan}</div>
                <div className="text-sm text-gray-600">Pending Scans</div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Need attention</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as Order['status'] | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending_scan">Pending Scan</option>
                <option value="scanned">Scanned</option>
                <option value="processed">Processed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Shop Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shop</label>
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Shops</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedStatus !== 'all' || selectedShop !== 'all') && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {selectedStatus.replace('_', ' ')}
                  <button 
                    onClick={() => setSelectedStatus('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedShop !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Shop: {shops.find(s => s.id === selectedShop)?.name?.substring(0, 20) || 'Unknown'}
                  <button 
                    onClick={() => setSelectedShop('all')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedShop('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Order List */}
        <OrderList
          orders={filteredOrders}
          title={`Orders (${filteredOrders.length})`}
          emptyMessage={
            selectedStatus !== 'all' || selectedShop !== 'all' 
              ? "No orders match the current filters" 
              : "No orders found"
          }
        />

        {/* Export Actions */}
        {filteredOrders.length > 0 && (
          <div 
            id="export-options"
            className={`mt-8 bg-white rounded-lg border border-gray-200 p-6 transition-all duration-1000 ${
              highlightExport ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 rounded-lg highlight-export' : ''
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            <p className="text-sm text-gray-600 mb-4">Export data for RPA automation into your ERP system.</p>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export to CSV
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Export to Excel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
