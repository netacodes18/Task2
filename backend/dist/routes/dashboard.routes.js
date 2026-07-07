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
router.get('/:datasetId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { datasetId } = req.params;
        const sessionId = req.headers['x-session-id'] || 'anonymous';
        const db = (0, db_service_1.getDb)();
        // 1. Fetch dataset metadata (Allow access without session ID for sharing links)
        const dataset = yield db.collection('_datasets').findOne({
            _id: new mongodb_1.ObjectId(datasetId)
        });
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found.' });
        }
        const { table_name: collectionName, column_schema: schema } = dataset;
        // 2. Load or Generate Dashboard Config
        let config = dataset.dashboard_config;
        if (!config) {
            const sampleRows = yield db.collection(collectionName).find().limit(1).toArray();
            const configStr = yield (0, llm_service_1.generateDashboardConfig)(collectionName, schema, sampleRows);
            try {
                config = JSON.parse(configStr);
                // Save config for future requests to make it instant
                yield db.collection('_datasets').updateOne({ _id: new mongodb_1.ObjectId(datasetId) }, { $set: { dashboard_config: config } });
            }
            catch (e) {
                return res.status(400).json({ error: 'Failed to parse generated dashboard config.', raw: configStr });
            }
        }
        if (!config || !config.kpis || !config.charts) {
            return res.status(400).json({ error: 'Invalid dashboard configuration format.' });
        }
        // 3. Execute all pipelines in parallel
        const kpiPromises = config.kpis.map((kpi) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            try {
                const result = yield db.collection(collectionName).aggregate(kpi.pipeline).toArray();
                return Object.assign(Object.assign({}, kpi), { data: ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.value) || ((_b = result[0]) === null || _b === void 0 ? void 0 : _b[Object.keys(result[0] || {})[0]]) || 0 });
            }
            catch (err) {
                return Object.assign(Object.assign({}, kpi), { data: 'Error', error: true });
            }
        }));
        const chartPromises = config.charts.map((chart) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const result = yield db.collection(collectionName).aggregate(chart.pipeline).toArray();
                return Object.assign(Object.assign({}, chart), { data: result });
            }
            catch (err) {
                return Object.assign(Object.assign({}, chart), { data: [], error: true });
            }
        }));
        const [kpiResults, chartResults] = yield Promise.all([
            Promise.all(kpiPromises),
            Promise.all(chartPromises)
        ]);
        // 4. Return formatted dashboard data
        res.json({
            kpis: kpiResults,
            charts: chartResults
        });
    }
    catch (error) {
        console.error('Dashboard Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate dashboard' });
    }
}));
exports.default = router;
