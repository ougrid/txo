'use client';

import React, { useState } from 'react';
import { InfoIcon } from '@/icons';
import WorkflowDiagramModal from '../modals/WorkflowDiagramModal';

interface WorkflowTriggerProps {
  variant?: 'button' | 'link' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const WorkflowTrigger: React.FC<WorkflowTriggerProps> = ({ 
  variant = 'button', 
  className = '',
  size = 'md'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const baseClasses = 'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-sm px-3 py-2', 
    lg: 'text-base px-4 py-3'
  };

  const variantClasses = {
    button: 'bg-blue-500 text-white rounded hover:bg-blue-600',
    link: 'text-blue-500 hover:text-blue-600 underline',
    icon: 'text-gray-500 hover:text-blue-500 rounded-full p-2 hover:bg-blue-50'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const renderContent = () => {
    switch (variant) {
      case 'icon':
        return <InfoIcon className="w-6 h-6" />;
      case 'link':
        return 'How It Works?';
      default:
        return (
          <>
            <InfoIcon className="w-4 h-4 mr-2" />
            How It Works?
          </>
        );
    }
  };

  return (
    <>
      <button 
        onClick={openModal}
        className={combinedClasses}
        title="View workflow diagram"
      >
        {renderContent()}
      </button>
      
      <WorkflowDiagramModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </>
  );
};

export default WorkflowTrigger;
