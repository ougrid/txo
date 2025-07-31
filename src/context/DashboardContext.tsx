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
  // Current selected data for single view (first selected or legacy compatibility)
  primaryDashboard: StoredDashboardData | null;
  isLoading: boolean;
  error: string | null;

  // Multi-selection state
  selectedDatasets: string[];
  aggregatedAnalytics: DashboardData | null;

  // Actions
  setPrimaryDashboard: (data: StoredDashboardData) => void;
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
  const [primaryDashboard, setPrimaryDashboardState] = useState<StoredDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [aggregatedAnalytics, setAggregatedAnalytics] = useState<DashboardData | null>(null);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    percentage: 0
  });
  const [isMounted, setIsMounted] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    // Aggregate revenue by status
    const revenueByStatusMap = new Map<string, number>();
    analyticsArray.forEach(analytics => {
      Object.entries(analytics.revenue.revenueByStatus).forEach(([status, revenue]) => {
        revenueByStatusMap.set(status, (revenueByStatusMap.get(status) || 0) + revenue);
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

    // Aggregate products by revenue
    const productsByRevenueMap = new Map<string, { revenue: number; quantity: number }>();
    analyticsArray.forEach(analytics => {
      analytics.products.topProductsByRevenue.forEach(item => {
        const existing = productsByRevenueMap.get(item.name) || { revenue: 0, quantity: 0 };
        productsByRevenueMap.set(item.name, {
          revenue: existing.revenue + item.revenue,
          quantity: existing.quantity + (item.quantity || 0)
        });
      });
    });

    // Calculate completion rate from order status
    // Use the same logic as individual analytics for consistency
    const cancelledStatusKeys = ['ยกเลิกแล้ว', 'cancelled', 'canceled', 'rejected'];
    const completedStatusKeys = ['สำเร็จแล้ว', 'completed', 'success', 'delivered'];
    const shippingStatusKeys = ['ที่ต้องจัดส่ง', 'รอการจัดส่ง', 'shipping', 'to_ship'];
    
    const completedOrders = Array.from(ordersByStatusMap.entries()).reduce((sum, [status, count]) => {
      const isCompleted = completedStatusKeys.some(key => status.toLowerCase().includes(key.toLowerCase())) ||
                         shippingStatusKeys.some(key => status.toLowerCase().includes(key.toLowerCase()));
      return isCompleted ? sum + count : sum;
    }, 0);
    
    const cancelledOrders = Array.from(ordersByStatusMap.entries()).reduce((sum, [status, count]) => {
      const isCancelled = cancelledStatusKeys.some(key => status.toLowerCase().includes(key.toLowerCase()));
      return isCancelled ? sum + count : sum;
    }, 0);
    
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    // Create aggregated analytics object
    const aggregated: DashboardData = {
      revenue: {
        totalRevenue,
        revenueByDate: Array.from(revenueByDateMap.entries()).map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        revenueByStatus: Object.fromEntries(revenueByStatusMap),
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        revenueGrowth: 0, // Would need historical data for accurate calculation
        topRevenuedays: Array.from(revenueByDateMap.entries()).map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        })).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
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
        completionRate: completionRate,
        cancellationRate: cancellationRate,
        orderTrends: [] // Would need date grouping
      },
      geographic: {
        revenueByProvince: Array.from(revenueByProvinceMap.entries()).map(([province, data]) => ({
          province,
          revenue: data.revenue,
          orders: data.orders
        })).sort((a, b) => b.revenue - a.revenue),
        revenueByDistrict: [], // Would need district aggregation
        topProvinces: Array.from(revenueByProvinceMap.entries())
          .map(([province, data]) => ({
            province,
            revenue: data.revenue,
            percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10), // Top 10 provinces
        geographicDistribution: Object.fromEntries(
          Array.from(revenueByProvinceMap.entries()).map(([province, data]) => [province, data.revenue])
        ),
        provinceCoverage: revenueByProvinceMap.size
      },
      products: {
        topProductsByRevenue: Array.from(productsByRevenueMap.entries())
          .map(([product, data]) => ({
            name: product,
            sku: '', // Would need SKU aggregation
            revenue: data.revenue,
            quantity: data.quantity,
            averagePrice: data.quantity > 0 ? data.revenue / data.quantity : 0
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10), // Top 10 products
        topProductsByQuantity: [],
        productCategories: [],
        averageProductPrice: 0,
        totalUniqueProducts: productsByRevenueMap.size
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

  // Helper function to get all stored data
  const getAllStoredData = useCallback((): StoredDashboardData[] => {
    if (!isMounted) {
      return [];
    }
    
    try {
      return DashboardStorage.getAllDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve stored data');
      return [];
    }
  }, [isMounted]);

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
  }, [getAllStoredData]);

  const loadPrimaryDashboard = useCallback(async () => {
    if (!isMounted) return;
    
    try {
      setIsLoading(true);
      const primaryData = DashboardStorage.getPrimaryDashboardData();
      const selectedIds = DashboardStorage.getSelectedDatasetIds();
      
      setPrimaryDashboardState(primaryData);
      setSelectedDatasets(selectedIds);
      
      if (selectedIds.length > 0) {
        updateAggregatedAnalyticsForIds(selectedIds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [updateAggregatedAnalyticsForIds, isMounted]);

  const updateStorageInfo = useCallback(() => {
    if (!isMounted) return;
    
    try {
      const info = DashboardStorage.getStorageInfo();
      setStorageInfo(info);
    } catch (err) {
      console.error('Failed to update storage info:', err);
      // Don't set error for storage info failures
    }
  }, [isMounted]);

  // Load primary dashboard on mount (first selected dataset)
  useEffect(() => {
    if (!isMounted) return;
    
    loadPrimaryDashboard();
    updateStorageInfo();
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'miniseller_dashboard_data') {
        loadPrimaryDashboard();
        updateStorageInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadPrimaryDashboard, updateStorageInfo, isMounted]);

  // Auto-update aggregated analytics when selection changes
  useEffect(() => {
    if (selectedDatasets.length > 0) {
      updateAggregatedAnalyticsForIds(selectedDatasets);
      // Set primary dashboard to first selected
      const allData = getAllStoredData();
      const firstSelected = allData.find(data => data.id === selectedDatasets[0]);
      if (firstSelected) {
        setPrimaryDashboardState(firstSelected);
      }
    } else {
      setAggregatedAnalytics(null);
      setPrimaryDashboardState(null);
    }
  }, [selectedDatasets, updateAggregatedAnalyticsForIds, getAllStoredData]);

  const setPrimaryDashboard = (data: StoredDashboardData) => {
    setPrimaryDashboardState(data);
  };

  const saveDashboardData = async (
    parsedData: ParsedData, 
    fileName: string
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!isMounted) {
      return { success: false, error: 'Not mounted' };
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Generate analytics from parsed data
      const analytics = DashboardAnalytics.generateAnalytics(parsedData);
      
      // Create stored data object
      const storedData: StoredDashboardData = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        fileName,
        uploadDate: new Date().toISOString(),
        parsedData,
        analytics,
        isSelected: true
      };

      // Save to localStorage
      DashboardStorage.saveDashboardData(storedData);
      
      // Update state
      setPrimaryDashboardState(storedData);
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

      // Just select this dataset
      const currentSelected = DashboardStorage.getSelectedDatasetIds();
      if (!currentSelected.includes(id)) {
        const newSelected = [...currentSelected, id];
        DashboardStorage.setSelectedDatasetIds(newSelected);
        setSelectedDatasets(newSelected);
      }
      
      await loadPrimaryDashboard();
      return true;
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
        // If deleted dashboard was primary, clear primary dashboard
        if (primaryDashboard?.id === id) {
          setPrimaryDashboardState(null);
        }
        // Update selected datasets
        const newSelected = selectedDatasets.filter(selectedId => selectedId !== id);
        setSelectedDatasets(newSelected);
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

  const clearError = () => {
    setError(null);
  };

  // Multi-selection functions
  const selectDataset = (id: string) => {
    if (!isMounted) return;
    
    const newSelection = selectedDatasets.includes(id) 
      ? selectedDatasets 
      : [...selectedDatasets, id];
    
    setSelectedDatasets(newSelection);
    DashboardStorage.setSelectedDatasetIds(newSelection);
  };

  const deselectDataset = (id: string) => {
    if (!isMounted) return;
    
    const newSelection = selectedDatasets.filter(selectedId => selectedId !== id);
    setSelectedDatasets(newSelection);
    DashboardStorage.setSelectedDatasetIds(newSelection);
  };

  const selectAllDatasets = () => {
    if (!isMounted) return;
    
    const allData = getAllStoredData();
    const allIds = allData.map(data => data.id);
    setSelectedDatasets(allIds);
    DashboardStorage.setSelectedDatasetIds(allIds);
  };

  const deselectAllDatasets = () => {
    if (!isMounted) return;
    
    setSelectedDatasets([]);
    DashboardStorage.setSelectedDatasetIds([]);
  };

  const updateAggregatedAnalytics = () => {
    updateAggregatedAnalyticsForIds(selectedDatasets);
  };

  const value: DashboardContextType = {
    primaryDashboard,
    isLoading,
    error,
    selectedDatasets,
    aggregatedAnalytics,
    setPrimaryDashboard,
    saveDashboardData,
    loadDashboardData,
    deleteDashboardData,
    getAllStoredData,
    clearError,
    selectDataset,
    deselectDataset,
    selectAllDatasets,
    deselectAllDatasets,
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
  const { primaryDashboard, aggregatedAnalytics, selectedDatasets } = useDashboard();
  
  // Return aggregated analytics if multiple datasets selected, otherwise single dashboard analytics
  if (selectedDatasets.length > 1) {
    return aggregatedAnalytics;
  }
  
  return primaryDashboard?.analytics || null;
}

// Hook for checking if dashboard is ready
export function useIsDashboardReady(): boolean {
  const { primaryDashboard, isLoading, selectedDatasets, aggregatedAnalytics } = useDashboard();
  
  if (selectedDatasets.length > 1) {
    return !isLoading && aggregatedAnalytics !== null;
  }
  
  return !isLoading && primaryDashboard !== null;
}
