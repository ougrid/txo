export interface DashboardData {
  revenue: RevenueAnalytics;
  orders: OrderAnalytics;
  geographic: GeographicAnalytics;
  products: ProductAnalytics;
  payments: PaymentAnalytics;
  customers: CustomerAnalytics;
  operational: OperationalAnalytics;
  metadata: AnalyticsMetadata;
}

export interface AnalyticsMetadata {
  dataSource: string;
  lastUpdated: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalRecords: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueByDate: Array<{ date: string; revenue: number; orders: number }>;
  revenueByStatus: Record<string, number>;
  averageOrderValue: number;
  revenueGrowth: number;
  topRevenuedays: Array<{ date: string; revenue: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  weeklyRevenue: Array<{ week: string; revenue: number }>;
}

export interface OrderAnalytics {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  averageOrdersPerDay: number;
  completionRate: number;
  cancellationRate: number;
  orderTrends: Array<{ date: string; orders: number }>;
}

export interface GeographicAnalytics {
  revenueByProvince: Array<{ province: string; revenue: number; orders: number }>;
  revenueByDistrict: Array<{ district: string; revenue: number; orders: number; province: string }>;
  topProvinces: Array<{ province: string; revenue: number; percentage: number }>;
  geographicDistribution: Record<string, number>;
  provinceCoverage: number;
}

export interface ProductAnalytics {
  topProductsByRevenue: Array<{ 
    name: string; 
    sku: string; 
    revenue: number; 
    quantity: number; 
    averagePrice: number 
  }>;
  topProductsByQuantity: Array<{ 
    name: string; 
    sku: string; 
    quantity: number; 
    revenue: number 
  }>;
  productCategories: Array<{ category: string; revenue: number; count: number }>;
  averageProductPrice: number;
  totalUniqueProducts: number;
}

export interface PaymentAnalytics {
  revenueByPaymentMethod: Array<{ method: string; revenue: number; orders: number; percentage: number }>;
  paymentMethodDistribution: Record<string, number>;
  averageTransactionFeeByMethod: Record<string, number>;
  paymentTrends: Array<{ date: string; method: string; revenue: number }>;
  preferredPaymentMethods: Array<{ method: string; usage: number }>;
}

export interface CustomerAnalytics {
  totalUniqueCustomers: number;
  averageRevenuePerCustomer: number;
  customersByProvince: Record<string, number>;
  repeatCustomers: Array<{ username: string; orders: number; totalRevenue: number }>;
  customerDistribution: Array<{ segment: string; count: number; revenue: number }>;
  topCustomers: Array<{ username: string; revenue: number; orders: number }>;
}

export interface OperationalAnalytics {
  totalCommissionFees: number;
  totalTransactionFees: number;
  totalServiceFees: number;
  averageCommissionRate: number;
  feesByPaymentMethod: Record<string, { commission: number; transaction: number; service: number }>;
  profitMargins: Array<{ date: string; margin: number }>;
  operationalEfficiency: {
    processingTime: number;
    cancellationRate: number;
    returnRate: number;
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateFilter {
  type: 'custom' | 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear';
  range?: DateRange;
  label: string;
}

export interface StoredDashboardData {
  id: string;
  fileName: string;
  uploadDate: string;
  parsedData: {
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
  };
  analytics: DashboardData;
  isActive: boolean;
  isSelected?: boolean; // New field for multi-selection
}

export interface DatasetSelection {
  selectedIds: string[];
  selectAll: boolean;
  activeOnly: boolean;
}
