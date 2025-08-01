import React from 'react';
import { DashboardStats } from '@/types/shop';

interface DashboardOverviewProps {
  stats: DashboardStats;
}

export default function DashboardOverview({ stats }: DashboardOverviewProps) {
  const statCards = [
    {
      title: 'Total Shops',
      value: stats.totalShops,
      icon: '🏪',
      color: 'blue',
      description: 'Active shops connected'
    },
    {
      title: 'Connected',
      value: stats.connectedShops,
      icon: '✅',
      color: 'green',
      description: 'Shops running smoothly'
    },
    {
      title: 'Need Attention',
      value: stats.shopsNeedingAttention,
      icon: '⚠️',
      color: 'yellow',
      description: 'Shops requiring action'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: '📦',
      color: 'purple',
      description: 'All-time order count'
    },
    {
      title: 'Pending Scans',
      value: stats.pendingScans,
      icon: '📱',
      color: 'orange',
      description: 'Orders awaiting scan'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400',
      purple: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-400',
      orange: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-400'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div 
          key={index}
          className={`border rounded-lg p-6 ${getColorClasses(card.color)}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{card.icon}</div>
            <div className="text-right">
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm opacity-75">{card.title}</div>
            </div>
          </div>
          <p className="text-xs opacity-75">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
