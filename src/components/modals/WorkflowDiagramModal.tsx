'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { InfoIcon, CloseIcon } from '@/icons';

interface WorkflowDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowDiagramModal: React.FC<WorkflowDiagramModalProps> = ({ isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const router = useRouter();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setLastPanPoint({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanX(e.clientX - lastPanPoint.x);
      setPanY(e.clientY - lastPanPoint.y);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleLearnMore = () => {
    onClose();
    router.push('/how-it-works');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      isOpen ? 'visible opacity-100' : 'invisible opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <InfoIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                How MiniSeller Works
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Complete workflow from barcode scanning to order processing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)] overflow-hidden">
          {/* Diagram Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Interactive Workflow Diagram
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                >
                  <span className="text-base">+</span> Zoom In
                </button>
                <button
                  onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                  className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                >
                  <span className="text-base">−</span> Zoom Out
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  <span className="text-base">↻</span> Reset
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  Zoom: {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>
            
            <div 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 min-h-[400px]"
              style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                className="w-full flex items-center justify-center p-4 min-h-[400px]"
                style={{
                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.2s ease'
                }}
              >
                <Image
                  src="/examples/project-details/JUBB-HLA_v0.2_svg.svg"
                  alt="MiniSeller Workflow Diagram"
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                  priority
                />
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="w-full lg:w-80 p-6 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Overview
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  1. Barcode Scanning
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan order barcodes to automatically fetch order details from Shopee API
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  2. Data Processing
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Intelligent processing of order information with validation and formatting
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  3. ERP Integration
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Seamless integration with your existing ERP system for automated data entry
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLearnMore}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Learn More Details
              </button>
              
              <div className="mt-3 flex items-center justify-center">
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        localStorage.setItem('hideWorkflowModal', 'true');
                      } else {
                        localStorage.removeItem('hideWorkflowModal');
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Don&apos;t show this again
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDiagramModal;
