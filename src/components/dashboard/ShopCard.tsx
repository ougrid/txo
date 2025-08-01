import React from 'react';
import { Shop } from '@/types/shop';
import { platformConfigs } from '@/services/shopService';

interface ShopCardProps {
  shop: Shop;
  onRefresh: (shopId: string) => void;
  onResolveIssue: (shopId: string, issueType: string) => void;
}

export default function ShopCard({ shop, onRefresh, onResolveIssue }: ShopCardProps) {
  const platformConfig = platformConfigs[shop.platform];
  
  const getStatusColor = (status: Shop['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApiStatusColor = (apiStatus: Shop['apiStatus']) => {
    switch (apiStatus) {
      case 'healthy':
        return 'text-green-600';
      case 'expired_soon':
        return 'text-yellow-600';
      case 'needs_reconnection':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${platformConfig.color}-100`}>
            {platformConfig.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm truncate max-w-48" title={shop.name}>
              {shop.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(shop.status)}`}>
                {shop.status === 'connected' ? 'Connected' : 
                 shop.status === 'needs_attention' ? 'Needs Attention' : 'Disconnected'}
              </span>
              <span className={`text-xs ${getApiStatusColor(shop.apiStatus)}`}>
                API {shop.apiStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => onRefresh(shop.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh shop data"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{shop.orderStats.totalOrders}</div>
          <div className="text-xs text-gray-500">Total Orders</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{shop.orderStats.scannedOrders}</div>
          <div className="text-xs text-gray-500">Scanned</div>
        </div>
      </div>

      {/* Pending Scans */}
      {shop.orderStats.pendingScans > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-800">
                {shop.orderStats.pendingScans} orders pending scan
              </span>
            </div>
            <button className="text-orange-600 text-xs hover:text-orange-800 transition-colors">
              Start Scanning →
            </button>
          </div>
        </div>
      )}

      {/* Issues */}
      {shop.issues.length > 0 && (
        <div className="space-y-2 mb-4">
          {shop.issues.map((issue, index) => (
            <div 
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(issue.severity)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{issue.message}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onResolveIssue(shop.id, issue.type)}
                  className="text-blue-600 text-xs hover:text-blue-800 transition-colors whitespace-nowrap ml-2"
                >
                  {issue.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Credentials Status */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Last updated: {formatTimeAgo(shop.lastUpdate)}
          </span>
          <span className={`${shop.credentials.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {shop.credentials.isValid 
              ? `API expires in ${shop.credentials.daysUntilExpiry} days`
              : 'API expired'
            }
          </span>
        </div>
      </div>
    </div>
  );
}
