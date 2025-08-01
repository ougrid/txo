'use client';

import { useState, useEffect } from 'react';

const WORKFLOW_MODAL_KEY = 'miniseller_workflow_modal_shown';

export function useWorkflowModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already seen the workflow modal
    const hasSeenModal = localStorage.getItem(WORKFLOW_MODAL_KEY);
    
    if (!hasSeenModal) {
      // Show modal after a brief delay to allow page to load
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
    // Mark that user has seen the modal
    localStorage.setItem(WORKFLOW_MODAL_KEY, 'true');
  };

  const forceShowModal = () => {
    setShowModal(true);
  };

  const resetModalPreference = () => {
    localStorage.removeItem(WORKFLOW_MODAL_KEY);
  };

  return {
    showModal,
    closeModal,
    forceShowModal,
    resetModalPreference
  };
}

export default useWorkflowModal;
