'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Platform } from '@/types/shop';
import { platformConfigs } from '@/services/shopService';

interface ConnectionData {
  shopName: string;
  apiKey: string;
  partnerId: string;
}

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform | null;
  onConnect: (data: ConnectionData) => Promise<void>;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ 
  isOpen, 
  onClose, 
  platform, 
  onConnect 
}) => {
  // Internal state only - no external dependencies
  const [formData, setFormData] = useState<ConnectionData>({
    shopName: '',
    apiKey: '',
    partnerId: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Add blur effect when modal opens - must be before early return
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Early return pattern like WorkflowDiagramModal
  if (!isOpen || !platform) return null;

  // Simple, stable event handlers
  const handleInputChange = (field: keyof ConnectionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.shopName || !formData.apiKey || !formData.partnerId) {
      return;
    }

    setIsConnecting(true);
    
    try {
      await onConnect(formData);
      // Reset form on success
      setFormData({ shopName: '', apiKey: '', partnerId: '' });
      setShowApiKey(false);
      onClose();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    setFormData({ shopName: '', apiKey: '', partnerId: '' });
    setShowApiKey(false);
    // Remove blur effect from body
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    onClose();
  };

  const isFormValid = formData.shopName && formData.apiKey && formData.partnerId;

  // Early return pattern like WorkflowDiagramModal
  if (!isOpen || !platform) return null;

  const config = platformConfigs[platform];

  const modalContent = (
    <div className="modal-container">
      {/* Backdrop with extremely high z-index and CSS filter blur */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity duration-300"
        style={{ 
          zIndex: 9999999,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={handleClose}
      />
      
      {/* Modal container - same z-index level */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 9999999 }}>
        {/* Modal content */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6 shadow-2xl border border-gray-200 dark:border-gray-700 pointer-events-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Connect to {config.name}
            </h3>
            <button 
              onClick={handleClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                placeholder={`Enter your ${config.name} shop name`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isConnecting}
                autoComplete="off"
              />
            </div>
            
            {/* API Key with toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isConnecting}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isConnecting}
                >
                  {showApiKey ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.414m-1.415-1.414l1.415 1.414M21.543 12a9.97 9.97 0 01-1.563 3.029" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Partner ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Partner ID
              </label>
              <input
                type="text"
                value={formData.partnerId}
                onChange={(e) => handleInputChange('partnerId', e.target.value)}
                placeholder="Enter your Partner ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isConnecting}
                autoComplete="off"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isConnecting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!isFormValid || isConnecting}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect Shop'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render outside component tree for proper z-index stacking
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ConnectionModal;
