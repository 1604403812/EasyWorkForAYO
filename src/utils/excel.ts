import * as XLSX from 'xlsx';
import { downloadFile } from './storage';

export const parseExcel = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
};

export const parseExcelFromText = <T>(text: string): T[] => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split('\t').map((h) => h.trim());
  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || '';
    });
    result.push(obj as T);
  }

  return result;
};

export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: string[]
): void => {
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJson = <T>(data: T, filename: string): void => {
  downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
};

export const parseTextTable = <T>(text: string, columnMapping: Record<string, string>): T[] => {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  const result: T[] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const values = line.split('\t').map((v) => v.trim());
    const obj: Record<string, string | number> = {};
    
    Object.entries(columnMapping).forEach(([key, _], index) => {
      const value = values[index] || '';
      obj[key] = isNaN(Number(value)) ? value : Number(value);
    });
    
    result.push(obj as T);
  }

  return result;
};
