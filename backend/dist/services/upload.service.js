"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = exports.inferSchema = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const papaparse_1 = __importDefault(require("papaparse"));
const xlsx = __importStar(require("xlsx"));
const inferSchema = (data) => {
    if (data.length === 0)
        return [];
    const headers = Object.keys(data[0]);
    const schema = [];
    for (const header of headers) {
        let type = 'VARCHAR(255)'; // Default
        let allInt = true;
        let allFloat = true;
        let allDate = true;
        for (const row of data.slice(0, 100)) { // Sample up to 100 rows
            const val = row[header];
            if (val === null || val === undefined || val === '')
                continue;
            const num = Number(val);
            if (isNaN(num)) {
                allInt = false;
                allFloat = false;
                const date = new Date(val);
                if (isNaN(date.getTime())) {
                    allDate = false;
                }
            }
            else {
                allDate = false;
                if (!Number.isInteger(num)) {
                    allInt = false;
                }
            }
        }
        if (allInt)
            type = 'INTEGER';
        else if (allFloat)
            type = 'FLOAT';
        else if (allDate)
            type = 'TIMESTAMP';
        // Sanitize column name (snake_case, lowercase)
        const cleanName = header
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        schema.push({ name: cleanName || 'col', type });
    }
    // Deduplicate names
    const nameCounts = {};
    for (const col of schema) {
        if (nameCounts[col.name]) {
            nameCounts[col.name]++;
            col.name = `${col.name}_${nameCounts[col.name]}`;
        }
        else {
            nameCounts[col.name] = 1;
        }
    }
    return schema;
};
exports.inferSchema = inferSchema;
const parseFile = (filePath, originalName) => {
    const ext = path_1.default.extname(originalName || filePath).toLowerCase();
    if (ext === '.csv') {
        const fileContent = fs_1.default.readFileSync(filePath, 'utf8');
        const result = papaparse_1.default.parse(fileContent, { header: true, skipEmptyLines: true });
        return result.data;
    }
    else if (ext === '.xlsx' || ext === '.xls') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(sheet);
    }
    throw new Error('Unsupported file format');
};
exports.parseFile = parseFile;
