'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StoredDashboardData, DashboardData } from '@/utils/analytics/types';
import { DashboardStorage } from '@/utils/analytics/storage';
import { DashboardAnalytics } from '@/utils/analytics/dashboardAnalytics';

// Define ParsedData type to match fileProcessing.ts
interface ParsedData {
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
  fileType: 'excel' | 'csv';
  totalRows: number;
  errors?: string[];
  hasRevenueCalculation?: boolean;
  statusColumnIndex?: number;
  calculationSummary?: {
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
    processedRows: number;
  };
}

interface DashboardContextType {
  // Current active data
  activeDashboard: StoredDashboardData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveDashboard: (data: StoredDashboardData) => void;
  saveDashboardData: (
    parsedData: ParsedData, 
    fileName: string
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  loadDashboardData: (id: string) => Promise<boolean>;
  deleteDashboardData: (id: string) => Promise<boolean>;
  getAllStoredData: () => StoredDashboardData[];
  clearError: () => void;

  // Storage info
  storageInfo: {
    used: number;
    available: number;
    percentage: number;
  };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [activeDashboard, setActiveDashboardState] = useState<StoredDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    percentage: 0
  });

  // Load active dashboard on mount
  useEffect(() => {
    loadActiveDashboard();
    updateStorageInfo();
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'miniseller_dashboard_data' || e.key === 'miniseller_active_dashboard') {
        loadActiveDashboard();
        updateStorageInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadActiveDashboard = async () => {
    try {
      setIsLoading(true);
      const activeData = DashboardStorage.getActiveDashboardData();
      setActiveDashboardState(activeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStorageInfo = () => {
    const info = DashboardStorage.getStorageInfo();
    setStorageInfo(info);
  };

  const setActiveDashboard = (data: StoredDashboardData) => {
    try {
      DashboardStorage.setActiveDashboard(data.id);
      setActiveDashboardState(data);
      updateStorageInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active dashboard');
    }
  };

  const saveDashboardData = async (
    parsedData: ParsedData, 
    fileName: string
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check storage availability
      if (!DashboardStorage.isStorageAvailable()) {
        throw new Error('localStorage is not available in this browser');
      }

      // Check storage space
      const currentStorage = DashboardStorage.getStorageInfo();
      if (currentStorage.percentage > 90) {
        throw new Error('Storage is nearly full. Please delete some old data first.');
      }

      // Generate analytics
      const analytics = DashboardAnalytics.generateAnalytics(parsedData);

      // Create stored data object
      const storedData: StoredDashboardData = {
        id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName,
        uploadDate: new Date().toISOString(),
        parsedData,
        analytics,
        isActive: true
      };

      // Save to localStorage
      DashboardStorage.saveDashboardData(storedData);
      
      // Update state
      setActiveDashboardState(storedData);
      updateStorageInfo();

      return { success: true, id: storedData.id };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to save dashboard data';
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const success = DashboardStorage.setActiveDashboard(id);
      if (success) {
        await loadActiveDashboard();
        return true;
      } else {
        setError('Dashboard not found');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDashboardData = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const success = DashboardStorage.deleteDashboardData(id);
      if (success) {
        // If deleted dashboard was active, clear active dashboard
        if (activeDashboard?.id === id) {
          setActiveDashboardState(null);
        }
        updateStorageInfo();
        return true;
      } else {
        setError('Failed to delete dashboard');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dashboard');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllStoredData = (): StoredDashboardData[] => {
    try {
      return DashboardStorage.getAllDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve stored data');
      return [];
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: DashboardContextType = {
    activeDashboard,
    isLoading,
    error,
    setActiveDashboard,
    saveDashboardData,
    loadDashboardData,
    deleteDashboardData,
    getAllStoredData,
    clearError,
    storageInfo
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Hook for easy access to analytics data
export function useDashboardAnalytics(): DashboardData | null {
  const { activeDashboard } = useDashboard();
  return activeDashboard?.analytics || null;
}

// Hook for checking if dashboard is ready
export function useIsDashboardReady(): boolean {
  const { activeDashboard, isLoading } = useDashboard();
  return !isLoading && activeDashboard !== null;
}
