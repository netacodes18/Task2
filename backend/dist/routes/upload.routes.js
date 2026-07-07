"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload_service_1 = require("../services/upload.service");
const db_service_1 = require("../services/db.service");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        const filePath = path_1.default.resolve(req.file.path);
        const originalName = req.file.originalname;
        // Parse the file
        const data = (0, upload_service_1.parseFile)(filePath, originalName);
        if (data.length === 0) {
            return res.status(400).json({ error: 'File is empty.' });
        }
        // Infer schema
        const schema = (0, upload_service_1.inferSchema)(data);
        res.json({
            message: 'File parsed successfully',
            originalName,
            rowCount: data.length,
            schema,
            sampleData: data.slice(0, 5), // Send some sample rows
            filePath: req.file.filename // Keep the temporary filename to reference on confirm
        });
    }
    catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message || 'Failed to process file' });
    }
}));
router.post('/confirm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { originalName, schema, filePath, datasetName } = req.body;
        if (!schema || !filePath || !datasetName) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }
        const fullPath = path_1.default.resolve('uploads', filePath);
        const data = (0, upload_service_1.parseFile)(fullPath, originalName);
        // Dynamic collection name creation
        const rawTableName = datasetName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const timestamp = Date.now();
        const collectionName = `${rawTableName}_${timestamp}`;
        const db = (0, db_service_1.getDb)();
        // Insert data directly into MongoDB collection
        if (data.length > 0) {
            yield db.collection(collectionName).insertMany(data);
        }
        // Register dataset metadata in _datasets collection
        const sessionId = req.headers['x-session-id'] || 'anonymous';
        const metadata = {
            name: datasetName,
            original_filename: originalName,
            table_name: collectionName,
            row_count: data.length,
            column_schema: schema,
            session_id: sessionId,
            created_at: new Date()
        };
        const result = yield db.collection('_datasets').insertOne(metadata);
        res.json({
            message: 'Dataset created successfully',
            dataset: Object.assign({ id: result.insertedId.toString() }, metadata)
        });
    }
    catch (error) {
        console.error('Confirm Upload Error:', error);
        res.status(500).json({ error: error.message || 'Failed to create dataset' });
    }
}));
exports.default = router;
