import { StoredDashboardData } from './types';

const STORAGE_KEY = 'miniseller_dashboard_data';
const SELECTED_DATA_KEY = 'miniseller_selected_datasets';

export class DashboardStorage {
  /**
   * Check if localStorage is available and we're in browser environment
   */
  static isAvailable(): boolean {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return false;
      }
      
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save dashboard data to localStorage
   */
  static saveDashboardData(data: StoredDashboardData): void {
    try {
      if (!this.isAvailable()) {
        console.warn('localStorage is not available');
        return;
      }
      
      const existingData = this.getAllDashboardData();
      
      // Add new data as selected by default
      const newData = { ...data, isSelected: true };
      existingData.push(newData);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
      
      // Update selected datasets to include this new one
      const selectedIds = this.getSelectedDatasetIds();
      if (!selectedIds.includes(data.id)) {
        selectedIds.push(data.id);
        this.setSelectedDatasetIds(selectedIds);
      }
      
      console.log('Dashboard data saved successfully:', data.fileName);
    } catch (error) {
      console.error('Failed to save dashboard data:', error);
      throw new Error('Failed to save data to localStorage');
    }
  }

  /**
   * Get all dashboard data from localStorage
   */
  static getAllDashboardData(): StoredDashboardData[] {
    try {
      if (!this.isAvailable()) {
        return [];
      }
      
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve dashboard data:', error);
      return [];
    }
  }

  /**
   * Get selected dataset IDs
   */
  static getSelectedDatasetIds(): string[] {
    try {
      if (!this.isAvailable()) {
        return [];
      }
      
      const stored = localStorage.getItem(SELECTED_DATA_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve selected dataset IDs:', error);
      return [];
    }
  }

  /**
   * Set selected dataset IDs
   */
  static setSelectedDatasetIds(ids: string[]): void {
    try {
      if (!this.isAvailable()) {
        console.warn('localStorage is not available');
        return;
      }
      
      localStorage.setItem(SELECTED_DATA_KEY, JSON.stringify(ids));
      
      // Update isSelected flag in stored data
      const allData = this.getAllDashboardData();
      const updatedData = allData.map(item => ({
        ...item,
        isSelected: ids.includes(item.id)
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to set selected dataset IDs:', error);
    }
  }

  /**
   * Get specific dashboard data by ID
   */
  static getDashboardData(id: string): StoredDashboardData | null {
    try {
      const allData = this.getAllDashboardData();
      return allData.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Failed to retrieve specific dashboard data:', error);
      return null;
    }
  }

  /**
   * Get primary dashboard data (first available or most recently added)
   */
  static getPrimaryDashboardData(): StoredDashboardData | null {
    try {
      const allData = this.getAllDashboardData();
      if (allData.length === 0) {
        return null;
      }
      
      // Return the most recently added data (last in array)
      return allData[allData.length - 1];
    } catch (error) {
      console.error('Failed to retrieve primary dashboard data:', error);
      return null;
    }
  }

  /**
   * Update specific dashboard data
   */
  static updateDashboardData(id: string, updates: Partial<StoredDashboardData>): boolean {
    try {
      if (!this.isAvailable()) {
        console.warn('localStorage is not available');
        return false;
      }
      
      const allData = this.getAllDashboardData();
      const index = allData.findIndex(item => item.id === id);
      
      if (index === -1) {
        console.error('Dashboard data not found:', id);
        return false;
      }
      
      allData[index] = { ...allData[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
      
      console.log('Dashboard data updated successfully:', id);
      return true;
    } catch (error) {
      console.error('Failed to update dashboard data:', error);
      return false;
    }
  }

  /**
   * Delete specific dashboard data
   */
  static deleteDashboardData(id: string): boolean {
    try {
      if (!this.isAvailable()) {
        console.warn('localStorage is not available');
        return false;
      }
      
      const allData = this.getAllDashboardData();
      const filteredData = allData.filter(item => item.id !== id);
      
      if (allData.length === filteredData.length) {
        console.error('Dashboard data not found for deletion:', id);
        return false;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
      
      // Also remove from selected datasets
      const selectedIds = this.getSelectedDatasetIds();
      const updatedSelectedIds = selectedIds.filter(selectedId => selectedId !== id);
      this.setSelectedDatasetIds(updatedSelectedIds);
      
      console.log('Dashboard data deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Failed to delete dashboard data:', error);
      return false;
    }
  }

  /**
   * Clear all dashboard data
   */
  static clearAllData(): void {
    try {
      if (!this.isAvailable()) {
        console.warn('localStorage is not available');
        return;
      }
      
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SELECTED_DATA_KEY);
      console.log('All dashboard data cleared');
    } catch (error) {
      console.error('Failed to clear dashboard data:', error);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      if (!this.isAvailable()) {
        return { used: 0, available: 0, percentage: 0 };
      }
      
      const data = localStorage.getItem(STORAGE_KEY) || '';
      const selectedData = localStorage.getItem(SELECTED_DATA_KEY) || '';
      const used = (data.length + selectedData.length) * 2; // UTF-16 encoding
      
      // Estimate available space (localStorage is typically 5-10MB)
      const total = 5 * 1024 * 1024; // 5MB estimate
      const available = total - used;
      const percentage = total > 0 ? (used / total) * 100 : 0;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Check if storage has enough space for new data
   */
  static hasSpaceForData(dataSize: number): boolean {
    const info = this.getStorageInfo();
    return info.available > dataSize * 2; // Buffer for safety
  }
}

export default DashboardStorage;
