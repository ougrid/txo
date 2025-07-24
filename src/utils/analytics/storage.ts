import { StoredDashboardData } from './types';

const STORAGE_KEY = 'miniseller_dashboard_data';
const ACTIVE_DATA_KEY = 'miniseller_active_dashboard';

export class DashboardStorage {
  /**
   * Save dashboard data to localStorage
   */
  static saveDashboardData(data: StoredDashboardData): void {
    try {
      const existingData = this.getAllDashboardData();
      
      // Set all existing data as inactive
      const updatedData = existingData.map(item => ({ ...item, isActive: false }));
      
      // Add new data as active
      const newData = { ...data, isActive: true };
      updatedData.push(newData);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      localStorage.setItem(ACTIVE_DATA_KEY, data.id);
      
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
   * Get active dashboard data
   */
  static getActiveDashboardData(): StoredDashboardData | null {
    try {
      const activeId = localStorage.getItem(ACTIVE_DATA_KEY);
      if (!activeId) return null;

      const allData = this.getAllDashboardData();
      return allData.find(item => item.id === activeId && item.isActive) || null;
    } catch (error) {
      console.error('Failed to retrieve active dashboard data:', error);
      return null;
    }
  }

  /**
   * Set specific data as active
   */
  static setActiveDashboard(id: string): boolean {
    try {
      const allData = this.getAllDashboardData();
      const updatedData = allData.map(item => ({
        ...item,
        isActive: item.id === id
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      localStorage.setItem(ACTIVE_DATA_KEY, id);
      return true;
    } catch (error) {
      console.error('Failed to set active dashboard:', error);
      return false;
    }
  }

  /**
   * Delete dashboard data
   */
  static deleteDashboardData(id: string): boolean {
    try {
      const allData = this.getAllDashboardData();
      const filteredData = allData.filter(item => item.id !== id);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
      
      // If deleted data was active, clear active data
      const activeId = localStorage.getItem(ACTIVE_DATA_KEY);
      if (activeId === id) {
        localStorage.removeItem(ACTIVE_DATA_KEY);
      }
      
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
      localStorage.removeItem(ACTIVE_DATA_KEY);
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
      const data = this.getAllDashboardData();
      const dataSize = JSON.stringify(data).length;
      const totalStorage = 5 * 1024 * 1024; // 5MB typical localStorage limit
      
      return {
        used: dataSize,
        available: totalStorage - dataSize,
        percentage: (dataSize / totalStorage) * 100
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export data for backup
   */
  static exportData(): string {
    const allData = this.getAllDashboardData();
    return JSON.stringify(allData, null, 2);
  }

  /**
   * Import data from backup
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as StoredDashboardData[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}
