'use client';

import React, { useState, useEffect } from 'react';
import { platformConfigs } from '@/services/shopService';
import { Platform } from '@/types/shop';
import ConnectionModal from '@/components/modals/ConnectionModal';

export default function PlatformManagementPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [highlightShopee, setHighlightShopee] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<Platform>>(new Set());

  // Handle hash navigation for Shopee integration
  useEffect(() => {
    // Load connected platforms from localStorage
    const savedConnections = localStorage.getItem('connectedPlatforms');
    if (savedConnections) {
      try {
        const platforms = JSON.parse(savedConnections);
        setConnectedPlatforms(new Set(platforms));
      } catch (error) {
        console.error('Failed to load connected platforms:', error);
      }
    }

    const hash = window.location.hash;
    if (hash === '#shopee-integration') {
      // Scroll to the top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Highlight the Shopee section for 3 seconds without scrolling
      setHighlightShopee(true);
      setTimeout(() => setHighlightShopee(false), 3000);
    }
  }, []);

  const handleConnectPlatform = (platform: Platform) => {
    const config = platformConfigs[platform];
    if (!config.isAvailable) {
      return; // Can't connect to unavailable platforms
    }
    setSelectedPlatform(platform);
    setShowConnectionModal(true);
  };

  const handleConnectionSubmit = async (connectionData: { shopName: string; apiKey: string; partnerId: string }) => {
    // Mock API call - simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock success - add platform to connected platforms
    if (selectedPlatform) {
      const newConnectedPlatforms = new Set([...connectedPlatforms, selectedPlatform]);
      setConnectedPlatforms(newConnectedPlatforms);
      
      // Persist to localStorage
      localStorage.setItem('connectedPlatforms', JSON.stringify([...newConnectedPlatforms]));
    }
    
    console.log('Connected to platform:', selectedPlatform, connectionData);
  };

  const handleCloseModal = () => {
    setShowConnectionModal(false);
    setSelectedPlatform(null);
  };

  const handleDisconnectPlatform = (platform: Platform) => {
    const newConnectedPlatforms = new Set(connectedPlatforms);
    newConnectedPlatforms.delete(platform);
    setConnectedPlatforms(newConnectedPlatforms);
    
    // Update localStorage
    localStorage.setItem('connectedPlatforms', JSON.stringify([...newConnectedPlatforms]));
  };

  return (
    <React.Fragment>
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
        .highlight-shopee {
          animation: subtlePulse 2s ease-in-out infinite, subtleBounce 2s ease-in-out infinite;
        }
        `
      }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Connect and manage your e-commerce platform integrations</p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(platformConfigs).map(([key, config]) => {
            const platform = key as Platform;
            
            return (
              <div 
                key={platform}
                id={platform === 'shopee' ? 'shopee-integration' : undefined}
                className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 transition-all scroll-mt-20 ${
                  config.isAvailable 
                    ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md' 
                    : 'border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                } ${
                  platform === 'shopee' && highlightShopee 
                    ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/30 rounded-lg highlight-shopee' 
                    : ''
                }`}
              >
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      config.isAvailable ? `bg-${config.color}-100 dark:bg-${config.color}-900/30` : 'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        config.isAvailable ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {config.name}
                      </h3>
                      {config.comingSoon && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
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
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Features</h4>
                  <div className="space-y-2">
                    {config.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <svg className={`w-4 h-4 ${
                          config.isAvailable ? 'text-green-500' : 'text-gray-400'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-sm ${
                          config.isAvailable ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection Status & Actions */}
                <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
                  {config.isAvailable ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        {connectedPlatforms.has(platform) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            ✓ Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            Not Connected
                          </span>
                        )}
                      </div>
                      {connectedPlatforms.has(platform) ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleConnectPlatform(platform)}
                            className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Configure</span>
                          </button>
                          <button
                            onClick={() => handleDisconnectPlatform(platform)}
                            className="w-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnectPlatform(platform)}
                          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-orange-600 text-white hover:bg-orange-700"
                        >
                          Connect Shop
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {config.comingSoon ? 'Integration coming soon' : 'Not available'}
                      </div>
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
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
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need Help Connecting?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Getting API Credentials</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Log into your platform&apos;s seller center</li>
                <li>• Navigate to API/Developer settings</li>
                <li>• Generate new API credentials</li>
                <li>• Copy the Partner ID and API key</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Troubleshooting</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Ensure API permissions are enabled</li>
                <li>• Check credential expiration dates</li>
                <li>• Verify shop name spelling</li>
                <li>• Contact support if issues persist</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm">
              📖 View Documentation
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
              💬 Contact Support
            </button>
          </div>
        </div>
      </div>
      </div>

      <ConnectionModal 
        isOpen={showConnectionModal}
        onClose={handleCloseModal}
        platform={selectedPlatform}
        onConnect={handleConnectionSubmit}
      />
    </React.Fragment>
  );
}
