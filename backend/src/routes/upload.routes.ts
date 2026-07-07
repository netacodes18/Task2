import express from 'express';
import multer from 'multer';
import path from 'path';
import { parseFile, inferSchema } from '../services/upload.service';
import { getDb } from '../services/db.service';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = path.resolve(req.file.path);
    const originalName = req.file.originalname;

    // Parse the file
    const data = parseFile(filePath, originalName);
    
    if (data.length === 0) {
      return res.status(400).json({ error: 'File is empty.' });
    }

    // Infer schema
    const schema = inferSchema(data);

    res.json({
      message: 'File parsed successfully',
      originalName,
      rowCount: data.length,
      schema,
      sampleData: data.slice(0, 5), // Send some sample rows
      filePath: req.file.filename // Keep the temporary filename to reference on confirm
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process file' });
  }
});

router.post('/confirm', async (req, res) => {
  try {
    const { originalName, schema, filePath, datasetName } = req.body;
    
    if (!schema || !filePath || !datasetName) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const fullPath = path.resolve('uploads', filePath);
    const data = parseFile(fullPath, originalName);

    // Dynamic collection name creation
    const rawTableName = datasetName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const timestamp = Date.now();
    const collectionName = `${rawTableName}_${timestamp}`;

    const db = getDb();

    // Insert data directly into MongoDB collection
    if (data.length > 0) {
      await db.collection(collectionName).insertMany(data);
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
    
    const result = await db.collection('_datasets').insertOne(metadata);

    res.json({ 
      message: 'Dataset created successfully', 
      dataset: { id: result.insertedId.toString(), ...metadata } 
    });
  } catch (error: any) {
    console.error('Confirm Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create dataset' });
  }
});

export default router;
