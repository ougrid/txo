import { StoredDashboardData } from './types';

const STORAGE_KEY = 'miniseller_dashboard_data';
const SELECTED_DATA_KEY = 'miniseller_selected_datasets';

export class DashboardStorage {
  /**
   * Save dashboard data to localStorage
   */
  static saveDashboardData(data: StoredDashboardData): void {
    try {
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
   * Get all stored dashboard data
   */
  static getAllDashboardData(): StoredDashboardData[] {
    try {
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
      localStorage.setItem(SELECTED_DATA_KEY, JSON.stringify(ids));
      
      // Update isSelected flag on all datasets
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
   * Get first selected dashboard data (for backward compatibility)
   */
  static getPrimaryDashboardData(): StoredDashboardData | null {
    try {
      const selectedIds = this.getSelectedDatasetIds();
      if (selectedIds.length === 0) return null;
      
      const allData = this.getAllDashboardData();
      return allData.find(item => item.id === selectedIds[0]) || null;
    } catch (error) {
      console.error('Failed to retrieve primary dashboard data:', error);
      return null;
    }
  }

  /**
   * Get all selected dashboard data
   */
  static getSelectedDashboardData(): StoredDashboardData[] {
    try {
      const selectedIds = this.getSelectedDatasetIds();
      const allData = this.getAllDashboardData();
      return allData.filter(item => selectedIds.includes(item.id));
    } catch (error) {
      console.error('Failed to retrieve selected dashboard data:', error);
      return [];
    }
  }

  /**
   * Delete dashboard data by ID
   */
  static deleteDashboardData(id: string): boolean {
    try {
      const existingData = this.getAllDashboardData();
      const filteredData = existingData.filter(item => item.id !== id);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
      
      // Remove from selected datasets if it was selected
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
      const data = localStorage.getItem(STORAGE_KEY) || '';
      const selectedData = localStorage.getItem(SELECTED_DATA_KEY) || '';
      const used = new Blob([data + selectedData]).size;
      
      // Estimate available space (localStorage is typically 5-10MB)
      const estimated = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;
      
      return {
        used,
        available,
        percentage
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
