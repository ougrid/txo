import { DateRange, DateFilter } from './types';

export class DateFilterUtils {
  /**
   * Get predefined date ranges
   */
  static getQuickDateRanges(): DateFilter[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        type: 'today',
        label: 'Today',
        range: {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      },
      {
        type: 'yesterday',
        label: 'Yesterday',
        range: {
          start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          end: new Date(today.getTime() - 1)
        }
      },
      {
        type: 'last7days',
        label: 'Last 7 Days',
        range: {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      },
      {
        type: 'last30days',
        label: 'Last 30 Days',
        range: {
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      },
      {
        type: 'thisMonth',
        label: 'This Month',
        range: {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        }
      },
      {
        type: 'lastMonth',
        label: 'Last Month',
        range: {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        }
      },
      {
        type: 'thisYear',
        label: 'This Year',
        range: {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        }
      }
    ];
  }

  /**
   * Parse date string from various formats
   */
  static parseDate(dateString: string): Date | null {
    if (!dateString || dateString.trim() === '') return null;

    // Try different date formats commonly found in Thai e-commerce data
    const formats = [
      // ISO format: 2025-06-19 15:41
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/,
      // ISO format: 2025-06-19
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // Thai format: 19/06/2025
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      // US format: 06/19/2025
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        if (format.source.includes('(\\d{4})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2})')) {
          // ISO datetime format
          const [, year, month, day, hour, minute] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
        } else if (format.source.includes('(\\d{4})-(\\d{2})-(\\d{2})')) {
          // ISO date format
          const [, year, month, day] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // DD/MM/YYYY or MM/DD/YYYY format
          const [, first, second, year] = match;
          // Assume DD/MM/YYYY for Thai data
          return new Date(parseInt(year), parseInt(second) - 1, parseInt(first));
        }
      }
    }

    // Fallback to JavaScript Date parsing
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Check if date is within range
   */
  static isDateInRange(date: Date, range: DateRange): boolean {
    return date >= range.start && date <= range.end;
  }

  /**
   * Filter data rows by date range
   */
  static filterRowsByDateRange(
    rows: (string | number)[][],
    headers: string[],
    dateRange: DateRange
  ): (string | number)[][] {
    // Find date column
    const dateColumnIndex = this.findDateColumn(headers);
    if (dateColumnIndex === -1) {
      console.warn('No date column found, returning all rows');
      return rows;
    }

    return rows.filter(row => {
      const dateValue = row[dateColumnIndex];
      if (!dateValue) return false;

      const parsedDate = this.parseDate(String(dateValue));
      if (!parsedDate) return false;

      return this.isDateInRange(parsedDate, dateRange);
    });
  }

  /**
   * Find date column index
   */
  static findDateColumn(headers: string[]): number {
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
  }

  /**
   * Group data by date periods
   */
  static groupByDatePeriod(
    rows: (string | number)[][],
    headers: string[],
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Record<string, (string | number)[][]> {
    const dateColumnIndex = this.findDateColumn(headers);
    if (dateColumnIndex === -1) return {};

    const grouped: Record<string, (string | number)[][]> = {};

    rows.forEach(row => {
      const dateValue = row[dateColumnIndex];
      if (!dateValue) return;

      const parsedDate = this.parseDate(String(dateValue));
      if (!parsedDate) return;

      let key: string;
      switch (period) {
        case 'daily':
          key = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly':
          const weekStart = new Date(parsedDate);
          weekStart.setDate(parsedDate.getDate() - parsedDate.getDay());
          key = `Week of ${weekStart.toISOString().split('T')[0]}`;
          break;
        case 'monthly':
          key = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          key = String(parsedDate.getFullYear());
          break;
        default:
          key = parsedDate.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(row);
    });

    return grouped;
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date, format: 'short' | 'long' | 'thai' = 'short'): string {
    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
      case 'long':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'thai':
        return date.toLocaleDateString('th-TH', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Get date range from data
   */
  static getDataDateRange(rows: (string | number)[][], headers: string[]): DateRange | null {
    const dateColumnIndex = this.findDateColumn(headers);
    if (dateColumnIndex === -1) return null;

    const dates: Date[] = [];
    
    rows.forEach(row => {
      const dateValue = row[dateColumnIndex];
      if (dateValue) {
        const parsedDate = this.parseDate(String(dateValue));
        if (parsedDate) {
          dates.push(parsedDate);
        }
      }
    });

    if (dates.length === 0) return null;

    dates.sort((a, b) => a.getTime() - b.getTime());

    return {
      start: dates[0],
      end: dates[dates.length - 1]
    };
  }
}
