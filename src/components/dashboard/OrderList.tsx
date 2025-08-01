import React from 'react';
import { Order } from '@/types/shop';

interface OrderListProps {
  orders: Order[];
  title: string;
  emptyMessage?: string;
  showActions?: boolean;
  onScanOrder?: (orderSn: string) => void;
}

export default function OrderList({ 
  orders, 
  title, 
  emptyMessage = "No orders found", 
  showActions = false,
  onScanOrder 
}: OrderListProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending_scan':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scanned':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 text-4xl mb-3">📦</div>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {orders.map((order, index) => (
            <div key={`${order.order_sn}-${index}`} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {order.order_sn}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-1 truncate" title={order.productName}>
                    {order.productName}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Customer: {order.customerName}</span>
                    <span>AWB: {order.awb_number}</span>
                    <span>Created: {formatDate(order.created_at)}</span>
                    {order.scannedAt && (
                      <span>Scanned: {formatDate(order.scannedAt)}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    ฿{order.amount.toLocaleString()}
                  </div>
                  {showActions && order.status === 'pending_scan' && onScanOrder && (
                    <button
                      onClick={() => onScanOrder(order.order_sn)}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Quick Scan →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
