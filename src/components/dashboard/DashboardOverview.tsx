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
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
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
