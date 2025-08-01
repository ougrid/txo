'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, CheckCircleIcon, InfoIcon } from '@/icons';

export default function HowItWorksPage() {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

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

  const steps = [
    {
      step: "1",
      title: "Scan Product Barcode",
      description: "Scan the AWB barcode on your product parcel using your barcode scanner connected to MiniSeller.",
      details: "MiniSeller seamlessly integrates with your existing barcode scanners to capture order information instantly.",
      link: "/shop-management#barcode-scanner"
    },
    {
      step: "2", 
      title: "Shopee API Integration",
      description: "MiniSeller automatically fetches order details from Shopee API v2 using the scanned barcode.",
      details: "Real-time data retrieval ensures you always have the most up-to-date order information.",
      link: "/platform-management#shopee-integration"
    },
    {
      step: "3",
      title: "Intelligent Data Processing", 
      description: "Order information is processed and validated through our cloud-based processing system.",
      details: "Advanced algorithms ensure data accuracy and completeness before ERP entry.",
      link: "/shop-management#pending-scans"
    },
    {
      step: "4",
      title: "Automated ERP Entry",
      description: "The Local Auto-Input Agent automatically enters the processed data into your ERP system.",
      details: "Compatible with Senior Soft and other popular ERP systems for seamless integration.",
      link: "/order-analytics#export-options"
    }
  ];

  const features = [
    {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      title: "Barcode Scanning Integration",
      description: "Seamlessly integrates with your existing barcode scanners"
    },
    {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      title: "Shopee API Integration", 
      description: "Direct integration with Shopee API v2 for real-time data"
    },
    {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      title: "Automated Data Entry",
      description: "Eliminates manual data entry with RPA automation"
    },
    {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      title: "ERP System Support",
      description: "Compatible with Senior Soft and other ERP systems"
    },
    {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      title: "Cloud-Based Processing",
      description: "Reliable cloud infrastructure for data processing"
    },
    {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      title: "Audit Trail",
      description: "Complete logging and tracking of all operations"
    }
  ];

  const benefits = [
    "Reduces manual data entry by up to 95%",
    "Eliminates human errors in order processing", 
    "Processes orders 10x faster than manual entry",
    "Real-time integration with Shopee API",
    "Complete audit trail for all operations",
    "Seamless integration with existing ERP systems"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <InfoIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">How MiniSeller Works</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                Complete workflow from barcode scanning to order processing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            MiniSeller streamlines your e-commerce order processing workflow by automating the entire process from barcode scanning to ERP 
            data entry. Our system integrates with Shopee&apos;s API to fetch order details and automatically populates your ERP system, saving time 
            and reducing errors.
          </p>
        </div>

        {/* Step-by-Step Process */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Step-by-Step Process</h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  {step.link ? (
                    <Link href={step.link} className="group">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                        {step.title}
                        <ArrowRightIcon className="inline-block w-6 h-6 ml-2 opacity-60 group-hover:opacity-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}
                    </h3>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Diagram */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Interactive Workflow Diagram</h2>
            <p className="text-gray-600 dark:text-gray-400">Explore the complete workflow with our interactive diagram. Drag to pan and use zoom controls.</p>
          </div>
          
          {/* Diagram Controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <span className="text-base">+</span>
                <span>Zoom In</span>
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <span className="text-base">−</span>
                <span>Zoom Out</span>
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPanX(0);
                  setPanY(0);
                }}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <span className="text-sm">↻</span>
                <span>Reset</span>
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Diagram Container */}
          <div 
            className="h-96 overflow-hidden bg-gray-100 dark:bg-gray-800"
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.2s ease-out'
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <Image
                src="/examples/project-details/JUBB-HLA_v0.2_svg.svg"
                alt="MiniSeller Workflow Diagram"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
                draggable={false}
                style={{ userSelect: 'none' }}
                priority
              />
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Key Features</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">What makes MiniSeller the ideal solution for your e-commerce business</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Benefits</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Why choose MiniSeller for your order processing needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}