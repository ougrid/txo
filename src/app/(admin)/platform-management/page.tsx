'use client';

import React, { useState } from 'react';
import { platformConfigs } from '@/services/shopService';
import { Platform } from '@/types/shop';

export default function PlatformManagementPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const handleConnectPlatform = (platform: Platform) => {
    const config = platformConfigs[platform];
    if (!config.isAvailable) {
      return; // Can't connect to unavailable platforms
    }
    setSelectedPlatform(platform);
    setShowConnectionModal(true);
  };

  const ConnectionModal = () => {
    if (!selectedPlatform || !showConnectionModal) return null;
    
    const config = platformConfigs[selectedPlatform];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Connect to {config.name}
            </h3>
            <button 
              onClick={() => setShowConnectionModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                placeholder={`Enter your ${config.name} shop name`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partner ID
              </label>
              <input
                type="text"
                placeholder="Enter your Partner ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => setShowConnectionModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Connect Shop
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Management</h1>
          <p className="text-gray-600 mt-2">Connect and manage your e-commerce platform integrations</p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(platformConfigs).map(([key, config]) => {
            const platform = key as Platform;
            
            return (
              <div 
                key={platform}
                className={`bg-white rounded-lg border-2 p-6 transition-all ${
                  config.isAvailable 
                    ? 'border-gray-200 hover:border-blue-300 hover:shadow-md' 
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      config.isAvailable ? `bg-${config.color}-100` : 'bg-gray-100'
                    }`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        config.isAvailable ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {config.name}
                      </h3>
                      {config.comingSoon && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {config.isAvailable && (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
                  <div className="space-y-2">
                    {config.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <svg className={`w-4 h-4 ${
                          config.isAvailable ? 'text-green-500' : 'text-gray-400'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-sm ${
                          config.isAvailable ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection Status & Actions */}
                <div className="border-t border-gray-100 pt-4">
                  {config.isAvailable ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Connected
                        </span>
                      </div>
                      <button
                        onClick={() => handleConnectPlatform(platform)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-${config.color}-600 text-white hover:bg-${config.color}-700`}
                      >
                        Connect Shop
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">
                        {config.comingSoon ? 'Integration coming soon' : 'Not available'}
                      </div>
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                      >
                        {config.comingSoon ? 'Notify Me' : 'Unavailable'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help Connecting?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Getting API Credentials</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Log into your platform&apos;s seller center</li>
                <li>• Navigate to API/Developer settings</li>
                <li>• Generate new API credentials</li>
                <li>• Copy the Partner ID and API key</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Troubleshooting</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure API permissions are enabled</li>
                <li>• Check credential expiration dates</li>
                <li>• Verify shop name spelling</li>
                <li>• Contact support if issues persist</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              📖 View Documentation
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              💬 Contact Support
            </button>
          </div>
        </div>
      </div>

      <ConnectionModal />
    </div>
  );
}
