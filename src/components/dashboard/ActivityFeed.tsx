import React from 'react';
import { DashboardStats } from '@/types/shop';

interface ActivityFeedProps {
  stats: DashboardStats;
  className?: string;
}

export default function ActivityFeed({ stats, className = '' }: ActivityFeedProps) {
  const activities = [
    ...stats.recentActivity.map(order => ({
      id: `scan-${order.order_sn}`,
      type: 'scan' as const,
      title: 'Order Scanned',
      description: `${order.order_sn} - ${order.productName.substring(0, 50)}${order.productName.length > 50 ? '...' : ''}`,
      timestamp: order.scannedAt || order.created_at,
      amount: order.amount,
      icon: '📱',
      color: 'green'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Latest actions across all shops</p>
      </div>

      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📊</div>
            <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Activity will appear here as you scan orders and manage shops
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getColorClasses(activity.color)}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      ฿{activity.amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activities.length > 10 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}
