import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedData {
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
  // Analytics-ready flag
  analyticsReady?: boolean;
  // Additional column mappings for analytics
  dateColumnIndex?: number;
  provinceColumnIndex?: number;
  districtColumnIndex?: number;
  productNameColumnIndex?: number;
  skuColumnIndex?: number;
  quantityColumnIndex?: number;
  priceColumnIndex?: number;
  paymentMethodColumnIndex?: number;
  usernameColumnIndex?: number;
  commissionColumnIndex?: number;
  transactionFeeColumnIndex?: number;
  serviceFeeColumnIndex?: number;
  netSalePriceColumnIndex?: number;
}

export interface FileProcessingResult {
  success: boolean;
  data?: ParsedData;
  error?: string;
}

/**
 * Parse Excel file (.xlsx, .xls)
 */
export const parseExcelFile = async (file: File): Promise<FileProcessingResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (!worksheet) {
      return {
        success: false,
        error: 'No valid worksheet found in the Excel file',
      };
    }

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false, // Ensure all values are strings
    }) as (string | number)[][];

    if (jsonData.length === 0) {
      return {
        success: false,
        error: 'The Excel file appears to be empty',
      };
    }

    // Extract headers and data rows
    const headers = (jsonData[0] as (string | number)[]).map(h => String(h).trim());
    const rows = jsonData.slice(1);

    // Validate headers
    if (headers.length === 0 || headers.every(h => h === '')) {
      return {
        success: false,
        error: 'No valid column headers found in the Excel file',
      };
    }

    // Find status column immediately after parsing
    const statusColumnIndex = headers.findIndex(header => 
      header.trim().toLowerCase().includes('สถานะการสั่งซื้อ') || 
      header.trim().toLowerCase().includes('order status')
    );

    return {
      success: true,
      data: {
        headers,
        rows,
        fileName: file.name,
        fileType: 'excel',
        totalRows: rows.length,
        statusColumnIndex: statusColumnIndex >= 0 ? statusColumnIndex : undefined,
      },
    };
  } catch (error) {
    console.error('Excel parsing error:', error);
    return {
      success: false,
      error: 'Failed to parse Excel file. Please ensure the file is not corrupted.',
    };
  }
};

/**
 * Parse CSV file
 */
export const parseCSVFile = (file: File): Promise<FileProcessingResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            const errorMessages = results.errors.map(err => err.message);
            return resolve({
              success: false,
              error: `CSV parsing errors: ${errorMessages.join(', ')}`,
            });
          }

          const data = results.data as (string | number)[][];
          
          if (data.length === 0) {
            return resolve({
              success: false,
              error: 'The CSV file appears to be empty',
            });
          }

          // Extract headers and data rows
          const headers = (data[0] as (string | number)[]).map(h => String(h).trim());
          const rows = data.slice(1);

          // Validate headers
          if (headers.length === 0 || headers.every(h => h === '')) {
            return resolve({
              success: false,
              error: 'No valid column headers found in the CSV file',
            });
          }

          // Find status column immediately after parsing
          const statusColumnIndex = headers.findIndex(header => 
            header.trim().toLowerCase().includes('สถานะการสั่งซื้อ') || 
            header.trim().toLowerCase().includes('order status')
          );

          resolve({
            success: true,
            data: {
              headers,
              rows,
              fileName: file.name,
              fileType: 'csv',
              totalRows: rows.length,
              statusColumnIndex: statusColumnIndex >= 0 ? statusColumnIndex : undefined,
            },
          });
        } catch (error) {
          console.error('CSV processing error:', error);
          resolve({
            success: false,
            error: 'Failed to process CSV file data',
          });
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        resolve({
          success: false,
          error: 'Failed to parse CSV file. Please ensure the file is properly formatted.',
        });
      },
    });
  });
};

/**
 * Main file processing function
 */
export const processFile = async (file: File): Promise<FileProcessingResult> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileExtension) {
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file);
    case 'csv':
      return parseCSVFile(file);
    default:
      return {
        success: false,
        error: 'Unsupported file format. Please upload Excel (.xlsx, .xls) or CSV (.csv) files only.',
      };
  }
};

/**
 * Validate parsed data structure
 */
export const validateParsedData = (data: ParsedData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if headers exist
  if (!data.headers || data.headers.length === 0) {
    errors.push('No column headers found');
  }

  // Check for duplicate headers
  const duplicateHeaders = data.headers.filter((header, index) => 
    data.headers.indexOf(header) !== index
  );
  if (duplicateHeaders.length > 0) {
    errors.push(`Duplicate column headers found: ${duplicateHeaders.join(', ')}`);
  }

  // Check if there's actual data
  if (!data.rows || data.rows.length === 0) {
    errors.push('No data rows found');
  }

  // Check data consistency (all rows have same number of columns)
  if (data.rows && data.rows.length > 0) {
    const headerCount = data.headers.length;
    const inconsistentRows = data.rows.filter(row => row.length !== headerCount);
    if (inconsistentRows.length > 0) {
      errors.push(`${inconsistentRows.length} rows have inconsistent column count`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Export data to different formats
 */
export const exportToCSV = (data: ParsedData): string => {
  const csvContent = [
    // Properly quote headers to handle commas within header names
    data.headers.map(header => `"${String(header).replace(/"/g, '""')}"`).join(','),
    ...data.rows.map(row => {
      // Ensure each row has the same number of columns as headers
      const normalizedRow = [...row];
      while (normalizedRow.length < data.headers.length) {
        normalizedRow.push('');
      }
      return normalizedRow.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    })
  ].join('\n');
  
  return csvContent;
};

export const exportToJSON = (data: ParsedData): string => {
  const jsonData = data.rows.map(row => {
    const obj: Record<string, string | number> = {};
    data.headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
  
  return JSON.stringify(jsonData, null, 2);
};

/**
 * Thai order status mapping
 */
export type ThaiOrderStatus = 'สำเร็จแล้ว' | 'ยกเลิกแล้ว' | 'ที่ต้องจัดส่ง';

export const getStatusBadgeColor = (status: string): 'success' | 'error' | 'warning' | 'light' => {
  const normalizedStatus = String(status).trim();
  switch (normalizedStatus) {
    case 'สำเร็จแล้ว':
      return 'success';
    case 'ยกเลิกแล้ว':
      return 'error';
    case 'ที่ต้องจัดส่ง':
      return 'warning';
    default:
      return 'light';
  }
};

/**
 * Revenue calculation utility
 */
interface RevenueCalculationColumns {
  netSalePrice: number; // ราคาขายสุทธิ
  commission: number; // ค่าคอมมิชชั่น
  transactionFee: number; // Transaction Fee
  serviceFee: number; // ค่าบริการ
}

export const findRevenueCalculationColumns = (headers: string[]): RevenueCalculationColumns | null => {
  const columnMap: Partial<RevenueCalculationColumns> = {};
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.trim().toLowerCase();
    
    if (normalizedHeader.includes('ราคาขายสุทธิ') || normalizedHeader.includes('net sale')) {
      columnMap.netSalePrice = index;
    } else if (normalizedHeader.includes('ค่าคอมมิชชั่น') || normalizedHeader.includes('commission')) {
      columnMap.commission = index;
    } else if (normalizedHeader.includes('transaction fee')) {
      columnMap.transactionFee = index;
    } else if (normalizedHeader.includes('ค่าบริการ') || normalizedHeader.includes('service fee')) {
      columnMap.serviceFee = index;
    }
  });
  
  // Check if all required columns are found
  if (columnMap.netSalePrice !== undefined && 
      columnMap.commission !== undefined && 
      columnMap.transactionFee !== undefined && 
      columnMap.serviceFee !== undefined) {
    return columnMap as RevenueCalculationColumns;
  }
  
  return null;
};

export const calculateOrderRevenue = (
  row: (string | number)[], 
  columns: RevenueCalculationColumns
): number => {
  try {
    const netSale = parseFloat(String(row[columns.netSalePrice] || '0').replace(/,/g, ''));
    const commission = parseFloat(String(row[columns.commission] || '0').replace(/,/g, ''));
    const transactionFee = parseFloat(String(row[columns.transactionFee] || '0').replace(/,/g, ''));
    const serviceFee = parseFloat(String(row[columns.serviceFee] || '0').replace(/,/g, ''));
    
    // รายรับจากคำสั่งซื้อ = ราคาขายสุทธิ - ค่าคอมมิชชั่น - Transaction Fee - ค่าบริการ
    const revenue = netSale - commission - transactionFee - serviceFee;
    
    return isNaN(revenue) ? 0 : revenue;
  } catch (error) {
    console.error('Error calculating revenue for row:', error);
    return 0;
  }
};

export const processRevenueCalculation = (data: ParsedData): ParsedData => {
  // Check if data is suitable for processing (<=10000 rows)
  if (data.totalRows > 10000) {
    return {
      ...data,
      errors: [...(data.errors || []), 'File too large for client-side processing. Maximum 10,000 rows allowed.']
    };
  }

  // Find required columns (use original headers for column mapping)
  const revenueColumns = findRevenueCalculationColumns(data.headers);
  if (!revenueColumns) {
    return {
      ...data,
      errors: [...(data.errors || []), 'Required columns for revenue calculation not found. Need: ราคาขายสุทธิ, ค่าคอมมิชชั่น, Transaction Fee, ค่าบริการ']
    };
  }

  // Find status column (use original headers for column mapping)
  const statusColumnIndex = data.headers.findIndex(header => 
    header.trim().toLowerCase().includes('สถานะการสั่งซื้อ') || 
    header.trim().toLowerCase().includes('order status')
  );

  // Add revenue column to headers
  const newHeaders = [...data.headers, 'รายรับจากคำสั่งซื้อ'];
  
  // Calculate revenue for each row
  let totalRevenue = 0;
  const ordersByStatus: Record<string, number> = {};
  let processedRows = 0;

  const newRows = data.rows.map(row => {
    // Normalize row length to match header count (fill missing columns with empty strings)
    const normalizedRow = [...row];
    while (normalizedRow.length < data.headers.length) {
      normalizedRow.push('');
    }
    
    let revenue = 0;
    
    // Only calculate revenue for specific order statuses
    if (statusColumnIndex >= 0 && normalizedRow[statusColumnIndex]) {
      const status = String(normalizedRow[statusColumnIndex]).trim();
      
      // Only calculate for "ที่ต้องจัดส่ง" and "สำเร็จแล้ว" orders
      if (status === 'ที่ต้องจัดส่ง' || status === 'สำเร็จแล้ว') {
        revenue = calculateOrderRevenue(normalizedRow, revenueColumns);
        totalRevenue += revenue;
      }
      
      // Count all orders by status (including cancelled)
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    } else {
      // If no status column or empty status, still calculate revenue
      revenue = calculateOrderRevenue(normalizedRow, revenueColumns);
      totalRevenue += revenue;
    }
    
    processedRows++;
    return [...normalizedRow, revenue.toFixed(2)];
  });

  return {
    ...data,
    headers: newHeaders,
    rows: newRows,
    hasRevenueCalculation: true,
    statusColumnIndex: statusColumnIndex >= 0 ? statusColumnIndex : undefined,
    calculationSummary: {
      totalRevenue,
      ordersByStatus,
      processedRows
    }
  };
};

/**
 * Export data to Excel with protection
 */
export const exportToExcel = (data: ParsedData, withProtection: boolean = true): ArrayBuffer => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet format
  const wsData = [data.headers, ...data.rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  const colWidths = data.headers.map(() => ({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  // Apply formatting for status column if it exists
  if (data.statusColumnIndex !== undefined) {
    const statusCol = XLSX.utils.encode_col(data.statusColumnIndex);
    
    // Apply conditional formatting (limited support in xlsx)
    for (let i = 1; i <= data.rows.length; i++) {
      const cellRef = statusCol + (i + 1);
      const cell = ws[cellRef];
      
      if (cell && cell.v) {
        // Note: Full color formatting requires more advanced Excel manipulation
        // For now, we'll handle visual formatting in the frontend
      }
    }
  }
  
  // Apply protection if requested
  if (withProtection) {
    ws['!protect'] = {
      password: '', // Empty password - just prevents accidental editing
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false
    };
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  
  // Write workbook
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
};

/**
 * Prepare data for analytics by finding and mapping all relevant columns
 */
export const prepareDataForAnalytics = (data: ParsedData): ParsedData => {
  const enhancedData: ParsedData = {
    ...data,
    analyticsReady: true,
    dateColumnIndex: findDateColumn(data.headers),
    provinceColumnIndex: findColumnIndex(data.headers, ['จังหวัด', 'province']),
    districtColumnIndex: findColumnIndex(data.headers, ['เขต/อำเภอ', 'district']),
    productNameColumnIndex: findColumnIndex(data.headers, ['ชื่อสินค้า', 'product name']),
    skuColumnIndex: findColumnIndex(data.headers, ['เลขอ้างอิง SKU', 'sku']),
    quantityColumnIndex: findColumnIndex(data.headers, ['จำนวน', 'quantity']),
    priceColumnIndex: findColumnIndex(data.headers, ['ราคาขาย', 'price']),
    paymentMethodColumnIndex: findColumnIndex(data.headers, ['ช่องทางการชำระเงิน', 'payment method']),
    usernameColumnIndex: findColumnIndex(data.headers, ['ชื่อผู้ใช้', 'username']),
    commissionColumnIndex: findColumnIndex(data.headers, ['ค่าคอมมิชชั่น', 'commission']),
    transactionFeeColumnIndex: findColumnIndex(data.headers, ['Transaction Fee']),
    serviceFeeColumnIndex: findColumnIndex(data.headers, ['ค่าบริการ', 'service fee']),
    netSalePriceColumnIndex: findColumnIndex(data.headers, ['ราคาขายสุทธิ', 'net sale'])
  };

  return enhancedData;
};

/**
 * Find date column index
 */
const findDateColumn = (headers: string[]): number => {
  const dateHeaders = [
    'วันที่ทำการสั่งซื้อ',
    'เวลาการชำระสินค้า',
    'วันที่',
    'date',
    'order date',
    'created at',
    'timestamp'
  ];

  for (const dateHeader of dateHeaders) {
    const index = headers.findIndex(header => 
      header.toLowerCase().includes(dateHeader.toLowerCase())
    );
    if (index !== -1) return index;
  }

  return -1;
};

/**
 * Generic helper to find column index by search terms
 */
const findColumnIndex = (headers: string[], searchTerms: string[]): number => {
  for (const term of searchTerms) {
    const index = headers.findIndex(header => 
      header.toLowerCase().includes(term.toLowerCase())
    );
    if (index !== -1) return index;
  }
  return -1;
};
