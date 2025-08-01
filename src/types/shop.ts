export type Platform = 'shopee' | 'lazada' | 'tiktok';

export type ShopStatus = 'connected' | 'disconnected' | 'needs_attention';
export type ApiStatus = 'healthy' | 'expired_soon' | 'needs_reconnection';
export type OrderStatus = 'pending_scan' | 'scanned' | 'processed' | 'completed';

export interface Order {
  order_sn: string; // Shopee order number from barcode
  awb_number: string; // Air Waybill number
  status: OrderStatus;
  scannedAt?: Date;
  processedAt?: Date;
  productName: string;
  customerName: string;
  amount: number;
  platform: Platform;
  shopId: string;
  created_at: Date;
}

export interface ShopCredentials {
  isValid: boolean;
  expiresAt?: Date;
  daysUntilExpiry?: number;
  lastChecked: Date;
}

export interface OrderStats {
  totalOrders: number;
  scannedOrders: number;
  pendingScans: number;
  processedOrders: number;
  recentScans: Order[];
}

export interface ShopIssue {
  type: 'api_expiring' | 'api_expired' | 'high_order_volume' | 'scan_needed';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action: string;
  actionType: 'reconnect' | 'renew' | 'scan' | 'review';
}

export interface Shop {
  id: string;
  name: string;
  platform: Platform;
  status: ShopStatus;
  apiStatus: ApiStatus;
  lastUpdate: Date;
  orderStats: OrderStats;
  credentials: ShopCredentials;
  issues: ShopIssue[];
  isActive: boolean;
}

export interface PlatformConfig {
  name: string;
  color: string;
  icon: string;
  isAvailable: boolean;
  comingSoon?: boolean;
  features: string[];
}

export interface DashboardStats {
  totalShops: number;
  connectedShops: number;
  shopsNeedingAttention: number;
  totalOrders: number;
  pendingScans: number;
  recentActivity: Order[];
}
