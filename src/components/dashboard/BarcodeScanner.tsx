'use client';

import React, { useState } from 'react';
import { Order } from '@/types/shop';
import { ShopService } from '@/services/shopService';

interface BarcodeScannerProps {
  onScanComplete: (result: { success: boolean; order?: Order; message: string }) => void;
  className?: string;
}

export default function BarcodeScanner({ onScanComplete, className = '' }: BarcodeScannerProps) {
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<Order[]>([]);

  const handleScan = async () => {
    if (!scannedCode.trim()) return;
    
    setIsScanning(true);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = ShopService.scanOrder(scannedCode.trim());
    
    if (result.success && result.order) {
      setRecentScans(prev => [result.order!, ...prev.slice(0, 4)]);
    }
    
    onScanComplete(result);
    setScannedCode('');
    setIsScanning(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isScanning) {
      e.preventDefault();
      handleScan();
    }
  };

  // Sample barcode data for testing
  const sampleBarcodes = [
    '250717CXPUJJBE',
    '250716A5D1TJTW', 
    '2507156NYG7WA8',
    '250630VKBGHAVF',
    '250624D5V8Y20J'
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 text-xl">📱</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Barcode Scanner</h3>
          <p className="text-sm text-gray-600">Scan order barcodes to update status</p>
        </div>
      </div>

      {/* Scanner Input */}
      <div className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scan or enter order number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              disabled={isScanning}
            />
          </div>
          <button
            onClick={handleScan}
            disabled={!scannedCode.trim() || isScanning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isScanning ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning...</span>
              </div>
            ) : (
              'Scan'
            )}
          </button>
        </div>

        {/* Sample Barcodes for Testing */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-3">Example order numbers for testing:</p>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-2">
            {sampleBarcodes.map((barcode, index) => (
              <button
                key={index}
                onClick={() => setScannedCode(barcode)}
                className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border text-xs font-mono transition-colors truncate w-full max-w-full overflow-hidden"
                title={barcode}
                style={{ 
                  minWidth: '0',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {barcode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Scans</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentScans.map((order, index) => (
              <div 
                key={`${order.order_sn}-${index}`}
                className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded-lg gap-3"
              >
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-green-800 font-mono" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>
                    {order.order_sn}
                  </p>
                  <p className="text-xs text-green-600 truncate mt-1">
                    {order.productName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-800">
                    ฿{order.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">
                    ✓ Scanned
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
