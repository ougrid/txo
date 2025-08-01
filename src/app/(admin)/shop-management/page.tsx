'use client';

import React, { useState, useEffect } from 'react';
import { ShopService } from '@/services/shopService';
import { Shop, DashboardStats, Order, Platform } from '@/types/shop';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ShopCard from '@/components/dashboard/ShopCard';
import BarcodeScanner from '@/components/dashboard/BarcodeScanner';
import OrderList from '@/components/dashboard/OrderList';
import PlatformSelector from '@/components/dashboard/PlatformSelector';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function ShopManagementPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview');
  const [highlightScanner, setHighlightScanner] = useState(false);
  const [highlightOrdersTab, setHighlightOrdersTab] = useState(false);
  const [highlightPendingScans, setHighlightPendingScans] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter shops when platform selection changes
  useEffect(() => {
    if (selectedPlatform === 'all') {
      setFilteredShops(shops);
    } else {
      setFilteredShops(shops.filter(shop => shop.platform === selectedPlatform));
    }
  }, [shops, selectedPlatform]);

  // Handle hash navigation for barcode scanner and pending scans
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#barcode-scanner') {
      // Ensure we're on the overview tab first
      setActiveTab('overview');
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById('barcode-scanner');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          
          // Highlight the scanner for 3 seconds
          setHighlightScanner(true);
          setTimeout(() => setHighlightScanner(false), 3000);
        }
      }, 100);
    } else if (hash === '#pending-scans') {
      // Step 3 complex flow: switch to orders tab, then highlight pending scans
      setTimeout(() => {
        // Scroll to the top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Wait 0.5 second after scrolling
        setTimeout(() => {
          // Start highlighting orders tab
          setHighlightOrdersTab(true);
          
          // Switch to orders tab after 2 seconds (while highlighting is still active)
          setTimeout(() => {
            setActiveTab('orders');
            
            // Wait for tab transition (300ms), then end tab highlighting
            setTimeout(() => {
              setHighlightOrdersTab(false);
              
              // Wait 1 second after tab highlighting is done
              setTimeout(() => {
                // Scroll to pending scans section and highlight it
                const pendingScansElement = document.getElementById('pending-scans');
                if (pendingScansElement) {
                  const elementTop = pendingScansElement.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementTop - 100; // Scroll to 100px above the element
                  
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
                
                // Start highlighting pending scans
                setHighlightPendingScans(true);
                setTimeout(() => setHighlightPendingScans(false), 3000);
              }, 1000);
            }, 300);
          }, 2000);
        }, 500);
      }, 100);
    }
  }, []);

  const loadData = () => {
    setIsLoading(true);
    const shopsData = ShopService.getShops();
    const statsData = ShopService.getDashboardStats();
    
    setShops(shopsData);
    setStats(statsData);
    setIsLoading(false);
  };

  const handleRefreshShop = (shopId: string) => {
    const updatedShop = ShopService.refreshShop(shopId);
    if (updatedShop) {
      setShops(prev => prev.map(shop => 
        shop.id === shopId ? updatedShop : shop
      ));
      // Update stats
      setStats(ShopService.getDashboardStats());
    }
  };

  const handleResolveIssue = (shopId: string, issueType: string) => {
    const success = ShopService.resolveShopIssue(shopId, issueType);
    if (success) {
      // Reload data to reflect changes
      loadData();
    }
  };

  const handleScanComplete = (result: { success: boolean; order?: Order; message: string }) => {
    setScanMessage({
      text: result.message,
      type: result.success ? 'success' : 'error'
    });

    if (result.success) {
      // Reload data to reflect the scan
      loadData();
    }

    // Clear message after 5 seconds
    setTimeout(() => setScanMessage(null), 5000);
  };

  const handleQuickScan = (orderSn: string) => {
    const result = ShopService.scanOrder(orderSn);
    handleScanComplete(result);
  };

  // Get shop counts by platform
  const getShopCounts = () => {
    const counts: Record<Platform | 'all', number> = { all: shops.length, shopee: 0, lazada: 0, tiktok: 0 };
    shops.forEach(shop => {
      counts[shop.platform] = (counts[shop.platform] || 0) + 1;
    });
    return counts;
  };

  // Get pending orders
  const getPendingOrders = () => {
    return ShopService.getOrdersByStatus('pending_scan');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
        .highlight-scanner {
          animation: subtlePulse 2s ease-in-out infinite, subtleBounce 2s ease-in-out infinite;
        }
        .highlight-orders-tab {
          animation: subtlePulse 2s ease-in-out infinite, subtleBounce 2s ease-in-out infinite;
        }
        .highlight-pending-scans {
          animation: subtlePulse 2s ease-in-out infinite, subtleBounce 2s ease-in-out infinite;
        }
        `
      }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop Management Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor and manage your multi-platform e-commerce operations</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Tab Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  } ${
                    highlightOrdersTab ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/30 highlight-orders-tab' : ''
                  }`}
                >
                  Orders
                </button>
              </div>
              
              <button 
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scan Message */}
        {scanMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            scanMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {scanMessage.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{scanMessage.text}</span>
            </div>
          </div>
        )}

        {/* Dashboard Overview */}
        {stats && <DashboardOverview stats={stats} />}

        {/* Main Content Based on Active Tab */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Platform Filter */}
            <div className="xl:col-span-1">
              <PlatformSelector
                selectedPlatform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
                shopCounts={getShopCounts()}
              />
              
              {/* Activity Feed */}
              {stats && (
                <ActivityFeed 
                  stats={stats} 
                  className="mt-6"
                />
              )}
            </div>

            {/* Shops Section */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedPlatform === 'all' ? 'All Shops' : `${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Shops`}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {filteredShops.map((shop) => (
                  <ShopCard 
                    key={shop.id} 
                    shop={shop} 
                    onRefresh={handleRefreshShop}
                    onResolveIssue={handleResolveIssue}
                  />
                ))}
              </div>

              {filteredShops.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏪</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedPlatform === 'all' ? 'No shops connected' : `No ${selectedPlatform} shops found`}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedPlatform === 'all' 
                      ? 'Connect your first shop to get started with order management.'
                      : `Try selecting a different platform or connect a ${selectedPlatform} shop.`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Barcode Scanner Section */}
            <div id="barcode-scanner" className="xl:col-span-1 scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Scanner</h2>
              <BarcodeScanner 
                onScanComplete={handleScanComplete}
                className={`sticky top-6 transition-all duration-1000 ${
                  highlightScanner ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/30 rounded-lg highlight-scanner' : ''
                }`}
              />
            </div>
          </div>
        ) : (
          /* Orders Tab */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Pending Orders */}
            <div 
              id="pending-scans"
              className={`xl:col-span-2 transition-all duration-1000 ${
                highlightPendingScans ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 -m-4 highlight-pending-scans' : ''
              }`}
            >
              <OrderList
                orders={getPendingOrders()}
                title="Pending Scans"
                emptyMessage="No orders pending scan"
                showActions={true}
                onScanOrder={handleQuickScan}
              />
            </div>

            {/* Quick Scanner */}
            <div className="xl:col-span-1">
              <BarcodeScanner 
                onScanComplete={handleScanComplete}
                className="sticky top-6"
              />
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Scanning Activity</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Scanned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.recentActivity.map((order, index) => (
                      <tr key={`${order.order_sn}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                            {order.order_sn}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.awb_number}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={order.productName}>
                            {order.productName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ฿{order.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ {order.scannedAt ? new Date(order.scannedAt).toLocaleTimeString() : 'Scanned'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
