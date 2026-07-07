import express from 'express';
import { getDb } from '../services/db.service';
import { generateDashboardConfig } from '../services/llm.service';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/:datasetId', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const db = getDb();

    // 1. Fetch dataset metadata (Allow access without session ID for sharing links)
    const dataset = await db.collection('_datasets').findOne({ 
      _id: new ObjectId(datasetId)
    });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found.' });
    }

    const { table_name: collectionName, column_schema: schema } = dataset;

    // 2. Load or Generate Dashboard Config
    let config = dataset.dashboard_config;
    if (!config) {
      const sampleRows = await db.collection(collectionName).find().limit(1).toArray();
      const configStr = await generateDashboardConfig(collectionName, schema, sampleRows);
      
      try {
        config = JSON.parse(configStr);
        // Save config for future requests to make it instant
        await db.collection('_datasets').updateOne(
          { _id: new ObjectId(datasetId) },
          { $set: { dashboard_config: config } }
        );
      } catch (e) {
        return res.status(400).json({ error: 'Failed to parse generated dashboard config.', raw: configStr });
      }
    }

    if (!config || !config.kpis || !config.charts) {
      return res.status(400).json({ error: 'Invalid dashboard configuration format.' });
    }

    // 3. Execute all pipelines in parallel
    const kpiPromises = config.kpis.map(async (kpi: any) => {
      try {
        const result = await db.collection(collectionName).aggregate(kpi.pipeline).toArray();
        return { ...kpi, data: result[0]?.value || result[0]?.[Object.keys(result[0] || {})[0]] || 0 };
      } catch (err) {
        return { ...kpi, data: 'Error', error: true };
      }
    });

    const chartPromises = config.charts.map(async (chart: any) => {
      try {
        const result = await db.collection(collectionName).aggregate(chart.pipeline).toArray();
        return { ...chart, data: result };
      } catch (err) {
        return { ...chart, data: [], error: true };
      }
    });

    const [kpiResults, chartResults] = await Promise.all([
      Promise.all(kpiPromises),
      Promise.all(chartPromises)
    ]);

    // 4. Return formatted dashboard data
    res.json({
      kpis: kpiResults,
      charts: chartResults
    });

  } catch (error: any) {
    console.error('Dashboard Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate dashboard' });
  }
});

export default router;
