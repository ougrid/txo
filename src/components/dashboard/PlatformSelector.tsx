import React from 'react';
import { Platform } from '@/types/shop';
import { platformConfigs } from '@/services/shopService';

interface PlatformSelectorProps {
  selectedPlatform: Platform | 'all';
  onPlatformChange: (platform: Platform | 'all') => void;
  shopCounts: Record<Platform | 'all', number>;
}

export default function PlatformSelector({ 
  selectedPlatform, 
  onPlatformChange, 
  shopCounts 
}: PlatformSelectorProps) {
  const platforms: Array<{ key: Platform | 'all'; label: string; icon: string }> = [
    { key: 'all', label: 'All Platforms', icon: '🌐' },
    ...Object.entries(platformConfigs).map(([key, config]) => ({
      key: key as Platform,
      label: config.name,
      icon: config.icon
    }))
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter by Platform</h3>
      <div className="space-y-2">
        {platforms.map((platform) => {
          const isSelected = selectedPlatform === platform.key;
          const count = shopCounts[platform.key] || 0;
          const config = platform.key !== 'all' ? platformConfigs[platform.key as Platform] : null;
          const isDisabled = !!(config && !config.isAvailable);
          
          return (
            <button
              key={platform.key}
              onClick={() => !isDisabled && onPlatformChange(platform.key)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-blue-50 border-2 border-blue-200 text-blue-900'
                  : isDisabled
                  ? 'bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{platform.icon}</span>
                <div>
                  <div className="font-medium">{platform.label}</div>
                  {config && config.comingSoon && (
                    <div className="text-xs text-gray-500">Coming Soon</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {count > 0 && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isSelected
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
                {isSelected && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
