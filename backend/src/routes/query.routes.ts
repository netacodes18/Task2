import express from 'express';
import { getDb } from '../services/db.service';
import { generateMongoPipeline } from '../services/llm.service';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { datasetId, question } = req.body;

    if (!datasetId || !question) {
      return res.status(400).json({ error: 'Missing datasetId or question.' });
    }

    const db = getDb();
    const sessionId = req.headers['x-session-id'] || 'anonymous';

    // 1. Fetch dataset metadata and verify ownership
    const dataset = await db.collection('_datasets').findOne({ 
      _id: new ObjectId(datasetId),
      session_id: sessionId
    });
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found.' });
    }
    
    const { table_name: collectionName, column_schema: schema } = dataset;

    // 2. Fetch sample data to help LLM
    const sampleRows = await db.collection(collectionName).find().limit(1).toArray();

    // 3. Generate Response using Gemini
    let generatedResponseStr = await generateMongoPipeline(question, collectionName, schema, sampleRows);
    
    // 4. Validate JSON Response
    let aiResponse;
    try {
        aiResponse = JSON.parse(generatedResponseStr);
    } catch (e) {
        return res.status(400).json({ error: 'Generated response is invalid JSON.', sql: generatedResponseStr });
    }
    
    let pipeline = aiResponse.pipeline;
    let explanation = aiResponse.explanation || "Here are the results.";
    let results: any[] = [];
    let fields: any[] = [];
    
    // 5. Execute Pipeline if present
    if (pipeline && Array.isArray(pipeline) && pipeline.length > 0) {
        // Basic injection prevention (prevent write stages)
        const forbiddenStages = ['$out', '$merge'];
        for (const stage of pipeline) {
            const stageName = Object.keys(stage)[0];
            if (forbiddenStages.includes(stageName)) {
                 return res.status(400).json({ error: 'Unsafe pipeline generated. Write stages are prohibited.', sql: JSON.stringify(pipeline) });
            }
        }
        
        // Append a limit to prevent massive results
        pipeline.push({ $limit: 500 });

        try {
            results = await db.collection(collectionName).aggregate(pipeline).toArray();
            
            // Extract fields dynamically from the first result if available
            if (results.length > 0) {
                fields = Object.keys(results[0]).map(k => ({ name: k, dataTypeID: 0 }));
            }
        } catch (dbError: any) {
            console.error('Mongo Execution Error:', dbError);
            return res.status(400).json({ error: 'Failed to execute query', details: dbError.message, sql: JSON.stringify(pipeline) });
        }
    }

    res.json({
        sql: pipeline ? JSON.stringify(pipeline, null, 2) : null,
        results: results,
        fields: fields,
        explanation: explanation
    });
  } catch (error: any) {
    console.error('Query Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process query' });
  }
});

export default router;
