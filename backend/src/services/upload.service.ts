import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import * as xlsx from 'xlsx';

export interface ColumnSchema {
  name: string;
  type: string;
}

export const inferSchema = (data: any[]): ColumnSchema[] => {
  if (data.length === 0) return [];

  const headers = Object.keys(data[0]);
  const schema: ColumnSchema[] = [];

  for (const header of headers) {
    let type = 'VARCHAR(255)'; // Default
    let allInt = true;
    let allFloat = true;
    let allDate = true;

    for (const row of data.slice(0, 100)) { // Sample up to 100 rows
      const val = row[header];
      if (val === null || val === undefined || val === '') continue;

      const num = Number(val);
      if (isNaN(num)) {
        allInt = false;
        allFloat = false;
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          allDate = false;
        }
      } else {
        allDate = false;
        if (!Number.isInteger(num)) {
          allInt = false;
        }
      }
    }

    if (allInt) type = 'INTEGER';
    else if (allFloat) type = 'FLOAT';
    else if (allDate) type = 'TIMESTAMP';

    // Sanitize column name (snake_case, lowercase)
    const cleanName = header
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    
    schema.push({ name: cleanName || 'col', type });
  }

  // Deduplicate names
  const nameCounts: Record<string, number> = {};
  for (const col of schema) {
    if (nameCounts[col.name]) {
      nameCounts[col.name]++;
      col.name = `${col.name}_${nameCounts[col.name]}`;
    } else {
      nameCounts[col.name] = 1;
    }
  }

  return schema;
};

export const parseFile = (filePath: string, originalName?: string): any[] => {
  const ext = path.extname(originalName || filePath).toLowerCase();
  
  if (ext === '.csv') {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const result = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    return result.data;
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
  }
  
  throw new Error('Unsupported file format');
};
