/**
 * Export data to CSV format and trigger download
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from all objects
  const headers = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  ).sort();

  // Build CSV content
  const csvContent = [
    // Header row
    headers.map(escapeCSVField).join(','),
    // Data rows
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        return escapeCSVField(formatValue(value));
      }).join(',')
    ),
  ].join('\n');

  // Trigger download
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON format and trigger download
 */
export function exportToJSON(data: unknown, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, filename, 'application/json;charset=utf-8;');
}

/**
 * Escape special characters in CSV fields
 */
function escapeCSVField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Format a value for CSV export
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Handle Firestore Timestamp
    if ('seconds' in value && typeof (value as any).seconds === 'number') {
      const date = new Date((value as any).seconds * 1000);
      return date.toISOString();
    }
    return JSON.stringify(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

/**
 * Trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
