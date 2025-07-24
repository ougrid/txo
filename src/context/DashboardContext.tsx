'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

  // Multi-selection state
  selectedDatasets: string[];
  aggregatedAnalytics: DashboardData | null;

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

  // Multi-selection actions
  selectDataset: (id: string) => void;
  deselectDataset: (id: string) => void;
  selectAllDatasets: () => void;
  deselectAllDatasets: () => void;
  selectActiveDatasets: () => void;
  updateAggregatedAnalytics: () => void;

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
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [aggregatedAnalytics, setAggregatedAnalytics] = useState<DashboardData | null>(null);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    percentage: 0
  });

  // Helper function to aggregate analytics from multiple sources
  const aggregateMultipleAnalytics = (analyticsArray: DashboardData[]): DashboardData => {
    if (analyticsArray.length === 0) {
      throw new Error('No analytics data to aggregate');
    }

    if (analyticsArray.length === 1) {
      return analyticsArray[0];
    }

    // Combine all analytics
    const totalRevenue = analyticsArray.reduce((sum, analytics) => sum + analytics.revenue.totalRevenue, 0);
    const totalOrders = analyticsArray.reduce((sum, analytics) => sum + analytics.orders.totalOrders, 0);
    const totalRecords = analyticsArray.reduce((sum, analytics) => sum + analytics.metadata.totalRecords, 0);

    // Get date range
    const startDates = analyticsArray.map(a => new Date(a.metadata.dateRange.start));
    const endDates = analyticsArray.map(a => new Date(a.metadata.dateRange.end));
    const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));

    // Aggregate revenue by date
    const revenueByDateMap = new Map<string, { revenue: number; orders: number }>();
    analyticsArray.forEach(analytics => {
      analytics.revenue.revenueByDate.forEach(item => {
        const existing = revenueByDateMap.get(item.date) || { revenue: 0, orders: 0 };
        revenueByDateMap.set(item.date, {
          revenue: existing.revenue + item.revenue,
          orders: existing.orders + item.orders
        });
      });
    });

    // Aggregate orders by status
    const ordersByStatusMap = new Map<string, number>();
    analyticsArray.forEach(analytics => {
      Object.entries(analytics.orders.ordersByStatus).forEach(([status, count]) => {
        ordersByStatusMap.set(status, (ordersByStatusMap.get(status) || 0) + count);
      });
    });

    // Aggregate revenue by province
    const revenueByProvinceMap = new Map<string, { revenue: number; orders: number }>();
    analyticsArray.forEach(analytics => {
      analytics.geographic.revenueByProvince.forEach(item => {
        const existing = revenueByProvinceMap.get(item.province) || { revenue: 0, orders: 0 };
        revenueByProvinceMap.set(item.province, {
          revenue: existing.revenue + item.revenue,
          orders: existing.orders + item.orders
        });
      });
    });

    // Create aggregated analytics object
    const aggregated: DashboardData = {
      revenue: {
        totalRevenue,
        revenueByDate: Array.from(revenueByDateMap.entries()).map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        revenueByStatus: Object.fromEntries(ordersByStatusMap),
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        revenueGrowth: 0, // Would need historical data for accurate calculation
        topRevenuedays: [], // Calculated from revenueByDate
        monthlyRevenue: [], // Would need to group by month
        weeklyRevenue: [] // Would need to group by week
      },
      orders: {
        totalOrders,
        ordersByStatus: Object.fromEntries(ordersByStatusMap),
        statusDistribution: Array.from(ordersByStatusMap.entries()).map(([status, count]) => ({
          status,
          count,
          percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
        })),
        averageOrdersPerDay: 0, // Would need date range calculation
        completionRate: 0, // Would need status analysis
        cancellationRate: 0, // Would need status analysis
        orderTrends: [] // Would need date grouping
      },
      geographic: {
        revenueByProvince: Array.from(revenueByProvinceMap.entries()).map(([province, data]) => ({
          province,
          revenue: data.revenue,
          orders: data.orders
        })).sort((a, b) => b.revenue - a.revenue),
        revenueByDistrict: [], // Would need district aggregation
        topProvinces: [], // Derived from revenueByProvince
        geographicDistribution: Object.fromEntries(
          Array.from(revenueByProvinceMap.entries()).map(([province, data]) => [province, data.revenue])
        ),
        provinceCoverage: revenueByProvinceMap.size
      },
      products: {
        topProductsByRevenue: [],
        topProductsByQuantity: [],
        productCategories: [],
        averageProductPrice: 0,
        totalUniqueProducts: 0
      },
      payments: {
        revenueByPaymentMethod: [],
        paymentMethodDistribution: {},
        averageTransactionFeeByMethod: {},
        paymentTrends: [],
        preferredPaymentMethods: []
      },
      customers: {
        totalUniqueCustomers: 0,
        averageRevenuePerCustomer: 0,
        customersByProvince: {},
        repeatCustomers: [],
        customerDistribution: [],
        topCustomers: []
      },
      operational: {
        totalCommissionFees: 0,
        totalTransactionFees: 0,
        totalServiceFees: 0,
        averageCommissionRate: 0,
        feesByPaymentMethod: {},
        profitMargins: [],
        operationalEfficiency: {
          processingTime: 0,
          cancellationRate: 0,
          returnRate: 0
        }
      },
      metadata: {
        dataSource: `Aggregated from ${analyticsArray.length} datasets`,
        lastUpdated: new Date().toISOString(),
        dateRange: {
          start: earliestStart.toISOString(),
          end: latestEnd.toISOString()
        },
        totalRecords
      }
    };

    return aggregated;
  };

  const updateAggregatedAnalyticsForIds = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      setAggregatedAnalytics(null);
      return;
    }

    const allData = getAllStoredData();
    const selectedData = allData.filter(data => ids.includes(data.id));
    
    if (selectedData.length === 0) {
      setAggregatedAnalytics(null);
      return;
    }

    // Aggregate analytics from multiple datasets
    const aggregated = aggregateMultipleAnalytics(selectedData.map(data => data.analytics));
    setAggregatedAnalytics(aggregated);
  }, []);

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

  // Auto-select active dataset when it changes
  useEffect(() => {
    if (activeDashboard && selectedDatasets.length === 0) {
      setSelectedDatasets([activeDashboard.id]);
      updateAggregatedAnalyticsForIds([activeDashboard.id]);
    }
  }, [activeDashboard, selectedDatasets.length, updateAggregatedAnalyticsForIds]);

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

  // Multi-selection functions
  const selectDataset = (id: string) => {
    setSelectedDatasets(prev => {
      if (!prev.includes(id)) {
        const newSelection = [...prev, id];
        updateAggregatedAnalyticsForIds(newSelection);
        return newSelection;
      }
      return prev;
    });
  };

  const deselectDataset = (id: string) => {
    setSelectedDatasets(prev => {
      const newSelection = prev.filter(selectedId => selectedId !== id);
      updateAggregatedAnalyticsForIds(newSelection);
      return newSelection;
    });
  };

  const selectAllDatasets = () => {
    const allData = getAllStoredData();
    const allIds = allData.map(data => data.id);
    setSelectedDatasets(allIds);
    updateAggregatedAnalyticsForIds(allIds);
  };

  const deselectAllDatasets = () => {
    setSelectedDatasets([]);
    setAggregatedAnalytics(null);
  };

  const selectActiveDatasets = () => {
    const allData = getAllStoredData();
    const activeIds = allData.filter(data => data.isActive).map(data => data.id);
    setSelectedDatasets(activeIds);
    updateAggregatedAnalyticsForIds(activeIds);
  };

  const updateAggregatedAnalytics = () => {
    updateAggregatedAnalyticsForIds(selectedDatasets);
  };

  const value: DashboardContextType = {
    activeDashboard,
    isLoading,
    error,
    selectedDatasets,
    aggregatedAnalytics,
    setActiveDashboard,
    saveDashboardData,
    loadDashboardData,
    deleteDashboardData,
    getAllStoredData,
    clearError,
    selectDataset,
    deselectDataset,
    selectAllDatasets,
    deselectAllDatasets,
    selectActiveDatasets,
    updateAggregatedAnalytics,
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
