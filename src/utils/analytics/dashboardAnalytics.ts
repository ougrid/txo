import { 
  DashboardData, 
  RevenueAnalytics, 
  OrderAnalytics, 
  GeographicAnalytics, 
  ProductAnalytics, 
  PaymentAnalytics, 
  CustomerAnalytics, 
  OperationalAnalytics,
  AnalyticsMetadata
} from './types';
import { DateFilterUtils } from './dateFilters';

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

export class DashboardAnalytics {
  /**
   * Generate complete dashboard analytics from parsed data
   */
  static generateAnalytics(data: ParsedData): DashboardData {
    const startTime = Date.now();
    
    const analytics: DashboardData = {
      revenue: this.generateRevenueAnalytics(data),
      orders: this.generateOrderAnalytics(data),
      geographic: this.generateGeographicAnalytics(data),
      products: this.generateProductAnalytics(data),
      payments: this.generatePaymentAnalytics(data),
      customers: this.generateCustomerAnalytics(data),
      operational: this.generateOperationalAnalytics(data),
      metadata: this.generateMetadata(data)
    };

    console.log(`Analytics generated in ${Date.now() - startTime}ms`);
    return analytics;
  }

  /**
   * Generate revenue analytics
   */
  private static generateRevenueAnalytics(data: ParsedData): RevenueAnalytics {
    const revenueColumnIndex = this.findColumnIndex(data.headers, ['รายรับจากคำสั่งซื้อ', 'revenue']);
    const statusColumnIndex = data.statusColumnIndex ?? -1;
    const dateColumnIndex = DateFilterUtils.findDateColumn(data.headers);

    // Basic revenue metrics
    let totalRevenue = 0;
    const revenueByStatus: Record<string, number> = {};
    const revenueByDate: Map<string, { revenue: number; orders: number }> = new Map();
    const monthlyRevenue: Map<string, number> = new Map();
    const weeklyRevenue: Map<string, number> = new Map();

    data.rows.forEach(row => {
      const revenue = this.parseNumber(row[revenueColumnIndex]);
      const status = statusColumnIndex >= 0 ? String(row[statusColumnIndex] || '') : '';
      
      if (revenue > 0) {
        totalRevenue += revenue;
        
        // Revenue by status
        if (status) {
          revenueByStatus[status] = (revenueByStatus[status] || 0) + revenue;
        }

        // Revenue by date
        if (dateColumnIndex >= 0) {
          const dateValue = row[dateColumnIndex];
          if (dateValue) {
            const parsedDate = DateFilterUtils.parseDate(String(dateValue));
            if (parsedDate) {
              const dateKey = parsedDate.toISOString().split('T')[0];
              const existing = revenueByDate.get(dateKey) || { revenue: 0, orders: 0 };
              revenueByDate.set(dateKey, {
                revenue: existing.revenue + revenue,
                orders: existing.orders + 1
              });

              // Monthly revenue
              const monthKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
              monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + revenue);

              // Weekly revenue
              const weekStart = new Date(parsedDate);
              weekStart.setDate(parsedDate.getDate() - parsedDate.getDay());
              const weekKey = weekStart.toISOString().split('T')[0];
              weeklyRevenue.set(weekKey, (weeklyRevenue.get(weekKey) || 0) + revenue);
            }
          }
        }
      }
    });

    // Calculate derived metrics
    const revenueByDateArray = Array.from(revenueByDate.entries())
      .map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalOrders = data.rows.filter(row => 
      statusColumnIndex >= 0 && row[statusColumnIndex] && this.parseNumber(row[revenueColumnIndex]) > 0
    ).length;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth (simple month-over-month)
    const monthlyRevenueArray = Array.from(monthlyRevenue.entries())
      .sort(([a], [b]) => a.localeCompare(b));
    
    let revenueGrowth = 0;
    if (monthlyRevenueArray.length >= 2) {
      const lastMonth = monthlyRevenueArray[monthlyRevenueArray.length - 1][1];
      const previousMonth = monthlyRevenueArray[monthlyRevenueArray.length - 2][1];
      revenueGrowth = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
    }

    // Top revenue days
    const topRevenuedays = revenueByDateArray
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      revenueByDate: revenueByDateArray,
      revenueByStatus,
      averageOrderValue,
      revenueGrowth,
      topRevenuedays,
      monthlyRevenue: Array.from(monthlyRevenue.entries())
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      weeklyRevenue: Array.from(weeklyRevenue.entries())
        .map(([week, revenue]) => ({ week, revenue }))
        .sort((a, b) => a.week.localeCompare(b.week))
    };
  }

  /**
   * Generate order analytics
   */
  private static generateOrderAnalytics(data: ParsedData): OrderAnalytics {
    const statusColumnIndex = data.statusColumnIndex ?? -1;
    const dateColumnIndex = DateFilterUtils.findDateColumn(data.headers);

    const ordersByStatus: Record<string, number> = {};
    const orderTrends: Map<string, number> = new Map();
    let totalOrders = 0;

    data.rows.forEach(row => {
      totalOrders++;
      
      // Orders by status
      if (statusColumnIndex >= 0) {
        const status = String(row[statusColumnIndex] || '');
        if (status) {
          ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
        }
      }

      // Order trends by date
      if (dateColumnIndex >= 0) {
        const dateValue = row[dateColumnIndex];
        if (dateValue) {
          const parsedDate = DateFilterUtils.parseDate(String(dateValue));
          if (parsedDate) {
            const dateKey = parsedDate.toISOString().split('T')[0];
            orderTrends.set(dateKey, (orderTrends.get(dateKey) || 0) + 1);
          }
        }
      }
    });

    // Calculate status distribution
    const statusDistribution = Object.entries(ordersByStatus).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
    }));

    // Calculate rates
    const completedOrders = ordersByStatus['สำเร็จแล้ว'] || 0;
    const cancelledOrders = ordersByStatus['ยกเลิกแล้ว'] || 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    // Average orders per day
    const uniqueDays = new Set(Array.from(orderTrends.keys())).size;
    const averageOrdersPerDay = uniqueDays > 0 ? totalOrders / uniqueDays : 0;

    return {
      totalOrders,
      ordersByStatus,
      statusDistribution,
      averageOrdersPerDay,
      completionRate,
      cancellationRate,
      orderTrends: Array.from(orderTrends.entries())
        .map(([date, orders]) => ({ date, orders }))
        .sort((a, b) => a.date.localeCompare(b.date))
    };
  }

  /**
   * Generate geographic analytics
   */
  private static generateGeographicAnalytics(data: ParsedData): GeographicAnalytics {
    const provinceColumnIndex = this.findColumnIndex(data.headers, ['จังหวัด', 'province']);
    const districtColumnIndex = this.findColumnIndex(data.headers, ['เขต/อำเภอ', 'district']);
    const revenueColumnIndex = this.findColumnIndex(data.headers, ['รายรับจากคำสั่งซื้อ', 'revenue']);

    const revenueByProvince: Map<string, { revenue: number; orders: number }> = new Map();
    const revenueByDistrict: Map<string, { revenue: number; orders: number; province: string }> = new Map();
    const geographicDistribution: Map<string, number> = new Map();

    data.rows.forEach(row => {
      const revenue = this.parseNumber(row[revenueColumnIndex]);
      const province = provinceColumnIndex >= 0 ? String(row[provinceColumnIndex] || '') : '';
      const district = districtColumnIndex >= 0 ? String(row[districtColumnIndex] || '') : '';

      if (revenue > 0 && province) {
        // Province analytics
        const provinceData = revenueByProvince.get(province) || { revenue: 0, orders: 0 };
        revenueByProvince.set(province, {
          revenue: provinceData.revenue + revenue,
          orders: provinceData.orders + 1
        });

        // District analytics
        if (district) {
          const districtData = revenueByDistrict.get(district) || { revenue: 0, orders: 0, province };
          revenueByDistrict.set(district, {
            revenue: districtData.revenue + revenue,
            orders: districtData.orders + 1,
            province
          });
        }

        // Geographic distribution
        geographicDistribution.set(province, (geographicDistribution.get(province) || 0) + 1);
      }
    });

    const totalRevenue = Array.from(revenueByProvince.values()).reduce((sum, data) => sum + data.revenue, 0);
    
    return {
      revenueByProvince: Array.from(revenueByProvince.entries())
        .map(([province, data]) => ({ province, revenue: data.revenue, orders: data.orders }))
        .sort((a, b) => b.revenue - a.revenue),
      revenueByDistrict: Array.from(revenueByDistrict.entries())
        .map(([district, data]) => ({ 
          district, 
          revenue: data.revenue, 
          orders: data.orders,
          province: data.province
        }))
        .sort((a, b) => b.revenue - a.revenue),
      topProvinces: Array.from(revenueByProvince.entries())
        .map(([province, data]) => ({
          province,
          revenue: data.revenue,
          percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      geographicDistribution: Object.fromEntries(geographicDistribution),
      provinceCoverage: revenueByProvince.size
    };
  }

  /**
   * Generate product analytics
   */
  private static generateProductAnalytics(data: ParsedData): ProductAnalytics {
    const productNameIndex = this.findColumnIndex(data.headers, ['ชื่อสินค้า', 'product name']);
    const skuIndex = this.findColumnIndex(data.headers, ['เลขอ้างอิง SKU', 'sku']);
    const quantityIndex = this.findColumnIndex(data.headers, ['จำนวน', 'quantity']);
    const priceIndex = this.findColumnIndex(data.headers, ['ราคาขาย', 'price']);
    const revenueColumnIndex = this.findColumnIndex(data.headers, ['รายรับจากคำสั่งซื้อ', 'revenue']);

    const productMap: Map<string, { 
      name: string; 
      sku: string; 
      revenue: number; 
      quantity: number; 
      totalPrice: number; 
      orders: number;
    }> = new Map();

    data.rows.forEach(row => {
      const productName = productNameIndex >= 0 ? String(row[productNameIndex] || '') : '';
      const sku = skuIndex >= 0 ? String(row[skuIndex] || '') : '';
      const quantity = this.parseNumber(row[quantityIndex]);
      const price = this.parseNumber(row[priceIndex]);
      const revenue = this.parseNumber(row[revenueColumnIndex]);

      if (productName && revenue > 0) {
        const key = sku || productName;
        const existing = productMap.get(key) || { 
          name: productName, 
          sku, 
          revenue: 0, 
          quantity: 0, 
          totalPrice: 0, 
          orders: 0 
        };

        productMap.set(key, {
          name: productName,
          sku,
          revenue: existing.revenue + revenue,
          quantity: existing.quantity + quantity,
          totalPrice: existing.totalPrice + price,
          orders: existing.orders + 1
        });
      }
    });

    const products = Array.from(productMap.values());
    const totalPrice = products.reduce((sum, product) => sum + product.totalPrice, 0);
    const totalProducts = products.reduce((sum, product) => sum + product.orders, 0);

    return {
      topProductsByRevenue: products
        .map(product => ({
          name: product.name,
          sku: product.sku,
          revenue: product.revenue,
          quantity: product.quantity,
          averagePrice: product.orders > 0 ? product.totalPrice / product.orders : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 20),
      topProductsByQuantity: products
        .map(product => ({
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          revenue: product.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 20),
      productCategories: [], // Will need more logic to categorize products
      averageProductPrice: totalProducts > 0 ? totalPrice / totalProducts : 0,
      totalUniqueProducts: productMap.size
    };
  }

  /**
   * Generate payment analytics
   */
  private static generatePaymentAnalytics(data: ParsedData): PaymentAnalytics {
    const paymentMethodIndex = this.findColumnIndex(data.headers, ['ช่องทางการชำระเงิน', 'payment method']);
    const revenueColumnIndex = this.findColumnIndex(data.headers, ['รายรับจากคำสั่งซื้อ', 'revenue']);
    const transactionFeeIndex = this.findColumnIndex(data.headers, ['Transaction Fee']);
    const dateColumnIndex = DateFilterUtils.findDateColumn(data.headers);

    const paymentData: Map<string, { revenue: number; orders: number; totalFees: number }> = new Map();
    const paymentTrends: Map<string, Map<string, number>> = new Map();

    data.rows.forEach(row => {
      const paymentMethod = paymentMethodIndex >= 0 ? String(row[paymentMethodIndex] || '') : '';
      const revenue = this.parseNumber(row[revenueColumnIndex]);
      const transactionFee = this.parseNumber(row[transactionFeeIndex]);

      if (paymentMethod && revenue > 0) {
        const existing = paymentData.get(paymentMethod) || { revenue: 0, orders: 0, totalFees: 0 };
        paymentData.set(paymentMethod, {
          revenue: existing.revenue + revenue,
          orders: existing.orders + 1,
          totalFees: existing.totalFees + transactionFee
        });

        // Payment trends by date
        if (dateColumnIndex >= 0) {
          const dateValue = row[dateColumnIndex];
          if (dateValue) {
            const parsedDate = DateFilterUtils.parseDate(String(dateValue));
            if (parsedDate) {
              const dateKey = parsedDate.toISOString().split('T')[0];
              if (!paymentTrends.has(dateKey)) {
                paymentTrends.set(dateKey, new Map());
              }
              const dateMap = paymentTrends.get(dateKey)!;
              dateMap.set(paymentMethod, (dateMap.get(paymentMethod) || 0) + revenue);
            }
          }
        }
      }
    });

    const totalRevenue = Array.from(paymentData.values()).reduce((sum, data) => sum + data.revenue, 0);
    
    return {
      revenueByPaymentMethod: Array.from(paymentData.entries())
        .map(([method, data]) => ({
          method,
          revenue: data.revenue,
          orders: data.orders,
          percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue),
      paymentMethodDistribution: Object.fromEntries(
        Array.from(paymentData.entries()).map(([method, data]) => [method, data.orders])
      ),
      averageTransactionFeeByMethod: Object.fromEntries(
        Array.from(paymentData.entries()).map(([method, data]) => [
          method, 
          data.orders > 0 ? data.totalFees / data.orders : 0
        ])
      ),
      paymentTrends: Array.from(paymentTrends.entries()).flatMap(([date, methodMap]) =>
        Array.from(methodMap.entries()).map(([method, revenue]) => ({
          date,
          method,
          revenue
        }))
      ),
      preferredPaymentMethods: Array.from(paymentData.entries())
        .map(([method, data]) => ({ method, usage: data.orders }))
        .sort((a, b) => b.usage - a.usage)
    };
  }

  /**
   * Generate customer analytics
   */
  private static generateCustomerAnalytics(data: ParsedData): CustomerAnalytics {
    const usernameIndex = this.findColumnIndex(data.headers, ['ชื่อผู้ใช้', 'username']);
    const provinceIndex = this.findColumnIndex(data.headers, ['จังหวัด', 'province']);
    const revenueColumnIndex = this.findColumnIndex(data.headers, ['รายรับจากคำสั่งซื้อ', 'revenue']);

    const customerData: Map<string, { orders: number; revenue: number; province?: string }> = new Map();
    const customersByProvince: Map<string, Set<string>> = new Map();

    data.rows.forEach(row => {
      const username = usernameIndex >= 0 ? String(row[usernameIndex] || '') : '';
      const province = provinceIndex >= 0 ? String(row[provinceIndex] || '') : '';
      const revenue = this.parseNumber(row[revenueColumnIndex]);

      if (username && revenue > 0) {
        const existing = customerData.get(username) || { orders: 0, revenue: 0 };
        customerData.set(username, {
          orders: existing.orders + 1,
          revenue: existing.revenue + revenue,
          province: province || existing.province
        });

        if (province) {
          if (!customersByProvince.has(province)) {
            customersByProvince.set(province, new Set());
          }
          customersByProvince.get(province)!.add(username);
        }
      }
    });

    const customers = Array.from(customerData.values());
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.revenue, 0);
    const totalCustomers = customerData.size;

    return {
      totalUniqueCustomers: totalCustomers,
      averageRevenuePerCustomer: totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
      customersByProvince: Object.fromEntries(
        Array.from(customersByProvince.entries()).map(([province, customers]) => [
          province, 
          customers.size
        ])
      ),
      repeatCustomers: Array.from(customerData.entries())
        .filter(([, data]) => data.orders > 1)
        .map(([username, data]) => ({
          username,
          orders: data.orders,
          totalRevenue: data.revenue
        }))
        .sort((a, b) => b.orders - a.orders),
      customerDistribution: [
        {
          segment: 'New Customers',
          count: Array.from(customerData.values()).filter(c => c.orders === 1).length,
          revenue: Array.from(customerData.values())
            .filter(c => c.orders === 1)
            .reduce((sum, c) => sum + c.revenue, 0)
        },
        {
          segment: 'Repeat Customers',
          count: Array.from(customerData.values()).filter(c => c.orders > 1).length,
          revenue: Array.from(customerData.values())
            .filter(c => c.orders > 1)
            .reduce((sum, c) => sum + c.revenue, 0)
        }
      ],
      topCustomers: Array.from(customerData.entries())
        .map(([username, data]) => ({
          username,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 20)
    };
  }

  /**
   * Generate operational analytics
   */
  private static generateOperationalAnalytics(data: ParsedData): OperationalAnalytics {
    const commissionIndex = this.findColumnIndex(data.headers, ['ค่าคอมมิชชั่น', 'commission']);
    const transactionFeeIndex = this.findColumnIndex(data.headers, ['Transaction Fee']);
    const serviceFeeIndex = this.findColumnIndex(data.headers, ['ค่าบริการ', 'service fee']);
    const netSalePriceIndex = this.findColumnIndex(data.headers, ['ราคาขายสุทธิ', 'net sale']);
    const statusColumnIndex = data.statusColumnIndex ?? -1;

    let totalCommissionFees = 0;
    let totalTransactionFees = 0;
    let totalServiceFees = 0;
    let totalNetSales = 0;
    let totalOrders = 0;
    let cancelledOrders = 0;

    data.rows.forEach(row => {
      const commission = this.parseNumber(row[commissionIndex]);
      const transactionFee = this.parseNumber(row[transactionFeeIndex]);
      const serviceFee = this.parseNumber(row[serviceFeeIndex]);
      const netSale = this.parseNumber(row[netSalePriceIndex]);
      const status = statusColumnIndex >= 0 ? String(row[statusColumnIndex] || '') : '';

      totalCommissionFees += commission;
      totalTransactionFees += transactionFee;
      totalServiceFees += serviceFee;
      totalNetSales += netSale;
      totalOrders++;

      if (status === 'ยกเลิกแล้ว') {
        cancelledOrders++;
      }
    });

    const averageCommissionRate = totalNetSales > 0 ? (totalCommissionFees / totalNetSales) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    return {
      totalCommissionFees,
      totalTransactionFees,
      totalServiceFees,
      averageCommissionRate,
      feesByPaymentMethod: {}, // Would need more detailed analysis
      profitMargins: [], // Would need date-based analysis
      operationalEfficiency: {
        processingTime: 0, // Would need timestamp analysis
        cancellationRate,
        returnRate: 0 // Would need return status analysis
      }
    };
  }

  /**
   * Generate metadata
   */
  private static generateMetadata(data: ParsedData): AnalyticsMetadata {
    const dateRange = DateFilterUtils.getDataDateRange(data.rows, data.headers);
    
    return {
      dataSource: data.fileName,
      lastUpdated: new Date().toISOString(),
      dateRange: {
        start: dateRange?.start.toISOString() || '',
        end: dateRange?.end.toISOString() || ''
      },
      totalRecords: data.totalRows
    };
  }

  /**
   * Helper method to find column index
   */
  private static findColumnIndex(headers: string[], searchTerms: string[]): number {
    for (const term of searchTerms) {
      const index = headers.findIndex(header => 
        header.toLowerCase().includes(term.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  }

  /**
   * Helper method to parse number from cell value
   */
  private static parseNumber(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const cleaned = String(value).replace(/[,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}
