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
const db_service_1 = require("../services/db.service");
const llm_service_1 = require("../services/llm.service");
const mongodb_1 = require("mongodb");
const router = express_1.default.Router();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { datasetId, question, chatHistory = [] } = req.body;
        if (!datasetId || !question) {
            return res.status(400).json({ error: 'Missing datasetId or question.' });
        }
        const db = (0, db_service_1.getDb)();
        const sessionId = req.headers['x-session-id'] || 'anonymous';
        // 1. Fetch dataset metadata and verify ownership
        const dataset = yield db.collection('_datasets').findOne({
            _id: new mongodb_1.ObjectId(datasetId)
        });
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found.' });
        }
        const { table_name: collectionName, column_schema: schema } = dataset;
        // 2. Fetch sample data to help LLM
        const sampleRows = yield db.collection(collectionName).find().limit(1).toArray();
        // 3. Generate Response using LLM
        let generatedResponseStr = yield (0, llm_service_1.generateMongoPipeline)(question, collectionName, schema, sampleRows, chatHistory);
        // 4. Validate JSON Response
        let aiResponse;
        try {
            aiResponse = JSON.parse(generatedResponseStr);
        }
        catch (e) {
            return res.status(400).json({ error: 'Generated response is invalid JSON.', sql: generatedResponseStr });
        }
        let pipeline = aiResponse.pipeline;
        let explanation = aiResponse.explanation || "Here are the results.";
        let results = [];
        let fields = [];
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
                results = yield db.collection(collectionName).aggregate(pipeline).toArray();
                // Extract fields dynamically from the first result if available
                if (results.length > 0) {
                    fields = Object.keys(results[0]).map(k => ({ name: k, dataTypeID: 0 }));
                }
            }
            catch (dbError) {
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
    }
    catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: error.message || 'Failed to process query' });
    }
}));
exports.default = router;
