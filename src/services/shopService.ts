import { Shop, Order, Platform, DashboardStats, PlatformConfig } from '@/types/shop';

// Platform configurations
export const platformConfigs: Record<Platform, PlatformConfig> = {
  shopee: {
    name: 'Shopee',
    color: 'orange',
    icon: '🛒',
    isAvailable: true,
    features: ['order_scanning', 'api_monitoring', 'bulk_upload', 'real_time_sync']
  },
  lazada: {
    name: 'Lazada', 
    color: 'blue',
    icon: '🏪',
    isAvailable: false,
    comingSoon: true,
    features: ['order_management', 'inventory_sync']
  },
  tiktok: {
    name: 'TikTok Shop',
    color: 'pink', 
    icon: '🎵',
    isAvailable: false,
    comingSoon: true,
    features: ['creator_analytics', 'live_commerce', 'social_selling']
  }
};

// Mock Shopee shops with realistic Thai names
const mockShops: Shop[] = [
  {
    id: 'shop_001',
    name: 'เครื่องใช้ไฟฟ้า BKK Electronics',
    platform: 'shopee',
    status: 'connected',
    apiStatus: 'healthy',
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    orderStats: {
      totalOrders: 1247,
      scannedOrders: 1180,
      pendingScans: 23,
      processedOrders: 1157,
      recentScans: []
    },
    credentials: {
      isValid: true,
      daysUntilExpiry: 45,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      lastChecked: new Date()
    },
    issues: [],
    isActive: true
  },
  {
    id: 'shop_002', 
    name: 'แฟชั่นเสื้อผ้า Chiang Mai Fashion',
    platform: 'shopee',
    status: 'needs_attention',
    apiStatus: 'expired_soon',
    lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    orderStats: {
      totalOrders: 892,
      scannedOrders: 845,
      pendingScans: 12,
      processedOrders: 833,
      recentScans: []
    },
    credentials: {
      isValid: true,
      daysUntilExpiry: 3,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      lastChecked: new Date()
    },
    issues: [
      {
        type: 'api_expiring',
        severity: 'warning',
        message: 'API credentials expire in 3 days',
        action: 'Renew Credentials',
        actionType: 'renew'
      }
    ],
    isActive: true
  },
  {
    id: 'shop_003',
    name: 'อะไหล่รถยนต์ Hat Yai Auto Parts',
    platform: 'shopee', 
    status: 'connected',
    apiStatus: 'healthy',
    lastUpdate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    orderStats: {
      totalOrders: 634,
      scannedOrders: 598,
      pendingScans: 36,
      processedOrders: 562,
      recentScans: []
    },
    credentials: {
      isValid: true,
      daysUntilExpiry: 28,
      expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      lastChecked: new Date()
    },
    issues: [
      {
        type: 'high_order_volume',
        severity: 'info',
        message: '36 orders pending scan',
        action: 'Start Scanning',
        actionType: 'scan'
      }
    ],
    isActive: true
  },
  {
    id: 'shop_004',
    name: 'เครื่องสำอาง Phuket Beauty Store',
    platform: 'shopee',
    status: 'needs_attention', 
    apiStatus: 'needs_reconnection',
    lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    orderStats: {
      totalOrders: 1156,
      scannedOrders: 1089,
      pendingScans: 67,
      processedOrders: 1022,
      recentScans: []
    },
    credentials: {
      isValid: false,
      daysUntilExpiry: -1,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastChecked: new Date()
    },
    issues: [
      {
        type: 'api_expired',
        severity: 'critical',
        message: 'API connection lost - credentials expired',
        action: 'Reconnect Now',
        actionType: 'reconnect'
      }
    ],
    isActive: true
  },
  {
    id: 'shop_005',
    name: 'หนังสือและเครื่องเขียน Khon Kaen Books',
    platform: 'shopee',
    status: 'connected',
    apiStatus: 'healthy', 
    lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    orderStats: {
      totalOrders: 445,
      scannedOrders: 432,
      pendingScans: 8,
      processedOrders: 424,
      recentScans: []
    },
    credentials: {
      isValid: true,
      daysUntilExpiry: 67,
      expiresAt: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000),
      lastChecked: new Date()
    },
    issues: [],
    isActive: true
  }
];

// Sample orders for barcode scanning simulation
export const simulationOrders: Order[] = [
  {
    order_sn: '250717CXPUJJBE',
    awb_number: 'TH2507170001',
    status: 'pending_scan',
    productName: 'เกม PC : Steam Keys - Monster Hunter Wilds Standard',
    customerName: 'ธนากิ***** ป*****',
    amount: 1606,
    platform: 'shopee',
    shopId: 'shop_001',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    order_sn: '250716A5D1TJTW', 
    awb_number: 'TH2507160002',
    status: 'pending_scan',
    productName: 'ADATA SC750 ExtSSD 2000GB Type-C R1050 BK',
    customerName: 'วิริย***** ร*****',
    amount: 5490,
    platform: 'shopee',
    shopId: 'shop_001',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    order_sn: '2507156NYG7WA8',
    awb_number: 'TH2507150003', 
    status: 'pending_scan',
    productName: 'Dell EcoLoop Pro Slim Backpack - CP3724',
    customerName: 'วัชร***** ก*****',
    amount: 1304,
    platform: 'shopee',
    shopId: 'shop_002',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    order_sn: '250630VKBGHAVF',
    awb_number: 'TH2506300004',
    status: 'pending_scan', 
    productName: 'Amazfit T-Rex 3 Lava',
    customerName: 'อรรถพ***** อ*****',
    amount: 8590,
    platform: 'shopee',
    shopId: 'shop_003',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    order_sn: '250624D5V8Y20J',
    awb_number: 'TH2506240005',
    status: 'pending_scan',
    productName: 'Synology DDR4 non-ECC SODIMM 2666MHz รุ่น D4NESO-2666-4G',
    customerName: 'รัตน์***** ล*****',
    amount: 3490,
    platform: 'shopee',
    shopId: 'shop_004',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
];

// Service class for shop management
export class ShopService {
  private static shops: Shop[] = [...mockShops];
  private static scannedOrders: Order[] = [];

  // Get all shops
  static getShops(): Shop[] {
    return this.shops;
  }

  // Get shops by platform
  static getShopsByPlatform(platform: Platform): Shop[] {
    return this.shops.filter(shop => shop.platform === platform);
  }

  // Get shop by ID
  static getShopById(id: string): Shop | undefined {
    return this.shops.find(shop => shop.id === id);
  }

  // Get dashboard statistics
  static getDashboardStats(): DashboardStats {
    const shops = this.getShops();
    const totalShops = shops.length;
    const connectedShops = shops.filter(shop => shop.status === 'connected').length;
    const shopsNeedingAttention = shops.filter(shop => shop.status === 'needs_attention').length;
    const totalOrders = shops.reduce((sum, shop) => sum + shop.orderStats.totalOrders, 0);
    const pendingScans = shops.reduce((sum, shop) => sum + shop.orderStats.pendingScans, 0);
    
    return {
      totalShops,
      connectedShops,
      shopsNeedingAttention,
      totalOrders,
      pendingScans,
      recentActivity: this.scannedOrders.slice(-10)
    };
  }

  // Simulate manual refresh for a shop
  static refreshShop(shopId: string): Shop | undefined {
    const shop = this.getShopById(shopId);
    if (shop) {
      shop.lastUpdate = new Date();
      // Simulate minor changes in order stats
      shop.orderStats.pendingScans = Math.max(0, shop.orderStats.pendingScans + Math.floor(Math.random() * 3) - 1);
    }
    return shop;
  }

  // Simulate order scanning
  static scanOrder(orderSn: string): { success: boolean; order?: Order; shop?: Shop; message: string } {
    const order = simulationOrders.find(o => o.order_sn === orderSn);
    
    if (!order) {
      return {
        success: false,
        message: `Order ${orderSn} not found in system`
      };
    }

    if (order.status !== 'pending_scan') {
      return {
        success: false,
        order,
        message: `Order ${orderSn} has already been scanned`
      };
    }

    // Update order status
    order.status = 'scanned';
    order.scannedAt = new Date();
    
    // Add to scanned orders list
    this.scannedOrders.push({...order});

    // Update shop statistics
    const shop = this.getShopById(order.shopId);
    if (shop) {
      shop.orderStats.scannedOrders += 1;
      shop.orderStats.pendingScans = Math.max(0, shop.orderStats.pendingScans - 1);
      shop.orderStats.recentScans.unshift(order);
      if (shop.orderStats.recentScans.length > 5) {
        shop.orderStats.recentScans = shop.orderStats.recentScans.slice(0, 5);
      }
      shop.lastUpdate = new Date();
    }

    return {
      success: true,
      order,
      shop,
      message: `Order ${orderSn} scanned successfully`
    };
  }

  // Get scanned orders
  static getScannedOrders(): Order[] {
    return this.scannedOrders;
  }

  // Get orders by status
  static getOrdersByStatus(status: Order['status']): Order[] {
    return [...simulationOrders.filter(o => o.status === status), ...this.scannedOrders.filter(o => o.status === status)];
  }

  // Simulate fixing shop issues
  static resolveShopIssue(shopId: string, issueType: string): boolean {
    const shop = this.getShopById(shopId);
    if (!shop) return false;

    // Remove the issue
    shop.issues = shop.issues.filter(issue => issue.type !== issueType);
    
    // Update shop status based on remaining issues
    if (shop.issues.length === 0) {
      shop.status = 'connected';
      shop.apiStatus = 'healthy';
      if (issueType === 'api_expired' || issueType === 'api_expiring') {
        shop.credentials.isValid = true;
        shop.credentials.daysUntilExpiry = 90;
        shop.credentials.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      }
    }
    
    shop.lastUpdate = new Date();
    return true;
  }
}
