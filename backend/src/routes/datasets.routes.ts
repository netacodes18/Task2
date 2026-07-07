import express from 'express';
import { getDb } from '../services/db.service';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all datasets
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const datasets = await db.collection('_datasets')
      .find({}, { projection: { column_schema: 0 } }) // Omit schema for list view
      .sort({ created_at: -1 })
      .toArray();
    
    // Map _id to id for frontend
    const formattedDatasets = datasets.map(d => ({ ...d, id: d._id.toString() }));
    res.json(formattedDatasets);
  } catch (error: any) {
    console.error('Fetch datasets error:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// Get a specific dataset with schema
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const dataset = await db.collection('_datasets').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    res.json({ ...dataset, id: dataset._id.toString() });
  } catch (error: any) {
    console.error('Fetch dataset error:', error);
    res.status(500).json({ error: 'Failed to fetch dataset' });
  }
});

export default router;
