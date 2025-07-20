import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedData {
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
  fileType: 'excel' | 'csv';
  totalRows: number;
  errors?: string[];
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

    return {
      success: true,
      data: {
        headers,
        rows,
        fileName: file.name,
        fileType: 'excel',
        totalRows: rows.length,
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

          resolve({
            success: true,
            data: {
              headers,
              rows,
              fileName: file.name,
              fileType: 'csv',
              totalRows: rows.length,
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
    data.headers.join(','),
    ...data.rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
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
